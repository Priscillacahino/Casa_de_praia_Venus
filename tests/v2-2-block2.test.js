import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID, scryptSync } from "node:crypto";
import { openDatabase } from "../server/db.js";
import { createApp } from "../server/app.js";
import { addDays, today } from "../server/domain.js";

const SECRET = "abcdef0123456789abcdef0123456789abcdef0123456789";

function fixture() {
  const db = openDatabase(":memory:");
  const settings = JSON.parse(db.prepare("SELECT value FROM settings WHERE id=1").get().value);
  db.prepare("UPDATE settings SET value=? WHERE id=1").run(JSON.stringify({
    ...settings,
    pricingEnabled: true,
    cleaningFeeCents: 10000,
    maxAdvanceDays: 365,
    maxNights: 30,
  }));
  const start = addDays(today(), 1);
  const end = addDays(today(), 366);
  db.prepare("INSERT INTO rates VALUES(?,?,?,?,?,?,?)").run(
    "block2-rate", "Tarifa teste", start, end, 20000, 25000, 2,
  );
  return db;
}

async function startApp(db) {
  const password = "test-only-password";
  const salt = "test-salt";
  const app = createApp(db, {
    passwordHash: salt + ":" + scryptSync(password, salt, 64).toString("hex"),
    reservationTokenSecret: SECRET,
  });
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  const base = `http://127.0.0.1:${server.address().port}/api`;
  let cookie = "";

  async function call(path, method = "GET", body, extra = {}) {
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
  }

  async function login() {
    const response = await call("/admin/login", "POST", { password });
    assert.equal(response.status, 200);
    cookie = response.headers.get("set-cookie").split(";")[0];
  }

  return { server, call, login };
}

async function createReservation(call, name = "Hóspede Teste") {
  const checkIn = addDays(today(), 20);
  const checkOut = addDays(checkIn, 3);
  const quote = await call("/quote", "POST", { checkIn, checkOut });
  assert.equal(quote.status, 200);
  const response = await call("/reservations", "POST", {
    name,
    email:"hospede@example.com",
    phone:"83999999999",
    guests:2,
    hasPet:false,
    notes:"Bloco 2",
    consent:true,
    checkIn,
    checkOut,
    expectedTotalCents:quote.data.totalCents,
  }, { "Idempotency-Key":randomUUID() });
  assert.equal(response.status, 201);
  return response.data;
}

test("rotação do código privado invalida o anterior e preserva o novo acesso", async () => {
  const db = fixture();
  const { server, call, login } = await startApp(db);
  try {
    const reservation = await createReservation(call);
    await login();
    const rotated = await call(`/admin/reservations/${reservation.id}/rotate-token`, "POST", {});
    assert.equal(rotated.status, 200);
    assert.notEqual(rotated.data.manageToken, reservation.manageToken);
    assert.equal(rotated.data.tokenVersion, 2);

    const oldAccess = await call(`/reservations/${reservation.id}/status`, "GET", undefined, {
      "X-Reservation-Token": reservation.manageToken,
    });
    assert.equal(oldAccess.status, 404);

    const newAccess = await call(`/reservations/${reservation.id}/status`, "GET", undefined, {
      "X-Reservation-Token": rotated.data.manageToken,
    });
    assert.equal(newAccess.status, 200);
    assert.equal(db.prepare("SELECT token_version FROM reservations WHERE id=?").get(reservation.id).token_version, 2);
    assert.ok(db.prepare("SELECT 1 FROM reservation_events WHERE reservation_id=? AND event='access_token.rotated'").get(reservation.id));
  } finally {
    await new Promise((resolve) => server.close(resolve));
    db.close();
  }
});

test("avaliação exige token, reserva confirmada e estadia encerrada", async () => {
  const db = fixture();
  const { server, call, login } = await startApp(db);
  try {
    const reservation = await createReservation(call, "Hóspede Verificado");

    const early = await call("/reviews", "POST", {
      reservationId:reservation.id, rating:5, comment:"Uma experiência realmente muito boa.", consent:true,
    }, { "X-Reservation-Token":reservation.manageToken });
    assert.equal(early.status, 422);

    db.prepare("UPDATE reservations SET status='confirmed',check_in=?,check_out=? WHERE id=?")
      .run(addDays(today(), -4), addDays(today(), -1), reservation.id);

    const submitted = await call("/reviews", "POST", {
      reservationId:reservation.id, rating:5, comment:"Uma experiência realmente muito boa.", consent:true,
    }, { "X-Reservation-Token":reservation.manageToken });
    assert.equal(submitted.status, 201);

    const duplicate = await call("/reviews", "POST", {
      reservationId:reservation.id, rating:4, comment:"Tentativa duplicada de avaliação.", consent:true,
    }, { "X-Reservation-Token":reservation.manageToken });
    assert.equal(duplicate.status, 409);

    const stored = db.prepare("SELECT reservation_id,name,approved FROM reviews WHERE id=?").get(submitted.data.id);
    assert.equal(stored.reservation_id, reservation.id);
    assert.equal(stored.name, "Hóspede Verificado");
    assert.equal(stored.approved, 0);

    const status = await call(`/reservations/${reservation.id}/status`, "GET", undefined, {
      "X-Reservation-Token":reservation.manageToken,
    });
    assert.equal(status.data.reviewEligible, false);
    assert.equal(status.data.reviewSubmitted, true);

    await login();
    assert.equal((await call(`/admin/reviews/${submitted.data.id}`, "PATCH", { approved:true })).status, 200);
    const publicData = await call("/public");
    assert.equal(publicData.data.reviewStats.count, 1);
    assert.equal(publicData.data.reviews[0].name, "Hóspede Verificado");
  } finally {
    await new Promise((resolve) => server.close(resolve));
    db.close();
  }
});

test("conciliação separa entradas, estornos, líquido e saldo confirmado", async () => {
  const db = fixture();
  const { server, call, login } = await startApp(db);
  try {
    const reservationId = "finance-block2";
    db.prepare(`INSERT INTO reservations
      (id,request_key,request_hash,token_version,name,email,phone,check_in,check_out,guests,status,quote)
      VALUES(?,?,?,?,?,?,?,?,?,?,'confirmed',?)`).run(
      reservationId, "finance-request-key-123456", "hash", 1, "Financeiro Teste",
      "finance@example.com", "83999999999", addDays(today(), 10), addDays(today(), 13), 2,
      JSON.stringify({ totalCents:100000, depositCents:20000, depositPercent:20, nights:3 }),
    );

    await login();

    assert.equal((await call("/admin/payments", "POST", {
      reservationId, amountCents:40000, note:"Entrada conciliada", method:"pix",
      bankReference:"block2-payment-001", settled:true,
    })).status, 201);

    assert.equal((await call("/admin/payments", "POST", {
      reservationId, amountCents:-5000, note:"Estorno parcial conciliado", method:"pix",
      bankReference:"block2-refund-001", settled:true,
    })).status, 201);

    const finance = await call("/admin/finance");
    assert.equal(finance.status, 200);
    assert.equal(finance.data.summary.grossInflowCents, 40000);
    assert.equal(finance.data.summary.refundsCents, 5000);
    assert.equal(finance.data.summary.netReceivedCents, 35000);
    assert.equal(finance.data.summary.confirmedContractedCents, 100000);
    assert.equal(finance.data.summary.confirmedReceivedCents, 35000);
    assert.equal(finance.data.summary.confirmedOutstandingCents, 65000);

    const row = finance.data.rows.find((r) => r.reservationId === reservationId);
    assert.equal(row.receivedCents, 35000);
    assert.equal(row.balanceCents, 65000);
    assert.ok(db.prepare("SELECT 1 FROM audit WHERE action='payment.refund_recorded'").get());
    assert.ok(db.prepare("SELECT 1 FROM reservation_events WHERE reservation_id=? AND event='payment.refund_recorded'").get(reservationId));
  } finally {
    await new Promise((resolve) => server.close(resolve));
    db.close();
  }
});

test("reserva cancelada rejeita nova entrada positiva e aceita estorno do saldo recebido", async () => {
  const db = fixture();
  const { server, call, login } = await startApp(db);
  try {
    const reservation = await createReservation(call, "Hóspede Cancelamento");
    await login();
    assert.equal((await call("/admin/payments", "POST", { reservationId:reservation.id, amountCents:10000, note:"Entrada antes do cancelamento", method:"pix", bankReference:"cancel-test-payment-001", settled:true })).status, 201);
    assert.equal((await call(`/admin/reservations/${reservation.id}`, "PATCH", { status:"cancelled" })).status, 200);
    const novaEntrada = await call("/admin/payments", "POST", { reservationId:reservation.id, amountCents:1000, note:"Entrada indevida", method:"pix", bankReference:"cancel-test-payment-002", settled:true });
    assert.equal(novaEntrada.status, 409);
    assert.equal((await call("/admin/payments", "POST", { reservationId:reservation.id, amountCents:-5000, note:"Estorno parcial", method:"pix", bankReference:"cancel-test-refund-001", settled:true })).status, 201);
    const movements = db.prepare("SELECT movement_type,settled_at FROM payments WHERE reservation_id=? ORDER BY created_at").all(reservation.id);
    assert.deepEqual(movements.map((m) => m.movement_type), ["payment","refund"]);
    assert.ok(movements.every((m) => m.settled_at));
  } finally {
    await new Promise((resolve) => server.close(resolve));
    db.close();
  }
});
