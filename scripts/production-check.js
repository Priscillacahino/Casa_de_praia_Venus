import { existsSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import {
  isProtectedSignedTermPdf,
  revealSignedTermPdf,
} from "../server/privacy.js";
import { assertProductionConfig } from "../server/runtime-config.js";

if (process.loadEnvFile) {
  try { process.loadEnvFile(); } catch {}
}

assertProductionConfig(process.env);

const path = process.env.DATABASE_PATH;

if (!existsSync(path)) {
  throw new Error(
    "DATABASE_PATH não existe. O preflight não cria banco em produção.",
  );
}

const db = new DatabaseSync(path, { readOnly:true });

try {
  const integrity = db.prepare(
    "PRAGMA integrity_check",
  ).get()?.integrity_check;

  if (integrity !== "ok") {
    throw new Error(
      `PRAGMA integrity_check falhou: ${integrity || "sem resultado"}`,
    );
  }

  const foreignKeys = db.prepare(
    "PRAGMA foreign_key_check",
  ).all();

  if (foreignKeys.length) {
    throw new Error(
      `PRAGMA foreign_key_check encontrou ${foreignKeys.length} inconsistência(s).`,
    );
  }

  const version = Number(
    db.prepare("PRAGMA user_version")
      .get()?.user_version || 0,
  );

  if (version !== 10) {
    throw new Error(
      `Schema incompatível: user_version=${version}; esperado exatamente 10.`,
    );
  }

  const tables = new Set(
    db.prepare("SELECT name FROM sqlite_master WHERE type='table'")
      .all()
      .map((row) => row.name),
  );

  if (!tables.has("external_deposit_checks")) {
    throw new Error("Tabela external_deposit_checks ausente.");
  }

  if (!tables.has("signed_terms")) {
    throw new Error("Tabela signed_terms ausente.");
  }

  for (const legacy of ["payments", "banking"]) {
    if (tables.has(legacy)) {
      throw new Error(
        `Estrutura financeira legada ainda presente: ${legacy}. Execute a auditoria/limpeza antes da produção.`,
      );
    }
  }

  const plaintextCpf = Number(
    db.prepare(`
      SELECT COUNT(*) AS n
      FROM reservations
      WHERE cpf <> ''
        AND cpf NOT LIKE 'enc:v1:%'
    `).get()?.n || 0,
  );

  if (plaintextCpf > 0) {
    throw new Error(
      `Existem ${plaintextCpf} CPF(s) legados sem proteção em repouso. Execute privacy:migrate-cpf.`,
    );
  }

  const signedTerms = db.prepare(
    "SELECT pdf FROM signed_terms",
  ).all();

  let legacySignedTerms = 0;

  for (const row of signedTerms) {
    const bytes = Buffer.from(row.pdf);

    if (
      bytes.length >= 5 &&
      bytes.subarray(0, 5).toString("ascii") === "%PDF-"
    ) {
      legacySignedTerms += 1;
      continue;
    }

    if (!isProtectedSignedTermPdf(bytes)) {
      throw new Error(
        "Existe documento assinado em formato de armazenamento desconhecido.",
      );
    }

    try {
      revealSignedTermPdf(
        bytes,
        {
          ...process.env,
          NODE_ENV:"production",
        },
      );
    } catch {
      throw new Error(
        "Existe documento assinado protegido que não pôde ser validado com a chave configurada.",
      );
    }
  }

  if (legacySignedTerms > 0) {
    throw new Error(
      `Existem ${legacySignedTerms} termo(s) assinado(s) ainda armazenados como PDF aberto. Execute privacy:migrate-signed-terms.`,
    );
  }

  console.log(JSON.stringify({
    productionConfig:"ok",
    databaseIntegrity:"ok",
    foreignKeys:"ok",
    schemaVersion:version,
    cpfAtRest:"protected",
    signedTermsAtRest:"protected",
    legacyFinancialTables:"absent",
  }));

  console.log("PREFLIGHT DE PRODUÇÃO: APROVADO");
} finally {
  db.close();
}