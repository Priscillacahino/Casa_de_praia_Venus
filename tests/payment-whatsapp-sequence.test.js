import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { openDatabase } from "../server/db.js";
import { createApp } from "../server/app.js";
import { TERM_HASH } from "../server/compliance.js";

test("pagamento informado exige início prévio pelo WhatsApp oficial", async () => {
  const db = openDatabase(":memory:");
  const settings = JSON.parse(db.prepare("SELECT value FROM settings WHERE id=1").get().value);
  db.prepare("UPDATE settings SET value=? WHERE id=1").run(JSON.stringify({
    ...settings, pricingEnabled:true, cleaningFeeCents:12000, depositPercent:20,
    whatsappNumber:"5583986705999",
  }));
  db.prepare("INSERT INTO rates VALUES(?,?,?,?,?,?,?)").run(
    "test","Teste","2030-01-01","2031-01-01",24000,32000,1
  );
  const app=createApp(db);
  const server=app.listen(0,"127.0.0.1");
  await new Promise((r)=>server.once("listening",r));
  const base=`http://127.0.0.1:${server.address().port}/api`;
  const call=async(path,method="GET",body,headers={})=>{
    const res=await fetch(base+path,{method,headers:{...(body?{"Content-Type":"application/json"}:{}),...headers},...(body?{body:JSON.stringify(body)}:{})});
    return {status:res.status,data:await res.json()};
  };
  try {
    const quote=(await call("/quote","POST",{checkIn:"2030-01-03",checkOut:"2030-01-04"})).data;
    const request=await call("/reservations","POST",{
      name:"Pessoa Teste",email:"teste@example.com",phone:"83999999999",guests:2,hasPet:false,notes:"",
      consent:true,checkIn:"2030-01-03",checkOut:"2030-01-04",expectedTotalCents:quote.totalCents
    },{"Idempotency-Key":randomUUID()});
    assert.equal(request.status,201);
    const auth={"X-Reservation-Token":request.data.manageToken};
    assert.equal((await call(`/reservations/${request.data.id}/payment-reported`,"POST",{},auth)).status,409);
    assert.equal((await call(`/reservations/${request.data.id}/whatsapp-started`,"POST",{},auth)).status,409);
    db.prepare("UPDATE legal_approval SET approved=1,term_hash=? WHERE id=1").run(TERM_HASH);
    db.prepare(`INSERT INTO signed_terms(id,reservation_id,pdf,sha256,term_hash,validated_at,reviewer,validation_reference)
      VALUES(?,?,?,?,?,CURRENT_TIMESTAMP,'Teste automatizado','VALIDAR-TESTE')`).run(
      randomUUID(), request.data.id, Buffer.from("%PDF-1.4\n%%EOF"), "sha-payment-sequence", TERM_HASH,
    );
    assert.equal((await call(`/reservations/${request.data.id}/whatsapp-started`,"POST",{},auth)).status,201);
    const status=(await call(`/reservations/${request.data.id}/status`,"GET",undefined,auth)).data;
    assert.equal(status.whatsappStarted,true);
    assert.equal((await call(`/reservations/${request.data.id}/payment-reported`,"POST",{},auth)).status,201);
  } finally {
    await new Promise((r)=>server.close(r));
    db.close();
  }
});
