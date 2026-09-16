import React, { useState } from "react";
import { api, RatingSummary, useService } from "../service";
export function ReviewsSection() {
  const { data } = useService();
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    setBusy(true);
    try {
      await api("/reviews", "POST", {
        name: f.get("name"),
        rating: Number(f.get("rating")),
        comment: f.get("comment"),
        consent: f.get("consent") === "on",
      });
      setStatus(
        "Avaliação registrada para moderação. Ela será exibida após a publicação.",
      );
      form.reset();
    } catch (e) {
      setStatus((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section id="avaliacoes" className="py-10 border-t space-y-4">
      <h2 className="section-title">Experiências dos hóspedes</h2>
      <p>
        <RatingSummary />
      </p>
      {data?.reviews.map((r) => (
        <article key={r.id} className="surface">
          <h3 className="font-bold">
            {r.name} · {r.rating}/5
          </h3>
          <p className="whitespace-pre-wrap">{r.comment}</p>
        </article>
      ))}
      <details>
        <summary className="font-semibold cursor-pointer">
          Compartilhar minha experiência
        </summary>
        <form className="surface grid gap-3 mt-3" onSubmit={submit}>
          <label>
            Nome público
            <input name="name" required minLength={2} maxLength={80} />
          </label>
          <label>
            Nota
            <select name="rating">
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </label>
          <label>
            Comentário
            <textarea name="comment" required minLength={10} maxLength={2000} />
          </label>
          <label className="check-label">
            <input type="checkbox" name="consent" required />
            Autorizo a publicação do meu nome e comentário no site.
          </label>
          <button className="action" disabled={busy}>
            {busy ? "Enviando…" : "Enviar avaliação"}
          </button>
        </form>
      </details>
      {status && <p role="status">{status}</p>}
    </section>
  );
}
