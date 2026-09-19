import test from "node:test";
import assert from "node:assert/strict";
import { scryptSync, randomUUID } from "node:crypto";
import { openDatabase } from "../server/db.js";
import { createApp } from "../server/app.js";
import { calculateQuote, datesBetween, csv } from "../server/domain.js";
const fixture = () => {
  const db = openDatabase(":memory:");
  const settings = JSON.parse(
    db.prepare("SELECT value FROM settings").get().value,
  );
  db.prepare("UPDATE settings SET value=?").run(
    JSON.stringify({
      ...settings,
      pricingEnabled: true,
      cleaningFeeCents: 12000,
      depositPercent: 20,
    }),
  );
  db.prepare("INSERT INTO rates VALUES(?,?,?,?,?,?,?)").run(
    "test",
    "Teste isolado",
    "2030-01-01",
    "2031-01-01",
    24000,
    32000,
    2,
  );
  return db;
};
test("calcula centavos, sexta/sábado, limpeza única e saída exclusiva", () => {
  const db = fixture();
  const q = calculateQuote(db, "2030-01-03", "2030-01-06");
  assert.equal(q.nights, 3);
  assert.equal(q.subtotalCents, 88000);
  assert.equal(q.totalCents, 100000);
  assert.equal(q.depositCents, 20000);
  db.close();
});
test("percentual do sinal configurável é preservado na cotação e no compliance", async () => {
  const { readiness } = await import("../server/compliance.js");
  const db = fixture();
  const settings = JSON.parse(db.prepare("SELECT value FROM settings WHERE id=1").get().value);
  db.prepare("UPDATE settings SET value=? WHERE id=1").run(JSON.stringify({ ...settings, depositPercent: 35 }));
  const q = calculateQuote(db, "2030-01-03", "2030-01-06");
  assert.equal(q.depositPercent, 35);
  assert.equal(q.depositCents, 35000);
  db.prepare(`INSERT INTO reservations(id,name,email,phone,check_in,check_out,guests,status,quote)
    VALUES(?,?,?,?,?,?,?,'requested',?)`).run(
    "deposit-config", "Pessoa Teste", "teste@example.com", "83999999999",
    "2030-01-03", "2030-01-06", 2, JSON.stringify(q),
  );
  const row = db.prepare("SELECT * FROM reservations WHERE id=?").get("deposit-config");
  assert.equal(readiness(db, row).requiredDepositCents, 35000);
  db.close();
});

test("recusa datas inválidas, período excessivo, tarifa ausente e mínimo", () => {
  const db = fixture();
  assert.throws(() => datesBetween("2030-02-30", "2030-03-05"));
  assert.throws(() => datesBetween("2030-01-01", "2032-01-01"));
  assert.throws(() => calculateQuote(db, "2030-01-03", "2030-01-04"));
  assert.throws(() => calculateQuote(db, "2031-02-01", "2031-02-03"));
  db.close();
});
test("banco novo não inclui tarifas, reservas ou avaliações de exemplo", () => {
  const db = openDatabase(":memory:");
  for (const table of ["rates", "reviews", "reservations"])
    assert.equal(db.prepare(`SELECT COUNT(*) n FROM ${table}`).get().n, 0);
  assert.throws(() => calculateQuote(db, "2030-01-01", "2030-01-03"));
  db.close();
});
test("CSV neutraliza fórmulas em campos de texto", () => {
  assert.match(
    csv([['=HYPERLINK("x")', "+SUM(A1)", "Texto;com;separador"]]),
    /"'=HYPERLINK/,
  );
});
test("fluxo HTTP: acesso, pedido idempotente, conflito, pagamento, avaliação e exportações", async () => {
  const db = fixture();
  const password = "test-only-password";
  const salt = "test-salt";
  const app = createApp(db, {
    passwordHash: salt + ":" + scryptSync(password, salt, 64).toString("hex"),
  });
  const server = app.listen(0, "127.0.0.1");
  await new Promise((r) => server.once("listening", r));
  const base = `http://127.0.0.1:${server.address().port}/api`;
  let cookie = "";
  const call = async (path, method = "GET", body, extra = {}) => {
    const res = await fetch(base + path, {
      method,
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(cookie ? { Cookie: cookie } : {}),
        ...extra,
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    return { status: res.status, data: await res.json(), headers: res.headers };
  };
  try {
    assert.equal((await call("/admin/data")).status, 401);
    assert.equal((await call("/admin/reservations/private/signed-term")).status,401);
    assert.equal(
      (await call("/admin/login", "POST", { password: "wrong" })).status,
      401,
    );
    const login = await call("/admin/login", "POST", { password });
    assert.equal(login.status, 200);
    cookie = login.headers.get("set-cookie").split(";")[0];
    assert.equal((await call("/admin/data")).status, 200);
    assert.equal(
      (
        await call(
          "/admin/blocks",
          "POST",
          { checkIn: "2030-01-03", checkOut: "2030-01-06", notes: "teste" },
          { Origin: "https://evil.example" },
        )
      ).status,
      403,
    );
    const quote = (
      await call("/quote", "POST", {
        checkIn: "2030-01-03",
        checkOut: "2030-01-06",
      })
    ).data;
    const payload = {
      name: "Pessoa Teste",
      email: "teste@example.com",
      phone: "83999999999",
      guests: 2,
      hasPet: false,
      notes: "Teste isolado",
      consent: true,
      checkIn: "2030-01-03",
      checkOut: "2030-01-06",
      expectedTotalCents: quote.totalCents,
    };
    const key = randomUUID();
    const first = await call("/reservations", "POST", payload, {
      "Idempotency-Key": key,
    });
    assert.equal(first.status, 201);
    const repeat = await call("/reservations", "POST", payload, {
      "Idempotency-Key": key,
    });
    assert.equal(first.data.id, repeat.data.id);
    assert.equal(
      (
        await call(
          "/reservations",
          "POST",
          { ...payload, name: "Outro nome" },
          { "Idempotency-Key": key },
        )
      ).status,
      409,
    );
    const second = await call("/reservations", "POST", payload, {
      "Idempotency-Key": randomUUID(),
    });
    assert.equal(second.status, 201);
    const options=(await call('/payment-options')).data;
    assert.equal(options.pixAvailable,false);
    assert.ok(Object.values(options.bank).every(v=>v===''));
    const confirm=id=>call('/admin/reservations/'+id,'PATCH',{status:'confirmed'});
    assert.equal((await confirm(first.data.id)).status,422);
    const compliance=(await call('/admin/compliance')).data;
    assert.equal(compliance.approval.approved,0);
    assert.equal((await call('/admin/legal-approval','POST',{termHash:compliance.termHash,approved:true,confirmedReview:true,reviewer:'Jurídico teste',reference:'Parecer isolado de teste'})).status,200);
    assert.equal((await confirm(first.data.id)).status,422);
    for(const id of [first.data.id,second.data.id]) {
      const upload=await call(`/admin/reservations/${id}/signed-term`,'POST',{base64:Buffer.from('%PDF-1.4\nFixture apenas para testar upload, sem assinatura real').toString('base64')});
      assert.equal(upload.status,201);
      const validation={sha256:upload.data.sha256,signatureChecked:true,identityChecked:true,contentChecked:true,reviewer:'Conferente teste',reference:'Validação humana simulada em teste'};
      assert.equal((await call(`/admin/reservations/${id}/validate-term`,'POST',{...validation,sha256:'wrong'})).status,409);
      assert.equal((await call(`/admin/reservations/${id}/validate-term`,'POST',validation)).status,200);
      const replaced=await call(`/admin/reservations/${id}/signed-term`,'POST',{base64:Buffer.from('%PDF-1.4\nNovo documento de teste').toString('base64')});
      const current=(await call('/admin/data')).data.reservations.find(r=>r.id===id);
      assert.equal(current.requirements.signatureReady,false);
      assert.equal((await call(`/admin/reservations/${id}/validate-term`,'POST',validation)).status,409);
      assert.equal((await call(`/admin/reservations/${id}/validate-term`,'POST',{...validation,sha256:replaced.data.sha256})).status,200);
      assert.equal((await confirm(id)).status,422);
      assert.equal((await call('/admin/payments','POST',{reservationId:id,amountCents:10000,note:'Parcela teste',method:'pix',bankReference:id+'-1',settled:false})).status,400);
      for(let part=1;part<=2;part++) {
        const payment={reservationId:id,amountCents:10000,note:'Parcela teste',method:part===1?'pix':'transfer',bankReference:id+'-'+part,settled:true};
        assert.equal((await call('/admin/payments','POST',payment)).status,201);
        assert.equal((await call('/admin/payments','POST',payment)).status,409);
        if(part===1)assert.equal((await confirm(id)).status,422);
      }
    }

    assert.equal(
      (
        await call("/admin/reservations/" + first.data.id, "PATCH", {
          status: "confirmed",
        })
      ).status,
      200,
    );
    assert.equal(
      (
        await call("/admin/reservations/" + second.data.id, "PATCH", {
          status: "confirmed",
        })
      ).status,
      409,
    );
    assert.equal(
      (
        await call("/quote", "POST", {
          checkIn: "2030-01-06",
          checkOut: "2030-01-08",
        })
      ).status,
      200,
    );
    assert.equal(
      (
        await call("/quote", "POST", {
          checkIn: "2030-01-04",
          checkOut: "2030-01-07",
        })
      ).status,
      409,
    );
    const availability = await call(
      "/availability?start=2030-01-01&end=2030-02-01",
    );
    assert.deepEqual(Object.keys(availability.data.ranges[0]).sort(), [
      "check_in",
      "check_out",
    ]);
    assert.equal(
      (
        await call("/admin/payments", "POST", {
          reservationId: first.data.id,
          amountCents: 30000,
          method: "pix", settled: true, bankReference: "payment-third",
          note: "PIX conferido",
        })
      ).status,
      201,
    );
    assert.equal(
      (
        await call("/admin/payments", "POST", {
          reservationId: first.data.id,
          amountCents: 60000,
          method: "pix", settled: true, bankReference: "payment-excess",
          note: "Excesso",
        })
      ).status,
      400,
    );
    assert.equal(
      (
        await call("/admin/payments", "POST", {
          reservationId: first.data.id,
          amountCents: -60000,
          method: "transfer", settled: true, bankReference: "refund-excess",
          note: "Estorno inválido",
        })
      ).status,
      400,
    );
    assert.equal(
      (
        await call("/messages", "POST", {
          name: "Contato Teste",
          email: "a@example.com",
          phone: "",
          message: "Mensagem de teste isolada",
          consent: true,
        })
      ).status,
      201,
    );
    const review = await call("/reviews", "POST", {
      rating: 5,
      comment: "Comentário de teste isolado",
      consent: true,
    });
    assert.equal(review.status, 400);
    assert.equal((await call("/public")).data.reviews.length, 0);
    const csvRes = await fetch(base + "/admin/export.csv", {
      headers: { Cookie: cookie },
    });
    assert.equal(csvRes.status, 200);
    assert.match(await csvRes.text(), /1000,00/);
    const ics = await fetch(base + "/admin/calendar.ics", {
      headers: { Cookie: cookie },
    });
    const text = await ics.text();
    assert.match(text, /DTEND;VALUE=DATE:20300106/);
    assert.doesNotMatch(text, /Pessoa Teste/);
    await call("/admin/logout", "POST", {});
    assert.equal((await call("/admin/data")).status, 401);
  } finally {
    await new Promise((r) => server.close(r));
    db.close();
  }
});

test('backup preserva dados após fechar e reabrir o banco', async () => {
  const { mkdtempSync, rmSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const { join } = await import('node:path');
  const { DatabaseSync, backup } = await import('node:sqlite');
  const dir = mkdtempSync(join(tmpdir(), 'venus-test-'));
  try {
    const db = openDatabase(join(dir, 'source.sqlite'));
    db.prepare('INSERT INTO messages(id,name,email,phone,dates,message) VALUES(?,?,?,?,?,?)').run('test', 'Teste isolado', 'test@example.com', '', '', 'Mensagem de teste');
    await backup(db, join(dir, 'backup.sqlite'));
    db.close();
    const restored = new DatabaseSync(join(dir, 'backup.sqlite'));
    assert.equal(restored.prepare('SELECT COUNT(*) AS total FROM messages').get().total, 1);
    assert.equal(restored.prepare('PRAGMA integrity_check').get().integrity_check, 'ok');
    restored.close();
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
