import {
  readFileSync, writeFileSync, existsSync, mkdirSync, unlinkSync, renameSync,
} from "node:fs";
import { createDecipheriv, randomUUID } from "node:crypto";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";

if (process.loadEnvFile) { try { process.loadEnvFile(); } catch {} }

const [source, destination = "./data/venus-restored.sqlite"] = process.argv.slice(2);
if (!source || !existsSync(source)) {
  throw new Error("Uso: npm run backup:restore -- <arquivo.sqlite.enc> [destino.sqlite]");
}
if (existsSync(destination)) {
  throw new Error("O destino já existe. Escolha outro caminho para evitar sobrescrita acidental.");
}

const key = Buffer.from(process.env.BACKUP_ENCRYPTION_KEY || "", "base64");
if (key.length !== 32) throw new Error("Configure BACKUP_ENCRYPTION_KEY com a mesma chave do backup.");

const input = readFileSync(source);
if (input.subarray(0, 9).toString() !== "VENUSBAK1") throw new Error("Formato de backup inválido.");

const iv = input.subarray(9, 21);
const tag = input.subarray(21, 37);
const payload = input.subarray(37);
const decipher = createDecipheriv("aes-256-gcm", key, iv);
decipher.setAuthTag(tag);
const plain = Buffer.concat([decipher.update(payload), decipher.final()]);

mkdirSync(dirname(destination), { recursive:true, mode:0o700 });
const temporary = destination + ".restore-" + randomUUID() + ".tmp";

try {
  writeFileSync(temporary, plain, { mode:0o600 });
  const restored = new DatabaseSync(temporary, { readOnly:true });
  try {
    const integrity = restored.prepare("PRAGMA integrity_check").get()?.integrity_check;
    if (integrity !== "ok") throw new Error(`integrity_check retornou: ${integrity || "sem resultado"}`);
    const fk = restored.prepare("PRAGMA foreign_key_check").all();
    if (fk.length) throw new Error(`foreign_key_check encontrou ${fk.length} inconsistência(s).`);
  } finally {
    restored.close();
  }
  renameSync(temporary, destination);
  console.log(`Backup restaurado e validado para: ${destination}.`);
} catch (error) {
  try { unlinkSync(temporary); } catch {}
  throw new Error("Restauração rejeitada: " + error.message);
}
