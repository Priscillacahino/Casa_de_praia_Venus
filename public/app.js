const $ = (s) => document.querySelector(s);
const tr = (text) => window.VenusI18n?.translate(text) || text;
const locale = () => window.VenusI18n?.getLocale?.() || "pt-BR";
const money = (cents) => new Intl.NumberFormat(locale(), { style:"currency", currency:"BRL" }).format((cents || 0) / 100);
const when = (iso) => iso ? new Intl.DateTimeFormat(locale(), { dateStyle:"short", timeStyle:"short" }).format(new Date(iso)) : "—";

const api = async (path, options = {}) => {
  const response = await fetch("/api" + path, {
    credentials:"same-origin",
    ...options,
    headers:{ ...(options.body ? { "Content-Type":"application/json" } : {}), ...(options.headers || {}) },
  });
  const data = await response.json().catch(() => ({ error:tr("Resposta inválida do servidor.") }));
  if (!response.ok) throw new Error(tr(data.error || "Não foi possível concluir."));
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
const contactForm = $("#contactForm");
const contactResult = $("#contactResult");
const termWorkflow = $("#termWorkflow");
const termStatus = $("#termStatus");
const prepareTermButton = $("#prepareTerm");
const signedTermFile = $("#signedTermFile");
const printableTerm = $("#printableTerm");
const printableTermText = $("#printableTermText");

function saveReservationAccess(id, token) {
  currentReservationAccess = { id, token };
  trackingForm.elements.reservationId.value = id;
  trackingForm.elements.manageToken.value = token;
}

async function refreshQuote() {
  const checkIn = form.elements.checkIn.value, checkOut = form.elements.checkOut.value;
  const guests = Number(form.elements.guests.value || 2);
  currentQuote = null;
  if (!checkIn || !checkOut) {
    quoteBox.className = "notice";
    quoteBox.textContent = "Informe check-in e check-out para consultar.";
    return;
  }
  lastQuoteKey = [checkIn, checkOut, guests].join("|");
  quoteBox.textContent = "Consultando valor e disponibilidade…";
  try {
    const q = await api("/quote", { method:"POST", body:JSON.stringify({ checkIn, checkOut, guests }) });
    if (lastQuoteKey !== [checkIn, checkOut, guests].join("|")) return;
    currentQuote = q;
    quoteBox.className = "notice ok";
    quoteBox.innerHTML = `<strong>${q.nights} noite(s) · ${money(q.totalCents)}</strong><br>Diárias: ${money(q.subtotalCents)} · Hóspedes adicionais: ${money(q.guestFeeCents)} · Limpeza: ${money(q.cleaningFeeCents)} · Sinal previsto (${q.depositPercent}%): ${money(q.depositCents)}.`;
  } catch (e) {
    quoteBox.className = "notice error";
    quoteBox.textContent = e.message;
  }
}

form.elements.checkIn.addEventListener("change", refreshQuote);
form.elements.checkOut.addEventListener("change", refreshQuote);
form.elements.guests.addEventListener("change", refreshQuote);

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
    name:form.elements.name.value, cpf:form.elements.cpf.value, email:form.elements.email.value, phone:form.elements.phone.value,
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
  termWorkflow?.classList.add("hidden");
  trackingResult.className = "notice";
  trackingResult.textContent = "Consultando andamento…";
  try {
    const d = await api(`/reservations/${encodeURIComponent(id)}/status`, { headers:{ "X-Reservation-Token":token } });
    currentReservationState = d;
    window.__venusReservationState = d;
    window.dispatchEvent(new CustomEvent("venus:reservationstate", { detail:d }));
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
    if (d.status === "requested") {
      termWorkflow?.classList.remove("hidden");
      if (termStatus) {
        termStatus.className = d.signatureReady ? "notice ok" : "notice";
        termStatus.textContent = d.signatureReady
          ? "Termo assinado e validado. O pagamento da reserva pode seguir pelo canal oficial quando as demais condições estiverem válidas."
          : d.signedTermUploaded
            ? "PDF assinado enviado. Aguarde a validação administrativa antes do pagamento."
            : d.legalReady
              ? "Prepare o termo, assine pelo GOV.BR e envie o PDF assinado."
              : "A versão atual do termo ainda aguarda a aprovação necessária para contratação.";
      }
      if (prepareTermButton) prepareTermButton.disabled = !d.legalReady;
      if (signedTermFile) signedTermFile.disabled = !d.legalReady || d.signatureReady;
    }
    if ((d.status === "requested" || d.status === "confirmed") && cancellation?.status !== "pending") {
      if (d.signatureReady) whatsappButton?.classList.remove("hidden");
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
  const reason = prompt(tr("Motivo do cancelamento (opcional, até 1000 caracteres):"), "");
  if (reason === null) return;
  if (reason.length > 1000) return alert(tr("O motivo deve ter no máximo 1000 caracteres."));
  if (!confirm(tr("Registrar a solicitação de cancelamento? Isso não gera estorno automático; a administração fará a análise e o eventual reembolso."))) return;
  cancellationButton.disabled = true;
  try {
    await api(`/reservations/${encodeURIComponent(currentReservationAccess.id)}/cancellation-request`, {
      method:"POST",
      headers:{ "X-Reservation-Token":currentReservationAccess.token },
      body:JSON.stringify({ reason }),
    });
    alert(tr("Solicitação de cancelamento registrada. Acompanhe o andamento por este mesmo protocolo e código privado."));
    await loadReservationStatus();
  } catch (e) {
    alert(tr(e.message));
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
    }    if (!p.signatureReady) {
      paymentInstructions.textContent = "O termo assinado ainda precisa ser enviado e validado antes do pagamento.";
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
    if (!phone) throw new Error(tr("WhatsApp oficial não configurado."));
    await api(`/reservations/${encodeURIComponent(currentReservationAccess.id)}/whatsapp-started`, {
      method:"POST",
      headers:{ "X-Reservation-Token":currentReservationAccess.token },
      body:JSON.stringify({}),
    });
    currentReservationState.whatsappStarted = true;
    const d = currentReservationState;
    const isSpanish = window.VenusI18n?.getLanguage?.() === "es";
    const message = isSpanish
      ? [
          "¡Hola! Quiero continuar mi solicitud de reserva de Vênus Casa de Praia.",
          `Protocolo: ${d.id}`,
          `Fechas: ${d.checkIn} a ${d.checkOut}`,
          `Huéspedes: ${d.guests}`,
          "Me gustaría recibir las instrucciones para el pago por Pix o transferencia.",
        ].join("\n")
      : [
          "Olá! Quero continuar a minha solicitação de reserva da Vênus Casa de Praia.",
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
  if (!confirm(tr("Você já realizou o Pix ou a transferência combinada pelo WhatsApp? Este aviso não confirma o pagamento; a administração ainda fará a conferência bancária."))) return;
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


contactForm?.addEventListener("submit", async (e) => {
  e.preventDefault(); contactResult.classList.add("hidden"); if (!contactForm.reportValidity()) return;
  const button=contactForm.querySelector("button[type=submit]"); button.disabled=true;
  try { await api("/messages",{method:"POST",body:JSON.stringify({name:contactForm.elements.name.value,email:contactForm.elements.email.value,phone:contactForm.elements.phone.value,dates:contactForm.elements.dates.value,message:contactForm.elements.message.value,website:contactForm.elements.website.value,consent:contactForm.elements.consent.checked})}); contactResult.className="notice ok"; contactResult.textContent="Mensagem registrada. A administração poderá responder pelos canais informados."; contactForm.reset(); }
  catch(error){ contactResult.className="notice error"; contactResult.textContent=error.message; }
  finally{ button.disabled=false; }
});

prepareTermButton?.addEventListener("click", async () => {
  if(!currentReservationAccess)return; prepareTermButton.disabled=true;
  try{
    const pkg=await api(`/reservations/${encodeURIComponent(currentReservationAccess.id)}/term-package`,{headers:{"X-Reservation-Token":currentReservationAccess.token}}); const r=pkg.reservation;
    const cpfDigits=String(r.cpf||"").replace(/\D/g,"");
    const cpfDisplay=cpfDigits.length===11
      ? cpfDigits.slice(0,3)+"."+cpfDigits.slice(3,6)+"."+cpfDigits.slice(6,9)+"-"+cpfDigits.slice(9)
      : "Não informado";
    const emittedAt=r.emittedAt
      ? new Intl.DateTimeFormat("pt-BR",{dateStyle:"short",timeStyle:"short"}).format(new Date(r.emittedAt))
      : "—";
    const header=[
      "QUADRO DA RESERVA GERADO PELO SISTEMA",
      `Protocolo: ${r.id}`,
      `Hóspede responsável: ${r.name}`,
      `CPF: ${cpfDisplay}`,
      `Contato: ${r.phone || ""} · ${r.email || ""}`,
      `Período: ${r.checkIn} a ${r.checkOut}`,
      `Hóspedes: ${r.guests}`,
      `Valor total: ${money(r.totalCents)}`,
      `Taxa de limpeza: ${money(r.cleaningFeeCents || 0)}`,
      `Sinal de 20%: ${money(r.depositCents)}`,
      `Saldo de 80%: ${money(r.balanceCents)}`,
      `Data de emissão: ${emittedAt}`,
      `Versão do termo: ${pkg.termVersion}`,
      `SHA-256 do termo: ${pkg.termHash}`
    ].join("\n");
    printableTermText.textContent=`${header}\n\n${pkg.termText}`; printableTerm.classList.remove("hidden"); window.print();
  }catch(error){alert(tr(error.message))}finally{prepareTermButton.disabled=false}
});

signedTermFile?.addEventListener("change", async () => {
  const file=signedTermFile.files?.[0]; if(!file||!currentReservationAccess)return;
  if(file.type!=="application/pdf"&&!file.name.toLowerCase().endsWith(".pdf")){signedTermFile.value="";return alert(tr("Envie o PDF original assinado."))}
  if(file.size>3*1024*1024){signedTermFile.value="";return alert(tr("O PDF deve ter no máximo 3 MB."))}
  if(!confirm(tr("Confirma o envio do PDF assinado? A administração ainda validará a assinatura e a integridade do documento."))){signedTermFile.value="";return}
  try{const bytes=new Uint8Array(await file.arrayBuffer());let binary="";for(let i=0;i<bytes.length;i+=0x8000)binary+=String.fromCharCode(...bytes.subarray(i,i+0x8000));await api(`/reservations/${encodeURIComponent(currentReservationAccess.id)}/signed-term`,{method:"POST",headers:{"X-Reservation-Token":currentReservationAccess.token},body:JSON.stringify({base64:btoa(binary)})});termStatus.className="notice ok";termStatus.textContent="PDF assinado enviado. Aguarde a validação administrativa antes do pagamento.";signedTermFile.value="";await loadReservationStatus()}catch(error){termStatus.className="notice error";termStatus.textContent=error.message}
});


(async () => {
  try {
    const pub = await api("/public");
    publicSettings = pub.settings || {};
    const emailCard = $("#contactEmailCard");
    const emailText = $("#contactEmailText");
    if (emailCard && emailText) {
      const email = String(publicSettings.email || "").trim();
      if (email) {
        emailText.textContent = email;
        emailCard.href = `mailto:${email}`;
        emailCard.classList.remove("hidden");
      } else {
        emailCard.classList.add("hidden");
      }
    }
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
