export class AppError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

export const today = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "America/Fortaleza" }).format(new Date());

export function date(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new AppError("Data inválida.");
  }
  const parsed = new Date(value + "T12:00:00Z");
  if (!Number.isFinite(+parsed) || parsed.toISOString().slice(0, 10) !== value) {
    throw new AppError("Data inválida.");
  }
  return value;
}

export function addDays(value, amount) {
  date(value);
  if (!Number.isSafeInteger(amount) || Math.abs(amount) > 10000) {
    throw new AppError("Intervalo de datas inválido.");
  }
  return new Date(Date.parse(value) + amount * 86400000).toISOString().slice(0, 10);
}

export function datesBetween(start, end) {
  date(start);
  date(end);
  const count = (Date.parse(end) - Date.parse(start)) / 86400000;
  if (!Number.isSafeInteger(count) || count < 1 || count > 366) {
    throw new AppError("A estadia deve ter entre 1 e 366 noites.");
  }
  return Array.from({ length: count }, (_, i) =>
    new Date(Date.parse(start) + i * 86400000).toISOString().slice(0, 10),
  );
}

export function text(value, label, min = 1, max = 250) {
  if (typeof value !== "string") throw new AppError(`${label}: valor inválido.`);
  const clean = value.trim();
  if (clean.length < min || clean.length > max) {
    throw new AppError(`${label}: informe entre ${min} e ${max} caracteres.`);
  }
  return clean;
}

export function integer(value, label, min = 0, max = 100000000) {
  if (!Number.isSafeInteger(value) || value < min || value > max) {
    throw new AppError(`${label}: valor inválido.`);
  }
  return value;
}

export function contact(body) {
  const name = text(body.name, "Nome", 2, 120);
  const email = text(body.email, "E-mail", 5, 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new AppError("E-mail inválido.");
  const phone = text(body.phone || "", "Telefone", 0, 25);
  if (phone && !/^\+?[\d\s()-]{8,25}$/.test(phone)) throw new AppError("Telefone inválido.");
  return { name, email, phone };
}

export function bookingPolicy(db) {
  const settings = JSON.parse(db.prepare("SELECT value FROM settings WHERE id=1").get().value);
  const number = (value, fallback, min, max) =>
    Number.isSafeInteger(value) && value >= min && value <= max ? value : fallback;
  return {
    minLeadDays: number(settings.minLeadDays, 0, 0, 365),
    maxAdvanceDays: number(settings.maxAdvanceDays, 1825, 1, 3650),
    maxNights: number(settings.maxNights, 30, 1, 366),
    requestHoldMinutes: number(settings.requestHoldMinutes, 30, 5, 1440),
  };
}

export function assertBookingWindow(db, start, end, { referenceDate = today() } = {}) {
  const days = datesBetween(start, end);
  const policy = bookingPolicy(db);
  const earliest = addDays(referenceDate, policy.minLeadDays);
  const latest = addDays(referenceDate, policy.maxAdvanceDays);
  if (start < earliest) {
    const label = policy.minLeadDays === 0 ? "hoje" : `${policy.minLeadDays} dia(s) de antecedência`;
    throw new AppError(`O check-in precisa respeitar ${label}.`, 422);
  }
  if (start > latest) {
    throw new AppError(`Reservas podem ser solicitadas com até ${policy.maxAdvanceDays} dias de antecedência.`, 422);
  }
  if (days.length > policy.maxNights) {
    throw new AppError(`A estadia pode ter no máximo ${policy.maxNights} noites.`, 422);
  }
  return { ...policy, nights: days.length };
}

export function calculateQuote(db, start, end, { checkPast = true } = {}) {
  const days = datesBetween(start, end);
  if (checkPast) assertBookingWindow(db, start, end);

  const settings = JSON.parse(db.prepare("SELECT value FROM settings WHERE id=1").get().value);
  if (!settings.pricingEnabled) {
    throw new AppError("Tarifas ainda não publicadas. Consulte a anfitriã.", 422);
  }

  const rules = db.prepare(
    "SELECT * FROM rates WHERE start_date < ? AND end_date > ? ORDER BY start_date",
  ).all(end, start);

  const nightlyDetails = days.map((day) => {
    const rule = rules.find((r) => r.start_date <= day && day < r.end_date);
    if (!rule) {
      throw new AppError("Não há tarifa cadastrada para todas as noites selecionadas.", 422);
    }
    const weekend = [5, 6].includes(new Date(day + "T12:00:00Z").getUTCDay());
    return {
      date: day,
      rateCents: weekend ? rule.weekend_cents : rule.weekday_cents,
      label: rule.label,
      minNights: rule.min_nights,
    };
  });

  const minNights = Math.max(...nightlyDetails.map((n) => n.minNights));
  if (days.length < minNights) {
    throw new AppError(`Este período exige no mínimo ${minNights} noites.`, 422);
  }

  const subtotalCents = nightlyDetails.reduce((sum, n) => sum + n.rateCents, 0);
  const totalCents = subtotalCents + settings.cleaningFeeCents;
  return {
    nights: days.length,
    nightlyDetails,
    subtotalCents,
    cleaningFeeCents: settings.cleaningFeeCents,
    totalCents,
    depositCents: Math.round((totalCents * settings.depositPercent) / 100),
    depositPercent: settings.depositPercent,
    minNights,
  };
}

export function cleanupExpiredHolds(db, now = Date.now()) {
  db.prepare("DELETE FROM reservation_holds WHERE expires_at <= ?").run(now);
}

export function getReservationHold(db, reservationId, now = Date.now()) {
  cleanupExpiredHolds(db, now);
  const row = db.prepare(
    "SELECT reservation_id,expires_at,created_at FROM reservation_holds WHERE reservation_id=? AND expires_at>?",
  ).get(reservationId, now);
  if (!row) return null;
  return {
    reservationId: row.reservation_id,
    expiresAt: row.expires_at,
    expiresAtIso: new Date(row.expires_at).toISOString(),
    createdAt: row.created_at,
  };
}

export function findHoldConflict(db, start, end, exceptId = "", now = Date.now()) {
  datesBetween(start, end);
  cleanupExpiredHolds(db, now);
  return db.prepare(`
    SELECT r.id,r.check_in,r.check_out,h.expires_at
    FROM reservation_holds h
    JOIN reservations r ON r.id=h.reservation_id
    WHERE r.status='requested'
      AND h.expires_at>?
      AND r.check_in < ? AND r.check_out > ?
      AND r.id != ?
    ORDER BY h.expires_at ASC
    LIMIT 1
  `).get(now, end, start, exceptId) || null;
}

export function grantReservationHold(db, reservationId, minutes, { now = Date.now(), replace = false } = {}) {
  const row = db.prepare("SELECT id,status,check_in,check_out FROM reservations WHERE id=?").get(reservationId);
  if (!row) throw new AppError("Reserva não encontrada.", 404);
  if (row.status !== "requested") throw new AppError("Somente solicitações pendentes podem receber bloqueio temporário.", 409);
  integer(minutes, "Duração do bloqueio", 5, 1440);
  const conflict = findHoldConflict(db, row.check_in, row.check_out, reservationId, now);
  if (conflict && !replace) return null;
  if (conflict) throw new AppError("Outra solicitação possui prioridade temporária para este período.", 409);
  const expiresAt = now + minutes * 60000;
  db.prepare(`INSERT INTO reservation_holds(reservation_id,expires_at)
    VALUES(?,?) ON CONFLICT(reservation_id) DO UPDATE SET expires_at=excluded.expires_at`).run(reservationId, expiresAt);
  return getReservationHold(db, reservationId, now);
}

export function releaseReservationHold(db, reservationId) {
  db.prepare("DELETE FROM reservation_holds WHERE reservation_id=?").run(reservationId);
}

export function assertAvailable(db, start, end, exceptId = "", { includeHolds = true, now = Date.now() } = {}) {
  datesBetween(start, end);
  const conflict = db.prepare(
    "SELECT id FROM reservations WHERE status IN ('confirmed','blocked') AND check_in < ? AND check_out > ? AND id != ? LIMIT 1",
  ).get(end, start, exceptId);
  if (conflict) {
    throw new AppError("O período já está reservado ou bloqueado. Escolha outras datas.", 409);
  }
  if (includeHolds && findHoldConflict(db, start, end, exceptId, now)) {
    throw new AppError("O período está temporariamente em atendimento para outra solicitação. Tente novamente mais tarde.", 409);
  }
}

export function transaction(db, fn) {
  db.exec("BEGIN IMMEDIATE");
  try {
    const result = fn();
    db.exec("COMMIT");
    return result;
  } catch (error) {
    try { db.exec("ROLLBACK"); } catch {}
    throw error;
  }
}

export function csv(rows) {
  const cell = (value) =>
    '"' + String(value ?? "")
      .replace(/^[=+@\-\t\r]/, "'$&")
      .replaceAll('"', '""') + '"';
  return "\ufeff" + rows.map((row) => row.map(cell).join(";")).join("\r\n");
}
