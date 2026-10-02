import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

test("v2.3.10 consolida domingo, termo v5 e proteção do sistema solar", () => {
  const domain = readFileSync(join(root, "server", "domain.js"), "utf8");
  const compliance = readFileSync(join(root, "server", "compliance.js"), "utf8");
  const term = readFileSync(join(root, "docs", "termo-compromisso-minuta.txt"), "utf8");
  const html = readFileSync(join(root, "public", "index.html"), "utf8");
  const admin = readFileSync(join(root, "public", "admin.html"), "utf8");
  const i18n = readFileSync(join(root, "public", "i18n.js"), "utf8");
  const sw = readFileSync(join(root, "public", "sw.js"), "utf8");
  const gradle = readFileSync(join(root, "app", "build.gradle.kts"), "utf8");
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));

  assert.match(domain, /\[0, 5, 6\]/);
  assert.match(compliance, /2026-10-02-v5/);

  assert.match(term, /SISTEMA DE ENERGIA SOLAR/);
  assert.match(term, /incluindo o inversor/);
  assert.match(term, /sem tentar realizar reparos por conta própria/);

  assert.match(html, /sexta, sábado e domingo/);
  assert.match(admin, /Sex\/Sáb\/Dom\/Feriado/);
  assert.match(i18n, /viernes, sábado y domingo/);

  assert.equal(pkg.version, "2.3.10");
  assert.match(sw, /venus-shell-v17/);
  assert.match(gradle, /versionCode = 240/);
  assert.match(gradle, /versionName = "2\.3\.10"/);
});