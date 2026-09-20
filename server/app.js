import http from "node:http";
import { readFileSync, existsSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { extname, join, normalize, resolve, dirname , relative , isAbsolute } from "node:path";
import {
  randomBytes, randomUUID, createHash, createHmac, scryptSync, timingSafeEqual,
} from "node:crypto";
import {
  AppError, today, date, datesBetween, text, integer, contact,
  bookingPolicy, calculateQuote, assertAvailable, cleanupExpiredHolds, findHoldConflict,
  getReservationHold, grantReservationHold, releaseReservationHold, transaction, csv,
} from "./domain.js";
import {
  TERM_HASH, TERM_TEXT, TERM_VERSION, legal, banking, readiness,
  assertConfirmationReady, saveSignedTerm, validateSignedTerm,
} from "./compliance.js";

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const MAX_JSON = 8 * 1024 * 1024;

function decodeBase32(value) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const clean = String(value || "").toUpperCase().replace(/=+$/g, "").replace(/[^A-Z2-7]/g, "");
  let bits = "";
  for (const c of clean) {
    const n = alphabet.indexOf(c);
    if (n < 0) throw new Error("TOTP invÃ¡lido");
    bits += n.toString(2).padStart(5, "0");
  }
  const out = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) out.push(parseInt(bits.slice(i, i + 8), 2));
  return Buffer.from(out);
}

function verifyTotp(secret, code, now = Date.now()) {
  if (!secret) return true;
  if (!/^\d{6}$/.test(String(code || ""))) return false;
  let key;
  try { key = decodeBase32(secret); } catch { return false; }
  if (key.length < 10) return false;
  const expectedCodes = [];
  const current = Math.floor(now / 30000);
  for (const offset of [-1, 0, 1]) {
    const counter = Buffer.alloc(8);
    counter.writeBigUInt64BE(BigInt(current + offset));
    const hmac = createHmac("sha1", key).update(counter).digest();
    const pos = hmac[hmac.length - 1] & 0x0f;
    const bin = ((hmac[pos] & 0x7f) << 24) | ((hmac[pos + 1] & 0xff) << 16) | ((hmac[pos + 2] & 0xff) << 8) | (hmac[pos + 3] & 0xff);
    expectedCodes.push(String(bin % 1_000_000).padStart(6, "0"));
  }
  const received = Buffer.from(String(code));
  return expectedCodes.some((expected) => timingSafeEqual(Buffer.from(expected), received));
}
const MIME = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".webp": "image/webp", ".svg": "image/svg+xml", ".webmanifest": "application/manifest+json",
};

function compilePath(pattern) {
  const names = [];
  const source = pattern.split("/").map((part) => {
    if (part.startsWith(":")) { names.push(part.slice(1)); return "([^/]+)"; }
    return part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }).join("/");
  return { regex: new RegExp(`^${source}$`), names };
}

function parseCookies(value = "") {
  return Object.fromEntries(value.split(";").map((p) => p.trim()).filter(Boolean).map((p) => {
    const i = p.indexOf("="); return i < 0 ? [p, ""] : [p.slice(0, i), p.slice(i + 1)];
  }));
}

function json(res, status, value, headers = {}) {
  const data = Buffer.from(JSON.stringify(value));
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Content-Length": data.length, ...headers });
  res.end(data);
}
function raw(res, status, value, type, headers = {}) {
  const data = Buffer.isBuffer(value) ? value : Buffer.from(value);
  res.writeHead(status, { "Content-Type": type, "Content-Length": data.length, ...headers });
  res.end(data);
}
function attachment(name) {
  return { "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(name)}` };
}

async function readJson(req) {
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_JSON) throw new AppError("ConteÃºdo muito grande.", 413);
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); }
  catch { throw new AppError("JSON invÃ¡lido.", 400); }
}

async function loadGuideHtml() {
  const cachePath = resolve(process.env.GUIDE_CACHE_PATH || "./data/guia-venus-pb.html");
  const source = process.env.GUIDE_SOURCE_URL
    || "https://raw.githubusercontent.com/Priscillacahino/guia_lugares_pb/main/guia_offline.html";
  const expectedHash = String(process.env.GUIDE_EXPECTED_SHA256 || "").trim().toLowerCase();

  const validateGuide = (html) => {
    if (html.length < 1000 || html.length > 600000 || !/Guia V[eÃª]nus/i.test(html)) {
      throw new Error("ConteÃºdo do guia nÃ£o passou na validaÃ§Ã£o.");
    }
    if (expectedHash && !/^[a-f0-9]{64}$/.test(expectedHash)) {
      throw new Error("GUIDE_EXPECTED_SHA256 invÃ¡lido.");
    }
    if (expectedHash && sha256(html) !== expectedHash) {
      throw new Error("O Guia VÃªnus nÃ£o corresponde ao SHA-256 configurado.");
    }
    return html;
  };

  try {
    const response = await fetch(source, { signal: AbortSignal.timeout(7000), redirect: "follow" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const html = validateGuide(await response.text());
    mkdirSync(dirname(cachePath), { recursive: true, mode: 0o700 });
    writeFileSync(cachePath, html, { mode: 0o600 });
    return html;
  } catch (error) {
    if (existsSync(cachePath)) {
      try { return validateGuide(readFileSync(cachePath, "utf8")); } catch {}
    }
    throw new AppError("O Guia VÃªnus estÃ¡ temporariamente indisponÃ­vel.", 503);
  }
}

function clientIp(req) {
  const hops = Number(process.env.TRUST_PROXY_HOPS || 0);
  if (Number.isInteger(hops) && hops > 0 && hops <= 5) {
    const forwarded = String(req.headers["x-forwarded-for"] || "").split(",").map((x) => x.trim()).filter(Boolean);
    if (forwarded.length >= hops) return forwarded[Math.max(0, forwarded.length - hops)] || req.socket.remoteAddress || "unknown";
  }
  return req.socket.remoteAddress || "unknown";
}

export function createApp(db, options = {}) {
  const production = options.production ?? process.env.NODE_ENV === "production";
  const origin = options.origin ?? process.env.APP_URL;
  const passwordHash = options.passwordHash ?? process.env.ADMIN_PASSWORD_HASH;
  const totpSecret = options.totpSecret ?? process.env.ADMIN_TOTP_SECRET;
  const reservationTokenSecret = options.reservationTokenSecret ?? process.env.RESERVATION_TOKEN_SECRET
    ?? (production ? "" : sha256(passwordHash || "venus-development-reservation-token"));
  const staticDir = options.staticDir ? resolve(options.staticDir) : null;
  if (production && (!origin || !origin.startsWith("https://") || !passwordHash || !totpSecret || reservationTokenSecret.length < 32)) {
    throw new Error("Configure APP_URL HTTPS, ADMIN_PASSWORD_HASH, ADMIN_TOTP_SECRET e RESERVATION_TOKEN_SECRET antes de iniciar em produÃ§Ã£o.");
  }

  const routes = [];
  const register = (method, pattern, handler, auth = false) => {
    const compiled = compilePath(pattern);
    routes.push({ method, pattern, handler, auth, ...compiled });
  };

  const enforceRateLimit = (ctx, scope, maxAttempts, windowMs) => {
    const now = Date.now();
    const keyHash = sha256(`${scope}:${ctx.ip}`);
    db.prepare("DELETE FROM rate_limits WHERE window_until <= ?").run(now);
    const row = db.prepare("SELECT count,window_until FROM rate_limits WHERE key_hash=?").get(keyHash);
    if (!row) {
      db.prepare("INSERT INTO rate_limits(key_hash,scope,count,window_until) VALUES(?,?,1,?)")
        .run(keyHash, scope, now + windowMs);
      return;
    }
    const count = row.count + 1;
    db.prepare("UPDATE rate_limits SET count=? WHERE key_hash=?").run(count, keyHash);
    if (count > maxAttempts) {
      ctx.res.setHeader("Retry-After", String(Math.max(1, Math.ceil((row.window_until - now) / 1000))));
      throw new AppError("Muitas tentativas. Aguarde alguns minutos.", 429);
    }
  };
  const audit = (ctx, action, resource, details = {}, actor = "admin") => {
    const previous = db.prepare("SELECT entry_hash FROM audit WHERE entry_hash IS NOT NULL ORDER BY id DESC LIMIT 1").get()?.entry_hash || "";
    const safeDetails = JSON.stringify(details);
    const payload = JSON.stringify({
      action, resource, actor, requestId: ctx.requestId, details: safeDetails, previous,
    });
    const entryHash = sha256(payload);
    db.prepare(`INSERT INTO audit(action,resource,actor,request_id,details_json,previous_hash,entry_hash)
      VALUES(?,?,?,?,?,?,?)`).run(action, resource, actor, ctx.requestId, safeDetails, previous || null, entryHash);
  };

  const settings = () => JSON.parse(db.prepare("SELECT value FROM settings WHERE id=1").get().value);
  const sessionHash = (ctx) => sha256(ctx.cookies.venus_session || "");
  const requireAuth = (ctx) => {
    const row = db.prepare("SELECT expires FROM sessions WHERE token_hash=?").get(sessionHash(ctx));
    if (!row || row.expires < Date.now()) throw new AppError("Entre na administraÃ§Ã£o para continuar.", 401);
  };

  const reservationToken = (row) => {
    const version = Number(row.token_version || 1);
    const material = version > 1
      ? `reservation:${row.id}:${row.request_key || ""}:v${version}`
      : `reservation:${row.id}:${row.request_key || ""}`;
    return createHmac("sha256", reservationTokenSecret).update(material).digest("base64url");
  };
  const verifyReservationToken = (row, supplied) => {
    if (!row?.request_key || typeof supplied !== "string") return false;
    const expected = Buffer.from(reservationToken(row));
    const received = Buffer.from(supplied);
    return expected.length === received.length && timingSafeEqual(expected, received);
  };
  const reservationEvent = (reservationId, event, actor = "system", details = {}) => {
    db.prepare("INSERT INTO reservation_events(reservation_id,event,actor,details_json) VALUES(?,?,?,?)")
      .run(reservationId, event, actor, JSON.stringify(details));
  };
  const paidFor = (reservationId) => db.prepare(
    "SELECT COALESCE(SUM(amount_cents),0) AS total FROM payments WHERE reservation_id=? AND settled=1",
  ).get(reservationId).total;
  const financialSnapshot = () => {
    const reservations = db.prepare("SELECT * FROM reservations WHERE status!='blocked' ORDER BY check_in DESC").all();
    const payments = db.prepare("SELECT reservation_id,amount_cents FROM payments WHERE settled=1").all();
    const byReservation = new Map();
    let grossInflowCents = 0, refundsCents = 0;
    for (const p of payments) {
      byReservation.set(p.reservation_id, (byReservation.get(p.reservation_id) || 0) + p.amount_cents);
      if (p.amount_cents > 0) grossInflowCents += p.amount_cents;
      else refundsCents += Math.abs(p.amount_cents);
    }
    const rows = reservations.map((r) => {
      const q = JSON.parse(r.quote || "{}");
      const totalCents = q.totalCents || 0;
      const receivedCents = byReservation.get(r.id) || 0;
      return {
        reservationId: r.id,
        name: r.name,
        status: r.status,
        checkIn: r.check_in,
        checkOut: r.check_out,
        totalCents,
        receivedCents,
        balanceCents: Math.max(0, totalCents - receivedCents),
      };
    });
    const confirmed = rows.filter((r) => r.status === "confirmed");
    const requested = rows.filter((r) => r.status === "requested");
    const cancelled = rows.filter((r) => r.status === "cancelled");
    const sum = (items, field) => items.reduce((total, item) => total + (item[field] || 0), 0);
    return {
      summary: {
        grossInflowCents,
        refundsCents,
        netReceivedCents: grossInflowCents - refundsCents,
        confirmedContractedCents: sum(confirmed, "totalCents"),
        confirmedReceivedCents: sum(confirmed, "receivedCents"),
        confirmedOutstandingCents: sum(confirmed, "balanceCents"),
        requestedReceivedCents: sum(requested, "receivedCents"),
        cancelledHeldCents: sum(cancelled, "receivedCents"),
      },
      rows,
    };
  };

  const publicReservationState = (row) => {
    const quote = JSON.parse(row.quote || "{}");
    const paidCents = paidFor(row.id);
    const hold = getReservationHold(db, row.id);
    const review = db.prepare("SELECT id,approved FROM reviews WHERE reservation_id=?").get(row.id);
    return {
      id: row.id,
      status: row.status,
      checkIn: row.check_in,
      checkOut: row.check_out,
      guests: row.guests,
      hasPet: row.has_pet === 1,
      quote: {
        nights: quote.nights || 0, totalCents: quote.totalCents || 0,
        depositCents: quote.depositCents || 0, depositPercent: quote.depositPercent || 20,
      },
      paidCents,
      balanceCents: Math.max(0, (quote.totalCents || 0) - paidCents),
      depositReceived: paidCents >= (quote.depositCents || 0),
      reviewEligible: row.status === "confirmed" && row.check_out <= today() && !review,
      reviewSubmitted: !!review,
      hold: hold ? { active: true, expiresAt: hold.expiresAtIso } : { active: false, expiresAt: null },
    };
  };

  // Public endpoints.
  register("GET", "/api/health", (ctx) => json(ctx.res, 200, { ok: true, version: 6 }));
  register("GET", "/api/public", (ctx) => {
    const reviews = db.prepare("SELECT id,name,rating,comment,created_at FROM reviews WHERE approved=1 ORDER BY created_at DESC LIMIT 100").all();
    const stats = db.prepare("SELECT COUNT(*) AS count, AVG(rating) AS average FROM reviews WHERE approved=1").get();
    const publicSettings = { ...settings() };
    // Public settings never contain banking data; only property contact/configuration.
    json(ctx.res, 200, {
      settings: publicSettings,
      rates: db.prepare("SELECT * FROM rates WHERE end_date>? ORDER BY start_date").all(today()),
      reviews,
      reviewStats: stats,
    });
  });
  register("GET", "/api/availability", (ctx) => {
    const start = date(ctx.url.searchParams.get("start"));
    const end = date(ctx.url.searchParams.get("end"));
    datesBetween(start, end);
    cleanupExpiredHolds(db);
    const hard = db.prepare(`SELECT check_in,check_out FROM reservations
      WHERE status IN ('confirmed','blocked') AND check_in < ? AND check_out > ?`).all(end, start);
    const held = db.prepare(`SELECT r.check_in,r.check_out FROM reservation_holds h
      JOIN reservations r ON r.id=h.reservation_id
      WHERE r.status='requested' AND h.expires_at>? AND r.check_in < ? AND r.check_out > ?`).all(Date.now(), end, start);
    const unique = new Map([...hard, ...held].map((r) => [`${r.check_in}|${r.check_out}`, r]));
    json(ctx.res, 200, { ranges: [...unique.values()] });
  });
  register("POST", "/api/quote", (ctx) => {
    assertAvailable(db, ctx.body.checkIn, ctx.body.checkOut);
    json(ctx.res, 200, calculateQuote(db, ctx.body.checkIn, ctx.body.checkOut));
  });
  register("POST", "/api/reservations", (ctx) => {
    const b = ctx.body;
    const person = contact(b);
    if (!person.phone) throw new AppError("Informe seu telefone.");
    if (b.consent !== true) throw new AppError("Confirme o uso dos dados para atender Ã  solicitaÃ§Ã£o.");
    const requestKey = text(ctx.req.headers["idempotency-key"], "Identificador", 16, 100);
    const requestHash = sha256(JSON.stringify(b));
    const result = transaction(db, () => {
      cleanupExpiredHolds(db);
      const existing = db.prepare("SELECT * FROM reservations WHERE request_key=?").get(requestKey);
      if (existing) {
        if (existing.request_hash !== requestHash) throw new AppError("Esta solicitaÃ§Ã£o jÃ¡ foi enviada com outros dados. Atualize a pÃ¡gina.", 409);
        let hold = getReservationHold(db, existing.id);
        if (!hold && existing.status === "requested" && !findHoldConflict(db, existing.check_in, existing.check_out, existing.id)) {
          hold = grantReservationHold(db, existing.id, bookingPolicy(db).requestHoldMinutes);
          if (hold) reservationEvent(existing.id, "hold.regranted", "guest", { expiresAt: hold.expiresAtIso });
        }
        return {
          id: existing.id, quote: JSON.parse(existing.quote), status: existing.status,
          manageToken: reservationToken(existing),
          holdGranted: !!hold, holdExpiresAt: hold?.expiresAtIso || null,
        };
      }
      integer(b.guests, "HÃ³spedes", 1, settings().maxGuests);
      // SolicitaÃ§Ãµes concorrentes podem entrar na fila; somente reservas confirmadas/bloqueios impedem o pedido.
      assertAvailable(db, b.checkIn, b.checkOut, "", { includeHolds: false });
      const quote = calculateQuote(db, b.checkIn, b.checkOut);
      if (b.expectedTotalCents !== quote.totalCents) throw new AppError("A tarifa foi atualizada. Consulte o valor novamente.", 409);
      const id = randomUUID();
      db.prepare(`INSERT INTO reservations
        (id,request_key,request_hash,name,email,phone,check_in,check_out,guests,has_pet,notes,status,quote)
        VALUES(?,?,?,?,?,?,?,?,?,?,?,'requested',?)`).run(
        id, requestKey, requestHash, person.name, person.email, person.phone,
        b.checkIn, b.checkOut, b.guests, b.hasPet === true ? 1 : 0,
        text(b.notes || "", "ObservaÃ§Ãµes", 0, 2000), JSON.stringify(quote),
      );
      const row = db.prepare("SELECT * FROM reservations WHERE id=?").get(id);
      const hold = findHoldConflict(db, b.checkIn, b.checkOut, id)
        ? null
        : grantReservationHold(db, id, bookingPolicy(db).requestHoldMinutes);
      reservationEvent(id, "reservation.requested", "guest", {
        checkIn: b.checkIn, checkOut: b.checkOut, holdGranted: !!hold,
      });
      audit(ctx, "reservation.requested", id, { checkIn: b.checkIn, checkOut: b.checkOut, holdGranted: !!hold }, "guest");
      return {
        id, quote, status: "requested", manageToken: reservationToken(row),
        holdGranted: !!hold, holdExpiresAt: hold?.expiresAtIso || null,
      };
    });
    json(ctx.res, 201, result);
  });

  register("GET", "/api/reservations/:id/status", (ctx) => {
    const row = db.prepare("SELECT * FROM reservations WHERE id=? AND status!='blocked'").get(ctx.params.id);
    const token = String(ctx.req.headers["x-reservation-token"] || "");
    if (!row || !verifyReservationToken(row, token)) throw new AppError("Reserva nÃ£o encontrada.", 404);
    json(ctx.res, 200, publicReservationState(row));
  });
  register("POST", "/api/messages", (ctx) => {
    const b = ctx.body;
    const p = contact(b);
    if (b.consent !== true || b.website) throw new AppError("NÃ£o foi possÃ­vel registrar a mensagem.");
    const id = randomUUID();
    db.prepare("INSERT INTO messages(id,name,email,phone,dates,message) VALUES(?,?,?,?,?,?)").run(
      id, p.name, p.email, p.phone, text(b.dates || "", "Datas", 0, 120), text(b.message, "Mensagem", 10, 4000),
    );
    audit(ctx, "message.received", id, {}, "guest");
    json(ctx.res, 201, { id });
  });
  register("POST", "/api/reviews", (ctx) => {
    const b = ctx.body;
    if (b.consent !== true) throw new AppError("Confirme a publicaÃ§Ã£o de seu nome e comentÃ¡rio.");
    const reservationId = text(b.reservationId, "Protocolo", 1, 100);
    const row = db.prepare("SELECT * FROM reservations WHERE id=? AND status!='blocked'").get(reservationId);
    const token = String(ctx.req.headers["x-reservation-token"] || "");
    if (!row || !verifyReservationToken(row, token)) throw new AppError("Reserva nÃ£o encontrada.", 404);
    if (row.status !== "confirmed") throw new AppError("A avaliaÃ§Ã£o fica disponÃ­vel somente para reservas confirmadas.", 422);
    if (row.check_out > today()) throw new AppError("A avaliaÃ§Ã£o fica disponÃ­vel apÃ³s o encerramento da estadia.", 422);
    if (db.prepare("SELECT id FROM reviews WHERE reservation_id=?").get(row.id)) {
      throw new AppError("Esta estadia jÃ¡ possui uma avaliaÃ§Ã£o enviada.", 409);
    }
    const id = randomUUID();
    db.prepare("INSERT INTO reviews(id,reservation_id,name,rating,comment) VALUES(?,?,?,?,?)").run(
      id, row.id, row.name, integer(b.rating, "Nota", 1, 5), text(b.comment, "ComentÃ¡rio", 10, 2000),
    );
    reservationEvent(row.id, "review.submitted", "guest", { reviewId: id });
    audit(ctx, "review.submitted", id, { reservationId: row.id }, "guest");
    json(ctx.res, 201, { id, status: "pending" });
  });
  register("GET", "/api/payment-options", (ctx) => {
    const b = banking(db), l = legal(db);
    const enabled = l?.approved === 1 && l.term_hash === TERM_HASH;
    const empty = { bank: "", holder: "", holderDocument: "", branch: "", account: "", accountType: "", pixKey: "" };
    // A rota pÃºblica informa apenas os mÃ©todos. Dados bancÃ¡rios exigem uma solicitaÃ§Ã£o autenticada por token.
    json(ctx.res, 200, {
      pixAvailable: enabled && !!b.pixKey,
      transferAvailable: enabled && !!(b.bank && b.holder && b.account && b.branch),
      legalApproved: enabled,
      bank: empty,
    });
  });

  register("GET", "/api/reservations/:id/payment-options", (ctx) => {
    const row = db.prepare("SELECT * FROM reservations WHERE id=? AND status!='blocked'").get(ctx.params.id);
    const token = String(ctx.req.headers["x-reservation-token"] || "");
    if (!row || !verifyReservationToken(row, token)) throw new AppError("Reserva nÃ£o encontrada.", 404);
    const b = banking(db), l = legal(db);
    const enabled = l?.approved === 1 && l.term_hash === TERM_HASH;
    const hold = getReservationHold(db, row.id);
    const allowed = enabled && (row.status === "confirmed" || (row.status === "requested" && !!hold));
    const empty = { bank: "", holder: "", holderDocument: "", branch: "", account: "", accountType: "", pixKey: "" };
    json(ctx.res, 200, {
      pixAvailable: allowed && !!b.pixKey,
      transferAvailable: allowed && !!(b.bank && b.holder && b.account && b.branch),
      legalApproved: enabled,
      reservationEligible: allowed,
      bank: allowed ? b : empty,
    });
  });

  // Login must stay outside authenticated /admin routes.
  register("POST", "/api/admin/login", (ctx) => {
    if (!passwordHash) throw new AppError("Acesso administrativo ainda nÃ£o configurado.", 503);
    const password = text(ctx.body.password, "Senha", 1, 200);
    const [salt, digest] = passwordHash.split(":");
    let valid = false;
    if (salt && digest && /^[a-f0-9]{128}$/i.test(digest)) {
      valid = timingSafeEqual(scryptSync(password, salt, 64), Buffer.from(digest, "hex"));
    }
    if (!valid || !verifyTotp(totpSecret, ctx.body.otp)) {
      audit(ctx, "auth.login_failed", "admin", { ipHash: sha256(ctx.ip), mfaRequired: !!totpSecret }, "anonymous");
      throw new AppError("Credenciais invÃ¡lidas.", 401);
    }
    const token = randomBytes(32).toString("hex");
    db.prepare("DELETE FROM sessions WHERE expires < ?").run(Date.now());
    db.prepare("INSERT INTO sessions VALUES(?,?)").run(sha256(token), Date.now() + 8 * 3600000);
    audit(ctx, "auth.login", "admin");
    const cookie = `venus_session=${token}; HttpOnly; SameSite=Strict; Path=/api; Max-Age=28800${production ? "; Secure" : ""}`;
    json(ctx.res, 200, { ok: true }, { "Set-Cookie": cookie });
  });

  // Administrative endpoints.
  register("POST", "/api/admin/logout", (ctx) => {
    audit(ctx, "auth.logout", "admin");
    db.prepare("DELETE FROM sessions WHERE token_hash=?").run(sessionHash(ctx));
    const cookie = `venus_session=; HttpOnly; SameSite=Strict; Path=/api; Max-Age=0${production ? "; Secure" : ""}`;
    json(ctx.res, 200, { ok: true }, { "Set-Cookie": cookie });
  }, true);

  register("GET", "/api/admin/data", (ctx) => {
    cleanupExpiredHolds(db);
    const reservations = db.prepare("SELECT * FROM reservations ORDER BY check_in DESC").all().map((r) => {
      const hold = getReservationHold(db, r.id);
      return {
        ...r,
        quote: JSON.parse(r.quote),
        requirements: readiness(db, r),
        paidCents: paidFor(r.id),
        holdExpiresAt: hold?.expiresAtIso || null,
        events: db.prepare("SELECT event,actor,details_json,created_at FROM reservation_events WHERE reservation_id=? ORDER BY id DESC LIMIT 20").all(r.id),
      };
    });
    json(ctx.res, 200, {
      settings: settings(),
      rates: db.prepare("SELECT * FROM rates ORDER BY start_date").all(),
      reservations,
      messages: db.prepare("SELECT * FROM messages ORDER BY created_at DESC").all(),
      reviews: db.prepare("SELECT * FROM reviews ORDER BY created_at DESC").all(),
      payments: db.prepare("SELECT * FROM payments ORDER BY created_at DESC").all(),
      finance: financialSnapshot(),
    });
  }, true);

  register("GET", "/api/admin/audit", (ctx) => {
    json(ctx.res, 200, { events: db.prepare(`SELECT id,action,resource,actor,request_id,details_json,previous_hash,entry_hash,created_at
      FROM audit ORDER BY id DESC LIMIT 1000`).all() });
  }, true);

  register("PUT", "/api/admin/settings", (ctx) => {
    const b = ctx.body;
    const url = (value, allowedHosts, allowEmpty = false) => {
      if (!value && allowEmpty) return "";
      try {
        const u = new URL(value);
        if (u.protocol !== "https:" || !allowedHosts.includes(u.hostname)) throw new Error();
        return u.href;
      } catch { throw new AppError("Link do Google Maps invÃ¡lido."); }
    };
    const whatsappNumber = text(b.whatsappNumber, "WhatsApp", 10, 15);
    if (!/^\d{10,15}$/.test(whatsappNumber)) throw new AppError("WhatsApp: use somente nÃºmeros, incluindo paÃ­s e DDD.");
    const email = contact({ name: "Admin", email: b.email, phone: "" }).email;
    const value = {
      pricingEnabled: b.pricingEnabled === true,
      cleaningFeeCents: integer(b.cleaningFeeCents, "Limpeza"), depositPercent: integer(b.depositPercent, "Percentual do sinal", 1, 100),
      maxGuests: integer(b.maxGuests, "HÃ³spedes", 1, 50),
      minLeadDays: integer(b.minLeadDays, "AntecedÃªncia mÃ­nima", 0, 365),
      maxAdvanceDays: integer(b.maxAdvanceDays, "AntecedÃªncia mÃ¡xima", 1, 3650),
      maxNights: integer(b.maxNights, "MÃ¡ximo de noites", 1, 366),
      requestHoldMinutes: integer(b.requestHoldMinutes, "Bloqueio temporÃ¡rio", 5, 1440),
      whatsappNumber, email,
      googleMapsUrl: url(b.googleMapsUrl, ["maps.app.goo.gl", "www.google.com", "maps.google.com", "google.com"]),
      mapsEmbedUrl: url(b.mapsEmbedUrl, ["www.google.com", "maps.google.com"], true),
    };
    if (value.mapsEmbedUrl && !new URL(value.mapsEmbedUrl).pathname.startsWith("/maps/embed")) {
      throw new AppError("Use o endereÃ§o de incorporaÃ§Ã£o do Google Maps.");
    }
    db.prepare("UPDATE settings SET value=? WHERE id=1").run(JSON.stringify(value));
    audit(ctx, "settings.updated", "1", { pricingEnabled: value.pricingEnabled });
    json(ctx.res, 200, value);
  }, true);

  register("POST", "/api/admin/rates", (ctx) => {
    const b = ctx.body, start = date(b.startDate), end = date(b.endDate);
    datesBetween(start, end);
    const id = transaction(db, () => {
      if (db.prepare("SELECT id FROM rates WHERE start_date < ? AND end_date > ?").get(end, start)) {
        throw new AppError("Existe tarifa cadastrada neste intervalo. Exclua ou ajuste o perÃ­odo anterior.", 409);
      }
      const id = randomUUID();
      db.prepare("INSERT INTO rates VALUES(?,?,?,?,?,?,?)").run(
        id, text(b.label, "DescriÃ§Ã£o", 2, 120), start, end,
        integer(b.weekdayCents, "DiÃ¡ria", 1), integer(b.weekendCents, "DiÃ¡ria de sexta/sÃ¡bado", 1),
        integer(b.minNights, "MÃ­nimo de noites", 1, 366),
      );
      audit(ctx, "rate.created", id, { start, end });
      return id;
    });
    json(ctx.res, 201, { id });
  }, true);
  register("DELETE", "/api/admin/rates/:id", (ctx) => {
    db.prepare("DELETE FROM rates WHERE id=?").run(ctx.params.id);
    audit(ctx, "rate.deleted", ctx.params.id);
    json(ctx.res, 200, { ok: true });
  }, true);

  register("POST", "/api/admin/blocks", (ctx) => {
    const b = ctx.body, id = randomUUID();
    transaction(db, () => {
      assertAvailable(db, b.checkIn, b.checkOut);
      if (b.checkIn < today()) throw new AppError("Use uma data atual ou futura.");
      db.prepare(`INSERT INTO reservations(id,name,email,phone,check_in,check_out,guests,notes,status,quote)
        VALUES(?,'Bloqueio','','',?,?,0,?,'blocked','{}')`).run(id, b.checkIn, b.checkOut, text(b.notes, "Motivo", 2, 2000));
      audit(ctx, "block.created", id, { checkIn: b.checkIn, checkOut: b.checkOut });
    });
    json(ctx.res, 201, { id });
  }, true);

  register("POST", "/api/admin/reservations/:id/hold", (ctx) => {
    const minutes = integer(ctx.body.minutes ?? bookingPolicy(db).requestHoldMinutes, "DuraÃ§Ã£o do bloqueio", 5, 1440);
    const hold = transaction(db, () => {
      const row = db.prepare("SELECT * FROM reservations WHERE id=?").get(ctx.params.id);
      if (!row) throw new AppError("Reserva nÃ£o encontrada.", 404);
      assertAvailable(db, row.check_in, row.check_out, row.id);
      const created = grantReservationHold(db, row.id, minutes);
      if (!created) throw new AppError("Outra solicitaÃ§Ã£o possui prioridade temporÃ¡ria para este perÃ­odo.", 409);
      reservationEvent(row.id, "hold.granted", "admin", { expiresAt: created.expiresAtIso, minutes });
      audit(ctx, "reservation.hold_granted", row.id, { expiresAt: created.expiresAtIso, minutes });
      return created;
    });
    json(ctx.res, 200, { holdExpiresAt: hold.expiresAtIso });
  }, true);

  register("DELETE", "/api/admin/reservations/:id/hold", (ctx) => {
    const row = db.prepare("SELECT id FROM reservations WHERE id=?").get(ctx.params.id);
    if (!row) throw new AppError("Reserva nÃ£o encontrada.", 404);
    releaseReservationHold(db, ctx.params.id);
    reservationEvent(ctx.params.id, "hold.released", "admin");
    audit(ctx, "reservation.hold_released", ctx.params.id);
    json(ctx.res, 200, { ok: true });
  }, true);

  register("POST", "/api/admin/reservations/:id/rotate-token", (ctx) => {
    const result = transaction(db, () => {
      const row = db.prepare("SELECT * FROM reservations WHERE id=? AND status!='blocked'").get(ctx.params.id);
      if (!row || !row.request_key) throw new AppError("Reserva nÃ£o encontrada.", 404);
      const nextVersion = Math.max(1, Number(row.token_version || 1)) + 1;
      db.prepare("UPDATE reservations SET token_version=? WHERE id=?").run(nextVersion, row.id);
      const updated = db.prepare("SELECT * FROM reservations WHERE id=?").get(row.id);
      reservationEvent(row.id, "access_token.rotated", "admin", { version: nextVersion });
      audit(ctx, "reservation.access_token_rotated", row.id, { version: nextVersion });
      return { manageToken: reservationToken(updated), tokenVersion: nextVersion };
    });
    json(ctx.res, 200, result);
  }, true);

  register("PATCH", "/api/admin/reservations/:id", (ctx) => {
    const id = ctx.params.id, status = ctx.body.status;
    if (!["confirmed", "cancelled"].includes(status)) throw new AppError("SituaÃ§Ã£o invÃ¡lida.");
    transaction(db, () => {
      const row = db.prepare("SELECT * FROM reservations WHERE id=?").get(id);
      if (!row) throw new AppError("Reserva nÃ£o encontrada.", 404);
      if (row.status === status) return;
      if (status === "confirmed") {
        if (row.status !== "requested") throw new AppError("Somente solicitaÃ§Ãµes pendentes podem ser confirmadas.");
        if (row.check_in < today()) throw new AppError("A data de entrada jÃ¡ passou.");
        assertConfirmationReady(db, row);
        assertAvailable(db, row.check_in, row.check_out, id);
      }
      db.prepare("UPDATE reservations SET status=? WHERE id=?").run(status, id);
      releaseReservationHold(db, id);
      reservationEvent(id, `reservation.${status}`, "admin");
      audit(ctx, `reservation.${status}`, id);
    });
    json(ctx.res, 200, { ok: true });
  }, true);

  register("POST", "/api/admin/payments", (ctx) => {
    const b = ctx.body, id = randomUUID();
    integer(b.amountCents, "Valor", -100000000, 100000000);
    if (!["pix", "transfer"].includes(b.method) || b.settled !== true) {
      throw new AppError("Informe Pix ou transferÃªncia e confirme a compensaÃ§Ã£o no banco.");
    }
    const bankReference = text(b.bankReference, "IdentificaÃ§Ã£o da transaÃ§Ã£o bancÃ¡ria", 5, 250);
    if (!b.amountCents) throw new AppError("Informe um valor diferente de zero.");
    transaction(db, () => {
      const row = db.prepare("SELECT status,quote FROM reservations WHERE id=?").get(b.reservationId);
      if (!row || row.status === "blocked") throw new AppError("Reserva invÃ¡lida.");
      if (db.prepare("SELECT id FROM payments WHERE method=? AND bank_reference=?").get(b.method, bankReference)) {
        throw new AppError("Esta transaÃ§Ã£o bancÃ¡ria jÃ¡ foi registrada.", 409);
      }
      const paid = db.prepare("SELECT COALESCE(SUM(amount_cents),0) AS total FROM payments WHERE reservation_id=? AND settled=1").get(b.reservationId).total;
      const total = JSON.parse(row.quote).totalCents;
      if (paid + b.amountCents < 0 || paid + b.amountCents > total) {
        throw new AppError("O saldo recebido deve ficar entre zero e o total da reserva.");
      }
      try {
        db.prepare(`INSERT INTO payments(id,reservation_id,amount_cents,note,settled,method,bank_reference)
          VALUES(?,?,?,?,1,?,?)`).run(
          id, b.reservationId, b.amountCents, text(b.note, "DescriÃ§Ã£o do pagamento/estorno", 2, 250), b.method, bankReference,
        );
      } catch (e) {
        if (String(e.message).toLowerCase().includes("unique")) throw new AppError("Esta transaÃ§Ã£o bancÃ¡ria jÃ¡ foi registrada.", 409);
        throw e;
      }
      const paymentEvent = b.amountCents < 0 ? "payment.refund_recorded" : "payment.recorded";
      reservationEvent(b.reservationId, paymentEvent, "admin", { amountCents: b.amountCents, method: b.method });
      audit(ctx, paymentEvent, id, {
        reservationId: b.reservationId, amountCents: b.amountCents, method: b.method,
        bankReferenceHash: sha256(bankReference),
      });
    });
    json(ctx.res, 201, { id });
  }, true);

  register("PATCH", "/api/admin/reviews/:id", (ctx) => {
    const result = db.prepare("UPDATE reviews SET approved=? WHERE id=?").run(ctx.body.approved === true ? 1 : 0, ctx.params.id);
    if (!result.changes) throw new AppError("AvaliaÃ§Ã£o nÃ£o encontrada.", 404);
    audit(ctx, "review.moderated", ctx.params.id, { approved: ctx.body.approved === true });
    json(ctx.res, 200, { ok: true });
  }, true);

  register("GET", "/api/admin/compliance", (ctx) => {
    json(ctx.res, 200, { version: TERM_VERSION, termHash: TERM_HASH, approval: legal(db), bank: banking(db) });
  }, true);
  register("PUT", "/api/admin/banking", (ctx) => {
    const b = {};
    for (const key of ["bank","holder","holderDocument","branch","account","accountType","pixKey"]) {
      b[key] = text(ctx.body[key] || "", key, 0, 150);
    }
    db.prepare("UPDATE banking SET value=? WHERE id=1").run(JSON.stringify(b));
    audit(ctx, "banking.updated", "1", { configured: Object.values(b).some(Boolean) });
    json(ctx.res, 200, { ok: true });
  }, true);
  register("POST", "/api/admin/legal-approval", (ctx) => {
    if (ctx.body.termHash !== TERM_HASH) throw new AppError("A versÃ£o do termo mudou. Atualize a pÃ¡gina.", 409);
    if (ctx.body.approved !== true) {
      db.prepare("UPDATE legal_approval SET approved=0 WHERE id=1").run();
      audit(ctx, "legal.disabled", TERM_HASH);
      return json(ctx.res, 200, { ok: true });
    }
    if (ctx.body.confirmedReview !== true) throw new AppError("Confirme que o jurÃ­dico validou esta versÃ£o.");
    db.prepare(`UPDATE legal_approval SET approved=1,term_hash=?,reviewer=?,reference=?,approved_at=CURRENT_TIMESTAMP
      WHERE id=1`).run(
      TERM_HASH, text(ctx.body.reviewer, "ResponsÃ¡vel jurÃ­dico", 3, 150), text(ctx.body.reference, "ReferÃªncia da aprovaÃ§Ã£o", 5, 1000),
    );
    audit(ctx, "legal.approved", TERM_HASH, { reviewer: text(ctx.body.reviewer, "ResponsÃ¡vel jurÃ­dico", 3, 150) });
    json(ctx.res, 200, { ok: true });
  }, true);
  register("GET", "/api/admin/term-template", (ctx) => {
    raw(ctx.res, 200, TERM_TEXT, "text/plain; charset=utf-8", attachment("termo-compromisso-minuta.txt"));
  }, true);
  register("POST", "/api/admin/reservations/:id/signed-term", (ctx) => {
    json(ctx.res, 201, saveSignedTerm(db, ctx.params.id, ctx.body.base64, (a, r, d) => audit(ctx, a, r, d)));
  }, true);
  register("GET", "/api/admin/reservations/:id/signed-term", (ctx) => {
    const d = db.prepare("SELECT pdf FROM signed_terms WHERE reservation_id=?").get(ctx.params.id);
    if (!d) throw new AppError("Documento nÃ£o encontrado.", 404);
    raw(ctx.res, 200, Buffer.from(d.pdf), "application/pdf", attachment("termo-assinado.pdf"));
  }, true);
  register("POST", "/api/admin/reservations/:id/validate-term", (ctx) => {
    validateSignedTerm(db, ctx.params.id, ctx.body, (a, r, d) => audit(ctx, a, r, d));
    json(ctx.res, 200, { ok: true });
  }, true);

  register("GET", "/api/admin/finance", (ctx) => {
    json(ctx.res, 200, financialSnapshot());
  }, true);

  register("GET", "/api/admin/finance.csv", (ctx) => {
    const finance = financialSnapshot();
    const money = (n) => ((n || 0) / 100).toFixed(2).replace(".", ",");
    const output = [["Protocolo","HÃ³spede","SituaÃ§Ã£o","Entrada","SaÃ­da","Total contratado (R$)","Recebido lÃ­quido (R$)","Saldo (R$)"]];
    for (const r of finance.rows) {
      output.push([r.reservationId,r.name,r.status,r.checkIn,r.checkOut,money(r.totalCents),money(r.receivedCents),money(r.balanceCents)]);
    }
    raw(ctx.res, 200, csv(output), "text/csv; charset=utf-8", attachment("conciliacao-financeira-venus.csv"));
  }, true);

  register("GET", "/api/admin/export.csv", (ctx) => {
    const rows = db.prepare("SELECT * FROM reservations ORDER BY check_in").all();
    const output = [["Protocolo","HÃ³spede","E-mail","Telefone","Entrada","SaÃ­da","SituaÃ§Ã£o","Noites","DiÃ¡rias (R$)","Limpeza (R$)","Total (R$)","Sinal previsto (R$)","Recebido (R$)","Saldo contratual (R$)"]];
    for (const r of rows) {
      const q = JSON.parse(r.quote || "{}");
      const paid = db.prepare("SELECT COALESCE(SUM(amount_cents),0) AS total FROM payments WHERE reservation_id=? AND settled=1").get(r.id).total;
      const money = (n) => ((n || 0) / 100).toFixed(2).replace(".", ",");
      output.push([r.id,r.name,r.email,r.phone,r.check_in,r.check_out,r.status,q.nights||0,money(q.subtotalCents),money(q.cleaningFeeCents),money(q.totalCents),money(q.depositCents),money(paid),money((q.totalCents||0)-paid)]);
    }
    raw(ctx.res, 200, csv(output), "text/csv; charset=utf-8", attachment("reservas-venus.csv"));
  }, true);
  register("GET", "/api/admin/calendar.ics", (ctx) => {
    const rows = db.prepare("SELECT id,check_in,check_out,status FROM reservations WHERE status IN ('confirmed','blocked')").all();
    const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const lines = ["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Venus Beach House//Agenda//PT-BR","CALSCALE:GREGORIAN",
      ...rows.flatMap((r) => ["BEGIN:VEVENT",`UID:${r.id}@venus-beach-house`,`DTSTAMP:${stamp}`,`DTSTART;VALUE=DATE:${r.check_in.replaceAll("-", "")}`,`DTEND;VALUE=DATE:${r.check_out.replaceAll("-", "")}`,`SUMMARY:${r.status === "blocked" ? "Bloqueio" : "Reserva confirmada"}`,"END:VEVENT"]),"END:VCALENDAR"];
    raw(ctx.res, 200, lines.join("\r\n") + "\r\n", "text/calendar; charset=utf-8", attachment("agenda-venus.ics"));
  }, true);

  function applySecurityHeaders(req, res, requestId) {
    res.setHeader("X-Request-Id", requestId);
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
    res.setHeader("Content-Security-Policy", "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; font-src 'self' data:");
    if (production) res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    if (req.url?.startsWith("/api")) res.setHeader("Cache-Control", "no-store");
  }

  async function handler(req, res) {
    const requestId = randomUUID();
    applySecurityHeaders(req, res, requestId);
    const url = new URL(req.url || "/", "http://local");
    const ctx = { req, res, url, requestId, ip: clientIp(req), cookies: parseCookies(req.headers.cookie || ""), body: {}, params: {} };

    try {
      if (url.pathname === "/guia" || url.pathname === "/guia/") {
        const html = await loadGuideHtml();
        res.setHeader("Content-Security-Policy", "default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:; connect-src 'none'; font-src data:; frame-ancestors 'self'; base-uri 'none'; form-action 'none'");
        const headers = url.searchParams.get("download") === "1" ? attachment("guia-venus-pb.html") : { "Cache-Control": "no-cache" };
        return raw(res, 200, html, "text/html; charset=utf-8", headers);
      }

      if (url.pathname.startsWith("/api")) {
        const mutating = !["GET","HEAD","OPTIONS"].includes(req.method || "GET");
        if (mutating) {
          const requestOrigin = req.headers.origin;
          const allowed = origin || "http://localhost:3000";
          if (requestOrigin && requestOrigin !== allowed) throw new AppError("Origem nÃ£o permitida.", 403);
          if (req.headers["sec-fetch-site"] === "cross-site") throw new AppError("Origem nÃ£o permitida.", 403);
          const contentType = String(req.headers["content-type"] || "").split(";")[0].trim();
          if (contentType !== "application/json") throw new AppError("Envie os dados em JSON.", 415);

          const isLogin = url.pathname === "/api/admin/login";
          enforceRateLimit(ctx, isLogin ? "login" : "write", isLogin ? 8 : 80, 600000);
          ctx.body = await readJson(req);
        }

        const route = routes.find((r) => {
          if (r.method !== req.method) return false;
          const match = r.regex.exec(url.pathname);
          if (!match) return false;
          ctx.params = Object.fromEntries(r.names.map((n, i) => [n, decodeURIComponent(match[i + 1])]));
          return true;
        });
        if (!route) throw new AppError("Recurso nÃ£o encontrado.", 404);
        if (route.auth) requireAuth(ctx);
        return await route.handler(ctx);
      }

      if (staticDir && ["GET", "HEAD"].includes(req.method || "GET")) {
        let path = decodeURIComponent(url.pathname);
        if (path === "/") path = "/index.html";
        if (path === "/admin") path = "/admin.html";
        const target = resolve(join(staticDir, normalize(path).replace(/^[/\\]+/, "")));
        const relativeTarget = relative(staticDir, target);         if (relativeTarget.startsWith("..") || isAbsolute(relativeTarget)) {           throw new AppError("Recurso não encontrado.", 404);         }
        if (existsSync(target) && statSync(target).isFile()) {
          const body = readFileSync(target);
          const cache = path.endsWith(".html") || path.endsWith("sw.js") ? "no-cache" : "public, max-age=3600";
          return raw(res, 200, req.method === "HEAD" ? Buffer.alloc(0) : body, MIME[extname(target).toLowerCase()] || "application/octet-stream", { "Cache-Control": cache });
        }
        const fallback = join(staticDir, "index.html");
        if (existsSync(fallback)) return raw(res, 200, readFileSync(fallback), "text/html; charset=utf-8", { "Cache-Control": "no-cache" });
      }
      throw new AppError("Recurso nÃ£o encontrado.", 404);
    } catch (error) {
      const status = error.status || 500;
      if (status >= 500 && !(error instanceof AppError)) console.error("Request failed:", error);
      if (!res.headersSent) json(res, status, { error: error instanceof AppError ? error.message : "NÃ£o foi possÃ­vel concluir. Tente novamente.", requestId });
      else res.end();
    }
  }

  return { listen: (...args) => http.createServer(handler).listen(...args) };
}
