import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { openDatabase } from '../server/db.js';
import { createApp } from '../server/app.js';
import { TERM_HASH } from '../server/compliance.js';
test('WhatsApp requer documentação e não recebe nem expõe transações', async () => {
  const db=openDatabase(':memory:');
  const settings=JSON.parse(db.prepare('SELECT value FROM settings WHERE id=1').get().value);
  db.prepare('UPDATE settings SET value=? WHERE id=1').run(JSON.stringify({...settings,pricingEnabled:true,whatsappNumber:'5583986705999'}));
  db.prepare('INSERT INTO rates VALUES(?,?,?,?,?,?,?)').run('test','Teste','2030-01-01','2031-01-01',24000,32000,1);
  const server=createApp(db).listen(0,'127.0.0.1');
  await new Promise(resolve=>server.once('listening',resolve));
  const base='http://127.0.0.1:'+server.address().port+'/api';
  const call=async(path,method='GET',body,headers={})=>{
    const res=await fetch(base+path,{method,headers:{...(body?{'Content-Type':'application/json'}:{}),...headers},...(body?{body:JSON.stringify(body)}:{})});
    return {status:res.status,data:await res.json()};
  };
  try {
    const q=(await call('/quote','POST',{checkIn:'2030-01-03',checkOut:'2030-01-04'})).data;
    const r=await call('/reservations','POST',{name:'Pessoa Teste',email:'teste@example.com',phone:'83999999999',guests:2,consent:true,checkIn:'2030-01-03',checkOut:'2030-01-04',expectedTotalCents:q.totalCents},{'Idempotency-Key':randomUUID()});
    assert.equal(r.status,201);
    const path='/reservations/'+r.data.id;
    const auth={'X-Reservation-Token':r.data.manageToken};
    assert.equal((await call(path+'/whatsapp-started','POST',{},auth)).status,409);
    db.prepare('UPDATE legal_approval SET approved=1,term_hash=? WHERE id=1').run(TERM_HASH);
    db.prepare(`INSERT INTO signed_terms(id,reservation_id,pdf,sha256,term_hash,validated_at,reviewer,validation_reference)
      VALUES(?,?,?,?,?,CURRENT_TIMESTAMP,'Teste','VALIDAR-TESTE')`).run(randomUUID(),r.data.id,Buffer.from('%PDF-1.4\n%%EOF'),'sha-test',TERM_HASH);
    assert.equal((await call(path+'/whatsapp-started','POST',{},auth)).status,201);
    const state=await call(path+'/status','GET',undefined,auth);
    assert.equal(state.data.whatsappStarted,true);
    for(const field of ['paidCents','balanceCents','depositReceived','paymentReported'])assert.equal(Object.hasOwn(state.data,field),false);
    assert.equal((await call(path+'/payment-reported','POST',{},auth)).status,404);
    assert.equal((await call('/payment-options')).status,404);
    assert.equal((await call(path+'/payment-options','GET',undefined,auth)).status,404);
    assert.equal(db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='payments'").get(),undefined);
  } finally {await new Promise(resolve=>server.close(resolve));db.close();}
});
