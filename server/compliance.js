import { readFileSync } from 'node:fs';
import { createHash, randomUUID } from 'node:crypto';
import { AppError, text, transaction } from './domain.js';
export const TERM_VERSION = '2026-09-16-v1';
export const TERM_TEXT = readFileSync(new URL('../docs/termo-compromisso-minuta.txt',import.meta.url),'utf8');
export const TERM_HASH = createHash('sha256').update(TERM_TEXT).digest('hex');
export const legal = db => db.prepare('SELECT * FROM legal_approval WHERE id=1').get();
export const banking = db => JSON.parse(db.prepare('SELECT value FROM banking WHERE id=1').get().value);
export function readiness(db, row) {
  const approval=legal(db);
  const doc=db.prepare('SELECT id,sha256,term_hash,validated_at FROM signed_terms WHERE reservation_id=?').get(row.id);
  const paid=db.prepare('SELECT COALESCE(SUM(amount_cents),0) AS total FROM payments WHERE reservation_id=? AND settled=1').get(row.id).total;
  const q=JSON.parse(row.quote); const required=Math.round((q.totalCents||0)*.2);
  const legalReady=approval?.approved===1&&approval.term_hash===TERM_HASH;
  const signatureReady=!!doc?.validated_at&&doc.term_hash===TERM_HASH;
  return { legalReady,signatureReady,paidCents:paid,requiredDepositCents:required,documentId:doc?.id||null,documentHash:doc?.sha256||null,ready:legalReady&&signatureReady&&required>0&&paid>=required };
}
export function assertConfirmationReady(db,row){
 const r=readiness(db,row);
 if(!r.legalReady)throw new AppError('O termo ainda depende de aprovação jurídica desta versão.',422);
 if(!r.signatureReady)throw new AppError('Anexe o termo assinado e registre a validação antes de confirmar.',422);
 if(r.requiredDepositCents<=0||r.paidCents<r.requiredDepositCents)throw new AppError('O sinal de 20% ainda não foi confirmado como recebido.',422);
}
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function registerCompliance(app,db,route,audit){
 app.get('/api/payment-options',route((req,res)=>{const b=banking(db);const l=legal(db);const enabled=l?.approved===1&&l.term_hash===TERM_HASH;res.json({pixAvailable:enabled&&!!b.pixKey,transferAvailable:enabled&&!!(b.bank&&b.holder&&b.account&&b.branch),legalApproved:enabled,bank:enabled?b:{bank:'',holder:'',holderDocument:'',branch:'',account:'',accountType:'',pixKey:''}});}));
 app.get('/api/admin/compliance',route((req,res)=>res.json({version:TERM_VERSION,termHash:TERM_HASH,approval:legal(db),bank:banking(db)})));
 app.put('/api/admin/banking',route((req,res)=>{const b={};for(const key of ['bank','holder','holderDocument','branch','account','accountType','pixKey'])b[key]=text(req.body[key]||'',key,0,150);db.prepare('UPDATE banking SET value=? WHERE id=1').run(JSON.stringify(b));audit('banking.updated','1');res.json({ok:true});}));
 app.post('/api/admin/legal-approval',route((req,res)=>{
  if(req.body.termHash!==TERM_HASH)throw new AppError('A versão do termo mudou. Atualize a página.',409);
  if(req.body.approved!==true) {db.prepare('UPDATE legal_approval SET approved=0 WHERE id=1').run();audit('legal.disabled',TERM_HASH);return res.json({ok:true});}
  if(req.body.confirmedReview!==true)throw new AppError('Confirme que o jurídico validou esta versão.');
  db.prepare('UPDATE legal_approval SET approved=1,term_hash=?,reviewer=?,reference=?,approved_at=CURRENT_TIMESTAMP WHERE id=1').run(TERM_HASH,text(req.body.reviewer,'Responsável jurídico',3,150),text(req.body.reference,'Referência da aprovação',5,1000));audit('legal.approved',TERM_HASH);res.json({ok:true});
 }));
 app.get('/api/admin/term-template',route((req,res)=>res.type('text/plain; charset=utf-8').attachment('termo-compromisso-minuta.txt').send(TERM_TEXT)));
 app.get('/api/admin/reservations/:id/term',route((req,res)=>{
  const r=db.prepare('SELECT * FROM reservations WHERE id=?').get(req.params.id);if(!r||r.status==='blocked')throw new AppError('Pedido não encontrado.',404);
  const q=JSON.parse(r.quote),l=legal(db);const status=l?.approved===1&&l.term_hash===TERM_HASH?'VERSÃO COM APROVAÇÃO JURÍDICA REGISTRADA — PREENCHER LACUNAS ANTES DE ASSINAR':'MINUTA NÃO VIGENTE — AGUARDANDO JURÍDICO';
  const money=n=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(n/100);
  const summary=`Protocolo: ${r.id}\nHóspede: ${r.name}\nE-mail: ${r.email}\nTelefone: ${r.phone}\nEntrada: ${r.check_in} — horário: __________\nSaída: ${r.check_out} — horário: __________\nHóspedes: ${r.guests}\nTotal: ${money(q.totalCents)}\nLimpeza incluída: ${money(q.cleaningFeeCents)}\nSinal de 20%: ${money(Math.round(q.totalCents*.2))}\nSaldo: ${money(q.totalCents-Math.round(q.totalCents*.2))}\nData de contratação: __________\nResponsável pela propriedade e identificação: __________\nEndereço completo do imóvel: __________\nIdentificação do hóspede: __________\nPrazo de pagamento do saldo: __________`;
  res.type('html').attachment(`termo-${r.id}.html`).send(`<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Termo da reserva</title><style>body{font:12pt Arial;max-width:760px;margin:40px auto;padding:20px}pre{white-space:pre-wrap;font:inherit;line-height:1.5}</style><h1>Termo de compromisso</h1><p>${status}</p><p>Versão ${TERM_VERSION} — hash do modelo ${TERM_HASH}</p><pre>${escape(summary)}</pre><hr><pre>${escape(l?.approved===1&&l.term_hash===TERM_HASH?TERM_TEXT.replace(' — MINUTA NÃO VIGENTE','').replace('Uso e implementação condicionados à validação jurídica.','Aprovação jurídica registrada pela administração para esta versão.'):TERM_TEXT)}</pre></html>`);
 }));
 app.post('/api/admin/reservations/:id/signed-term',route((req,res)=>{
  const r=db.prepare('SELECT * FROM reservations WHERE id=?').get(req.params.id);if(!r||r.status!=='requested')throw new AppError('Anexe documentos somente a pedidos pendentes.');
  const source=req.body.base64;if(typeof source!=='string'||source.length>7500000||!/^[A-Za-z0-9+/]*={0,2}$/.test(source))throw new AppError('Arquivo PDF inválido ou maior que 5 MB.');
  const bytes=Buffer.from(source,'base64');if(bytes.length>5*1024*1024||bytes.subarray(0,5).toString()!=='%PDF-')throw new AppError('Envie o arquivo PDF original assinado, até 5 MB.');
  const sha=createHash('sha256').update(bytes).digest('hex');const id=randomUUID();
  db.prepare('INSERT INTO signed_terms(id,reservation_id,pdf,sha256,term_hash) VALUES(?,?,?,?,?) ON CONFLICT(reservation_id) DO UPDATE SET id=excluded.id,pdf=excluded.pdf,sha256=excluded.sha256,term_hash=excluded.term_hash,validated_at=NULL,reviewer=NULL,validation_reference=NULL,uploaded_at=CURRENT_TIMESTAMP').run(id,r.id,bytes,sha,TERM_HASH);audit('signature.uploaded',r.id);res.status(201).json({id,sha256:sha,status:'awaiting_validation'});
 }));
 app.get('/api/admin/reservations/:id/signed-term',route((req,res)=>{const d=db.prepare('SELECT pdf FROM signed_terms WHERE reservation_id=?').get(req.params.id);if(!d)throw new AppError('Documento não encontrado.',404);res.type('application/pdf').attachment('termo-assinado.pdf').send(Buffer.from(d.pdf));}));
 app.post('/api/admin/reservations/:id/validate-term',route((req,res)=>{
  transaction(db,()=>{const r=db.prepare('SELECT * FROM reservations WHERE id=?').get(req.params.id);if(!r||r.status!=='requested')throw new AppError('Pedido não está pendente.');const d=db.prepare('SELECT * FROM signed_terms WHERE reservation_id=?').get(r.id);if(!d||d.sha256!==req.body.sha256)throw new AppError('Documento mudou ou não foi enviado. Atualize a página.',409);const l=legal(db);if(l?.approved!==1||l.term_hash!==TERM_HASH||d.term_hash!==TERM_HASH)throw new AppError('Aprovação jurídica pendente ou versão desatualizada.',422);if(req.body.signatureChecked!==true||req.body.identityChecked!==true||req.body.contentChecked!==true)throw new AppError('Confira assinatura, identidade e conteúdo.');db.prepare('UPDATE signed_terms SET validated_at=CURRENT_TIMESTAMP,reviewer=?,validation_reference=? WHERE reservation_id=?').run(text(req.body.reviewer,'Responsável pela conferência',3,150),text(req.body.reference,'Relatório de validação ou protocolo',5,1500),r.id);audit('signature.validated_manually',r.id);});res.json({ok:true});
 }));
}
