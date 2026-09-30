import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { openDatabase } from "../server/db.js";
import { calculateQuote } from "../server/domain.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function fixture() {
  const db = openDatabase(":memory:");
  const current = JSON.parse(
    db.prepare("SELECT value FROM settings WHERE id=1").get().value
  );

  db.prepare("UPDATE settings SET value=? WHERE id=1").run(JSON.stringify({
    ...current,
    pricingEnabled: true,
    cleaningFeeCents: 0,
    depositPercent: 20,
    maxGuests: 6,
    includedGuests: 2,
    additionalGuestFeeCents: 5000,
    holidayDates: [],
  }));

  db.prepare("INSERT INTO rates VALUES(?,?,?,?,?,?,?)").run(
    "v238",
    "Tarifa atual",
    "2026-10-01",
    "2030-01-01",
    12000,
    15000,
    1
  );

  return db;
}

test("v2.3.8 cobra R$ 50 por hóspede adicional a cada noite", () => {
  const db = fixture();

  const q = calculateQuote(db, "2026-10-02", "2026-10-04", { guests: 4 });

  assert.equal(q.nights, 2);
  assert.equal(q.subtotalCents, 30000);
  assert.equal(q.additionalGuests, 2);
  assert.equal(q.additionalGuestFeeCents, 5000);
  assert.equal(q.guestFeeCents, 20000);
  assert.equal(q.totalCents, 50000);
  assert.equal(q.depositCents, 10000);

  db.close();
});

test("v2.3.8 mantém casal sem adicional", () => {
  const db = fixture();

  const q = calculateQuote(db, "2026-10-02", "2026-10-04", { guests: 2 });

  assert.equal(q.guestFeeCents, 0);
  assert.equal(q.totalCents, 30000);

  db.close();
});

test("v2.3.8 publica a nova regra e atualiza versões", () => {
  const html = readFileSync(join(root, "public", "index.html"), "utf8");
  const admin = readFileSync(join(root, "public", "admin.html"), "utf8");
  const i18n = readFileSync(join(root, "public", "i18n.js"), "utf8");
  const server = readFileSync(join(root, "server", "app.js"), "utf8");
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  const sw = readFileSync(join(root, "public", "sw.js"), "utf8");
  const gradle = readFileSync(join(root, "app", "build.gradle.kts"), "utf8");

  assert.match(html, /Adicional por noite/);
  assert.match(html, /R\$ 50 por pessoa a cada noite da hospedagem/);
  assert.doesNotMatch(html, /uma única vez por hospedagem/);
  assert.match(admin, /Adicional por hóspede\/noite/);
  assert.match(i18n, /Adicional por noche/);
  assert.match(server, /http:\/\/localhost:3001/);

  assert.equal(pkg.version, "2.3.9");
  assert.match(sw, /venus-shell-v15/);
  assert.match(gradle, /versionCode = 239/);
  assert.match(gradle, /versionName = "2\.3\.9"/);
});
