import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
);

test("package expõe ferramentas de segurança de pré-produção", () => {
  const pkg = JSON.parse(
    readFileSync(
      join(root, "package.json"),
      "utf8",
    ),
  );

  assert.equal(
    pkg.scripts["backup:key"],
    "node scripts/generate-backup-key.js",
  );

  assert.equal(
    pkg.scripts["production:config-check"],
    "node scripts/production-config-check.js",
  );

  assert.equal(
    pkg.scripts["preprod:db-rehearsal"],
    "node scripts/preprod-db-rehearsal.js",
  );

  assert.equal(
    pkg.scripts["privacy:migrate-signed-terms"],
    "node scripts/migrate-signed-terms.js",
  );
});

test("check de configuração força regras de produção sem imprimir segredos", () => {
  const source = readFileSync(
    join(
      root,
      "scripts",
      "production-config-check.js",
    ),
    "utf8",
  );

  assert.match(
    source,
    /NODE_ENV:"production"/,
  );

  assert.match(
    source,
    /assertProductionConfig/,
  );

  assert.doesNotMatch(
    source,
    /console\.log\(process\.env/,
  );
});

test("documentação registra backup, restauração e migração controlada", () => {
  const hardening = readFileSync(
    join(
      root,
      "docs",
      "HARDENING_PRE_PRODUCAO.md",
    ),
    "utf8",
  );

  assert.match(
    hardening,
    /backup:selftest/,
  );

  assert.match(
    hardening,
    /privacy:migrate-signed-terms/,
  );

  assert.match(
    hardening,
    /preprod:db-rehearsal/,
  );

  assert.match(
    hardening,
    /não migra o banco real/i,
  );
});