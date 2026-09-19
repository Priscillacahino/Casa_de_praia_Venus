function httpsUrl(value) {
  try {
    const url = new URL(String(value || ""));
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}

function validBackupKey(value) {
  const raw = String(value || "").trim();
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(raw)) return false;
  try { return Buffer.from(raw, "base64").length === 32; }
  catch { return false; }
}

export function productionConfigErrors(env = process.env) {
  if (String(env.NODE_ENV || "") !== "production") return [];
  const errors = [];

  if (!httpsUrl(env.APP_URL)) errors.push("APP_URL deve ser HTTPS válido.");
  if (!/^[a-f0-9]{32}:[a-f0-9]{128}$/i.test(String(env.ADMIN_PASSWORD_HASH || ""))) {
    errors.push("ADMIN_PASSWORD_HASH deve ser gerado por npm run admin:password.");
  }
  if (!/^[A-Z2-7]{16,}$/i.test(String(env.ADMIN_TOTP_SECRET || ""))) {
    errors.push("ADMIN_TOTP_SECRET deve ser Base32 válido.");
  }
  if (String(env.RESERVATION_TOKEN_SECRET || "").length < 32) {
    errors.push("RESERVATION_TOKEN_SECRET deve ter pelo menos 32 caracteres.");
  }
  if (!validBackupKey(env.BACKUP_ENCRYPTION_KEY)) {
    errors.push("BACKUP_ENCRYPTION_KEY deve representar 32 bytes em Base64.");
  }
  if (!httpsUrl(env.GUIDE_SOURCE_URL)) {
    errors.push("GUIDE_SOURCE_URL deve ser HTTPS válido.");
  }
  if (!/^[a-f0-9]{64}$/i.test(String(env.GUIDE_EXPECTED_SHA256 || ""))) {
    errors.push("GUIDE_EXPECTED_SHA256 é obrigatório em produção e deve ter 64 caracteres hexadecimais.");
  }
  const dbPath = String(env.DATABASE_PATH || "").trim();
  if (!dbPath || dbPath === ":memory:") {
    errors.push("DATABASE_PATH deve apontar explicitamente para armazenamento persistente.");
  }
  if (env.TRUST_PROXY_HOPS !== undefined && String(env.TRUST_PROXY_HOPS).trim() !== "") {
    const hops = Number(env.TRUST_PROXY_HOPS);
    if (!Number.isInteger(hops) || hops < 0 || hops > 5) {
      errors.push("TRUST_PROXY_HOPS deve ser inteiro entre 0 e 5.");
    }
  }
  return errors;
}

export function assertProductionConfig(env = process.env) {
  const errors = productionConfigErrors(env);
  if (errors.length) throw new Error("Configuração de produção inválida:\n- " + errors.join("\n- "));
  return true;
}
