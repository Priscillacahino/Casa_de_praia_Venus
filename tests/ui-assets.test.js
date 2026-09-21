import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

test("galeria mobile referencia apenas imagens existentes", () => {
  const html = readFileSync(join(root, "public", "index.html"), "utf8");
  const groups = [...html.matchAll(/data-gallery-images="([^"]+)"/g)].map((match) => match[1]);
  assert.ok(groups.length >= 6, "esperava ao menos seis ambientes na galeria");
  for (const group of groups) {
    for (const image of group.split("|").filter(Boolean)) {
      assert.match(image, /^\/images\/[A-Za-z0-9_.-]+$/);
      assert.ok(existsSync(join(root, "public", image.replace(/^\//, ""))), `imagem ausente: ${image}`);
    }
  }
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

test("Android permite pin SHA-256 do Guia e configuração externa de assinatura", () => {
  const gradle = readFileSync(join(root, "app", "build.gradle.kts"), "utf8");
  const guide = readFileSync(join(root, "app", "src", "main", "java", "com", "aistudio", "venusbeachhouse", "GuideRepository.kt"), "utf8");
  assert.match(gradle, /GUIDE_EXPECTED_SHA256/);
  assert.match(gradle, /VENUS_KEYSTORE_PATH/);
  assert.match(guide, /MessageDigest\.getInstance\("SHA-256"\)/);
});
