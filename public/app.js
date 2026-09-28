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
let currentReservationState = null;
let publicSettings = {};
const form = $("#bookingForm");
const quoteBox = $("#quote");
const resultBox = $("#reservationResult");
const trackingForm = $("#trackingForm");
const trackingResult = $("#trackingResult");
const paymentInstructions = $("#paymentInstructions");
const whatsappButton = $("#continueWhatsApp");
const reportPaymentButton = $("#reportPayment");
const cancellationButton = $("#requestCancellation");
const reviewSection = $("#avaliar");
const reviewForm = $("#reviewForm");
const reviewResult = $("#reviewResult");

function saveReservationAccess(id, token) {
  currentReservationAccess = { id, token };
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
  whatsappButton?.classList.add("hidden");
  reportPaymentButton?.classList.add("hidden");
  cancellationButton?.classList.add("hidden");
  paymentInstructions.classList.add("hidden");
  trackingResult.className = "notice";
  trackingResult.textContent = "Consultando andamento…";
  try {
    const d = await api(`/reservations/${encodeURIComponent(id)}/status`, { headers:{ "X-Reservation-Token":token } });
    currentReservationState = d;
    const statusLabel = ({ requested:"Solicitação em análise", confirmed:"Reserva confirmada", cancelled:"Solicitação cancelada" })[d.status] || d.status;
    const priority = d.hold?.active
      ? `Prioridade temporária ativa até ${when(d.hold.expiresAt)}.`
      : d.status === "requested" ? "Sem prioridade temporária no momento." : "";
    const cancellation = d.cancellationRequest;
    const cancellationInfo = cancellation?.status === "pending"
      ? "<br><strong>Cancelamento solicitado e aguardando análise. Não realize novos pagamentos.</strong>"
      : cancellation?.status === "accepted"
        ? "<br>Solicitação de cancelamento aceita."
        : cancellation?.status === "rejected" ? "<br>Solicitação de cancelamento analisada e não aceita." : "";
    const paymentInfo = d.paymentReported
      ? "<br><strong>Pagamento informado pelo hóspede — aguardando conferência bancária.</strong>"
      : d.paidCents > 0
        ? "<br><strong>Pagamento recebido e conciliado pela administração.</strong>"
        : "";
    trackingResult.className = "notice ok";
    trackingResult.innerHTML = `<strong>${statusLabel}</strong><br>${d.checkIn} → ${d.checkOut} · ${d.quote.nights} noite(s)<br>Total contratado: ${money(d.quote.totalCents)} · Recebido: ${money(d.paidCents)} · Saldo: ${money(d.balanceCents)}.<br>${priority}${paymentInfo}${cancellationInfo}${d.reviewSubmitted ? "<br>Avaliação da estadia já enviada." : ""}`;
    reviewSection?.classList.toggle("hidden", !d.reviewEligible);
    if ((d.status === "requested" || d.status === "confirmed") && cancellation?.status !== "pending") {
      whatsappButton?.classList.remove("hidden");
      if (d.balanceCents > 0 && !d.paymentReported && d.whatsappStarted) reportPaymentButton?.classList.remove("hidden");
      cancellationButton?.classList.remove("hidden");
    }
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

cancellationButton?.addEventListener("click", async () => {
  if (!currentReservationAccess) return;
  const reason = prompt("Motivo do cancelamento (opcional, até 1000 caracteres):", "");
  if (reason === null) return;
  if (reason.length > 1000) return alert("O motivo deve ter no máximo 1000 caracteres.");
  if (!confirm("Registrar a solicitação de cancelamento? Isso não gera estorno automático; a administração fará a análise e o eventual reembolso.")) return;
  cancellationButton.disabled = true;
  try {
    await api(`/reservations/${encodeURIComponent(currentReservationAccess.id)}/cancellation-request`, {
      method:"POST",
      headers:{ "X-Reservation-Token":currentReservationAccess.token },
      body:JSON.stringify({ reason }),
    });
    alert("Solicitação de cancelamento registrada. Acompanhe o andamento por este mesmo protocolo e código privado.");
    await loadReservationStatus();
  } catch (e) {
    alert(e.message);
  } finally {
    cancellationButton.disabled = false;
  }
});

reviewForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!reviewForm.reportValidity() || !currentReservationAccess) return;
  const button = reviewForm.querySelector("button[type=submit]");
  button.disabled = true;
  reviewResult.className = "notice";
  reviewResult.textContent = "Enviando avaliação…";
  try {
    const body = {
      reservationId: currentReservationAccess.id,
      rating: Number(reviewForm.elements.rating.value),
      comment: reviewForm.elements.comment.value,
      consent: reviewForm.elements.consent.checked,
    };
    await api("/reviews", {
      method:"POST",
      headers:{ "X-Reservation-Token":currentReservationAccess.token },
      body:JSON.stringify(body),
    });
    reviewResult.className = "notice ok";
    reviewResult.textContent = "Avaliação recebida e encaminhada para moderação.";
    reviewForm.reset();
    await loadReservationStatus();
  } catch (e) {
    reviewResult.className = "notice error";
    reviewResult.textContent = e.message;
  } finally {
    button.disabled = false;
  }
});

whatsappButton?.addEventListener("click", async () => {
  if (!currentReservationAccess || !currentReservationState) return;
  paymentInstructions.className = "notice";
  paymentInstructions.textContent = "Verificando se a solicitação está liberada para continuar…";
  try {
    const p = await api(`/reservations/${encodeURIComponent(currentReservationAccess.id)}/payment-options`, {
      headers:{ "X-Reservation-Token":currentReservationAccess.token },
    });
    if (p.cancellationPending) {
      paymentInstructions.textContent = "Há uma solicitação de cancelamento pendente. Não realize novos pagamentos.";
      return;
    }
    if (!p.legalApproved) {
      paymentInstructions.textContent = "A etapa de pagamento ainda não foi liberada porque o termo vigente não possui aprovação registrada.";
      return;
    }
    if (!p.reservationEligible) {
      paymentInstructions.textContent = "Esta solicitação ainda não está liberada para pagamento. Aguarde a prioridade das datas ou a orientação da administração.";
      return;
    }
    if (!p.whatsappAvailable) {
      paymentInstructions.textContent = "O WhatsApp oficial ainda não está configurado. Use o canal de contato informado pela administração.";
      return;
    }
    const phone = String(publicSettings.whatsappNumber || "").replace(/\D/g, "");
    if (!phone) throw new Error("WhatsApp oficial não configurado.");
    await api(`/reservations/${encodeURIComponent(currentReservationAccess.id)}/whatsapp-started`, {
      method:"POST",
      headers:{ "X-Reservation-Token":currentReservationAccess.token },
      body:JSON.stringify({}),
    });
    currentReservationState.whatsappStarted = true;
    const d = currentReservationState;
    const message = [
      "Olá! Quero continuar a minha solicitação de reserva da Vênus Beach House.",
      `Protocolo: ${d.id}`,
      `Datas: ${d.checkIn} a ${d.checkOut}`,
      `Hóspedes: ${d.guests}`,
      "Gostaria de receber as orientações para pagamento por Pix ou transferência.",
    ].join("\n");
    paymentInstructions.className = "notice ok";
    paymentInstructions.textContent = "O WhatsApp será aberto com os dados básicos da reserva. O código privado não será enviado.";
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  } catch (e) {
    paymentInstructions.className = "notice error";
    paymentInstructions.textContent = e.message;
  }
});

reportPaymentButton?.addEventListener("click", async () => {
  if (!currentReservationAccess) return;
  if (!confirm("Você já realizou o Pix ou a transferência combinada pelo WhatsApp? Este aviso não confirma o pagamento; a administração ainda fará a conferência bancária.")) return;
  reportPaymentButton.disabled = true;
  paymentInstructions.className = "notice";
  paymentInstructions.textContent = "Registrando seu aviso de pagamento…";
  try {
    const result = await api(`/reservations/${encodeURIComponent(currentReservationAccess.id)}/payment-reported`, {
      method:"POST",
      headers:{ "X-Reservation-Token":currentReservationAccess.token },
      body:JSON.stringify({}),
    });
    paymentInstructions.className = "notice ok";
    paymentInstructions.textContent = result.alreadyReported
      ? "O pagamento já havia sido informado e continua aguardando conferência bancária."
      : "Pagamento informado. A administração fará a conferência bancária antes de confirmar o recebimento.";
    await loadReservationStatus();
  } catch (e) {
    paymentInstructions.className = "notice error";
    paymentInstructions.textContent = e.message;
  } finally {
    reportPaymentButton.disabled = false;
  }
});


(async () => {
  try {
    const pub = await api("/public");
    publicSettings = pub.settings || {};
    const reviewsBox = $("#publicReviews");
    const reviewStats = $("#reviewStats");
    const reviews = Array.isArray(pub.reviews) ? pub.reviews : [];
    if (reviewsBox) {
      reviewsBox.replaceChildren();
      if (reviews.length) {
        for (const r of reviews) {
          const article = document.createElement("article");
          article.className = "card review-card";

          const stars = document.createElement("div");
          stars.className = "stars";
          const rating = Math.max(0, Math.min(5, Number(r.rating || 0)));
          stars.textContent = "★".repeat(rating);

          const title = document.createElement("h3");
          title.textContent = String(r.name || "Hóspede");

          const comment = document.createElement("p");
          comment.textContent = String(r.comment || "");

          const note = document.createElement("small");
          note.textContent = "Experiência publicada após moderação";

          article.append(stars, title, comment, note);
          reviewsBox.append(article);
        }
      } else {
        const article = document.createElement("article");
        article.className = "card";
        const message = document.createElement("p");
        message.textContent = "Nenhuma avaliação pública disponível no momento.";
        article.append(message);
        reviewsBox.append(article);
      }
    }
    if (reviewStats) {
      const count = Number(pub.reviewStats?.count || 0);
      const avg = Number(pub.reviewStats?.average || 0);
      reviewStats.textContent = count > 0
        ? `${count} avaliação(ões) pública(s) · média ${avg.toFixed(1).replace(".", ",")}/5`
        : "As avaliações aparecem aqui somente após estadia concluída e moderação.";
    }
    const maxGuests = Number(pub.settings?.maxGuests || 6);
    if (Number.isSafeInteger(maxGuests) && maxGuests > 0) {
      form.elements.guests.max = String(maxGuests);
      if (Number(form.elements.guests.value) > maxGuests) form.elements.guests.value = String(maxGuests);
    }
    const apkStatus = $("#androidAppStatus");
    const apkButton = $("#androidAppDownload");
    const apkHash = $("#androidAppHash");
    const s = publicSettings;
    if (apkStatus && apkButton && s.androidApkUrl && s.androidApkSha256 && s.androidVersionName) {
      apkStatus.className = "notice ok";
      apkStatus.textContent = "Versão " + s.androidVersionName + " disponível para Android.";
      apkButton.href = s.androidApkUrl;
      apkButton.classList.remove("hidden");
      apkHash.textContent = "SHA-256: " + s.androidApkSha256;
    } else if (apkStatus) {
      apkStatus.textContent = "O APK oficial ainda não foi publicado. Use a versão web/PWA enquanto isso.";
    }
  } catch {}
  const box = $("#paymentStatus");
  if (box) {
    if (publicSettings.whatsappNumber) {
      box.className = "notice ok";
      box.textContent = "Após solicitar a reserva, continue pelo WhatsApp oficial. Pix ou transferência são combinados no atendimento e a confirmação final aparece no próprio site.";
    } else {
      box.className = "notice";
      box.textContent = "O canal oficial de WhatsApp ainda será configurado pela administração.";
    }
  }
})();



// Gallery mobile: ambientes
const galleryDialog = $("#galleryDialog");
if (galleryDialog) {
  const galleryImage = $("#galleryImage");
  const galleryTitle = $("#galleryTitle");
  const galleryCounter = $("#galleryCounter");
  const galleryPrev = $("#galleryPrev");
  const galleryNext = $("#galleryNext");
  const galleryClose = $("#galleryClose");
  let galleryImages = [];
  let galleryIndex = 0;
  let galleryName = "";

  const renderGallery = () => {
    if (!galleryImages.length) return;
    galleryIndex = (galleryIndex + galleryImages.length) % galleryImages.length;
    galleryImage.src = galleryImages[galleryIndex];
    galleryImage.alt = `${galleryName} — foto ${galleryIndex + 1} de ${galleryImages.length}`;
    galleryTitle.textContent = galleryName;
    galleryCounter.textContent = `${galleryIndex + 1} de ${galleryImages.length}`;
    const single = galleryImages.length < 2;
    galleryPrev.hidden = single;
    galleryNext.hidden = single;
  };

  const openGallery = (card) => {
    galleryName = card.dataset.galleryTitle || "Ambiente";
    galleryImages = String(card.dataset.galleryImages || "").split("|").filter(Boolean);
    galleryIndex = 0;
    renderGallery();
    if (typeof galleryDialog.showModal === "function") galleryDialog.showModal();
    else galleryDialog.setAttribute("open", "");
  };

  const closeGallery = () => {
    if (typeof galleryDialog.close === "function" && galleryDialog.open) galleryDialog.close();
    else galleryDialog.removeAttribute("open");
  };

  document.querySelectorAll(".gallery-card[data-gallery-images]").forEach((card) => {
    card.addEventListener("click", () => openGallery(card));
  });

  galleryPrev.addEventListener("click", () => { galleryIndex -= 1; renderGallery(); });
  galleryNext.addEventListener("click", () => { galleryIndex += 1; renderGallery(); });
  galleryClose.addEventListener("click", closeGallery);

  galleryDialog.addEventListener("click", (event) => {
    if (event.target === galleryDialog) closeGallery();
  });

  document.addEventListener("keydown", (event) => {
    if (!galleryDialog.open) return;
    if (event.key === "ArrowLeft" && galleryImages.length > 1) {
      galleryIndex -= 1;
      renderGallery();
    }
    if (event.key === "ArrowRight" && galleryImages.length > 1) {
      galleryIndex += 1;
      renderGallery();
    }
  });
}

if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => {}));
