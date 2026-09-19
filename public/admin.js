const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
const money = (c) => new Intl.NumberFormat("pt-BR", { style:"currency", currency:"BRL" }).format((c || 0) / 100);
const when = (iso) => iso ? new Intl.DateTimeFormat("pt-BR", { dateStyle:"short", timeStyle:"short" }).format(new Date(iso)) : "—";
let currentSettings = {};

async function api(path, method = "GET", body) {
  const r = await fetch("/api" + path, {
    method,
    credentials: "same-origin",
    headers: body ? { "Content-Type":"application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  const d = await r.json().catch(() => ({ error:"Resposta inválida" }));
  if (!r.ok) throw new Error(d.error || "Falha");
  return d;
}

const showDashboard = () => {
  $("#login").classList.add("hidden");
  $("#dashboard").classList.remove("hidden");
  $("#logout").classList.remove("hidden");
};

async function load() {
  try {
    const d = await api("/admin/data");
    showDashboard();
    currentSettings = d.settings || {};
    const requested = d.reservations.filter((r) => r.status === "requested").length;
    const withPriority = d.reservations.filter((r) => r.status === "requested" && r.holdExpiresAt).length;
    const confirmed = d.reservations.filter((r) => r.status === "confirmed").length;
    const received = d.finance?.summary?.netReceivedCents || 0;
    $("#summary").innerHTML = `
      <article class="card"><h3>${requested}</h3><p>solicitações pendentes</p></article>
      <article class="card"><h3>${withPriority}</h3><p>com prioridade temporária</p></article>
      <article class="card"><h3>${confirmed}</h3><p>reservas confirmadas</p></article>
      <article class="card"><h3>${money(received)}</h3><p>recebimento líquido registrado</p></article>`;

    $("#reservations").innerHTML = d.reservations.map((r) => {
      const q = r.quote || {}, req = r.requirements || {};
      const hold = r.holdExpiresAt
        ? `<strong>Prioridade até ${esc(when(r.holdExpiresAt))}</strong>`
        : `<span class="muted">Sem prioridade temporária</span>`;
      return `<article class="card" data-id="${esc(r.id)}">
        <strong>${esc(r.check_in)} → ${esc(r.check_out)}</strong> · ${esc(r.status)}<br>
        <span>${esc(r.name || "Bloqueio")} · ${q.totalCents ? money(q.totalCents) : "—"}</span>
        <p>${hold}</p>
        <p class="muted">Termo jurídico: ${req.legalReady ? "OK" : "pendente"} · assinatura: ${req.signatureReady ? "OK" : "pendente"} · recebido: ${money(req.paidCents || 0)} / sinal ${money(req.requiredDepositCents || 0)}</p>
        ${r.status === "requested" ? `<div class="actions">
          <button class="button confirm">Confirmar</button>
          <button class="button cancel">Cancelar</button>
          <button class="button payment">Registrar pagamento</button>
          <button class="button term">Termo assinado</button>
          <button class="button hold">${r.holdExpiresAt ? "Renovar prioridade" : "Conceder prioridade"}</button>
          ${r.holdExpiresAt ? '<button class="button release-hold">Liberar prioridade</button>' : ""}
        </div>` : ""}
        ${r.request_key ? '<div class="actions"><button class="button rotate-token">Trocar código privado</button></div>' : ""}
      </article>`;
    }).join("") || "<p>Nenhum registro.</p>";

    document.querySelectorAll("[data-id]").forEach((card) => {
      const id = card.dataset.id;
      card.querySelector(".confirm")?.addEventListener("click", () => changeStatus(id, "confirmed"));
      card.querySelector(".cancel")?.addEventListener("click", () => changeStatus(id, "cancelled"));
      card.querySelector(".payment")?.addEventListener("click", () => payment(id));
      card.querySelector(".term")?.addEventListener("click", () => term(id));
      card.querySelector(".hold")?.addEventListener("click", () => grantHold(id));
      card.querySelector(".release-hold")?.addEventListener("click", () => releaseHold(id));
      card.querySelector(".rotate-token")?.addEventListener("click", () => rotateToken(id));
    });
    renderFinance(d.finance);
    renderSettings(d.settings);
    renderReviews(d.reviews);
    await loadCompliance();
  } catch (e) {
    if (e.message.includes("Entre na administração")) return;
    alert(e.message);
  }
}

async function changeStatus(id, status) {
  try { await api("/admin/reservations/" + id, "PATCH", { status }); await load(); }
  catch (e) { alert(e.message); }
}

async function grantHold(id) {
  const raw = prompt("Por quantos minutos esta solicitação terá prioridade?", String(currentSettings.requestHoldMinutes || 30));
  if (raw === null) return;
  const minutes = Number(raw);
  if (!Number.isSafeInteger(minutes) || minutes < 5 || minutes > 1440) return alert("Informe entre 5 e 1440 minutos.");
  try { await api(`/admin/reservations/${id}/hold`, "POST", { minutes }); await load(); }
  catch (e) { alert(e.message); }
}

async function releaseHold(id) {
  if (!confirm("Liberar a prioridade temporária desta solicitação?")) return;
  try { await api(`/admin/reservations/${id}/hold`, "DELETE", {}); await load(); }
  catch (e) { alert(e.message); }
}

async function rotateToken(id) {
  if (!confirm("Trocar o código privado? O código anterior deixará de funcionar.")) return;
  try {
    const result = await api(`/admin/reservations/${id}/rotate-token`, "POST", {});
    prompt("Novo código privado. Copie e envie ao hóspede por um canal confiável:", result.manageToken);
    await load();
  } catch (e) { alert(e.message); }
}

function renderFinance(finance) {
  const box = $("#finance"); if (!box) return;
  const s = finance?.summary || {};
  const rows = (finance?.rows || []).filter((r) => r.status !== "cancelled" || r.receivedCents !== 0).slice(0, 12);
  box.innerHTML = `
    <div class="grid three">
      <article class="card"><h3>${money(s.grossInflowCents || 0)}</h3><p>entradas compensadas</p></article>
      <article class="card"><h3>${money(s.refundsCents || 0)}</h3><p>estornos registrados</p></article>
      <article class="card"><h3>${money(s.confirmedOutstandingCents || 0)}</h3><p>saldo de reservas confirmadas</p></article>
      <article class="card"><h3>${money(s.cancelledHeldCents || 0)}</h3><p>valor ainda retido em canceladas</p></article>
    </div>
    <div class="grid">
      ${rows.map((r) => `<article class="card"><strong>${esc(r.name)} · ${esc(r.status)}</strong><p class="muted">${esc(r.checkIn)} → ${esc(r.checkOut)} · protocolo ${esc(r.reservationId)}</p><p>Total ${money(r.totalCents)} · recebido ${money(r.receivedCents)} · saldo ${money(r.balanceCents)}</p></article>`).join("") || "<p class=muted>Nenhum movimento financeiro registrado.</p>"}
    </div>`;
}

async function payment(id) {
  const amount = prompt("Valor compensado em R$ (use negativo somente para estorno):");
  if (amount === null) return;
  const method = prompt("Método: pix ou transfer", "pix");
  if (!["pix", "transfer"].includes(method)) return alert("Método inválido.");
  const bankReference = prompt("Identificador único no extrato bancário:");
  if (!bankReference) return;
  const note = prompt("Descrição:", "Pagamento conferido no extrato");
  const cents = Math.round(Number(String(amount).replace(",", ".")) * 100);
  if (!Number.isSafeInteger(cents) || !cents) return alert("Valor inválido.");
  try {
    await api("/admin/payments", "POST", { reservationId:id, amountCents:cents, note, method, bankReference, settled:true });
    await load();
  } catch (e) { alert(e.message); }
}

function renderSettings(s) {
  const f = $("#settingsForm"); if (!f) return;
  f.pricingEnabled.checked = !!s.pricingEnabled;
  f.cleaningFee.value = ((s.cleaningFeeCents || 0) / 100).toFixed(2);
  f.depositPercent.value = s.depositPercent || 20;
  f.maxGuests.value = s.maxGuests || 6;
  f.minLeadDays.value = s.minLeadDays ?? 0;
  f.maxAdvanceDays.value = s.maxAdvanceDays || 1825;
  f.maxNights.value = s.maxNights || 30;
  f.requestHoldMinutes.value = s.requestHoldMinutes || 30;
  f.whatsappNumber.value = s.whatsappNumber || "";
  f.email.value = s.email || "";
  f.googleMapsUrl.value = s.googleMapsUrl || "";
  f.mapsEmbedUrl.value = s.mapsEmbedUrl || "";
}

function renderReviews(reviews) {
  const box = $("#reviews");
  const pending = (reviews || []).filter((r) => r.approved !== 1);
  box.innerHTML = pending.map((r) => `<article class="card" data-review="${esc(r.id)}"><strong>${esc(r.name)}</strong> · ${esc(r.rating)}/5<p>${esc(r.comment)}</p><p class="muted">${r.reservation_id ? `Estadia vinculada: ${esc(r.reservation_id)}` : "Avaliação legada sem vínculo de reserva"}</p><div class="actions"><button class="button approve-review">Aprovar</button><button class="button reject-review">Rejeitar</button></div></article>`).join("") || "<p class=muted>Nenhuma avaliação pendente.</p>";
  document.querySelectorAll("[data-review]").forEach((card) => {
    const id = card.dataset.review;
    card.querySelector(".approve-review").onclick = async () => { await api("/admin/reviews/" + id, "PATCH", { approved:true }); await load(); };
    card.querySelector(".reject-review").onclick = async () => { await api("/admin/reviews/" + id, "PATCH", { approved:false }); await load(); };
  });
}

async function term(id) {
  const input = document.createElement("input"); input.type = "file"; input.accept = "application/pdf";
  input.onchange = async () => {
    const file = input.files?.[0]; if (!file) return;
    if (file.size > 5 * 1024 * 1024) return alert("PDF maior que 5 MB.");
    try {
      const bytes = new Uint8Array(await file.arrayBuffer()); let binary = "";
      for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
      const upload = await api(`/admin/reservations/${id}/signed-term`, "POST", { base64:btoa(binary) });
      const reviewer = prompt("Responsável pela conferência da assinatura/identidade:");
      const reference = prompt("Referência/protocolo da validação:");
      if (!reviewer || !reference) return alert("Documento anexado, mas ainda não validado.");
      await api(`/admin/reservations/${id}/validate-term`, "POST", { sha256:upload.sha256, signatureChecked:true, identityChecked:true, contentChecked:true, reviewer, reference });
      alert("Termo anexado e validação registrada."); await load();
    } catch (e) { alert(e.message); }
  };
  input.click();
}

async function loadCompliance() {
  const c = await api("/admin/compliance");
  $("#compliance").innerHTML = `<p><strong>Versão:</strong> ${esc(c.version)}</p><p><strong>Hash do termo:</strong> <code>${esc(c.termHash)}</code></p><p><strong>Aprovação jurídica:</strong> ${c.approval?.approved === 1 ? "registrada" : "pendente"}</p><div class="actions"><button class="button" id="legalApprove">Registrar aprovação validada</button><button class="button" id="banking">Configurar dados bancários</button><a class="button" href="/api/admin/term-template">Baixar minuta</a></div>`;
  $("#legalApprove").onclick = async () => {
    const reviewer = prompt("Responsável/revisor jurídico:"); const reference = prompt("Referência do parecer/documento:");
    if (!reviewer || !reference) return;
    try { await api("/admin/legal-approval", "POST", { termHash:c.termHash, approved:true, confirmedReview:true, reviewer, reference }); await loadCompliance(); }
    catch (e) { alert(e.message); }
  };
  $("#banking").onclick = async () => {
    const bank = prompt("Banco:", c.bank.bank || "") ?? "";
    const holder = prompt("Titular:", c.bank.holder || "") ?? "";
    const holderDocument = prompt("Documento do titular:", c.bank.holderDocument || "") ?? "";
    const branch = prompt("Agência:", c.bank.branch || "") ?? "";
    const account = prompt("Conta:", c.bank.account || "") ?? "";
    const accountType = prompt("Tipo de conta:", c.bank.accountType || "") ?? "";
    const pixKey = prompt("Chave Pix:", c.bank.pixKey || "") ?? "";
    try { await api("/admin/banking", "PUT", { bank, holder, holderDocument, branch, account, accountType, pixKey }); await loadCompliance(); }
    catch (e) { alert(e.message); }
  };
}

$("#loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  try { await api("/admin/login", "POST", { password:e.target.password.value, otp:e.target.otp.value }); e.target.reset(); await load(); }
  catch (err) { $("#loginMsg").textContent = err.message; }
});
$("#logout").onclick = async () => { await api("/admin/logout", "POST", {}); location.reload(); };
$("#reload").onclick = load;
$("#showAudit").onclick = async () => { try { const a = await api("/admin/audit"); $("#audit").classList.remove("hidden"); $("#audit pre").textContent = JSON.stringify(a.events, null, 2); } catch (e) { alert(e.message); } };
$("#settingsForm").addEventListener("submit", async (e) => {
  e.preventDefault(); const f = e.target;
  try {
    await api("/admin/settings", "PUT", {
      pricingEnabled:f.pricingEnabled.checked,
      cleaningFeeCents:Math.round(Number(f.cleaningFee.value) * 100), depositPercent:Number(f.depositPercent.value),
      maxGuests:Number(f.maxGuests.value), minLeadDays:Number(f.minLeadDays.value),
      maxAdvanceDays:Number(f.maxAdvanceDays.value), maxNights:Number(f.maxNights.value),
      requestHoldMinutes:Number(f.requestHoldMinutes.value), whatsappNumber:f.whatsappNumber.value,
      email:f.email.value, googleMapsUrl:f.googleMapsUrl.value, mapsEmbedUrl:f.mapsEmbedUrl.value,
    });
    alert("Configuração salva."); await load();
  } catch (err) { alert(err.message); }
});
$("#rateForm").addEventListener("submit", async (e) => {
  e.preventDefault(); const f = e.target;
  try {
    await api("/admin/rates", "POST", { label:f.label.value, startDate:f.startDate.value, endDate:f.endDate.value, weekdayCents:Math.round(Number(f.weekday.value) * 100), weekendCents:Math.round(Number(f.weekend.value) * 100), minNights:Number(f.minNights.value) });
    f.reset(); await load();
  } catch (err) { alert(err.message); }
});
load();
