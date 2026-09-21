import { existsSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { assertProductionConfig } from "../server/runtime-config.js";

if (process.loadEnvFile) { try { process.loadEnvFile(); } catch {} }

assertProductionConfig(process.env);
const path = process.env.DATABASE_PATH;
if (!existsSync(path)) throw new Error("DATABASE_PATH não existe. O preflight não cria banco em produção.");

const db = new DatabaseSync(path, { readOnly: true });
try {
  const integrity = db.prepare("PRAGMA integrity_check").get()?.integrity_check;
  if (integrity !== "ok") throw new Error(`PRAGMA integrity_check falhou: ${integrity || "sem resultado"}`);
  const foreignKeys = db.prepare("PRAGMA foreign_key_check").all();
  if (foreignKeys.length) throw new Error(`PRAGMA foreign_key_check encontrou ${foreignKeys.length} inconsistência(s).`);
  const version = Number(db.prepare("PRAGMA user_version").get()?.user_version || 0);
  if (version !== 7) throw new Error(`Schema incompatível: user_version=${version}; esperado exatamente 7.`);
  console.log(JSON.stringify({
    productionConfig:"ok",
    databaseIntegrity:"ok",
    foreignKeys:"ok",
    schemaVersion:version,
  }));
  console.log("PREFLIGHT DE PRODUÇÃO: APROVADO");
} finally {
  db.close();
}
