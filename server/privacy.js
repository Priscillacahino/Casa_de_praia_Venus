import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const CPF_PREFIX = "enc:v1:";
const CPF_AAD = Buffer.from("venus:cpf:v1", "utf8");

function decodeConfiguredKey(value) {
  const raw = String(value || "").trim();
  if (!raw || !/^[A-Za-z0-9+/]+={0,2}$/.test(raw)) return null;
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
  const configured = decodeConfiguredKey(env.PII_ENCRYPTION_KEY);
  if (configured) return configured;
  if (String(env.NODE_ENV || "") === "production") {
    throw new Error("PII_ENCRYPTION_KEY deve representar 32 bytes em Base64.");
  }
  // Somente desenvolvimento/testes. Produção exige chave própria no secret manager.
  return createHash("sha256").update("venus-development-pii-key-v1").digest();
}

export function isProtectedCpf(value) {
  return String(value || "").startsWith(CPF_PREFIX);
}

export function protectCpf(value, env = process.env) {
  const plain = String(value || "").trim();
  if (!plain) return "";
  if (isProtectedCpf(plain)) return plain;
  if (!/^\d{11}$/.test(plain)) throw new Error("CPF normalizado inválido.");

  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", piiKey(env), iv);
  cipher.setAAD(CPF_AAD);
  const ciphertext = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
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

  // Compatibilidade temporária para migração de bancos anteriores.
  if (/^\d{11}$/.test(stored)) return stored;
  if (!isProtectedCpf(stored)) throw new Error("CPF armazenado em formato desconhecido.");

  const parts = stored.split(":");
  if (parts.length !== 5 || parts[0] !== "enc" || parts[1] !== "v1") {
    throw new Error("CPF protegido inválido.");
  }

  const iv = Buffer.from(parts[2], "base64");
  const tag = Buffer.from(parts[3], "base64");
  const ciphertext = Buffer.from(parts[4], "base64");
  if (iv.length !== 12 || tag.length !== 16 || !ciphertext.length) {
    throw new Error("CPF protegido inválido.");
  }

  const decipher = createDecipheriv("aes-256-gcm", piiKey(env), iv);
  decipher.setAAD(CPF_AAD);
  decipher.setAuthTag(tag);
  const plain = Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");

  if (!/^\d{11}$/.test(plain)) throw new Error("CPF protegido corrompido.");
  return plain;
}
