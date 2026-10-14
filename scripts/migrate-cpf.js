import { existsSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { protectCpf, validPiiKey } from "../server/privacy.js";

if (process.loadEnvFile) {
  try { process.loadEnvFile(); } catch {}
}

const dbPath = String(process.env.DATABASE_PATH || "").trim();

if (!dbPath || !existsSync(dbPath)) {
  throw new Error("DATABASE_PATH deve apontar para um banco existente.");
}

if (!validPiiKey(process.env.PII_ENCRYPTION_KEY)) {
  throw new Error("Configure PII_ENCRYPTION_KEY com 32 bytes em Base64 antes de migrar CPF.");
}

const db = new DatabaseSync(dbPath);

try {
  db.exec("PRAGMA busy_timeout=5000;");

  const tables = new Set(
    db.prepare("SELECT name FROM sqlite_master WHERE type='table'")
      .all()
      .map((row) => row.name),
  );

  if (!tables.has("reservations")) {
    throw new Error("Tabela reservations ausente. Nenhuma alteração realizada.");
  }

  const rows = db.prepare(`
    SELECT id,cpf
    FROM reservations
    WHERE cpf <> ''
      AND cpf NOT LIKE 'enc:v1:%'
  `).all();

  for (const row of rows) {
    if (!/^\d{11}$/.test(String(row.cpf || ""))) {
      throw new Error(
        "Existe CPF legado em formato inesperado. Migração interrompida sem imprimir o dado.",
      );
    }
  }

  db.exec("BEGIN IMMEDIATE");

  try {
    for (const row of rows) {
      db.prepare(
        "UPDATE reservations SET cpf=? WHERE id=?",
      ).run(
        protectCpf(
          row.cpf,
          { ...process.env, NODE_ENV:"production" },
        ),
        row.id,
      );
    }

    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }

  const remaining = Number(
    db.prepare(`
      SELECT COUNT(*) AS n
      FROM reservations
      WHERE cpf <> ''
        AND cpf NOT LIKE 'enc:v1:%'
    `).get()?.n || 0,
  );

  if (remaining !== 0) {
    throw new Error("Ainda existem CPFs legados após a migração.");
  }

  console.log(JSON.stringify({
    cpfMigrated:rows.length,
    plaintextRemaining:remaining,
  }));

  console.log("MIGRAÇÃO DE CPF: CONCLUÍDA");
} finally {
  db.close();
}