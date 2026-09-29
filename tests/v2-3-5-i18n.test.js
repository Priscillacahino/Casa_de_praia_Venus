import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

test("v2.3.5 exibe seletor por bandeiras no padrão PT/ES", () => {
  const html = readFileSync(join(root, "public", "index.html"), "utf8");
  const css = readFileSync(join(root, "public", "styles.css"), "utf8");
  assert.match(html, /id="lang-pt"/);
  assert.match(html, /id="lang-es"/);
  assert.match(html, /🇧🇷/);
  assert.match(html, /🇪🇸/);
  assert.match(html, /src="\/i18n\.js"/);
  assert.match(css, /\.language-switcher/);
  assert.match(css, /\.language-button\.is-active/);
});

test("v2.3.5 possui tradução espanhola sem alterar a versão contratual oficial", () => {
  const file = join(root, "public", "i18n.js");
  assert.ok(existsSync(file));
  const i18n = readFileSync(file, "utf8");
  assert.match(i18n, /¡Vênus, tu casa de playa!/);
  assert.match(i18n, /STORAGE_KEY = "venus:lang"/);
  assert.match(i18n, /#printableTermText/);
  assert.match(i18n, /La versión contractual oficial se mantiene en portugués/);
  assert.match(i18n, /WHATSAPP_ES/);
  assert.match(i18n, /getLocale/);
});

test("v2.3.5 localiza mensagens dinâmicas e inclui i18n no cache PWA", () => {
  const app = readFileSync(join(root, "public", "app.js"), "utf8");
  const sw = readFileSync(join(root, "public", "sw.js"), "utf8");
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  assert.match(app, /const tr =/);
  assert.match(app, /getLocale/);
  assert.match(app, /¡Hola! Quiero continuar mi solicitud de reserva/);
  assert.match(app, /confirm\(tr\(/);
  assert.match(sw, /venus-shell-v11/);
  assert.match(sw, /"\/i18n\.js"/);
  assert.equal(pkg.version, "2.3.5");
});
