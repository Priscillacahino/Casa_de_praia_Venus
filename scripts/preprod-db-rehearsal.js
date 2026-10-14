import assert from "node:assert/strict";
import {
  mkdtempSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  createHash,
  randomBytes,
} from "node:crypto";
import { spawnSync } from "node:child_process";
import { DatabaseSync } from "node:sqlite";

import {
  openDatabase,
} from "../server/db.js";

import {
  isProtectedSignedTermPdf,
  revealSignedTermPdf,
} from "../server/privacy.js";

const projectRoot = fileURLToPath(
  new URL("../", import.meta.url),
);

const work = mkdtempSync(
  join(tmpdir(), "venus-preprod-rehearsal-"),
);

function run(scriptName, env) {
  const script = join(
    projectRoot,
    "scripts",
    scriptName,
  );

  const result = spawnSync(
    process.execPath,
    [script],
    {
      cwd:work,
      env,
      encoding:"utf8",
    },
  );

  if (result.status !== 0) {
    throw new Error(
      `${scriptName} falhou.\nSTDOUT:\n${result.stdout}\nSTDERR:\n${result.stderr}`,
    );
  }
}

try {
  const dbPath = join(
    work,
    "venus-rehearsal.sqlite",
  );

  const pdf = Buffer.from(
    "%PDF-1.4\nDocumento legado ficticio\n%%EOF",
  );

  const pdfHash = createHash("sha256")
    .update(pdf)
    .digest("hex");

  const db = openDatabase(dbPath);

  try {
    db.prepare(`
      INSERT INTO reservations(
        id,
        name,
        email,
        phone,
        cpf,
        check_in,
        check_out,
        guests,
        status,
        quote
      )
      VALUES(
        'rehearsal',
        'Pessoa Teste',
        'teste@example.com',
        '83999999999',
        '52998224725',
        '2030-01-01',
        '2030-01-02',
        2,
        'requested',
        '{"totalCents":12000}'
      )
    `).run();

    db.prepare(`
      INSERT INTO signed_terms(
        id,
        reservation_id,
        pdf,
        sha256,
        term_hash
      )
      VALUES(
        'documento-rehearsal',
        'rehearsal',
        ?,
        ?,
        'termo-rehearsal'
      )
    `).run(
      pdf,
      pdfHash,
    );

    db.exec(`
      CREATE TABLE payments(
        id TEXT PRIMARY KEY,
        bank_reference TEXT
      );

      CREATE UNIQUE INDEX
        payments_bank_reference_unique
      ON payments(bank_reference);

      CREATE TABLE banking(
        id INTEGER PRIMARY KEY,
        value TEXT NOT NULL
      );

      INSERT INTO banking(id,value)
      VALUES(1,'{}');
    `);
  } finally {
    db.close();
  }

  const piiKey = randomBytes(32)
    .toString("base64");

  const env = {
    ...process.env,
    NODE_ENV:"production",
    DATABASE_PATH:dbPath,
    PII_ENCRYPTION_KEY:piiKey,
  };

  run("migrate-cpf.js", env);
  run("migrate-signed-terms.js", env);
  run("legacy-finance-cleanup-empty.js", env);

  const verified = new DatabaseSync(
    dbPath,
    { readOnly:true },
  );

  try {
    assert.equal(
      verified
        .prepare("PRAGMA integrity_check")
        .get()?.integrity_check,
      "ok",
    );

    assert.equal(
      verified
        .prepare("PRAGMA foreign_key_check")
        .all().length,
      0,
    );

    const cpf = String(
      verified
        .prepare(
          "SELECT cpf FROM reservations WHERE id='rehearsal'",
        )
        .get()?.cpf || "",
    );

    assert.match(
      cpf,
      /^enc:v1:/,
    );

    const stored = Buffer.from(
      verified
        .prepare(
          "SELECT pdf FROM signed_terms WHERE reservation_id='rehearsal'",
        )
        .get()?.pdf || [],
    );

    assert.equal(
      isProtectedSignedTermPdf(stored),
      true,
    );

    assert.deepEqual(
      revealSignedTermPdf(
        stored,
        {
          NODE_ENV:"production",
          PII_ENCRYPTION_KEY:piiKey,
        },
      ),
      pdf,
    );

    const tables = new Set(
      verified
        .prepare(
          "SELECT name FROM sqlite_master WHERE type='table'",
        )
        .all()
        .map((row) => row.name),
    );

    assert.equal(
      tables.has("payments"),
      false,
    );

    assert.equal(
      tables.has("banking"),
      false,
    );
  } finally {
    verified.close();
  }

  console.log(
    "ENSAIO DE PRE-PRODUCAO: APROVADO",
  );
} finally {
  rmSync(
    work,
    {
      recursive:true,
      force:true,
    },
  );
}