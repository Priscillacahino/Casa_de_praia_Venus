import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFileSync(join(root, file), "utf8");

test("cotação pública identifica a casa inteira e reage aos dados essenciais", () => {
  const html = read("public/index.html");
  const app = read("public/app.js");

  assert.equal((html.match(/id="quote"/g) || []).length, 1);

  const form = html.indexOf('id="bookingForm"');
  const checkIn = html.indexOf('name="checkIn"', form);
  const guests = html.indexOf('name="guests"', form);
  const quote = html.indexOf('id="quote"', form);
  const name = html.indexOf('name="name"', form);

  assert.ok(form >= 0);
  assert.ok(checkIn > form);
  assert.ok(guests > checkIn);
  assert.ok(quote > guests);
  assert.ok(name > quote);

  assert.match(app, /Casa inteira/);
  assert.match(app, /Não há cobrança por quarto, cama ou cômodo utilizado/);

  assert.match(app, /checkIn\.addEventListener\("input", refreshQuote\)/);
  assert.match(app, /checkOut\.addEventListener\("input", refreshQuote\)/);
  assert.match(app, /guests\.addEventListener\("input", refreshQuote\)/);
});

test("termo v7 preserva inventário e esclarece tarifa da casa inteira", () => {
  const term = read("docs/termo-compromisso-minuta.txt");
  const compliance = read("server/compliance.js");

  assert.match(compliance, /2026-10-08-v7/);
  assert.match(term, /Versão 2026-10-08 — v7/);
  assert.match(term, /Conteúdo concluído pela administração/);
  assert.match(term, /uso da casa inteira/);
  assert.match(term, /Não há cobrança por quarto, cama ou cômodo utilizado/);

  assert.match(term, /projetor smart/);
  assert.match(term, /cafeteira Três Corações/);
  assert.match(term, /air fryer/);
  assert.match(term, /4 cadeiras de praia/);
  assert.match(term, /sistema de energia solar/);
});

test("termo v7 registra referência ao art. 49 sem afirmar aplicação automática", () => {
  const term = read("docs/termo-compromisso-minuta.txt");

  assert.match(term, /art\. 49 do Código de Defesa do Consumidor/);
  assert.match(term, /prazo legal de 7 dias/);
  assert.match(term, /quando presentes os requisitos legais para sua aplicação/);
});

test("CDC está acessível pelas páginas públicas", () => {
  for (const file of [
    "public/index.html",
    "public/termos.html",
    "public/privacidade.html",
  ]) {
    const page = read(file);
    assert.match(page, /codigo-defesa-consumidor\.pdf/);
    assert.match(page, /l8078compilado\.htm/);
  }
});

test("painel usa liberação administrativa sem fingir revisão jurídica", () => {
  const admin = read("public/admin.js");
  const app = read("server/app.js");
  const compliance = read("server/compliance.js");

  assert.match(admin, /Liberação administrativa/);
  assert.match(app, /liberação administrativa desta versão/);
  assert.match(compliance, /liberação administrativa desta versão/);

  assert.doesNotMatch(admin, /Responsável\/revisor jurídico/);
  assert.doesNotMatch(app, /Confirme que o jurídico validou esta versão/);
});