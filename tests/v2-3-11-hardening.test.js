import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { openDatabase } from "../server/db.js";
import { readiness, TERM_HASH } from "../server/compliance.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

test("hardening pré-produção não cria estruturas financeiras legadas", () => {
  const db = openDatabase(":memory:");
  const tables = new Set(db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map((row) => row.name));
  assert.equal(tables.has("payments"), false);
  assert.equal(tables.has("banking"), false);
  assert.equal(tables.has("external_deposit_checks"), true);
  db.close();
});

test("readiness exige sinal conferido externamente sem guardar transação", () => {
  const db = openDatabase(":memory:");
  db.prepare(`INSERT INTO reservations(id,name,email,phone,check_in,check_out,guests,status,quote)
    VALUES('r','Pessoa','p@example.com','83999999999','2030-01-01','2030-01-02',2,'requested','{"totalCents":12000,"depositCents":2400}')`).run();
  db.prepare("UPDATE legal_approval SET approved=1,term_hash=? WHERE id=1").run(TERM_HASH);
  db.prepare(`INSERT INTO signed_terms(id,reservation_id,pdf,sha256,term_hash,validated_at,reviewer,validation_reference)
    VALUES('doc','r',X'255044462D','sha',?,CURRENT_TIMESTAMP,'Teste','VALIDAR-TESTE')`).run(TERM_HASH);

  const row = db.prepare("SELECT * FROM reservations WHERE id='r'").get();
  const before = readiness(db, row);
  assert.equal(before.legalReady, true);
  assert.equal(before.signatureReady, true);
  assert.equal(before.depositCheckedExternally, false);
  assert.equal(before.ready, false);

  db.prepare("INSERT INTO external_deposit_checks(reservation_id,checked_by) VALUES('r','admin')").run();
  const after = readiness(db, row);
  assert.equal(after.depositCheckedExternally, true);
  assert.equal(after.ready, true);

  db.close();
});

test("admin não deve expor CPF protegido na listagem geral", () => {
  const app = readFileSync(join(root, "server", "app.js"), "utf8");
  assert.match(app, /cpf: _protectedCpf/);
  assert.match(app, /revealCpf\(row\.cpf/);
  assert.match(app, /protectCpf\(documentCpf\)/);
});

test("produção exige chave PII e bloqueia legado financeiro", () => {
  const runtime = readFileSync(join(root, "server", "runtime-config.js"), "utf8");
  const preflight = readFileSync(join(root, "scripts", "production-check.js"), "utf8");
  assert.match(runtime, /PII_ENCRYPTION_KEY/);
  assert.match(preflight, /legacyFinancialTables/);
  assert.match(preflight, /privacy:migrate-cpf/);
});
