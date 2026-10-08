import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { openDatabase } from "../server/db.js";
import { cpf } from "../server/domain.js";
import { protectCpf, revealCpf } from "../server/privacy.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

test("v2.3.10 mantém CPF validado e termo de conservação v7", () => {
  const html = readFileSync(join(root, "public", "index.html"), "utf8");
  const app = readFileSync(join(root, "public", "app.js"), "utf8");
  const compliance = readFileSync(join(root, "server", "compliance.js"), "utf8");
  const term = readFileSync(join(root, "docs", "termo-compromisso-minuta.txt"), "utf8");

  assert.match(html, /name="cpf"/);
  assert.match(app, /cpf:form\.elements\.cpf\.value/);
  assert.match(compliance, /2026-10-08-v7/);

  assert.match(term, /4 cadeiras de praia/);
  assert.match(term, /O suporte para televisão não está vinculado ao projetor smart/);
  assert.match(term, /Desgastes naturais decorrentes do uso regular não serão considerados danos/);
  assert.match(term, /DIVERGÊNCIAS IDENTIFICADAS NA CHEGADA/);
});

test("CPF brasileiro é validado e pode ser protegido em repouso", () => {
  const normalized = cpf("529.982.247-25");
  assert.equal(normalized, "52998224725");
  const protectedValue = protectCpf(normalized);
  assert.match(protectedValue, /^enc:v1:/);
  assert.notEqual(protectedValue, normalized);
  assert.equal(revealCpf(protectedValue), normalized);
  assert.throws(() => cpf("111.111.111-11"), /CPF inválido/);
  assert.throws(() => cpf("123.456.789-00"), /CPF inválido/);
});

test("banco possui coluna CPF, marcador de sinal e schema 10", () => {
  const db = openDatabase(":memory:");

  const cols = db.prepare("PRAGMA table_info(reservations)").all().map((c) => c.name);
  const version = Number(db.prepare("PRAGMA user_version").get().user_version);
  const depositTable = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='external_deposit_checks'").get();
  const paymentsTable = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='payments'").get();
  const bankingTable = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='banking'").get();

  assert.ok(cols.includes("cpf"));
  assert.equal(version, 10);
  assert.equal(depositTable.name, "external_deposit_checks");
  assert.equal(paymentsTable, undefined);
  assert.equal(bankingTable, undefined);

  db.close();
});
