import React, { useEffect, useRef, useState } from "react";
import { BookingCalendar } from "./BookingCalendar";
import {
  api,
  dayLabel,
  localToday,
  money,
  Quote,
  useService,
  whatsapp,
} from "../service";
interface Props {
  checkIn: string;
  checkOut: string;
  onDatesChange: (a: string, b: string) => void;
}
export function BookingSection({ checkIn, checkOut, onDatesChange }: Props) {
  const { data } = useService();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [receipt, setReceipt] = useState<{ id: string; quote: Quote } | null>(
    null,
  );
  const requestKey = useRef("");
  const requestBody = useRef("");
  useEffect(() => {
    let active = true;
    setQuote(null);
    setError("");
    setReceipt(null);
    setLoading(false);
    if (!checkIn || !checkOut) return;
    setLoading(true);
    api<Quote>("/quote", "POST", { checkIn, checkOut })
      .then((q) => {
        if (active) setQuote(q);
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [checkIn, checkOut, data, refresh]);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!quote || busy) return;
    setBusy(true);
    setError("");
    const f = new FormData(e.currentTarget);
    const payload = {
      name: f.get("name"),
      email: f.get("email"),
      phone: f.get("phone"),
      guests: Number(f.get("guests")),
      hasPet: f.get("pet") === "on",
      notes: f.get("notes"),
      consent: f.get("consent") === "on",
      checkIn,
      checkOut,
      expectedTotalCents: quote.totalCents,
    };
    const encoded = JSON.stringify(payload);
    if (encoded !== requestBody.current) {
      requestKey.current = crypto.randomUUID();
      requestBody.current = encoded;
    }
    try {
      setReceipt(
        await api("/reservations", "POST", payload, {
          "Idempotency-Key": requestKey.current,
        }),
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section id="reserva" className="py-10 border-t scroll-mt-20 space-y-5">
      <div>
        <p className="eyebrow">Reservas diretas</p>
        <h2 className="section-title">Planeje sua estadia</h2>
        <p>
          Consulte o período e registre seu pedido. A reserva depende da
          confirmação da anfitriã.
        </p>
      </div>
      <BookingCalendar
        checkIn={checkIn}
        checkOut={checkOut}
        onSelectDates={onDatesChange}
      />
      <div className="grid grid-cols-2 gap-3">
        <label>
          Entrada
          <input
            type="date"
            value={checkIn}
            min={localToday()}
            onChange={(e) => onDatesChange(e.target.value, checkOut)}
          />
        </label>
        <label>
          Saída
          <input
            type="date"
            value={checkOut}
            min={checkIn || localToday()}
            onChange={(e) => onDatesChange(checkIn, e.target.value)}
          />
        </label>
      </div>
      {loading && <p role="status">Calculando diárias…</p>}
      {error && (
        <p className="error" role="alert">
          {error}
          <button type="button" className="underline ml-2" onClick={()=>setRefresh(v=>v+1)}>Consultar novamente</button>
        </p>
      )}
      {!data?.settings.pricingEnabled && (
        <p>
          As tarifas ainda não foram publicadas. Entre em contato para consultar
          valores.
        </p>
      )}
      {quote && (
        <div className="surface">
          <h3 className="font-semibold">
            {quote.nights} noites · {dayLabel(checkIn)} a {dayLabel(checkOut)}
          </h3>
          <details className="my-3">
            <summary>Ver cálculo por noite</summary>
            {quote.nightlyDetails.map((n) => (
              <p key={n.date} className="flex justify-between text-sm">
                <span>
                  {dayLabel(n.date)} · {n.label}
                </span>
                <span>{money(n.rateCents)}</span>
              </p>
            ))}
          </details>
          <p>Diárias: {money(quote.subtotalCents)}</p>
          <p>Limpeza: {money(quote.cleaningFeeCents)}</p>
          <p className="font-bold text-xl">Total: {money(quote.totalCents)}</p>
          <p>
            Sinal previsto ({quote.depositPercent}%):{" "}
            {money(quote.depositCents)}
          </p>
          <p className="text-xs mt-2">
            Nenhuma cobrança é feita por este formulário. Combine o pagamento
            com a anfitriã.
          </p>
        </div>
      )}
      {receipt ? (
        <div className="surface" role="status">
          <h3 className="font-bold">Pedido registrado</h3>
          <p className="break-all">Protocolo: {receipt.id}</p>
          <p>
            A confirmação exige termo assinado e validado e sinal de 20% recebido. O pedido ainda não bloqueia as
            datas.
          </p>
          {data && (
            <a
              className="action mt-3"
              href={whatsapp(
                data.settings.whatsappNumber,
                `Olá! Registrei o pedido ${receipt.id} na Vênus Beach House, de ${dayLabel(checkIn)} a ${dayLabel(checkOut)}, total ${money(receipt.quote.totalCents)}. Gostaria de combinar a confirmação.`,
              )}
              target="_blank"
              rel="noreferrer"
            >
              Continuar no WhatsApp
            </a>
          )}
        </div>
      ) : (
        <form onSubmit={submit} className="surface grid gap-4">
          <h3 className="font-bold">Dados para o pedido</h3>
          <label>
            Nome completo
            <input
              name="name"
              required
              minLength={2}
              maxLength={120}
              autoComplete="name"
            />
          </label>
          <div className="grid sm:grid-cols-2 gap-3">
            <label>
              E-mail
              <input
                name="email"
                type="email"
                required
                maxLength={254}
                autoComplete="email"
              />
            </label>
            <label>
              Telefone/WhatsApp
              <input
                name="phone"
                type="tel"
                required
                maxLength={25}
                autoComplete="tel"
              />
            </label>
          </div>
          <label>
            Hóspedes
            <select name="guests">
              {Array.from({ length: data?.settings.maxGuests || 6 }, (_, i) => (
                <option key={i} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </label>
          <label className="check-label">
            <input type="checkbox" name="pet" />
            Vou levar um pet
          </label>
          <label>
            Observações
            <textarea name="notes" maxLength={2000} />
          </label>
          <label className="check-label">
            <input name="consent" type="checkbox" required />
            Autorizo o uso desses dados para atender ao meu pedido de
            hospedagem.{" "}
            <a href="#privacidade" className="underline">
              Privacidade
            </a>
          </label>
          <button className="action" disabled={!quote || busy || loading}>
            {busy ? "Registrando…" : "Registrar pedido de reserva"}
          </button>
        </form>
      )}
    </section>
  );
}
