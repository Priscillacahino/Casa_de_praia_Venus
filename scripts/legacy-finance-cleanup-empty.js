import { existsSync } from "node:fs";
import { openDatabase } from "../server/db.js";

if (process.loadEnvFile) { try { process.loadEnvFile(); } catch {} }
const dbPath = String(process.env.DATABASE_PATH || "").trim();
if (!dbPath || !existsSync(dbPath)) throw new Error("DATABASE_PATH deve apontar para um banco existente.");

const db = openDatabase(dbPath);
try {
  const tables = new Set(db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map((r) => r.name));

  if (tables.has("payments")) {
    const count = Number(db.prepare("SELECT COUNT(*) AS n FROM payments").get().n || 0);
    if (count > 0) {
      throw new Error("A tabela legada payments possui registros. Nenhum dado foi apagado; faça análise de retenção antes de qualquer exclusão.");
    }
  }

  if (tables.has("banking")) {
    const raw = String(db.prepare("SELECT value FROM banking WHERE id=1").get()?.value || "").trim();
    let configured = false;
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        configured = Object.values(parsed || {}).some((value) => String(value || "").trim() !== "");
      } catch {
        configured = true;
      }
    }
    if (configured) {
      throw new Error("A tabela legada banking contém configuração. Nenhum dado foi apagado; revise antes de excluir.");
    }
  }

  db.exec("BEGIN IMMEDIATE");
  try {
    db.exec("DROP INDEX IF EXISTS payments_bank_reference_unique;");
    if (tables.has("payments")) db.exec("DROP TABLE payments;");
    if (tables.has("banking")) db.exec("DROP TABLE banking;");
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }

  console.log(JSON.stringify({
    paymentsRemoved:tables.has("payments"),
    bankingRemoved:tables.has("banking"),
  }));
  console.log("LIMPEZA DE LEGADO FINANCEIRO VAZIO: CONCLUÍDA");
} finally {
  db.close();
}
