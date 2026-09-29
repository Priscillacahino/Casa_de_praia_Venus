import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

test("v2.3.6 adiciona calendário visual e jornada da reserva", () => {
  const html = readFileSync(join(root, "public", "index.html"), "utf8");
  const css = readFileSync(join(root, "public", "styles.css"), "utf8");

  assert.match(html, /id="availabilityCalendar"/);
  assert.match(html, /id="availabilityDays"/);
  assert.match(html, /id="reservationProgress"/);
  assert.match(html, /id="reservationConfirmation"/);
  assert.match(html, /id="forgetReservationAccess"/);
  assert.match(html, /src="\/booking-experience\.js"/);

  assert.match(css, /\.availability-calendar/);
  assert.match(css, /\.reservation-progress/);
  assert.match(css, /\.availability-day\.is-unavailable/);
});

test("v2.3.6 consulta disponibilidade e restaura acompanhamento somente por sessão", () => {
  const file = join(root, "public", "booking-experience.js");
  assert.ok(existsSync(file));

  const js = readFileSync(file, "utf8");
  assert.match(js, /\/availability\?start=/);
  assert.match(js, /sessionStorage\.setItem/);
  assert.match(js, /sessionStorage\.removeItem/);
  assert.match(js, /visibilitychange/);
  assert.match(js, /window\.addEventListener\("focus"/);
  assert.doesNotMatch(js, /localStorage\.setItem/);

  const app = readFileSync(join(root, "public", "app.js"), "utf8");
  assert.match(app, /venus:reservationstate/);
});

test("v2.3.6 corrige fonte do guia e atualiza PWA sem enfraquecer backend", () => {
  const env = readFileSync(join(root, ".env.example"), "utf8");
  const sw = readFileSync(join(root, "public", "sw.js"), "utf8");
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  const runtime = readFileSync(join(root, "server", "runtime-config.js"), "utf8");

  assert.doesNotMatch(env, /guia_offline\.html/);
  assert.match(env, /Casa_de_praia_Venus\/main\/public\/guia\/index\.html/);
  assert.match(sw, /venus-shell-v12/);
  assert.match(sw, /"\/booking-experience\.js"/);
  assert.equal(pkg.version, "2.3.6");

  assert.match(runtime, /VERCEL/);
  assert.match(runtime, /armazenamento persistente/);
});
