import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

test("v2.3.4 padroniza o nome público e corrige o título inicial", () => {
  const html = readFileSync(join(root, "public", "index.html"), "utf8");
  assert.match(html, /Vênus Casa de Praia/);
  assert.match(html, /Vênus, sua casa de praia!/);
  assert.doesNotMatch(html, /Vênus Beach House/);
  assert.doesNotMatch(html, /Venus, sua casa de praia!/);
  assert.doesNotMatch(html, /Fotos reais e nomenclaturas originais/);

  const publicText = walk(join(root, "public"))
    .filter((file) => /\.(?:html|js|json|webmanifest|css|txt)$/i.test(file))
    .map((file) => readFileSync(file, "utf8"))
    .join("\n");
  assert.doesNotMatch(publicText, /Vênus Beach House/);
});

test("v2.3.4 disponibiliza o Guia Vênus estático e em arquivo offline autônomo", () => {
  const guidePath = join(root, "public", "guia", "index.html");
  const offlinePath = join(root, "public", "guia-venus-offline.html");
  assert.ok(existsSync(guidePath));
  assert.ok(existsSync(offlinePath));

  const guide = readFileSync(guidePath, "utf8");
  const offline = readFileSync(offlinePath, "utf8");
  assert.match(guide, /const PLACES\s*=\s*\[/);
  assert.match(offline, /const PLACES\s*=\s*\[/);
  assert.match(guide, /id="search"/);
  assert.match(guide, /id="cidade"/);
  assert.match(guide, /id="categoria"/);
  assert.doesNotMatch(guide, /<script\s+src=/i);
  assert.doesNotMatch(offline, /<script\s+src=/i);

  const home = readFileSync(join(root, "public", "index.html"), "utf8");
  assert.match(home, /href="\/guia\/index\.html"/);
  assert.match(home, /href="\/guia-venus-offline\.html"/);
  assert.match(home, /download="guia-venus-offline\.html"/);
});

test("v2.3.4 inclui o guia no cache PWA e preserva fallback seguro no backend", () => {
  const sw = readFileSync(join(root, "public", "sw.js"), "utf8");
  assert.match(sw, /const CACHE="venus-shell-v\d+";/);
  assert.match(sw, /"\/guia\/index\.html"/);
  assert.match(sw, /"\/guia-venus-offline\.html"/);
  assert.doesNotMatch(sw, /url\.pathname==="\/guia"/);

  const server = readFileSync(join(root, "server", "app.js"), "utf8");
  assert.match(server, /bundledPath\s*=\s*resolve\("\.\/public\/guia\/index\.html"\)/);
  assert.doesNotMatch(server, /guia_offline\.html/);
});
