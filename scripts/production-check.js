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
  if (version !== 10) throw new Error(`Schema incompatível: user_version=${version}; esperado exatamente 10.`);

  const tables = new Set(db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map((row) => row.name));
  if (!tables.has("external_deposit_checks")) throw new Error("Tabela external_deposit_checks ausente.");
  for (const legacy of ["payments", "banking"]) {
    if (tables.has(legacy)) throw new Error(`Estrutura financeira legada ainda presente: ${legacy}. Execute a auditoria/limpeza antes da produção.`);
  }

  const plaintextCpf = Number(db.prepare("SELECT COUNT(*) AS n FROM reservations WHERE cpf <> '' AND cpf NOT LIKE 'enc:v1:%'").get()?.n || 0);
  if (plaintextCpf > 0) throw new Error(`Existem ${plaintextCpf} CPF(s) legados sem proteção em repouso. Execute privacy:migrate-cpf.`);

  console.log(JSON.stringify({
    productionConfig:"ok",
    databaseIntegrity:"ok",
    foreignKeys:"ok",
    schemaVersion:version,
    cpfAtRest:"protected",
    legacyFinancialTables:"absent",
  }));
  console.log("PREFLIGHT DE PRODUÇÃO: APROVADO");
} finally {
  db.close();
}
