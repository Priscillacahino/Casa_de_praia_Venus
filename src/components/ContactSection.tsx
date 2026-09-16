import React, { useState } from "react";
import { api, useService, whatsapp } from "../service";
export function ContactSection() {
  const { data } = useService();
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    setBusy(true);
    try {
      const r = await api(
        "/messages",
        "POST",
        Object.fromEntries([
          ...f.entries(),
          ["consent", f.get("consent") === "on"],
        ]),
      );
      setStatus(
        `Mensagem registrada. Protocolo: ${r.id}. A anfitriã poderá responder pelos contatos informados.`,
      );
      form.reset();
    } catch (e) {
      setStatus((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section id="contato" className="py-10 border-t space-y-4">
      <h2 className="section-title">Fale com a anfitriã</h2>
      {data && (
        <div className="flex gap-4 flex-wrap">
          <a
            className="underline"
            target="_blank"
            rel="noreferrer"
            href={whatsapp(
              data.settings.whatsappNumber,
              "Olá! Gostaria de informações sobre a Vênus Beach House.",
            )}
          >
            Conversar no WhatsApp
          </a>
          <a className="underline" href={`mailto:${data.settings.email}`}>
            {data.settings.email}
          </a>
        </div>
      )}
      <form onSubmit={submit} className="surface grid gap-3">
        <label>
          Nome
          <input
            name="name"
            required
            minLength={2}
            maxLength={120}
            autoComplete="name"
          />
        </label>
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
          Telefone
          <input name="phone" type="tel" maxLength={25} autoComplete="tel" />
        </label>
        <label>
          Datas de interesse (opcional)
          <input name="dates" maxLength={120} />
        </label>
        <label className="hidden" aria-hidden="true">
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
        <label>
          Mensagem
          <textarea name="message" required minLength={10} maxLength={4000} />
        </label>
        <label className="check-label">
          <input name="consent" type="checkbox" required />
          Autorizo o uso dos dados para responder a esta mensagem.
        </label>
        <button className="action" disabled={busy || !data}>
          {busy ? "Registrando…" : "Enviar mensagem"}
        </button>
      </form>
      {status && <p role="status">{status}</p>}
    </section>
  );
}
