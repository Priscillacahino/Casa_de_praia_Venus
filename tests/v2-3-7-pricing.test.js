import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { openDatabase } from "../server/db.js";
import { calculateQuote } from "../server/domain.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function pricingFixture() {
  const db = openDatabase(":memory:");
  const settings = JSON.parse(db.prepare("SELECT value FROM settings WHERE id=1").get().value);
  db.prepare("UPDATE settings SET value=? WHERE id=1").run(JSON.stringify({
    ...settings,
    pricingEnabled: true,
    cleaningFeeCents: 0,
    depositPercent: 20,
    maxGuests: 6,
    includedGuests: 2,
    additionalGuestFeeCents: 5000,
    holidayDates: ["2030-01-08"],
  }));
  db.prepare("INSERT INTO rates VALUES(?,?,?,?,?,?,?)").run(
    "v237",
    "Tarifa atual",
    "2030-01-01",
    "2031-01-01",
    12000,
    15000,
    1,
  );
  return db;
}

test("v2.3.7 cobra adicional por pessoa uma única vez por hospedagem", () => {
  const db = pricingFixture();
  const q = calculateQuote(db, "2030-01-07", "2030-01-10", { guests: 4 });
  assert.equal(q.nights, 3);
  assert.equal(q.subtotalCents, 39000);
  assert.equal(q.additionalGuests, 2);
  assert.equal(q.guestFeeCents, 10000);
  assert.equal(q.totalCents, 49000);
  assert.equal(q.depositCents, 9800);
  db.close();
});

test("v2.3.7 mantém casal incluído e aplica tarifa de feriado cadastrada", () => {
  const db = pricingFixture();
  const couple = calculateQuote(db, "2030-01-08", "2030-01-09", { guests: 2 });
  assert.equal(couple.subtotalCents, 15000);
  assert.equal(couple.guestFeeCents, 0);
  assert.equal(couple.nightlyDetails[0].rateType, "holiday");

  const full = calculateQuote(db, "2030-01-08", "2030-01-09", { guests: 6 });
  assert.equal(full.guestFeeCents, 20000);
  assert.equal(full.totalCents, 35000);
  assert.throws(() => calculateQuote(db, "2030-01-08", "2030-01-09", { guests: 7 }));
  db.close();
});

test("v2.3.7 publica tabela, atualiza cotação por hóspedes e permite cadastrar feriados", () => {
  const html = readFileSync(join(root, "public", "index.html"), "utf8");
  const app = readFileSync(join(root, "public", "app.js"), "utf8");
  const admin = readFileSync(join(root, "public", "admin.html"), "utf8");
  const adminJs = readFileSync(join(root, "public", "admin.js"), "utf8");
  const i18n = readFileSync(join(root, "public", "i18n.js"), "utf8");

  assert.match(html, /R\$ 120\/noite/);
  assert.match(html, /R\$ 150\/noite/);
  assert.match(html, /uma única vez por hospedagem/);
  assert.match(app, /guestFeeCents/);
  assert.match(app, /JSON\.stringify\(\{ checkIn, checkOut, guests \}\)/);
  assert.match(admin, /name="additionalGuestFee"/);
  assert.match(admin, /name="holidayDates"/);
  assert.match(adminJs, /additionalGuestFeeCents/);
  assert.match(i18n, /Hasta 2 huéspedes están incluidos/);
});

test("v2.3.7 remove fonte Android inexistente do Guia e alinha versões", () => {
  const house = readFileSync(join(root, "app", "src", "main", "java", "com", "aistudio", "venusbeachhouse", "data", "HouseData.kt"), "utf8");
  const gradle = readFileSync(join(root, "app", "build.gradle.kts"), "utf8");
  const repository = readFileSync(join(root, "app", "src", "main", "java", "com", "aistudio", "venusbeachhouse", "GuideRepository.kt"), "utf8");
  const releaseCheck = readFileSync(join(root, "scripts", "android-release-check.js"), "utf8");
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  const sw = readFileSync(join(root, "public", "sw.js"), "utf8");

  assert.doesNotMatch(house, /guia_offline\.html/);
  assert.match(gradle, /versionName = "2\.3\.7"/);
  assert.match(gradle, /GUIDE_SOURCE_URL/);
  assert.match(repository, /BuildConfig\.GUIDE_SOURCE_URL/);
  assert.match(releaseCheck, /VENUS_GUIDE_URL/);
  assert.equal(pkg.version, "2.3.7");
  assert.match(sw, /venus-shell-v13/);
});

test("v2.3.7 corrige marca da minuta contratual e mantém status de minuta", () => {
  const term = readFileSync(join(root, "docs", "termo-compromisso-minuta.txt"), "utf8");
  const compliance = readFileSync(join(root, "server", "compliance.js"), "utf8");
  assert.match(term, /VÊNUS CASA DE PRAIA/);
  assert.doesNotMatch(term, /VÊNUS BEACH HOUSE/);
  assert.match(term, /MINUTA NÃO VIGENTE/);
  assert.match(compliance, /2026-09-30-v3/);
});
