import React, { useEffect, useState } from "react";
import { api, localToday } from "../service";
interface Props {
  checkIn: string;
  checkOut: string;
  onSelectDates: (a: string, b: string) => void;
}
export function BookingCalendar({ checkIn, checkOut, onSelectDates }: Props) {
  const [month, setMonth] = useState((checkIn || localToday()).slice(0, 7));
  const [ranges, setRanges] = useState<
    { check_in: string; check_out: string }[]
  >([]);
  const [state, setState] = useState("loading");
  const [retry, setRetry] = useState(0);
  const [year, m] = month.split("-").map(Number);
  const end = new Date(Date.UTC(year, m, 1)).toISOString().slice(0, 10);
  useEffect(() => {
    let active = true;
    setState("loading");
    api<{ ranges: typeof ranges }>(`/availability?start=${month}-01&end=${end}`)
      .then((r) => {
        if (active) {
          setRanges(r.ranges);
          setState("ready");
        }
      })
      .catch(() => {
        if (active) setState("error");
      });
    return () => {
      active = false;
    };
  }, [month, retry]);
  const occupied = (day: string) =>
    ranges.some((r) => r.check_in <= day && day < r.check_out);
  const choose = (day: string) => {
    if (checkIn && !checkOut && day > checkIn) {
      if (ranges.some((r) => r.check_in < day && r.check_out > checkIn))
        onSelectDates(day, "");
      else onSelectDates(checkIn, day);
    } else onSelectDates(day, "");
  };
  const shift = (offset: number) =>
    setMonth(
      new Date(Date.UTC(year, m - 1 + offset, 1)).toISOString().slice(0, 7),
    );
  return (
    <div className="bg-white rounded-2xl border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => shift(-1)}
          aria-label="Mês anterior"
        >
          ←
        </button>
        <h3 className="font-semibold capitalize">
          {new Date(`${month}-15T12:00:00Z`).toLocaleDateString("pt-BR", {
            month: "long",
            year: "numeric",
          })}
        </h3>
        <button type="button" onClick={() => shift(1)} aria-label="Próximo mês">
          →
        </button>
      </div>
      <p className="text-xs">
        Selecione a entrada e depois a saída. A noite da saída não é cobrada.
      </p>
      {state === "error" && (
        <p role="alert">
          Agenda indisponível.{" "}
          <button onClick={() => setRetry(retry + 1)} className="underline">
            Tentar novamente
          </button>
        </p>
      )}
      {state === "loading" && (
        <p role="status" className="text-xs">
          Consultando disponibilidade…
        </p>
      )}
      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
          <span key={i} aria-hidden="true">
            {d}
          </span>
        ))}
        {Array.from(
          { length: new Date(Date.UTC(year, m - 1, 1)).getUTCDay() },
          (_, i) => (
            <span key={"e" + i} />
          ),
        )}
        {Array.from(
          { length: new Date(Date.UTC(year, m, 0)).getUTCDate() },
          (_, i) => {
            const day = `${month}-${String(i + 1).padStart(2, "0")}`;
            const checkoutAllowed =
              !!checkIn &&
              !checkOut &&
              day > checkIn &&
              !ranges.some((r) => r.check_in < day && r.check_out > checkIn);
            const disabled =
              state !== "ready" ||
              day < localToday() ||
              (occupied(day) && !checkoutAllowed);
            const selected = day === checkIn || day === checkOut;
            return (
              <button
                key={day}
                type="button"
                disabled={disabled}
                onClick={() => choose(day)}
                aria-label={`${i + 1}/${m}/${year}${occupied(day) ? " — noite ocupada" : ""}`}
                className={`h-11 rounded-lg disabled:opacity-40 disabled:line-through ${selected ? "bg-stone-900 text-white" : checkIn < day && day < checkOut ? "bg-amber-100" : "bg-stone-50 hover:bg-amber-100"}`}
              >
                {i + 1}
              </button>
            );
          },
        )}
      </div>
      <p className="text-xs text-stone-500">
        Datas riscadas: passadas ou ocupadas. Disponibilidade confirmada
        novamente ao enviar.
      </p>
      <button
        className="underline text-sm"
        type="button"
        onClick={() => onSelectDates("", "")}
      >
        Limpar datas
      </button>
    </div>
  );
}
