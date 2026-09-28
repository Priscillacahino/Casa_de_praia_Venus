import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");

test("v2.3.3 publica contato, logo e política 20/80 sem cascata", () => {
  const html = readFileSync(join(root,"public","index.html"),"utf8");
  const kotlin = readFileSync(join(root,"app","src","main","java","com","aistudio","venusbeachhouse","data","HouseData.kt"),"utf8");
  const db = readFileSync(join(root,"server","db.js"),"utf8");
  assert.match(html,/venus-logo\.jpg/);
  assert.match(html,/Falar no WhatsApp/);
  assert.match(html,/@venuscasadepraiapb/);
  assert.match(html,/20% de sinal/);
  assert.match(html,/80% restantes no check-in/);
  assert.doesNotMatch(html,/cascata/i);
  assert.match(kotlin,/Quarto 02 - Escritório no Paraíso 💻🌴/);
  assert.match(kotlin,/Área externa 02 - Suave na nave 🌴🪢/);
  assert.match(kotlin,/Área externa 01 - Ilhado em Vênus 🏊‍♂️🥩/);
  assert.match(kotlin,/Cozinha - Chef no rolê 🍳🧑‍🍳/);
  assert.match(kotlin,/Sala - Divindade ancestral 🎬✨/);
  assert.doesNotMatch(kotlin,/cascata/i);
  assert.match(db,/depositPercent:\s*20/);
  assert.match(db,/depositPolicyVersion\s*=\s*3/);
});

test("v2.3.3 exige termo validado antes do WhatsApp de pagamento", () => {
  const server = readFileSync(join(root,"server","app.js"),"utf8");
  const app = readFileSync(join(root,"public","app.js"),"utf8");
  const terms = readFileSync(join(root,"public","termos.html"),"utf8");
  assert.match(server,/\/api\/reservations\/:id\/term-package/);
  assert.match(server,/\/api\/reservations\/:id\/signed-term/);
  assert.match(server,/Termo assinado ainda não foi validado/);
  assert.match(app,/prepareTerm/);
  assert.match(app,/signedTermFile/);
  const html = readFileSync(join(root,"public","index.html"),"utf8");
  assert.match(html,/id="govbrSignLink"/);
  assert.match(terms,/Assinar pelo GOV\.BR/);
});

test("v2.3.3 preserva Guia Vênus e controles de reserva", () => {
  const html=readFileSync(join(root,"public","index.html"),"utf8");
  assert.match(html,/id="guia"/);
  assert.match(html,/id="reportPayment"/);
  assert.match(html,/id="requestCancellation"/);
  assert.match(html,/href="\/privacidade\.html"/);
});
