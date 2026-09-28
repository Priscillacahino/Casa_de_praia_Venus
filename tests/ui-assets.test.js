import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

test("site público não publica fotos da casa sem origem validada", () => {
  const html = readFileSync(join(root, "public", "index.html"), "utf8");
  assert.match(html, /Fotos reais em atualização/);
  assert.doesNotMatch(html, /<img[^>]+\/images\/(?:quarto_abduzido|quarto_escritorio|sala_divindade|cozinha_chef|piscina_churrasqueira|area_externa_rede)/);
  assert.doesNotMatch(html, /data-gallery-images=/);
});

test("PWA mantém atalhos da casa, reserva e guia", () => {
  const manifest = JSON.parse(readFileSync(join(root, "public", "manifest.webmanifest"), "utf8"));
  assert.equal(manifest.id, "/");
  assert.equal(manifest.display, "standalone");
  const urls = new Set((manifest.shortcuts || []).map((item) => item.url));
  assert.ok(urls.has("/#ambientes"));
  assert.ok(urls.has("/#reserva"));
  assert.ok(urls.has("/guia"));
});

test("proteção de arquivos estáticos permanece compatível com caminhos Windows", () => {
  const server = readFileSync(join(root, "server", "app.js"), "utf8");
  assert.match(server, /relative\(staticDir,\s*target\)/);
  assert.match(server, /isAbsolute\(relativeTarget\)/);
});

test("arquivos principais não apresentam sequências comuns de mojibake", () => {
  const suspicious = [
    /\u00C3[\u00A0-\u00BF]/,
    /\u00C2[\u00A0-\u00BF]/,
    /\u00E2[\u0080-\u00BF]/,
  ];
  for (const rel of ["server/app.js", "public/index.html", "public/app.js", "README.md"]) {
    const source = readFileSync(join(root, rel), "utf8");
    assert.equal(suspicious.some((pattern) => pattern.test(source)), false, `encoding suspeito em ${rel}`);
  }
});

test("interface prepara distribuição direta do APK sem persistir código privado no navegador", () => {
  const html = readFileSync(join(root, "public", "index.html"), "utf8");
  const app = readFileSync(join(root, "public", "app.js"), "utf8");
  const admin = readFileSync(join(root, "public", "admin.html"), "utf8");
  assert.match(html, /id="androidAppDownload"/);
  assert.match(admin, /name="androidApkSha256"/);
  assert.doesNotMatch(app, /venus:lastReservation/);
  assert.doesNotMatch(app, /sessionStorage/);
});

test("painel administrativo fica fora do cache PWA e da indexação", () => {
  const sw = readFileSync(join(root, "public", "sw.js"), "utf8");
  const shellMatch = sw.match(/const SHELL=(\[[^;]+\])/);
  assert.ok(shellMatch, "lista SHELL do service worker não encontrada");
  const shell = JSON.parse(shellMatch[1]);
  assert.equal(shell.includes("/admin.html"), false);
  assert.equal(shell.includes("/admin.js"), false);
  const admin = readFileSync(join(root, "public", "admin.html"), "utf8");
  assert.match(admin, /name="robots" content="noindex,nofollow"/);
});

test("site expõe cancelamento autenticado e política de privacidade", () => {
  const html = readFileSync(join(root, "public", "index.html"), "utf8");
  assert.match(html, /id="requestCancellation"/);
  assert.match(html, /id="continueWhatsApp"/);
  assert.match(html, /id="reportPayment"/);
  assert.match(html, /href="\/privacidade.html"/);
  assert.ok(existsSync(join(root, "public", "privacidade.html")));
  assert.ok(existsSync(join(root, "public", "privacy.js")));
  assert.ok(existsSync(join(root, "public", "termos.html")));
  assert.ok(existsSync(join(root, "public", "terms.js")));
});

test("Android permite pin SHA-256 do Guia e configuração externa de assinatura", () => {
  const gradle = readFileSync(join(root, "app", "build.gradle.kts"), "utf8");
  const guide = readFileSync(join(root, "app", "src", "main", "java", "com", "aistudio", "venusbeachhouse", "GuideRepository.kt"), "utf8");
  assert.match(gradle, /GUIDE_EXPECTED_SHA256/);
  assert.match(gradle, /VENUS_KEYSTORE_PATH/);
  assert.match(guide, /MessageDigest\.getInstance\("SHA-256"\)/);
});

test("Android não associa fotos não validadas aos ambientes da casa", () => {
  const data = readFileSync(join(root, "app", "src", "main", "java", "com", "aistudio", "venusbeachhouse", "data", "HouseData.kt"), "utf8");
  for (const image of [
    "piscina_churrasqueira.jpg",
    "quarto_abduzido.jpg",
    "quarto_abduzido_angulo2.jpg",
    "quarto_escritorio.jpg",
    "area_externa_rede.jpg",
    "sala_divindade.jpg",
    "cozinha_chef.jpg",
  ]) {
    assert.doesNotMatch(data, new RegExp(image.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  const assetImage = readFileSync(join(root, "app", "src", "main", "java", "com", "aistudio", "venusbeachhouse", "ui", "components", "AssetImage.kt"), "utf8");
  assert.match(assetImage, /assetPath\.isBlank\(\)/);
});
