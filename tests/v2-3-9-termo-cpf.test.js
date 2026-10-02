import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { openDatabase } from "../server/db.js";
import { cpf } from "../server/domain.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

test("v2.3.10 mantém CPF validado e termo de conservação v6", () => {
  const html = readFileSync(join(root, "public", "index.html"), "utf8");
  const app = readFileSync(join(root, "public", "app.js"), "utf8");
  const compliance = readFileSync(join(root, "server", "compliance.js"), "utf8");
  const term = readFileSync(join(root, "docs", "termo-compromisso-minuta.txt"), "utf8");

  assert.match(html, /name="cpf"/);
  assert.match(app, /cpf:form\.elements\.cpf\.value/);
  assert.match(compliance, /2026-10-02-v6/);

  assert.match(term, /4 cadeiras de praia/);
  assert.match(term, /O suporte para televisão não está vinculado ao projetor smart/);
  assert.match(term, /Desgastes naturais decorrentes do uso regular não serão considerados danos/);
  assert.match(term, /DIVERGÊNCIAS IDENTIFICADAS NA CHEGADA/);
});

test("v2.3.9 valida CPF brasileiro", () => {
  assert.equal(cpf("529.982.247-25"), "52998224725");
  assert.throws(() => cpf("111.111.111-11"), /CPF inválido/);
  assert.throws(() => cpf("123.456.789-00"), /CPF inválido/);
});

test("v2.3.9 banco possui coluna CPF e schema 9", () => {
  const db = openDatabase(":memory:");

  const cols = db.prepare("PRAGMA table_info(reservations)").all().map((c) => c.name);
  const version = Number(db.prepare("PRAGMA user_version").get().user_version);

  assert.ok(cols.includes("cpf"));
  assert.equal(version, 9);

  db.close();
});
