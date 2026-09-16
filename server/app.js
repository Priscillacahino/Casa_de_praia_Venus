import { registerCompliance, readiness, assertConfirmationReady } from './compliance.js';
import express from "express";
import {
  randomBytes,
  randomUUID,
  createHash,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import { resolve } from "node:path";
import {
  AppError,
  today,
  date,
  datesBetween,
  text,
  integer,
  contact,
  calculateQuote,
  assertAvailable,
  transaction,
  csv,
} from "./domain.js";
const hash = (value) => createHash("sha256").update(value).digest("hex");
export function createApp(db, options = {}) {
  const app = express();
  app.disable("x-powered-by");
  if (process.env.TRUST_PROXY_HOPS)
    app.set(
      "trust proxy",
      integer(Number(process.env.TRUST_PROXY_HOPS), "Proxies confiáveis", 1, 5),
    );
  const production =
    options.production ?? process.env.NODE_ENV === "production";
  const origin = options.origin ?? process.env.APP_URL;
  const passwordHash = options.passwordHash ?? process.env.ADMIN_PASSWORD_HASH;
  if (
    production &&
    (!origin || !origin.startsWith("https://") || !passwordHash)
  )
    throw new Error(
      "Configure APP_URL HTTPS e ADMIN_PASSWORD_HASH antes de iniciar em produção.",
    );
  app.use(express.json({ limit: "8mb" }));
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=()",
    );
    if (production)
      res.setHeader(
        "Strict-Transport-Security",
        "max-age=31536000; includeSubDomains",
      );
    if (req.path.startsWith("/api")) res.setHeader("Cache-Control", "no-store");
    if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
      const requestOrigin = req.get("origin");
      const allowed = origin || "http://localhost:3000";
      if (requestOrigin && requestOrigin !== allowed)
        return next(new AppError("Origem não permitida.", 403));
      if (req.get("sec-fetch-site") === "cross-site")
        return next(new AppError("Origem não permitida.", 403));
      if (!req.is("application/json"))
        return next(new AppError("Envie os dados em JSON.", 415));
    }
    next();
  });
  const limits = new Map();
  app.use("/api", (req, res, next) => {
    if (req.method === "GET") return next();
    const now = Date.now();
    if (limits.size > 10000)
      for (const [key, value] of limits)
        if (value.until < now) limits.delete(key);
    const key = `${req.ip}:${req.path === "/admin/login" ? "login" : "write"}`;
    let value = limits.get(key);
    if (!value || value.until < now) value = { count: 0, until: now + 600000 };
    limits.set(key, value);
    value.count++;
    if (value.count > (req.path === "/admin/login" ? 8 : 80)) {
      res.setHeader("Retry-After", "600");
      return next(
        new AppError("Muitas tentativas. Aguarde alguns minutos.", 429),
      );
    }
    next();
  });
  const settings = () =>
    JSON.parse(db.prepare("SELECT value FROM settings WHERE id=1").get().value);
  const audit = (action, resource) =>
    db
      .prepare("INSERT INTO audit(action,resource) VALUES(?,?)")
      .run(action, resource);
  const sessionToken = (req) =>
    (req.headers.cookie || "")
      .split(";")
      .map((x) => x.trim())
      .find((x) => x.startsWith("venus_session="))
      ?.split("=")[1] || "";
  const auth = (req, res, next) => {
    const row = db
      .prepare("SELECT expires FROM sessions WHERE token_hash=?")
      .get(hash(sessionToken(req)));
    if (!row || row.expires < Date.now())
      return next(new AppError("Entre na administração para continuar.", 401));
    next();
  };
  const route = (fn) => (req, res, next) => {
    try {
      fn(req, res);
    } catch (e) {
      next(e);
    }
  };
  app.get("/api/health", (req, res) => res.json({ ok: true }));
  app.get(
    "/api/public",
    route((req, res) => {
      const reviews = db
        .prepare(
          "SELECT id,name,rating,comment,created_at FROM reviews WHERE approved=1 ORDER BY created_at DESC LIMIT 100",
        )
        .all();
      const stats = db
        .prepare(
          "SELECT COUNT(*) AS count, AVG(rating) AS average FROM reviews WHERE approved=1",
        )
        .get();
      res.json({
        settings: settings(),
        rates: db
          .prepare("SELECT * FROM rates WHERE end_date>? ORDER BY start_date")
          .all(today()),
        reviews,
        reviewStats: stats,
      });
    }),
  );
  app.get(
    "/api/availability",
    route((req, res) => {
      const start = date(req.query.start),
        end = date(req.query.end);
      datesBetween(start, end);
      const ranges = db
        .prepare(
          "SELECT check_in,check_out FROM reservations WHERE status IN ('confirmed','blocked') AND check_in < ? AND check_out > ?",
        )
        .all(end, start);
      res.json({ ranges });
    }),
  );
  app.post(
    "/api/quote",
    route((req, res) => {
      assertAvailable(db, req.body.checkIn, req.body.checkOut);
      res.json(calculateQuote(db, req.body.checkIn, req.body.checkOut));
    }),
  );
  app.post(
    "/api/reservations",
    route((req, res) => {
      const body = req.body;
      const person = contact(body);
      if (!person.phone) throw new AppError("Informe seu telefone.");
      if (body.consent !== true)
        throw new AppError(
          "Confirme o uso dos dados para atender à solicitação.",
        );
      const requestKey = text(
        req.get("Idempotency-Key"),
        "Identificador",
        16,
        100,
      );
      const requestHash = hash(JSON.stringify(body));
      const result = transaction(db, () => {
        const existing = db
          .prepare(
            "SELECT id,quote,status,request_hash FROM reservations WHERE request_key=?",
          )
          .get(requestKey);
        if (existing) {
          if (existing.request_hash !== requestHash)
            throw new AppError(
              "Esta solicitação já foi enviada com outros dados. Atualize a página.",
              409,
            );
          return {
            id: existing.id,
            quote: JSON.parse(existing.quote),
            status: existing.status,
          };
        }
        integer(body.guests, "Hóspedes", 1, settings().maxGuests);
        assertAvailable(db, body.checkIn, body.checkOut);
        const quote = calculateQuote(db, body.checkIn, body.checkOut);
        if (body.expectedTotalCents !== quote.totalCents)
          throw new AppError(
            "A tarifa foi atualizada. Consulte o valor novamente.",
            409,
          );
        const id = randomUUID();
        db.prepare(
          "INSERT INTO reservations(id,request_key,request_hash,name,email,phone,check_in,check_out,guests,has_pet,notes,status,quote) VALUES(?,?,?,?,?,?,?,?,?,?,?,'requested',?)",
        ).run(
          id,
          requestKey,
          requestHash,
          person.name,
          person.email,
          person.phone,
          body.checkIn,
          body.checkOut,
          body.guests,
          body.hasPet === true ? 1 : 0,
          text(body.notes || "", "Observações", 0, 2000),
          JSON.stringify(quote),
        );
        audit("reservation.requested", id);
        return { id, quote, status: "requested" };
      });
      res.status(201).json(result);
    }),
  );
  app.post(
    "/api/messages",
    route((req, res) => {
      const b = req.body,
        p = contact(b);
      if (b.consent !== true || b.website)
        throw new AppError("Não foi possível registrar a mensagem.");
      const id = randomUUID();
      db.prepare(
        "INSERT INTO messages(id,name,email,phone,dates,message) VALUES(?,?,?,?,?,?)",
      ).run(
        id,
        p.name,
        p.email,
        p.phone,
        text(b.dates || "", "Datas", 0, 120),
        text(b.message, "Mensagem", 10, 4000),
      );
      res.status(201).json({ id });
    }),
  );
  app.post(
    "/api/reviews",
    route((req, res) => {
      const b = req.body;
      if (b.consent !== true)
        throw new AppError("Confirme a publicação de seu nome e comentário.");
      const id = randomUUID();
      db.prepare(
        "INSERT INTO reviews(id,name,rating,comment) VALUES(?,?,?,?)",
      ).run(
        id,
        text(b.name, "Nome", 2, 80),
        integer(b.rating, "Nota", 1, 5),
        text(b.comment, "Comentário", 10, 2000),
      );
      res.status(201).json({ id, status: "pending" });
    }),
  );
  app.post(
    "/api/admin/login",
    route((req, res) => {
      if (!passwordHash)
        throw new AppError("Acesso administrativo ainda não configurado.", 503);
      const password = text(req.body.password, "Senha", 1, 200);
      const [salt, digest] = passwordHash.split(":");
      if (
        !salt ||
        !digest ||
        digest.length !== 128 ||
        !timingSafeEqual(
          scryptSync(password, salt, 64),
          Buffer.from(digest, "hex"),
        )
      )
        throw new AppError("Senha inválida.", 401);
      const token = randomBytes(32).toString("hex");
      db.prepare("DELETE FROM sessions WHERE expires < ?").run(Date.now());
      db.prepare("INSERT INTO sessions VALUES(?,?)").run(
        hash(token),
        Date.now() + 8 * 3600000,
      );
      res.setHeader(
        "Set-Cookie",
        `venus_session=${token}; HttpOnly; SameSite=Strict; Path=/api; Max-Age=28800${production ? "; Secure" : ""}`,
      );
      res.json({ ok: true });
    }),
  );
  app.use("/api/admin", auth);
  app.post(
    "/api/admin/logout",
    route((req, res) => {
      db.prepare("DELETE FROM sessions WHERE token_hash=?").run(
        hash(sessionToken(req)),
      );
      res.setHeader(
        "Set-Cookie",
        `venus_session=; HttpOnly; SameSite=Strict; Path=/api; Max-Age=0${production ? "; Secure" : ""}`,
      );
      res.json({ ok: true });
    }),
  );
  app.get(
    "/api/admin/data",
    route((req, res) =>
      res.json({
        settings: settings(),
        rates: db.prepare("SELECT * FROM rates ORDER BY start_date").all(),
        reservations: db
          .prepare("SELECT * FROM reservations ORDER BY check_in DESC")
          .all()
          .map((r) => ({
            ...r,
            quote: JSON.parse(r.quote),
            requirements: readiness(db,r),
            paidCents: db
              .prepare(
                "SELECT COALESCE(SUM(amount_cents),0) AS paid FROM payments WHERE reservation_id=?",
              )
              .get(r.id).paid,
          })),
        messages: db
          .prepare("SELECT * FROM messages ORDER BY created_at DESC")
          .all(),
        reviews: db
          .prepare("SELECT * FROM reviews ORDER BY created_at DESC")
          .all(),
        payments: db
          .prepare("SELECT * FROM payments ORDER BY created_at DESC")
          .all(),
      }),
    ),
  );
  app.put(
    "/api/admin/settings",
    route((req, res) => {
      const b = req.body;
      const url = (value, allowedHosts, allowEmpty = false) => {
        if (!value && allowEmpty) return "";
        try {
          const u = new URL(value);
          if (u.protocol !== "https:" || !allowedHosts.includes(u.hostname))
            throw new Error();
          return u.href;
        } catch {
          throw new AppError("Link do Google Maps inválido.");
        }
      };
      const whatsappNumber = text(b.whatsappNumber, "WhatsApp", 10, 15);
      if (!/^\d{10,15}$/.test(whatsappNumber))
        throw new AppError(
          "WhatsApp: use somente números, incluindo país e DDD.",
        );
      const value = {
        pricingEnabled: b.pricingEnabled === true,
        cleaningFeeCents: integer(b.cleaningFeeCents, "Limpeza"),
        depositPercent: 20,
        maxGuests: integer(b.maxGuests, "Hóspedes", 1, 50),
        whatsappNumber,
        email: contact({ name: "Admin", email: b.email }).email,
        googleMapsUrl: url(b.googleMapsUrl, [
          "maps.app.goo.gl",
          "www.google.com",
          "maps.google.com",
          "google.com",
        ]),
        mapsEmbedUrl: url(
          b.mapsEmbedUrl,
          ["www.google.com", "maps.google.com"],
          true,
        ),
      };
      if (
        value.mapsEmbedUrl &&
        !new URL(value.mapsEmbedUrl).pathname.startsWith("/maps/embed")
      )
        throw new AppError("Use o endereço de incorporação do Google Maps.");
      db.prepare("UPDATE settings SET value=? WHERE id=1").run(
        JSON.stringify(value),
      );
      audit("settings.updated", "1");
      res.json(value);
    }),
  );
  app.post(
    "/api/admin/rates",
    route((req, res) => {
      const b = req.body;
      const start = date(b.startDate),
        end = date(b.endDate);
      datesBetween(start, end);
      const id = transaction(db, () => {
        if (
          db
            .prepare(
              "SELECT id FROM rates WHERE start_date < ? AND end_date > ?",
            )
            .get(end, start)
        )
          throw new AppError(
            "Existe tarifa cadastrada neste intervalo. Exclua ou ajuste o período anterior.",
            409,
          );
        const id = randomUUID();
        db.prepare("INSERT INTO rates VALUES(?,?,?,?,?,?,?)").run(
          id,
          text(b.label, "Descrição", 2, 120),
          start,
          end,
          integer(b.weekdayCents, "Diária", 1),
          integer(b.weekendCents, "Diária de sexta/sábado", 1),
          integer(b.minNights, "Mínimo de noites", 1, 366),
        );
        audit("rate.created", id);
        return id;
      });
      res.status(201).json({ id });
    }),
  );
  app.delete(
    "/api/admin/rates/:id",
    route((req, res) => {
      db.prepare("DELETE FROM rates WHERE id=?").run(req.params.id);
      audit("rate.deleted", req.params.id);
      res.json({ ok: true });
    }),
  );
  app.post(
    "/api/admin/blocks",
    route((req, res) => {
      const b = req.body;
      const id = randomUUID();
      transaction(db, () => {
        assertAvailable(db, b.checkIn, b.checkOut);
        if (b.checkIn < today())
          throw new AppError("Use uma data atual ou futura.");
        db.prepare(
          "INSERT INTO reservations(id,name,email,phone,check_in,check_out,guests,notes,status,quote) VALUES(?,'Bloqueio','','',?,?,0,?,'blocked','{}')",
        ).run(id, b.checkIn, b.checkOut, text(b.notes, "Motivo", 2, 2000));
        audit("block.created", id);
      });
      res.status(201).json({ id });
    }),
  );
  app.patch(
    "/api/admin/reservations/:id",
    route((req, res) => {
      const id = req.params.id,
        status = req.body.status;
      if (!["confirmed", "cancelled"].includes(status))
        throw new AppError("Situação inválida.");
      transaction(db, () => {
        const row = db.prepare("SELECT * FROM reservations WHERE id=?").get(id);
        if (!row) throw new AppError("Reserva não encontrada.", 404);
        if (row.status === status) return;
        if (status === "confirmed") {
          if (row.status !== "requested")
            throw new AppError(
              "Somente solicitações pendentes podem ser confirmadas.",
            );
          if (row.check_in < today())
            throw new AppError("A data de entrada já passou.");
          assertConfirmationReady(db, row);
          assertAvailable(db, row.check_in, row.check_out, id);
        }
        db.prepare("UPDATE reservations SET status=? WHERE id=?").run(
          status,
          id,
        );
        audit(`reservation.${status}`, id);
      });
      res.json({ ok: true });
    }),
  );
  app.post(
    "/api/admin/payments",
    route((req, res) => {
      const b = req.body,
        id = randomUUID();
      integer(b.amountCents, "Valor", -100000000, 100000000);
      if (!['pix','transfer'].includes(b.method) || b.settled !== true) throw new AppError('Informe Pix ou transferência e confirme a compensação no banco.');
      const bankReference=text(b.bankReference,'Identificação da transação bancária',5,250);
      if (!b.amountCents)
        throw new AppError("Informe um valor diferente de zero.");
      transaction(db, () => {
        const row = db
          .prepare("SELECT status,quote FROM reservations WHERE id=?")
          .get(b.reservationId);
        if (!row || row.status === "blocked")
          throw new AppError("Reserva inválida.");
        if (db.prepare('SELECT id FROM payments WHERE method=? AND bank_reference=?').get(b.method,bankReference)) throw new AppError('Esta transação bancária já foi registrada.',409);
        const paid = db
          .prepare(
            "SELECT COALESCE(SUM(amount_cents),0) AS total FROM payments WHERE reservation_id=?",
          )
          .get(b.reservationId).total;
        if (
          paid + b.amountCents < 0 ||
          paid + b.amountCents > JSON.parse(row.quote).totalCents
        )
          throw new AppError(
            "O saldo recebido deve ficar entre zero e o total da reserva.",
          );
        db.prepare(
          "INSERT INTO payments(id,reservation_id,amount_cents,note,settled,method,bank_reference) VALUES(?,?,?,?,1,?,?)",
        ).run(
          id,
          b.reservationId,
          b.amountCents,
          text(b.note, "Descrição do pagamento/estorno", 2, 250),
          b.method, bankReference,
        );
        audit("payment.recorded", id);
      });
      res.status(201).json({ id });
    }),
  );
  app.patch(
    "/api/admin/reviews/:id",
    route((req, res) => {
      db.prepare("UPDATE reviews SET approved=? WHERE id=?").run(
        req.body.approved === true ? 1 : 0,
        req.params.id,
      );
      audit("review.moderated", req.params.id);
      res.json({ ok: true });
    }),
  );
  app.get(
    "/api/admin/export.csv",
    route((req, res) => {
      const rows = db
        .prepare("SELECT * FROM reservations ORDER BY check_in")
        .all();
      const output = [
        [
          "Protocolo",
          "Hóspede",
          "E-mail",
          "Telefone",
          "Entrada",
          "Saída",
          "Situação",
          "Noites",
          "Diárias (R$)",
          "Limpeza (R$)",
          "Total (R$)",
          "Sinal previsto (R$)",
          "Recebido (R$)",
          "Saldo contratual (R$)",
        ],
      ];
      for (const r of rows) {
        const q = JSON.parse(r.quote);
        const paid = db
          .prepare(
            "SELECT COALESCE(SUM(amount_cents),0) AS total FROM payments WHERE reservation_id=?",
          )
          .get(r.id).total;
        const money = (n) => ((n || 0) / 100).toFixed(2).replace(".", ",");
        output.push([
          r.id,
          r.name,
          r.email,
          r.phone,
          r.check_in,
          r.check_out,
          r.status,
          q.nights || 0,
          money(q.subtotalCents),
          money(q.cleaningFeeCents),
          money(q.totalCents),
          money(q.depositCents),
          money(paid),
          money((q.totalCents || 0) - paid),
        ]);
      }
      res
        .type("text/csv; charset=utf-8")
        .attachment("reservas-venus.csv")
        .send(csv(output));
    }),
  );
  app.get(
    "/api/admin/calendar.ics",
    route((req, res) => {
      const rows = db
        .prepare(
          "SELECT id,check_in,check_out,status FROM reservations WHERE status IN ('confirmed','blocked')",
        )
        .all();
      const stamp = new Date()
        .toISOString()
        .replace(/[-:]/g, "")
        .replace(/\.\d{3}/, "");
      const lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Venus Beach House//Agenda//PT-BR",
        "CALSCALE:GREGORIAN",
        ...rows.flatMap((r) => [
          "BEGIN:VEVENT",
          `UID:${r.id}@venus-beach-house`,
          `DTSTAMP:${stamp}`,
          `DTSTART;VALUE=DATE:${r.check_in.replaceAll("-", "")}`,
          `DTEND;VALUE=DATE:${r.check_out.replaceAll("-", "")}`,
          `SUMMARY:${r.status === "blocked" ? "Bloqueio" : "Reserva confirmada"}`,
          "END:VEVENT",
        ]),
        "END:VCALENDAR",
      ];
      res
        .type("text/calendar; charset=utf-8")
        .attachment("agenda-venus.ics")
        .send(lines.join("\r\n") + "\r\n");
    }),
  );
  registerCompliance(app,db,route,audit);
  app.use("/api", (req, res) =>
    res.status(404).json({ error: "Recurso não encontrado." }),
  );
  if (options.staticDir) {
    app.use(
      express.static(options.staticDir, {
        etag: true,
        setHeaders(res, file) {
          if (file.endsWith("sw.js") || file.endsWith("index.html"))
            res.setHeader("Cache-Control", "no-cache");
        },
      }),
    );
    app.get("*", (req, res) =>
      res.sendFile(resolve(options.staticDir, "index.html")),
    );
  }
  app.use((error, req, res, next) => {
    const status = error.status || (error instanceof SyntaxError ? 400 : 500);
    if (status >= 500 && !(error instanceof AppError))
      console.error("Request failed:", error.message);
    res
      .status(status)
      .json({
        error:
          error instanceof AppError
            ? error.message
            : status === 400
              ? "Dados inválidos."
              : "Não foi possível concluir. Tente novamente.",
      });
  });
  return app;
}
