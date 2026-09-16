import React from "react";
import { dayLabel, money, useService } from "../service";
export function PricingSection() {
  const { data, error } = useService();
  return (
    <section id="tarifas" className="py-10 border-t space-y-4">
      <h2 className="section-title">Tarifas da estadia</h2>
      {error ? (
        <p role="alert">Não foi possível consultar as tarifas.</p>
      ) : !data ? (
        <p>Carregando tarifas…</p>
      ) : !data.settings.pricingEnabled || !data.rates.length ? (
        <p>
          Tarifas sob consulta. Fale com a anfitriã para planejar sua estadia.
        </p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Período de noites</th>
                  <th>Dom–qui</th>
                  <th>Sex–sáb</th>
                  <th>Mínimo</th>
                </tr>
              </thead>
              <tbody>
                {data.rates.map((r) => (
                  <tr key={r.id}>
                    <td>
                      {r.label}
                      <br />
                      <small>
                        {dayLabel(r.start_date)} até {dayLabel(r.end_date)}{" "}
                        (exclusiva)
                      </small>
                    </td>
                    <td>{money(r.weekday_cents)}</td>
                    <td>{money(r.weekend_cents)}</td>
                    <td>{r.min_nights} noites</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            Limpeza por estadia: {money(data.settings.cleaningFeeCents)}. Sinal
            previsto: {data.settings.depositPercent}%.
          </p>
          <p className="text-sm">
            A data final de cada tarifa não inclui a noite desse dia. O cálculo
            da reserva apresenta o valor de cada noite.
          </p>
        </>
      )}
    </section>
  );
}
