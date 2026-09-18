import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID, scryptSync } from "node:crypto";
import { openDatabase } from "../server/db.js";
import { createApp } from "../server/app.js";
import { addDays, bookingPolicy, calculateQuote, today } from "../server/domain.js";

function fixture() {
  const db = openDatabase(":memory:");
  const settings = JSON.parse(db.prepare("SELECT value FROM settings WHERE id=1").get().value);
  db.prepare("UPDATE settings SET value=? WHERE id=1").run(JSON.stringify({
    ...settings,
    pricingEnabled: true,
    cleaningFeeCents: 10000,
    minLeadDays: 0,
    maxAdvanceDays: 365,
    maxNights: 10,
    requestHoldMinutes: 30,
  }));
  const start = addDays(today(), 1);
  const end = addDays(today(), 366);
  db.prepare("INSERT INTO rates VALUES(?,?,?,?,?,?,?)").run(
    "v2-test", "Tarifa teste", start, end, 20000, 25000, 2,
  );
  return db;
}

async function startApp(db) {
  const password = "test-only-password";
  const salt = "test-salt";
  const app = createApp(db, {
    passwordHash: salt + ":" + scryptSync(password, salt, 64).toString("hex"),
    reservationTokenSecret: "0123456789abcdef0123456789abcdef0123456789abcdef",
  });
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  const base = `http://127.0.0.1:${server.address().port}/api`;
  let cookie = "";
  const call = async (path, method = "GET", body, extra = {}) => {
    const response = await fetch(base + path, {
      method,
      headers: {
        ...(body ? { "Content-Type":"application/json" } : {}),
        ...(cookie ? { Cookie:cookie } : {}),
        ...extra,
      },
      ...(body ? { body:JSON.stringify(body) } : {}),
    });
    return { status:response.status, data:await response.json(), headers:response.headers };
  };
  return {
    server, call,
    login: async () => {
      const response = await call("/admin/login", "POST", { password });
      assert.equal(response.status, 200);
      cookie = response.headers.get("set-cookie").split(";")[0];
    },
  };
}

test("política de reserva limita janela e duração", () => {
  const db = fixture();
  const policy = bookingPolicy(db);
  assert.equal(policy.maxNights, 10);
  const start = addDays(today(), 15);
  const valid = calculateQuote(db, start, addDays(start, 3));
  assert.equal(valid.nights, 3);
  assert.throws(() => calculateQuote(db, start, addDays(start, 11)), /no máximo 10 noites/);
  assert.throws(() => calculateQuote(db, addDays(today(), 366), addDays(today(), 368)), /até 365 dias/);
  db.close();
});

test("limite de tentativas administrativas é persistido no banco", async () => {
  const db = fixture();
  const { server, call } = await startApp(db);
  try {
    for (let i = 0; i < 8; i++) {
      const attempt = await call("/admin/login", "POST", { password:"senha-incorreta" });
      assert.equal(attempt.status, 401);
    }
    const blocked = await call("/admin/login", "POST", { password:"senha-incorreta" });
    assert.equal(blocked.status, 429);
    const row = db.prepare("SELECT scope,count FROM rate_limits WHERE scope='login'").get();
    assert.equal(row.scope, "login");
    assert.ok(row.count >= 9);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    db.close();
  }
});

test("primeira solicitação recebe prioridade; concorrente vira fila e token consulta somente sua reserva", async () => {
  const db = fixture();
  const { server, call, login } = await startApp(db);
  try {
    const checkIn = addDays(today(), 20);
    const checkOut = addDays(checkIn, 3);
    const quote = await call("/quote", "POST", { checkIn, checkOut });
    assert.equal(quote.status, 200);

    const payload = {
      name:"Pessoa Um", email:"um@example.com", phone:"83999999999", guests:2,
      hasPet:false, notes:"Teste motor v2", consent:true, checkIn, checkOut,
      expectedTotalCents:quote.data.totalCents,
    };
    const firstKey = randomUUID();
    const first = await call("/reservations", "POST", payload, { "Idempotency-Key":firstKey });
    assert.equal(first.status, 201);
    assert.equal(first.data.holdGranted, true);
    assert.ok(first.data.manageToken.length >= 40);

    const replay = await call("/reservations", "POST", payload, { "Idempotency-Key":firstKey });
    assert.equal(replay.status, 201);
    assert.equal(replay.data.id, first.data.id);
    assert.equal(replay.data.manageToken, first.data.manageToken);

    const blockedQuote = await call("/quote", "POST", { checkIn, checkOut });
    assert.equal(blockedQuote.status, 409);

    const second = await call("/reservations", "POST", { ...payload, name:"Pessoa Dois", email:"dois@example.com" }, { "Idempotency-Key":randomUUID() });
    assert.equal(second.status, 201);
    assert.equal(second.data.holdGranted, false);

    const wrong = await call(`/reservations/${first.data.id}/status`, "GET", undefined, { "X-Reservation-Token":"errado" });
    assert.equal(wrong.status, 404);
    const status = await call(`/reservations/${first.data.id}/status`, "GET", undefined, { "X-Reservation-Token":first.data.manageToken });
    assert.equal(status.status, 200);
    assert.equal(status.data.hold.active, true);
    assert.equal(status.data.status, "requested");

    const genericPayment = await call("/payment-options");
    assert.ok(genericPayment.data.bank);
    assert.ok(Object.values(genericPayment.data.bank).every((v) => v === ""));

    await login();
    const release = await call(`/admin/reservations/${first.data.id}/hold`, "DELETE", {});
    assert.equal(release.status, 200);
    const grantSecond = await call(`/admin/reservations/${second.data.id}/hold`, "POST", { minutes:45 });
    assert.equal(grantSecond.status, 200);

    const admin = await call("/admin/data");
    const firstAdmin = admin.data.reservations.find((r) => r.id === first.data.id);
    const secondAdmin = admin.data.reservations.find((r) => r.id === second.data.id);
    assert.equal(firstAdmin.holdExpiresAt, null);
    assert.ok(secondAdmin.holdExpiresAt);
    assert.ok(secondAdmin.events.some((e) => e.event === "hold.granted"));
  } finally {
    await new Promise((resolve) => server.close(resolve));
    db.close();
  }
});
