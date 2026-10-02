import { existsSync } from "node:fs";
import { openDatabase } from "../server/db.js";
import { protectCpf, validPiiKey } from "../server/privacy.js";

if (process.loadEnvFile) { try { process.loadEnvFile(); } catch {} }

const dbPath = String(process.env.DATABASE_PATH || "").trim();
if (!dbPath || !existsSync(dbPath)) throw new Error("DATABASE_PATH deve apontar para um banco existente.");
if (!validPiiKey(process.env.PII_ENCRYPTION_KEY)) {
  throw new Error("Configure PII_ENCRYPTION_KEY com 32 bytes em Base64 antes de migrar CPF.");
}

const db = openDatabase(dbPath);
try {
  const rows = db.prepare("SELECT id,cpf FROM reservations WHERE cpf <> '' AND cpf NOT LIKE 'enc:v1:%'").all();
  db.exec("BEGIN IMMEDIATE");
  try {
    for (const row of rows) {
      if (!/^\d{11}$/.test(String(row.cpf || ""))) {
        throw new Error(`Reserva ${row.id} possui CPF legado em formato inesperado. Migração interrompida sem imprimir o dado.`);
      }
      db.prepare("UPDATE reservations SET cpf=? WHERE id=?").run(
        protectCpf(row.cpf, { ...process.env, NODE_ENV:"production" }),
        row.id,
      );
    }
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }

  console.log(JSON.stringify({ cpfMigrated:rows.length, plaintextRemaining:0 }));
  console.log("MIGRAÇÃO DE CPF: CONCLUÍDA");
} finally {
  db.close();
}
