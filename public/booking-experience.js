(() => {
  "use strict";

  const SESSION_KEY = "venus:reservation-access:v1";
  const $ = (selector) => document.querySelector(selector);
  const t = (value) => window.VenusI18n?.translate?.(value) || value;
  const locale = () => window.VenusI18n?.getLocale?.() || "pt-BR";

  const calendar = $("#availabilityCalendar");
  const monthLabel = $("#availabilityMonth");
  const daysGrid = $("#availabilityDays");
  const weekdaysGrid = $("#availabilityWeekdays");
  const previousButton = $("#availabilityPrev");
  const nextButton = $("#availabilityNext");
  const calendarStatus = $("#availabilityStatus");
  const bookingForm = $("#bookingForm");
  const trackingForm = $("#trackingForm");
  const forgetButton = $("#forgetReservationAccess");
  const confirmationBox = $("#reservationConfirmation");
  const progress = $("#reservationProgress");

  if (!bookingForm || !trackingForm) return;

  const checkInInput = bookingForm.elements.checkIn;
  const checkOutInput = bookingForm.elements.checkOut;

  const localToday = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
  };

  const parseIso = (value) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ""));
    if (!match) return null;
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12);
  };

  const toIso = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const addDays = (date, amount) => {
    const copy = new Date(date);
    copy.setDate(copy.getDate() + amount);
    return copy;
  };

  const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1, 12);
  const addMonths = (date, amount) => new Date(date.getFullYear(), date.getMonth() + amount, 1, 12);
  const sameDay = (a, b) => !!a && !!b && toIso(a) === toIso(b);

  const requestJson = async (path) => {
    const response = await fetch("/api" + path, {
      credentials: "same-origin",
      headers: { "Accept": "application/json" },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(t(data.error || "Não foi possível carregar a disponibilidade."));
    return data;
  };

  let policy = { minLeadDays: 0, maxAdvanceDays: 1825, maxNights: 30 };
  let earliestCheckIn = localToday();
  let latestCheckIn = addDays(localToday(), policy.maxAdvanceDays);
  let currentMonth = startOfMonth(earliestCheckIn);
  let unavailableRanges = [];
  let calendarRequest = 0;

  function updatePolicy(settings = {}) {
    const integer = (value, fallback, min, max) =>
      Number.isSafeInteger(Number(value)) && Number(value) >= min && Number(value) <= max
        ? Number(value) : fallback;

    policy = {
      minLeadDays: integer(settings.minLeadDays, 0, 0, 365),
      maxAdvanceDays: integer(settings.maxAdvanceDays, 1825, 1, 3650),
      maxNights: integer(settings.maxNights, 30, 1, 366),
    };

    earliestCheckIn = addDays(localToday(), policy.minLeadDays);
    latestCheckIn = addDays(localToday(), policy.maxAdvanceDays);

    checkInInput.min = toIso(earliestCheckIn);
    checkInInput.max = toIso(latestCheckIn);
    updateCheckoutBounds();

    const selected = parseIso(checkInInput.value);
    if (selected) currentMonth = startOfMonth(selected);
    else if (currentMonth < startOfMonth(earliestCheckIn)) currentMonth = startOfMonth(earliestCheckIn);
  }

  function updateCheckoutBounds() {
    const selectedCheckIn = parseIso(checkInInput.value);
    if (!selectedCheckIn) {
      checkOutInput.removeAttribute("min");
      checkOutInput.removeAttribute("max");
      return;
    }
    checkOutInput.min = toIso(addDays(selectedCheckIn, 1));
    checkOutInput.max = toIso(addDays(selectedCheckIn, policy.maxNights));
  }

  function getStoredAccess() {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed.id !== "string" || typeof parsed.token !== "string") return null;
      if (!parsed.id.trim() || !parsed.token.trim()) return null;
      return { id: parsed.id.trim(), token: parsed.token.trim() };
    } catch {
      return null;
    }
  }

  function storeCurrentAccess() {
    const id = String(trackingForm.elements.reservationId?.value || "").trim();
    const token = String(trackingForm.elements.manageToken?.value || "").trim();
    if (!id || !token) return;
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ id, token }));
      forgetButton?.classList.remove("hidden");
    } catch {}
  }

  function restoreAccess() {
    const stored = getStoredAccess();
    if (!stored) return false;
    trackingForm.elements.reservationId.value = stored.id;
    trackingForm.elements.manageToken.value = stored.token;
    forgetButton?.classList.remove("hidden");
    return true;
  }

  function forgetAccess() {
    try { sessionStorage.removeItem(SESSION_KEY); } catch {}
    trackingForm.reset();
    window.location.reload();
  }

  function setProgressState(state) {
    if (!progress) return;
    const items = [...progress.querySelectorAll("[data-step]")];
    items.forEach((item) => {
      item.classList.remove("is-done", "is-current");
      item.removeAttribute("aria-current");
    });

    if (!state) {
      items[0]?.classList.add("is-current");
      items[0]?.setAttribute("aria-current", "step");
      return;
    }

    if (state.status === "confirmed") {
      items.forEach((item) => item.classList.add("is-done"));
      items.at(-1)?.classList.add("is-current");
      items.at(-1)?.setAttribute("aria-current", "step");
      if (confirmationBox) {
        confirmationBox.className = "notice ok reservation-confirmation";
        confirmationBox.textContent = t("Sua reserva está confirmada! Guarde o protocolo e acompanhe aqui qualquer atualização da hospedagem.");
      }
      return;
    }

    if (confirmationBox) {
      confirmationBox.className = "notice reservation-confirmation hidden";
      confirmationBox.textContent = "";
    }

    let current = 2;
    const done = new Set([0, 1]);

    if (state.signatureReady) {
      done.add(2);
      current = 3;
    }

    if (state.whatsappStarted && (state.paymentReported || Number(state.paidCents || 0) > 0)) {
      done.add(3);
      current = 4;
    }

    if (Number(state.paidCents || 0) > 0) current = 4;
    if (state.status === "cancelled") current = 1;

    items.forEach((item, index) => {
      if (done.has(index)) item.classList.add("is-done");
      if (index === current) {
        item.classList.add("is-current");
        item.setAttribute("aria-current", "step");
      }
    });
  }

  function renderWeekdays() {
    if (!weekdaysGrid) return;
    const labels = window.VenusI18n?.getLanguage?.() === "es"
      ? ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
      : ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
    weekdaysGrid.replaceChildren(...labels.map((label) => {
      const cell = document.createElement("span");
      cell.textContent = label;
      return cell;
    }));
  }

  function rangeContains(range, date) {
    const value = toIso(date);
    return value >= String(range.check_in || "") && value < String(range.check_out || "");
  }

  function isUnavailable(date) {
    return unavailableRanges.some((range) => rangeContains(range, date));
  }

  function isWithinSelectedRange(date) {
    const start = parseIso(checkInInput.value);
    const end = parseIso(checkOutInput.value);
    if (!start || !end) return false;
    const value = toIso(date);
    return value > toIso(start) && value < toIso(end);
  }

  function isSelectable(date) {
    if (isUnavailable(date)) return false;
    if (date < earliestCheckIn) return false;

    const selectedStart = parseIso(checkInInput.value);
    const selectedEnd = parseIso(checkOutInput.value);

    if (date <= latestCheckIn) return true;
    if (selectedStart && !selectedEnd && date > selectedStart && date <= addDays(selectedStart, policy.maxNights)) return true;
    return false;
  }

  function monthBounds() {
    return {
      min: startOfMonth(earliestCheckIn),
      max: startOfMonth(addDays(latestCheckIn, policy.maxNights)),
    };
  }

  function renderCalendar() {
    if (!calendar || !daysGrid || !monthLabel) return;

    renderWeekdays();
    monthLabel.textContent = new Intl.DateTimeFormat(locale(), {
      month: "long", year: "numeric",
    }).format(currentMonth);

    const first = startOfMonth(currentMonth);
    const nextMonth = addMonths(first, 1);
    const lastDate = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 0, 12);
    const mondayOffset = (first.getDay() + 6) % 7;
    const selectedStart = parseIso(checkInInput.value);
    const selectedEnd = parseIso(checkOutInput.value);
    const today = localToday();

    daysGrid.replaceChildren();

    for (let i = 0; i < mondayOffset; i += 1) {
      const blank = document.createElement("span");
      blank.className = "availability-day is-empty";
      blank.setAttribute("aria-hidden", "true");
      daysGrid.append(blank);
    }

    for (let dayNumber = 1; dayNumber <= lastDate.getDate(); dayNumber += 1) {
      const date = new Date(first.getFullYear(), first.getMonth(), dayNumber, 12);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "availability-day";
      button.textContent = String(dayNumber);
      button.dataset.date = toIso(date);
      button.setAttribute("aria-label", new Intl.DateTimeFormat(locale(), { dateStyle: "full" }).format(date));

      if (sameDay(date, today)) button.classList.add("is-today");
      if (isUnavailable(date)) button.classList.add("is-unavailable");
      if (sameDay(date, selectedStart) || sameDay(date, selectedEnd)) button.classList.add("is-selected");
      if (isWithinSelectedRange(date)) button.classList.add("is-in-range");

      if (!isSelectable(date)) {
        button.disabled = true;
        button.setAttribute("aria-disabled", "true");
      }

      button.addEventListener("click", () => selectDate(date));
      daysGrid.append(button);
    }

    const bounds = monthBounds();
    previousButton.disabled = currentMonth <= bounds.min;
    nextButton.disabled = currentMonth >= bounds.max;
  }

  async function loadAvailability() {
    if (!calendar) return;
    const requestId = ++calendarRequest;
    const start = startOfMonth(currentMonth);
    const end = addMonths(start, 1);

    calendarStatus.className = "availability-status";
    calendarStatus.textContent = t("Carregando disponibilidade…");

    try {
      const result = await requestJson(`/availability?start=${encodeURIComponent(toIso(start))}&end=${encodeURIComponent(toIso(end))}`);
      if (requestId !== calendarRequest) return;
      unavailableRanges = Array.isArray(result.ranges) ? result.ranges : [];
      calendarStatus.className = "availability-status";
      calendarStatus.textContent = t("Datas indisponíveis incluem reservas confirmadas, bloqueios e prioridades temporárias ativas.");
      renderCalendar();
    } catch {
      if (requestId !== calendarRequest) return;
      unavailableRanges = [];
      calendarStatus.className = "availability-status is-error";
      calendarStatus.textContent = t("Não foi possível carregar o calendário agora. Você ainda pode usar os campos de check-in e check-out.");
      renderCalendar();
    }
  }

  function selectDate(date) {
    const selectedStart = parseIso(checkInInput.value);
    const selectedEnd = parseIso(checkOutInput.value);

    if (!selectedStart || selectedEnd || date <= selectedStart) {
      checkInInput.value = toIso(date);
      checkOutInput.value = "";
      updateCheckoutBounds();
      calendarStatus.className = "availability-status";
      calendarStatus.textContent = t("Check-in selecionado. Agora escolha a data de check-out.");
      checkInInput.dispatchEvent(new Event("change", { bubbles: true }));
      renderCalendar();
      return;
    }

    checkOutInput.value = toIso(date);
    updateCheckoutBounds();
    checkOutInput.dispatchEvent(new Event("change", { bubbles: true }));
    renderCalendar();
  }

  checkInInput.addEventListener("change", () => {
    updateCheckoutBounds();
    const selected = parseIso(checkInInput.value);
    if (selected) currentMonth = startOfMonth(selected);
    loadAvailability();
  });

  checkOutInput.addEventListener("change", renderCalendar);

  previousButton?.addEventListener("click", () => {
    currentMonth = addMonths(currentMonth, -1);
    loadAvailability();
  });

  nextButton?.addEventListener("click", () => {
    currentMonth = addMonths(currentMonth, 1);
    loadAvailability();
  });

  forgetButton?.addEventListener("click", forgetAccess);

  window.addEventListener("venus:reservationstate", (event) => {
    storeCurrentAccess();
    setProgressState(event.detail || null);
    loadAvailability();
  });

  window.addEventListener("venus:languagechange", () => {
    renderCalendar();
    const state = window.__venusReservationState || null;
    if (state) setProgressState(state);
  });

  let lastReturnRefresh = 0;
  function refreshAfterReturn() {
    if (document.hidden || !getStoredAccess()) return;
    const now = Date.now();
    if (now - lastReturnRefresh < 5000) return;
    lastReturnRefresh = now;
    trackingForm.requestSubmit();
    loadAvailability();
  }

  document.addEventListener("visibilitychange", refreshAfterReturn);
  window.addEventListener("focus", refreshAfterReturn);

  async function init() {
    setProgressState(null);
    try {
      const pub = await requestJson("/public");
      updatePolicy(pub.settings || {});
    } catch {
      updatePolicy({});
    }

    currentMonth = startOfMonth(parseIso(checkInInput.value) || earliestCheckIn);
    await loadAvailability();

    if (restoreAccess()) setTimeout(() => trackingForm.requestSubmit(), 50);
  }

  init();
})();
