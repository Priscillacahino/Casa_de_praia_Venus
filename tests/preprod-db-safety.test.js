import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  isProtectedSignedTermPdf,
  protectSignedTermPdf,
  revealSignedTermPdf,
} from "../server/privacy.js";

import { openDatabase } from "../server/db.js";
import { saveSignedTerm } from "../server/compliance.js";

const root = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
);

const key = Buffer.alloc(32, 7).toString("base64");

const productionEnv = {
  NODE_ENV:"production",
  PII_ENCRYPTION_KEY:key,
};

test("PDF assinado é protegido e PDF legado continua legível durante a migração", () => {
  const pdf = Buffer.from(
    "%PDF-1.4\nDocumento fictício de teste\n%%EOF",
  );

  const protectedPdf =
    protectSignedTermPdf(pdf, productionEnv);

  assert.equal(
    protectedPdf.subarray(0, 9).toString("ascii"),
    "VENUSPII1",
  );

  assert.notEqual(
    protectedPdf.subarray(0, 5).toString("ascii"),
    "%PDF-",
  );

  assert.equal(
    isProtectedSignedTermPdf(protectedPdf),
    true,
  );

  assert.deepEqual(
    revealSignedTermPdf(protectedPdf, productionEnv),
    pdf,
  );

  assert.deepEqual(
    revealSignedTermPdf(pdf, productionEnv),
    pdf,
  );
});

test("novo termo assinado é gravado protegido e conserva o SHA do PDF original", () => {
  const previousKey = process.env.PII_ENCRYPTION_KEY;
  const previousNodeEnv = process.env.NODE_ENV;

  process.env.PII_ENCRYPTION_KEY = key;
  process.env.NODE_ENV = "production";

  const db = openDatabase(":memory:");

  try {
    db.prepare(`
      INSERT INTO reservations(
        id,name,email,phone,
        check_in,check_out,guests,
        status,quote
      )
      VALUES(
        'security-pdf',
        'Pessoa Teste',
        'teste@example.com',
        '83999999999',
        '2030-01-01',
        '2030-01-02',
        2,
        'requested',
        '{"totalCents":12000}'
      )
    `).run();

    const pdf = Buffer.from(
      "%PDF-1.4\nPDF assinado fictício\n%%EOF",
    );

    const expectedHash = createHash("sha256")
      .update(pdf)
      .digest("hex");

    const result = saveSignedTerm(
      db,
      "security-pdf",
      pdf.toString("base64"),
      () => {},
    );

    assert.equal(result.sha256, expectedHash);

    const row = db.prepare(
      "SELECT pdf,sha256 FROM signed_terms WHERE reservation_id=?",
    ).get("security-pdf");

    const stored = Buffer.from(row.pdf);

    assert.equal(row.sha256, expectedHash);
    assert.equal(isProtectedSignedTermPdf(stored), true);

    assert.notEqual(
      stored.subarray(0, 5).toString("ascii"),
      "%PDF-",
    );

    assert.deepEqual(
      revealSignedTermPdf(stored, productionEnv),
      pdf,
    );
  } finally {
    db.close();

    if (previousKey === undefined) {
      delete process.env.PII_ENCRYPTION_KEY;
    } else {
      process.env.PII_ENCRYPTION_KEY = previousKey;
    }

    if (previousNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = previousNodeEnv;
    }
  }
});

test("migrações sensíveis abrem o SQLite diretamente", () => {
  for (const file of [
    "scripts/migrate-cpf.js",
    "scripts/legacy-finance-cleanup-empty.js",
    "scripts/migrate-signed-terms.js",
  ]) {
    const source = readFileSync(
      join(root, file),
      "utf8",
    );

    assert.match(source, /DatabaseSync/);
    assert.doesNotMatch(source, /openDatabase/);
  }
});

test("preflight exige proteção dos termos assinados", () => {
  const source = readFileSync(
    join(root, "scripts", "production-check.js"),
    "utf8",
  );

  assert.match(
    source,
    /privacy:migrate-signed-terms/,
  );

  assert.match(
    source,
    /signedTermsAtRest/,
  );

  assert.match(
    source,
    /revealSignedTermPdf/,
  );
});