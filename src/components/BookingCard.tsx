import React from "react";
import { useService, money } from "../service";
export function BookingCard(_props: {
  checkIn: string;
  checkOut: string;
  onDatesChange: (a: string, b: string) => void;
}) {
  const { data } = useService();
  const minimum =
    data?.settings.pricingEnabled && data.rates.length
      ? Math.min(
          ...data.rates.flatMap((r) => [r.weekday_cents, r.weekend_cents]),
        )
      : null;
  return (
    <aside className="lg:sticky lg:top-24 surface my-4">
      <p className="eyebrow">Sua casa de praia</p>
      <h2 className="text-xl font-serif font-bold">Vênus Beach House</h2>
      <p className="my-3">
        {minimum
          ? `Diárias a partir de ${money(minimum)}`
          : "Consulte as tarifas e a disponibilidade"}
      </p>
      <p className="text-sm mb-4">
        O valor depende do período escolhido. Registre o pedido e combine a
        confirmação com a anfitriã.
      </p>
      <a href="#reserva" className="action">
        Consultar datas e reservar
      </a>
    </aside>
  );
}
