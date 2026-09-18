const $ = (s) => document.querySelector(s);
const money = (cents) => new Intl.NumberFormat("pt-BR", { style:"currency", currency:"BRL" }).format((cents || 0) / 100);
const when = (iso) => iso ? new Intl.DateTimeFormat("pt-BR", { dateStyle:"short", timeStyle:"short" }).format(new Date(iso)) : "—";

const api = async (path, options = {}) => {
  const response = await fetch("/api" + path, {
    credentials:"same-origin",
    ...options,
    headers:{ ...(options.body ? { "Content-Type":"application/json" } : {}), ...(options.headers || {}) },
  });
  const data = await response.json().catch(() => ({ error:"Resposta inválida do servidor." }));
  if (!response.ok) throw new Error(data.error || "Não foi possível concluir.");
  return data;
};

let currentQuote = null;
let lastQuoteKey = "";
let currentReservationAccess = null;
const form = $("#bookingForm");
const quoteBox = $("#quote");
const resultBox = $("#reservationResult");
const trackingForm = $("#trackingForm");
const trackingResult = $("#trackingResult");
const paymentInstructions = $("#paymentInstructions");
const paymentButton = $("#loadPaymentInstructions");

function saveReservationAccess(id, token) {
  currentReservationAccess = { id, token };
  sessionStorage.setItem("venus:lastReservation", JSON.stringify(currentReservationAccess));
  trackingForm.elements.reservationId.value = id;
  trackingForm.elements.manageToken.value = token;
}

async function refreshQuote() {
  const checkIn = form.elements.checkIn.value, checkOut = form.elements.checkOut.value;
  currentQuote = null;
  if (!checkIn || !checkOut) {
    quoteBox.className = "notice";
    quoteBox.textContent = "Informe check-in e check-out para consultar.";
    return;
  }
  lastQuoteKey = checkIn + "|" + checkOut;
  quoteBox.textContent = "Consultando valor e disponibilidade…";
  try {
    const q = await api("/quote", { method:"POST", body:JSON.stringify({ checkIn, checkOut }) });
    if (lastQuoteKey !== checkIn + "|" + checkOut) return;
    currentQuote = q;
    quoteBox.className = "notice ok";
    quoteBox.innerHTML = `<strong>${q.nights} noite(s) · ${money(q.totalCents)}</strong><br>Diárias: ${money(q.subtotalCents)} · Limpeza: ${money(q.cleaningFeeCents)} · Sinal previsto (${q.depositPercent}%): ${money(q.depositCents)}.`;
  } catch (e) {
    quoteBox.className = "notice error";
    quoteBox.textContent = e.message;
  }
}

form.elements.checkIn.addEventListener("change", refreshQuote);
form.elements.checkOut.addEventListener("change", refreshQuote);

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  resultBox.classList.add("hidden");
  if (!form.reportValidity()) return;
  await refreshQuote();
  if (!currentQuote) return;
  const button = form.querySelector("button[type=submit]");
  button.disabled = true;
  const body = {
    checkIn:form.elements.checkIn.value, checkOut:form.elements.checkOut.value,
    name:form.elements.name.value, email:form.elements.email.value, phone:form.elements.phone.value,
    guests:Number(form.elements.guests.value), hasPet:form.elements.hasPet.checked, notes:form.elements.notes.value,
    consent:form.elements.consent.checked, expectedTotalCents:currentQuote.totalCents,
  };
  try {
    const data = await api("/reservations", {
      method:"POST",
      headers:{ "Idempotency-Key":crypto.randomUUID() },
      body:JSON.stringify(body),
    });
    saveReservationAccess(data.id, data.manageToken);
    const priority = data.holdGranted
      ? `As datas ficaram com prioridade temporária até ${when(data.holdExpiresAt)}.`
      : "A solicitação entrou na fila porque já existe outra prioridade temporária para o período. Não faça pagamento até a administração liberar a sua solicitação.";
    resultBox.className = "notice ok";
    resultBox.innerHTML = `<strong>Solicitação registrada.</strong><br>Protocolo: <code>${data.id}</code>.<br>Código privado: <code>${data.manageToken}</code>.<br>${priority}<br><strong>Guarde o código privado.</strong> Ele permite acompanhar esta solicitação e consultar instruções oficiais quando forem liberadas.`;
    await loadReservationStatus();
  } catch (err) {
    resultBox.className = "notice error";
    resultBox.textContent = err.message;
  } finally {
    button.disabled = false;
  }
});

async function loadReservationStatus() {
  const id = trackingForm.elements.reservationId.value.trim();
  const token = trackingForm.elements.manageToken.value.trim();
  if (!id || !token) return;
  currentReservationAccess = { id, token };
  paymentButton.classList.add("hidden");
  paymentInstructions.classList.add("hidden");
  trackingResult.className = "notice";
  trackingResult.textContent = "Consultando andamento…";
  try {
    const d = await api(`/reservations/${encodeURIComponent(id)}/status`, { headers:{ "X-Reservation-Token":token } });
    const statusLabel = ({ requested:"Solicitação em análise", confirmed:"Reserva confirmada", cancelled:"Solicitação cancelada" })[d.status] || d.status;
    const priority = d.hold?.active
      ? `Prioridade temporária ativa até ${when(d.hold.expiresAt)}.`
      : d.status === "requested" ? "Sem prioridade temporária no momento." : "";
    trackingResult.className = "notice ok";
    trackingResult.innerHTML = `<strong>${statusLabel}</strong><br>${d.checkIn} → ${d.checkOut} · ${d.quote.nights} noite(s)<br>Total contratado: ${money(d.quote.totalCents)} · Recebido: ${money(d.paidCents)} · Saldo: ${money(d.balanceCents)}.<br>${priority}`;
    if (d.status === "requested" || d.status === "confirmed") paymentButton.classList.remove("hidden");
  } catch (e) {
    trackingResult.className = "notice error";
    trackingResult.textContent = e.message;
  }
}

trackingForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!trackingForm.reportValidity()) return;
  saveReservationAccess(trackingForm.elements.reservationId.value.trim(), trackingForm.elements.manageToken.value.trim());
  await loadReservationStatus();
});

paymentButton.addEventListener("click", async () => {
  const id = trackingForm.elements.reservationId.value.trim();
  const token = trackingForm.elements.manageToken.value.trim();
  paymentInstructions.className = "notice";
  paymentInstructions.textContent = "Consultando instruções oficiais…";
  try {
    const p = await api(`/reservations/${encodeURIComponent(id)}/payment-options`, { headers:{ "X-Reservation-Token":token } });
    if (!p.legalApproved) {
      paymentInstructions.textContent = "As instruções de pagamento ainda não foram liberadas porque a versão vigente do termo não possui aprovação jurídica registrada.";
      return;
    }
    if (!p.reservationEligible) {
      paymentInstructions.textContent = "Esta solicitação ainda não está habilitada para pagamento. Aguarde a administração conceder prioridade ou confirmar a reserva.";
      return;
    }
    const lines = [];
    if (p.pixAvailable) lines.push(`Pix: ${p.bank.pixKey}`);
    if (p.transferAvailable) lines.push(`Transferência: ${p.bank.bank} · agência ${p.bank.branch} · conta ${p.bank.account} · titular ${p.bank.holder}`);
    paymentInstructions.className = "notice ok";
    paymentInstructions.textContent = lines.length ? lines.join(" | ") : "Nenhum meio de pagamento está configurado para esta solicitação.";
  } catch (e) {
    paymentInstructions.className = "notice error";
    paymentInstructions.textContent = e.message;
  }
});

(async () => {
  try {
    const saved = JSON.parse(sessionStorage.getItem("venus:lastReservation") || "null");
    if (saved?.id && saved?.token) {
      saveReservationAccess(saved.id, saved.token);
      await loadReservationStatus();
    }
  } catch {}
  try {
    const p = await api("/payment-options");
    const box = $("#paymentStatus");
    if (!p.legalApproved) {
      box.className = "notice";
      box.textContent = "Meios de pagamento permanecem ocultos até a aprovação jurídica da versão vigente do termo.";
      return;
    }
    if (!p.pixAvailable && !p.transferAvailable) {
      box.className = "notice";
      box.textContent = "Aprovação jurídica registrada, mas os meios de pagamento ainda não foram configurados.";
      return;
    }
    const methods = [];
    if (p.pixAvailable) methods.push("Pix");
    if (p.transferAvailable) methods.push("transferência bancária");
    box.className = "notice ok";
    box.textContent = `Meios habilitados: ${methods.join(" e ")}. Os dados bancários só aparecem dentro do acompanhamento de uma solicitação elegível.`;
  } catch {
    $("#paymentStatus").textContent = "Não foi possível consultar os meios de pagamento agora.";
  }
})();

if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => {}));
