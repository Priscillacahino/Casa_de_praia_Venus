const $ = (s) => document.querySelector(s);
const money = (cents) => new Intl.NumberFormat("pt-BR", { style:"currency", currency:"BRL" }).format(cents/100);
const api = async (path, options={}) => {
  const response = await fetch("/api"+path, { credentials:"same-origin", ...options, headers:{ ...(options.body?{"Content-Type":"application/json"}:{}), ...(options.headers||{}) } });
  const data = await response.json().catch(()=>({error:"Resposta inválida do servidor."}));
  if(!response.ok) throw new Error(data.error || "Não foi possível concluir.");
  return data;
};
let currentQuote = null;
let lastQuoteKey = "";
const form = $("#bookingForm");
const quoteBox = $("#quote");
const resultBox = $("#reservationResult");

async function refreshQuote(){
  const checkIn=form.elements.checkIn.value, checkOut=form.elements.checkOut.value;
  currentQuote=null;
  if(!checkIn||!checkOut){quoteBox.className="notice";quoteBox.textContent="Informe check-in e check-out para consultar.";return;}
  lastQuoteKey=checkIn+"|"+checkOut;
  quoteBox.textContent="Consultando valor e disponibilidade…";
  try{
    const q=await api("/quote",{method:"POST",body:JSON.stringify({checkIn,checkOut})});
    if(lastQuoteKey!==checkIn+"|"+checkOut)return;
    currentQuote=q;
    quoteBox.className="notice ok";
    quoteBox.innerHTML=`<strong>${q.nights} noite(s) · ${money(q.totalCents)}</strong><br>Diárias: ${money(q.subtotalCents)} · Limpeza: ${money(q.cleaningFeeCents)} · Sinal previsto (${q.depositPercent}%): ${money(q.depositCents)}.`;
  }catch(e){quoteBox.className="notice error";quoteBox.textContent=e.message;}
}
form.elements.checkIn.addEventListener("change",refreshQuote);
form.elements.checkOut.addEventListener("change",refreshQuote);

form.addEventListener("submit",async(e)=>{
  e.preventDefault();
  resultBox.classList.add("hidden");
  if(!form.reportValidity())return;
  await refreshQuote();
  if(!currentQuote)return;
  const button=form.querySelector("button[type=submit]");button.disabled=true;
  const body={
    checkIn:form.elements.checkIn.value,checkOut:form.elements.checkOut.value,
    name:form.elements.name.value,email:form.elements.email.value,phone:form.elements.phone.value,
    guests:Number(form.elements.guests.value),hasPet:form.elements.hasPet.checked,notes:form.elements.notes.value,
    consent:form.elements.consent.checked,expectedTotalCents:currentQuote.totalCents
  };
  try{
    const data=await api("/reservations",{method:"POST",headers:{"Idempotency-Key":crypto.randomUUID()},body:JSON.stringify(body)});
    resultBox.className="notice ok";
    resultBox.innerHTML=`<strong>Solicitação registrada.</strong><br>Protocolo: <code>${data.id}</code>. Isso ainda não é uma reserva confirmada. A administração precisa validar termo, pagamento e disponibilidade antes da confirmação final.`;
  }catch(err){resultBox.className="notice error";resultBox.textContent=err.message;}
  finally{button.disabled=false;}
});

(async()=>{
  try{
    const p=await api("/payment-options");
    const box=$("#paymentStatus");
    if(!p.legalApproved){box.className="notice";box.textContent="Meios de pagamento permanecem ocultos até a aprovação jurídica da versão vigente do termo.";return;}
    if(!p.pixAvailable&&!p.transferAvailable){box.className="notice";box.textContent="Aprovação jurídica registrada, mas os dados bancários ainda não foram liberados.";return;}
    const methods=[];if(p.pixAvailable)methods.push("Pix");if(p.transferAvailable)methods.push("transferência bancária");
    box.className="notice ok";box.textContent=`Meios habilitados: ${methods.join(" e ")}. Use somente os dados exibidos no fluxo oficial após receber as instruções da reserva.`;
  }catch{ $("#paymentStatus").textContent="Não foi possível consultar os meios de pagamento agora."; }
})();

if("serviceWorker" in navigator) window.addEventListener("load",()=>navigator.serviceWorker.register("/sw.js").catch(()=>{}));
