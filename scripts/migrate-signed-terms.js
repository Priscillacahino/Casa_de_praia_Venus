import { existsSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import {
  isProtectedSignedTermPdf,
  protectSignedTermPdf,
  revealSignedTermPdf,
  validPiiKey,
} from "../server/privacy.js";

if (process.loadEnvFile) {
  try { process.loadEnvFile(); } catch {}
}

const dbPath = String(process.env.DATABASE_PATH || "").trim();

if (!dbPath || !existsSync(dbPath)) {
  throw new Error("DATABASE_PATH deve apontar para um banco existente.");
}

if (!validPiiKey(process.env.PII_ENCRYPTION_KEY)) {
  throw new Error(
    "Configure PII_ENCRYPTION_KEY com 32 bytes em Base64 antes de migrar documentos.",
  );
}

const env = {
  ...process.env,
  NODE_ENV:"production",
};

const db = new DatabaseSync(dbPath);

try {
  db.exec("PRAGMA busy_timeout=5000;");

  const tables = new Set(
    db.prepare("SELECT name FROM sqlite_master WHERE type='table'")
      .all()
      .map((row) => row.name),
  );

  if (!tables.has("signed_terms")) {
    throw new Error("Tabela signed_terms ausente. Nenhuma alteração realizada.");
  }

  const rows = db.prepare(
    "SELECT id,pdf FROM signed_terms",
  ).all();

  const legacy = [];

  // Primeiro valida toda a base.
  // Só depois inicia qualquer escrita.
  for (const row of rows) {
    const bytes = Buffer.from(row.pdf);

    if (isProtectedSignedTermPdf(bytes)) {
      revealSignedTermPdf(bytes, env);
      continue;
    }

    if (
      bytes.length >= 5 &&
      bytes.subarray(0, 5).toString("ascii") === "%PDF-"
    ) {
      legacy.push({
        id:row.id,
        bytes,
      });

      continue;
    }

    throw new Error(
      "Existe documento assinado em formato desconhecido. Migração interrompida antes de qualquer alteração.",
    );
  }

  db.exec("BEGIN IMMEDIATE");

  try {
    for (const row of legacy) {
      db.prepare(
        "UPDATE signed_terms SET pdf=? WHERE id=?",
      ).run(
        protectSignedTermPdf(row.bytes, env),
        row.id,
      );
    }

    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }

  const after = db.prepare(
    "SELECT pdf FROM signed_terms",
  ).all();

  for (const row of after) {
    const bytes = Buffer.from(row.pdf);

    if (!isProtectedSignedTermPdf(bytes)) {
      throw new Error(
        "Migração incompleta: ainda existe documento sem proteção.",
      );
    }

    revealSignedTermPdf(bytes, env);
  }

  console.log(JSON.stringify({
    signedTermsMigrated:legacy.length,
    protectedTerms:after.length,
    plaintextRemaining:0,
  }));

  console.log("MIGRAÇÃO DE TERMOS ASSINADOS: CONCLUÍDA");
} finally {
  db.close();
}