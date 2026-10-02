import test from 'node:test';
import assert from 'node:assert/strict';
import { scryptSync, randomUUID } from 'node:crypto';
import { openDatabase } from '../server/db.js';
import { createApp } from '../server/app.js';
import { TERM_HASH } from '../server/compliance.js';
import { today, addDays } from '../server/domain.js';

test('confirmação manual exige documentação e sinal conferido externamente sem registrar transação', async () => {
  const db=openDatabase(':memory:');
  const salt='test-salt', password='test-password';
  const app=createApp(db,{ passwordHash: salt+':'+scryptSync(password,salt,64).toString('hex') });
  const server=app.listen(0,'127.0.0.1');
  await new Promise(resolve=>server.once('listening',resolve));
  const base='http://127.0.0.1:'+server.address().port+'/api';
  let cookie='';
  const call=async(path,method='GET',body)=>{
    const response=await fetch(base+path,{method,headers:{...(body?{'Content-Type':'application/json'}:{}),...(cookie?{Cookie:cookie}:{})},...(body?{body:JSON.stringify(body)}:{})});
    return {status:response.status,data:await response.json(),headers:response.headers};
  };
  const start=addDays(today(),20),end=addDays(start,2);
  const quote=JSON.stringify({totalCents:30000,depositCents:6000,depositPercent:20,nights:2});
  const insert=(id)=>db.prepare(`INSERT INTO reservations(id,name,email,phone,check_in,check_out,guests,status,quote)
    VALUES(?,?,?,?,?,?,2,'requested',?)`).run(id,'Hóspede teste','teste@example.com','83999999999',start,end,quote);
  const doc=(id)=>db.prepare(`INSERT INTO signed_terms(id,reservation_id,pdf,sha256,term_hash,validated_at,reviewer,validation_reference)
    VALUES(?,?,?,?,?,CURRENT_TIMESTAMP,'Teste','VALIDACAO-TESTE')`).run(randomUUID(),id,Buffer.from('%PDF-1.4\n%%EOF'),'hash-'+id,TERM_HASH);
  try {
    insert('manual-a');
    const login=await call('/admin/login','POST',{password});
    assert.equal(login.status,200);
    cookie=login.headers.get('set-cookie').split(';')[0];
    const confirm=id=>call('/admin/reservations/'+id,'PATCH',{status:'confirmed'});
    const check=id=>call('/admin/reservations/'+id+'/deposit-check','POST',{});

    assert.equal((await confirm('manual-a')).status,422,'não confirmar antes da aprovação jurídica');
    db.prepare('UPDATE legal_approval SET approved=1,term_hash=? WHERE id=1').run(TERM_HASH);
    assert.equal((await confirm('manual-a')).status,422,'não confirmar sem termo validado');
    doc('manual-a');
    assert.equal((await confirm('manual-a')).status,422,'não confirmar sem sinal conferido externamente');
    assert.equal((await check('manual-a')).status,200);
    assert.equal((await confirm('manual-a')).status,200);
    assert.equal(db.prepare(`SELECT status FROM reservations WHERE id='manual-a'`).get().status,'confirmed');

    const legacyPaymentTable=db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='payments'").get();
    assert.equal(legacyPaymentTable,undefined);

    insert('manual-b');doc('manual-b');
    assert.equal((await check('manual-b')).status,200);
    assert.equal((await confirm('manual-b')).status,409,'mesmas datas não podem ser confirmadas duas vezes');

    assert.ok(db.prepare(`SELECT id FROM audit WHERE action='reservation.deposit_checked_externally'`).get());
    assert.ok(db.prepare(`SELECT id FROM audit WHERE action='reservation.confirmed'`).get());
  } finally {
    await new Promise(resolve=>server.close(resolve));
    db.close();
  }
});
