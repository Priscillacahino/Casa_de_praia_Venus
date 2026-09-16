import React, { useEffect, useState } from "react";
import {
  api,
  dayLabel,
  localToday,
  money,
  Settings,
  Rate,
  Review,
  Quote,
} from "../service";
import { Compliance } from "./Compliance";
type Reservation = {
  requirements: {ready:boolean;legalReady:boolean;signatureReady:boolean;paidCents:number;requiredDepositCents:number};
  id: string;
  name: string;
  email: string;
  phone: string;
  check_in: string;
  check_out: string;
  guests: number;
  has_pet: number;
  notes: string;
  status: string;
  quote: Quote;
  paidCents: number;
};
type AdminData = {
  settings: Settings;
  rates: Rate[];
  reservations: Reservation[];
  messages: any[];
  reviews: Review[];
  payments: any[];
};
const statusLabel: Record<string, string> = {
  requested: "Pedido pendente",
  confirmed: "Confirmada",
  cancelled: "Cancelada",
  blocked: "Bloqueio",
};
export function Admin() {
  const [data, setData] = useState<AdminData | null>(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState("agenda");
  const load = async () => {
    const d = await api<AdminData>("/admin/data");
    setData(d);
  };
  useEffect(() => {
    load().catch(() => {});
  }, []);
  async function run(action: () => Promise<unknown>, message: string) {
    setBusy(true);
    setStatus("");
    try {
      await action();
      await load();
      setStatus(message);
    } catch (e) {
      setStatus((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function login(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    await run(
      () => api("/admin/login", "POST", { password: f.get("password") }),
      "Acesso autorizado.",
    );
  }
  const cents = (f: FormData, key: string) =>
    Math.round(Number(f.get(key)) * 100);
  const form = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    return new FormData(event.currentTarget);
  };
  if (!data)
    return (
      <main className="max-w-lg mx-auto p-6">
        <a href="/" className="underline">
          ← Voltar ao site
        </a>
        <h1 className="section-title mt-8">Administração Vênus</h1>
        <form onSubmit={login} className="surface grid gap-4 mt-4">
          <label>
            Senha administrativa
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              required
              maxLength={200}
            />
          </label>
          <button disabled={busy} className="action">
            {busy ? "Entrando…" : "Entrar"}
          </button>
        </form>
        {status && (
          <p role="alert" className="error mt-4">
            {status}
          </p>
        )}
      </main>
    );
  const confirmed = data.reservations.filter((r) => r.status === "confirmed");
  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex justify-between gap-4 flex-wrap">
        <div>
          <a className="underline text-sm" href="/">
            ← Site da casa
          </a>
          <h1 className="section-title">Administração Vênus</h1>
        </div>
        <button
          className="underline"
          onClick={async () => {
            try {
              await api("/admin/logout", "POST", {});
              setData(null);
              setStatus("Sessão encerrada.");
            } catch (e) {
              setStatus((e as Error).message);
            }
          }}
        >
          Sair
        </button>
      </div>
      <nav className="flex gap-2 flex-wrap" aria-label="Áreas administrativas">
        {[
          ["agenda", "Agenda e pedidos"],
          ["tarifas", "Tarifas"],
          ["financeiro", "Financeiro"],
          ["termos", "Termos e pagamento"],
          ["mensagens", "Mensagens"],
          ["avaliacoes", "Avaliações"],
          ["config", "Configurações"],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            aria-pressed={tab === id}
            className={tab === id ? "action" : "tab-button"}
          >
            {label}
          </button>
        ))}
      </nav>
      {status && (
        <p role="status" className="surface">
          {status}
        </p>
      )}
      {tab === "termos" && <Compliance reservations={data.reservations} reload={load}/>}
      {tab === "agenda" && (
        <>
          <div className="flex gap-4 flex-wrap">
            <a className="underline" href="/api/admin/calendar.ics">
              Baixar agenda para importar no Google Agenda
            </a>
            <a className="underline" href="/api/admin/export.csv">
              Exportar planilha de reservas
            </a>
          </div>
          <p className="text-sm">
            Somente confirmações e bloqueios ocupam a agenda. Pedidos pendentes
            podem coincidir; a confirmação verifica o conflito novamente.
            Importar o arquivo de agenda não cria sincronização automática.
          </p>
          <div className="overflow-x-auto surface">
            <table>
              <thead>
                <tr>
                  <th>Entrada / saída</th>
                  <th>Hóspede</th>
                  <th>Situação</th>
                  <th>Total</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {data.reservations.map((r) => (
                  <tr key={r.id}>
                    <td>
                      {dayLabel(r.check_in)}
                      <br />
                      {dayLabel(r.check_out)}
                    </td>
                    <td>
                      {r.name}
                      <small className="block">
                        {r.guests || "—"} hóspedes {r.has_pet ? "· Pet" : ""}
                      </small>
                      <small className="block break-all">
                        {r.phone}
                        <br />
                        {r.email}
                      </small>
                      <details>
                        <summary>Detalhes</summary>
                        <p className="whitespace-pre-wrap">{r.notes}</p>
                        <p className="text-xs break-all">{r.id}</p>
                      </details>
                    </td>
                    <td>{statusLabel[r.status]}{r.status === "requested" && <small className="block">Jurídico: {r.requirements.legalReady?"OK":"pendente"}<br/>Assinatura: {r.requirements.signatureReady?"validada":"pendente"}<br/>Sinal: {money(r.requirements.paidCents)} / {money(r.requirements.requiredDepositCents)}</small>}</td>
                    <td>
                      {r.quote.totalCents !== undefined
                        ? money(r.quote.totalCents)
                        : "—"}
                    </td>
                    <td className="space-y-2">
                      {r.status === "requested" && (
                        <button
                          disabled={busy || !r.requirements.ready}
                          title="Exige termo aprovado, assinatura validada e sinal recebido"
                          className="underline block disabled:opacity-40"
                          onClick={() =>
                            run(
                              () =>
                                api(`/admin/reservations/${r.id}`, "PATCH", {
                                  status: "confirmed",
                                }),
                              "Reserva confirmada.",
                            )
                          }
                        >
                          Confirmar
                        </button>
                      )}
                      {r.status !== "cancelled" && (
                        <button
                          disabled={busy}
                          className="underline text-red-700"
                          onClick={() => {
                            if (
                              window.confirm(
                                "Cancelar este pedido, reserva ou bloqueio?",
                              )
                            )
                              void run(
                                () =>
                                  api(`/admin/reservations/${r.id}`, "PATCH", {
                                    status: "cancelled",
                                  }),
                                "Cancelamento registrado. Confira eventuais estornos no financeiro.",
                              );
                          }}
                        >
                          Cancelar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!data.reservations.length && (
              <p>Nenhuma reserva ou bloqueio cadastrado.</p>
            )}
          </div>
          <form
            className="surface grid gap-3"
            onSubmit={(e) => {
              const f = form(e);
              void run(
                () =>
                  api("/admin/blocks", "POST", {
                    checkIn: f.get("start"),
                    checkOut: f.get("end"),
                    notes: f.get("notes"),
                  }),
                "Período bloqueado.",
              );
            }}
          >
            <h2 className="font-bold">Bloquear período</h2>
            <p className="text-sm">
              Use para manutenção, uso próprio ou reservas feitas em outros
              canais.
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              <label>
                Primeira noite
                <input type="date" name="start" min={localToday()} required />
              </label>
              <label>
                Saída / primeira noite liberada
                <input type="date" name="end" min={localToday()} required />
              </label>
            </div>
            <label>
              Motivo
              <input name="notes" required minLength={2} maxLength={2000} />
            </label>
            <button className="action" disabled={busy}>
              Salvar bloqueio
            </button>
          </form>
        </>
      )}
      {tab === "tarifas" && (
        <>
          <p>
            Cadastre valores reais para intervalos sem sobreposição. Para
            feriados, divida os períodos e cadastre a tarifa específica nas
            datas corretas. A data final é exclusiva.
          </p>
          <div className="surface overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Tarifa / período</th>
                  <th>Dom–qui</th>
                  <th>Sex–sáb</th>
                  <th>Mínimo</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {data.rates.map((r) => (
                  <tr key={r.id}>
                    <td>
                      {r.label}
                      <br />
                      {dayLabel(r.start_date)} → {dayLabel(r.end_date)}
                    </td>
                    <td>{money(r.weekday_cents)}</td>
                    <td>{money(r.weekend_cents)}</td>
                    <td>{r.min_nights}</td>
                    <td>
                      <button
                        className="underline"
                        disabled={busy}
                        onClick={() => {
                          if (
                            window.confirm(
                              "Excluir esta tarifa? Reservas já registradas mantêm o orçamento original.",
                            )
                          )
                            void run(
                              () => api("/admin/rates/" + r.id, "DELETE", {}),
                              "Tarifa excluída.",
                            );
                        }}
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!data.rates.length && <p>Sem tarifas cadastradas.</p>}
          </div>
          <form
            className="surface grid gap-3"
            onSubmit={(e) => {
              const f = form(e);
              void run(
                () =>
                  api("/admin/rates", "POST", {
                    label: f.get("label"),
                    startDate: f.get("start"),
                    endDate: f.get("end"),
                    weekdayCents: cents(f, "weekday"),
                    weekendCents: cents(f, "weekend"),
                    minNights: Number(f.get("minimum")),
                  }),
                "Tarifa cadastrada.",
              );
            }}
          >
            <h2 className="font-bold">Cadastrar tarifa</h2>
            <label>
              Descrição
              <input name="label" required minLength={2} maxLength={120} />
            </label>
            <div className="grid sm:grid-cols-2 gap-3">
              <label>
                Primeira noite
                <input name="start" type="date" required />
              </label>
              <label>
                Fim exclusivo
                <input name="end" type="date" required />
              </label>
              <label>
                Diária dom–qui (R$)
                <input
                  name="weekday"
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                />
              </label>
              <label>
                Diária sex–sáb (R$)
                <input
                  name="weekend"
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                />
              </label>
            </div>
            <label>
              Mínimo de noites
              <input
                name="minimum"
                type="number"
                min="1"
                max="366"
                defaultValue={1}
                required
              />
            </label>
            <button className="action" disabled={busy}>
              Cadastrar
            </button>
          </form>
        </>
      )}
      {tab === "financeiro" && (
        <>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="surface">
              Contratado em reservas confirmadas
              <strong className="block text-xl">
                {money(confirmed.reduce((s, r) => s + r.quote.totalCents, 0))}
              </strong>
            </div>
            <div className="surface">
              Recebido nessas reservas
              <strong className="block text-xl">
                {money(confirmed.reduce((s, r) => s + r.paidCents, 0))}
              </strong>
            </div>
            <div className="surface">
              Saldo a receber
              <strong className="block text-xl">
                {money(
                  confirmed.reduce(
                    (s, r) => s + r.quote.totalCents - r.paidCents,
                    0,
                  ),
                )}
              </strong>
            </div>
          </div>
          <a className="underline" href="/api/admin/export.csv">
            Baixar planilha com cálculos por reserva (CSV)
          </a>
          <p>
            Registre pagamentos somente após conferir o recebimento. Isto não
            processa pagamentos bancários. Valores negativos registram estornos;
            cancelamentos não estornam automaticamente.
          </p>
          <form
            className="surface grid gap-3"
            onSubmit={(e) => {
              const f = form(e);
              void run(
                () =>
                  api("/admin/payments", "POST", {
                    reservationId: f.get("reservation"),
                    amountCents: cents(f, "amount"),
                    note: f.get("note"),
                    method: f.get("method"), bankReference: f.get("bankReference"), settled: f.get("settled") === "on",
                  }),
                "Movimentação registrada.",
              );
            }}
          >
            <label>
              Reserva
              <select name="reservation" required>
                <option value="">Selecione</option>
                {data.reservations
                  .filter(
                    (r) =>
                      r.status !== "blocked" &&
                      r.quote.totalCents !== undefined,
                  )
                  .map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} · {dayLabel(r.check_in)} ·{" "}
                      {statusLabel[r.status]} · recebido {money(r.paidCents)}
                    </option>
                  ))}
              </select>
            </label>
            <label>
              Valor recebido ou estornado (R$)
              <input name="amount" type="number" step="0.01" required />
            </label>
            <label>
              Descrição / comprovante
              <input name="note" required minLength={2} maxLength={250} />
            </label>
            <label>Forma de pagamento<select name="method" required><option value="pix">Pix</option><option value="transfer">Transferência bancária</option></select></label>
            <label>Identificador no extrato bancário<input name="bankReference" minLength={5} maxLength={250} required/></label>
            <label className="check-label"><input name="settled" type="checkbox" required/>Conferi a compensação desta movimentação no extrato bancário.</label>
            <button className="action" disabled={busy}>
              Registrar movimentação
            </button>
          </form>
          <div className="surface overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Hóspede</th>
                  <th>Descrição</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                {data.payments.map((p) => (
                  <tr key={p.id}>
                    <td>{p.created_at} UTC</td>
                    <td>
                      {
                        data.reservations.find((r) => r.id === p.reservation_id)
                          ?.name
                      }
                    </td>
                    <td>{p.note}</td>
                    <td>{money(p.amount_cents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {tab === "mensagens" && (
        <div className="space-y-3">
          {!data.messages.length && <p>Nenhuma mensagem recebida.</p>}
          {data.messages.map((m) => (
            <article key={m.id} className="surface">
              <h2 className="font-bold">{m.name}</h2>
              <p>
                {m.email} · {m.phone}
              </p>
              <p>{m.dates}</p>
              <p className="whitespace-pre-wrap mt-3">{m.message}</p>
              <small>{m.created_at} UTC</small>
            </article>
          ))}
        </div>
      )}
      {tab === "avaliacoes" && (
        <div className="space-y-3">
          <p>
            Publique somente relatos de hóspedes reais. O sistema não atribui
            selo automático de estadia verificada.
          </p>
          {!data.reviews.length && <p>Nenhuma avaliação recebida.</p>}
          {data.reviews.map((r) => (
            <article key={r.id} className="surface space-y-2">
              <h2 className="font-bold">
                {r.name} · {r.rating}/5 ·{" "}
                {r.approved ? "Publicada" : "Pendente"}
              </h2>
              <p className="whitespace-pre-wrap">{r.comment}</p>
              <button
                className="underline"
                disabled={busy}
                onClick={() =>
                  run(
                    () =>
                      api(`/admin/reviews/${r.id}`, "PATCH", {
                        approved: !r.approved,
                      }),
                    "Avaliação atualizada.",
                  )
                }
              >
                {r.approved ? "Retirar da publicação" : "Publicar"}
              </button>
            </article>
          ))}
        </div>
      )}
      {tab === "config" && (
        <form
          className="surface grid gap-4"
          onSubmit={(e) => {
            const f = form(e);
            void run(
              () =>
                api("/admin/settings", "PUT", {
                  pricingEnabled: f.get("enabled") === "on",
                  cleaningFeeCents: cents(f, "cleaning"),
                  depositPercent: Number(f.get("deposit")),
                  maxGuests: Number(f.get("guests")),
                  whatsappNumber: f.get("whatsapp"),
                  email: f.get("email"),
                  googleMapsUrl: f.get("maps"),
                  mapsEmbedUrl: f.get("embed"),
                }),
              "Configurações salvas.",
            );
          }}
        >
          <h2 className="font-bold">Dados da operação</h2>
          <label className="check-label">
            <input
              type="checkbox"
              name="enabled"
              defaultChecked={data.settings.pricingEnabled}
            />
            Publicar tarifas e habilitar pedidos de reserva
          </label>
          <label>
            Taxa única de limpeza (R$)
            <input
              type="number"
              min="0"
              step="0.01"
              name="cleaning"
              defaultValue={data.settings.cleaningFeeCents / 100}
              required
            />
          </label>
          <label>
            Percentual do sinal
            <input
              name="deposit"
              type="number"
              min="0"
              max="100"
              step="1"
              value={20}
              readOnly
              required
            />
          </label>
          <label>
            Limite de hóspedes
            <input
              name="guests"
              type="number"
              min="1"
              max="50"
              defaultValue={data.settings.maxGuests}
              required
            />
          </label>
          <label>
            WhatsApp com país e DDD (somente números)
            <input
              name="whatsapp"
              pattern="[0-9]{10,15}"
              defaultValue={data.settings.whatsappNumber}
              required
            />
          </label>
          <label>
            E-mail de contato
            <input
              name="email"
              type="email"
              defaultValue={data.settings.email}
              required
            />
          </label>
          <label>
            Link da propriedade no Google Maps
            <input
              name="maps"
              type="url"
              defaultValue={data.settings.googleMapsUrl}
              required
            />
          </label>
          <label>
            Endereço de incorporação do Maps (opcional)
            <input
              name="embed"
              type="url"
              defaultValue={data.settings.mapsEmbedUrl}
            />
          </label>
          <p className="text-sm">
            No Google Maps, use Compartilhar → Incorporar um mapa. Copie apenas
            o endereço dentro de src, sem o restante do código.
          </p>
          <button className="action" disabled={busy}>
            Salvar configurações
          </button>
        </form>
      )}
    </main>
  );
}
