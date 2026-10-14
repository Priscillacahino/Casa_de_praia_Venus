import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
} from "node:crypto";

const CPF_PREFIX = "enc:v1:";
const CPF_AAD = Buffer.from("venus:cpf:v1", "utf8");

const SIGNED_TERM_MAGIC = Buffer.from("VENUSPII1", "ascii");
const SIGNED_TERM_AAD = Buffer.from("venus:signed-term:v1", "utf8");

function decodeConfiguredKey(value) {
  const raw = String(value || "").trim();

  if (!raw || !/^[A-Za-z0-9+/]+={0,2}$/.test(raw)) {
    return null;
  }

  try {
    const key = Buffer.from(raw, "base64");
    return key.length === 32 ? key : null;
  } catch {
    return null;
  }
}

export function validPiiKey(value) {
  return !!decodeConfiguredKey(value);
}

function piiKey(env = process.env) {
  const configured =
    decodeConfiguredKey(env.PII_ENCRYPTION_KEY);

  if (configured) return configured;

  if (String(env.NODE_ENV || "") === "production") {
    throw new Error(
      "PII_ENCRYPTION_KEY deve representar 32 bytes em Base64.",
    );
  }

  return createHash("sha256")
    .update("venus-development-pii-key-v1")
    .digest();
}

function signedTermKey(env = process.env) {
  return createHmac(
    "sha256",
    piiKey(env),
  )
    .update(
      "venus:signed-term:key:v1",
      "utf8",
    )
    .digest();
}

export function isProtectedCpf(value) {
  return String(value || "").startsWith(CPF_PREFIX);
}

export function protectCpf(value, env = process.env) {
  const plain = String(value || "").trim();

  if (!plain) return "";
  if (isProtectedCpf(plain)) return plain;

  if (!/^\d{11}$/.test(plain)) {
    throw new Error("CPF normalizado inválido.");
  }

  const iv = randomBytes(12);

  const cipher = createCipheriv(
    "aes-256-gcm",
    piiKey(env),
    iv,
  );

  cipher.setAAD(CPF_AAD);

  const ciphertext = Buffer.concat([
    cipher.update(plain, "utf8"),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  return [
    "enc",
    "v1",
    iv.toString("base64"),
    tag.toString("base64"),
    ciphertext.toString("base64"),
  ].join(":");
}

export function revealCpf(value, env = process.env) {
  const stored = String(value || "").trim();

  if (!stored) return "";

  // Compatibilidade temporaria com bancos anteriores.
  if (/^\d{11}$/.test(stored)) return stored;

  if (!isProtectedCpf(stored)) {
    throw new Error(
      "CPF armazenado em formato desconhecido.",
    );
  }

  const parts = stored.split(":");

  if (
    parts.length !== 5 ||
    parts[0] !== "enc" ||
    parts[1] !== "v1"
  ) {
    throw new Error("CPF protegido inválido.");
  }

  const iv = Buffer.from(parts[2], "base64");
  const tag = Buffer.from(parts[3], "base64");
  const ciphertext = Buffer.from(
    parts[4],
    "base64",
  );

  if (
    iv.length !== 12 ||
    tag.length !== 16 ||
    !ciphertext.length
  ) {
    throw new Error("CPF protegido inválido.");
  }

  const decipher = createDecipheriv(
    "aes-256-gcm",
    piiKey(env),
    iv,
  );

  decipher.setAAD(CPF_AAD);
  decipher.setAuthTag(tag);

  const plain = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]).toString("utf8");

  if (!/^\d{11}$/.test(plain)) {
    throw new Error("CPF protegido corrompido.");
  }

  return plain;
}

function bytesOf(value) {
  if (Buffer.isBuffer(value)) {
    return Buffer.from(value);
  }

  if (value instanceof Uint8Array) {
    return Buffer.from(value);
  }

  return Buffer.from(value || []);
}

export function isProtectedSignedTermPdf(value) {
  const stored = bytesOf(value);

  return (
    stored.length >= SIGNED_TERM_MAGIC.length &&
    stored
      .subarray(0, SIGNED_TERM_MAGIC.length)
      .equals(SIGNED_TERM_MAGIC)
  );
}

export function protectSignedTermPdf(
  value,
  env = process.env,
) {
  const plain = bytesOf(value);

  if (
    plain.length < 5 ||
    plain.subarray(0, 5).toString("ascii") !== "%PDF-"
  ) {
    throw new Error("PDF assinado inválido.");
  }

  const iv = randomBytes(12);

  const cipher = createCipheriv(
    "aes-256-gcm",
    signedTermKey(env),
    iv,
  );

  cipher.setAAD(SIGNED_TERM_AAD);

  const ciphertext = Buffer.concat([
    cipher.update(plain),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  return Buffer.concat([
    SIGNED_TERM_MAGIC,
    iv,
    tag,
    ciphertext,
  ]);
}

export function revealSignedTermPdf(
  value,
  env = process.env,
) {
  const stored = bytesOf(value);

  // Compatibilidade temporaria para migracao de bancos anteriores.
  if (
    stored.length >= 5 &&
    stored.subarray(0, 5).toString("ascii") === "%PDF-"
  ) {
    return stored;
  }

  if (!isProtectedSignedTermPdf(stored)) {
    throw new Error(
      "Documento assinado em formato desconhecido.",
    );
  }

  const minimum =
    SIGNED_TERM_MAGIC.length + 12 + 16 + 1;

  if (stored.length < minimum) {
    throw new Error(
      "Documento assinado protegido inválido.",
    );
  }

  let offset = SIGNED_TERM_MAGIC.length;

  const iv = stored.subarray(
    offset,
    offset + 12,
  );

  offset += 12;

  const tag = stored.subarray(
    offset,
    offset + 16,
  );

  offset += 16;

  const ciphertext = stored.subarray(offset);

  const decipher = createDecipheriv(
    "aes-256-gcm",
    signedTermKey(env),
    iv,
  );

  decipher.setAAD(SIGNED_TERM_AAD);
  decipher.setAuthTag(tag);

  const plain = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  if (
    plain.length < 5 ||
    plain.subarray(0, 5).toString("ascii") !== "%PDF-"
  ) {
    throw new Error(
      "Documento assinado protegido corrompido.",
    );
  }

  return plain;
}