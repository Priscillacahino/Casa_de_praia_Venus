import { existsSync } from "node:fs";
const required = ["VENUS_KEYSTORE_PATH","VENUS_KEYSTORE_PASSWORD","VENUS_KEY_ALIAS","VENUS_KEY_PASSWORD"];
const errors = [];
for (const name of required) if (!String(process.env[name] || "").trim()) errors.push(name + " não configurado.");
if (process.env.VENUS_KEYSTORE_PATH && !existsSync(process.env.VENUS_KEYSTORE_PATH)) errors.push("VENUS_KEYSTORE_PATH não existe.");
try {
  const u = new URL(String(process.env.VENUS_BOOKING_URL || ""));
  if (u.protocol !== "https:") throw new Error();
} catch { errors.push("VENUS_BOOKING_URL deve ser uma URL HTTPS."); }
if (!/^[a-f0-9]{64}$/i.test(String(process.env.VENUS_GUIDE_SHA256 || ""))) errors.push("VENUS_GUIDE_SHA256 deve conter 64 caracteres hexadecimais.");
if (errors.length) { console.error("RELEASE ANDROID NÃO APROVADA:\n- " + errors.join("\n- ")); process.exit(1); }
console.log("RELEASE ANDROID: configuração mínima aprovada para gerar APK assinado.");
