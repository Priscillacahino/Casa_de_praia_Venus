import React, { createContext, useContext, useEffect, useState } from "react";
export type Settings = {
  pricingEnabled: boolean;
  cleaningFeeCents: number;
  depositPercent: number;
  maxGuests: number;
  whatsappNumber: string;
  email: string;
  googleMapsUrl: string;
  mapsEmbedUrl: string;
};
export type Rate = {
  id: string;
  label: string;
  start_date: string;
  end_date: string;
  weekday_cents: number;
  weekend_cents: number;
  min_nights: number;
};
export type Review = {
  id: string;
  name: string;
  rating: number;
  comment: string;
  created_at: string;
  approved?: number;
};
export type Quote = {
  nights: number;
  nightlyDetails: { date: string; rateCents: number; label: string }[];
  subtotalCents: number;
  cleaningFeeCents: number;
  totalCents: number;
  depositCents: number;
  depositPercent: number;
  minNights: number;
};
export const money = (cents: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    cents / 100,
  );
export const dayLabel = (day: string) =>
  day?.split("-").reverse().join("/") || "—";
export const localToday = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "America/Fortaleza" }).format(
    new Date(),
  );
export async function api<T = any>(
  path: string,
  method = "GET",
  body?: unknown,
  headers: Record<string, string> = {},
): Promise<T> {
  const response = await fetch("/api" + path, {
    method,
    credentials: "same-origin",
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const data = await response
    .json()
    .catch(() => ({ error: "Serviço indisponível. Tente novamente." }));
  if (!response.ok) throw new Error(data.error || "Não foi possível concluir.");
  return data;
}
type PublicData = {
  settings: Settings;
  rates: Rate[];
  reviews: Review[];
  reviewStats: { count: number; average: number | null };
};
const Context = createContext<{
  data: PublicData | null;
  error: string;
  reload: () => Promise<void>;
}>({ data: null, error: "", reload: async () => {} });
export function ServiceProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<PublicData | null>(null);
  const [error, setError] = useState("");
  const reload = async () => {
    try {
      setData(await api("/public"));
      setError("");
    } catch (e) {
      setData(null);
      setError((e as Error).message);
    }
  };
  useEffect(() => {
    void reload();
  }, []);
  return (
    <Context.Provider value={{ data, error, reload }}>
      {children}
    </Context.Provider>
  );
}
export const useService = () => useContext(Context);
export const whatsapp = (number: string, message: string) =>
  `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
export function RatingSummary() {
  const { data } = useService();
  const stats = data?.reviewStats;
  return (
    <span>
      {stats?.count
        ? `${Number(stats.average).toFixed(2)} · ${stats.count} avaliações`
        : "Sem avaliações publicadas"}
    </span>
  );
}
