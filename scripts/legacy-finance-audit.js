import { existsSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";

if (process.loadEnvFile) { try { process.loadEnvFile(); } catch {} }
const dbPath = String(process.env.DATABASE_PATH || "").trim();
if (!dbPath || !existsSync(dbPath)) throw new Error("DATABASE_PATH deve apontar para um banco existente.");

const db = new DatabaseSync(dbPath, { readOnly:true });
try {
  const tables = new Set(db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map((r) => r.name));
  const paymentsRows = tables.has("payments")
    ? Number(db.prepare("SELECT COUNT(*) AS n FROM payments").get().n || 0)
    : 0;

  let bankingConfigured = false;
  if (tables.has("banking")) {
    const raw = String(db.prepare("SELECT value FROM banking WHERE id=1").get()?.value || "").trim();
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        bankingConfigured = Object.values(parsed || {}).some((value) => String(value || "").trim() !== "");
      } catch {
        bankingConfigured = true;
      }
    }
  }

  console.log(JSON.stringify({
    paymentsTablePresent:tables.has("payments"),
    paymentsRows,
    bankingTablePresent:tables.has("banking"),
    bankingConfigured,
    legacyFinancialDataPresent:paymentsRows > 0 || bankingConfigured,
  }));
} finally {
  db.close();
}
