import { RatingSummary, useService } from "../service";
import React, { useState } from "react";
import {
  Star,
  MapPin,
  Share2,
  Heart,
  ShieldCheck,
  Check,
  Sparkles,
} from "lucide-react";
import { HOUSE_INFO } from "../data/houseData";

export const PropertyHeader: React.FC = () => {
  const { data } = useService();
  const [copied, setCopied] = useState(false);
  const [isFavorite, setIsFavorite] = useState(
    () => localStorage.getItem("venus_favorite") === "yes",
  );

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: HOUSE_INFO.name,
          text: `${HOUSE_INFO.name} - ${HOUSE_INFO.tagline}`,
          url: window.location.href,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      window.prompt("Copie o link:", window.location.href);
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="pt-6 pb-4">
      {/* Superhost badge pill */}
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200/80 rounded-full text-xs font-semibold text-amber-800">
          <Sparkles className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
          Hospedagem Exclusiva · Casa Inteira
        </span>
        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2.5 py-0.5 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          Reserva Direta
        </span>
      </div>

      {/* Main Property Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-stone-900 tracking-tight">
            {HOUSE_INFO.name}
          </h1>
          <p className="text-base sm:text-lg text-amber-800/90 font-medium italic mt-1">
            "{HOUSE_INFO.tagline}"
          </p>
        </div>

        {/* Action buttons (Share & Save) */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium text-stone-700 bg-white hover:bg-stone-50 border border-stone-300 rounded-xl transition-colors shadow-2xs"
            title="Compartilhar link da casa"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Copiado!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-stone-600" />
                <span>Compartilhar</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              setIsFavorite(!isFavorite);
              localStorage.setItem(
                "venus_favorite",
                !isFavorite ? "yes" : "no",
              );
            }}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium border rounded-xl transition-all shadow-2xs ${
              isFavorite
                ? "bg-rose-50 border-rose-200 text-rose-600"
                : "bg-white hover:bg-stone-50 border-stone-300 text-stone-700"
            }`}
            title="Salvar nos favoritos"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isFavorite ? "fill-rose-500 text-rose-500" : "text-stone-600"
              }`}
            />
            <span>{isFavorite ? "Salvo" : "Salvar"}</span>
          </button>
        </div>
      </div>

      {/* Sub-meta: Reviews, Superhost, Location, Capacity */}
      <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs sm:text-sm text-stone-600 mt-3 pt-3 border-t border-stone-200/60">
        <div className="flex items-center gap-1 font-semibold text-stone-900">
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          <a href="#avaliacoes">
            <RatingSummary />
          </a>
        </div>

        <span className="text-stone-300 hidden sm:inline">·</span>

        <div className="flex items-center gap-1 font-medium text-stone-800">
          <span>Atendimento direto</span>
        </div>

        <span className="text-stone-300 hidden sm:inline">·</span>

        <a
          href="#localizacao"
          className="flex items-center gap-1 underline font-medium hover:text-amber-800 transition-colors"
        >
          <MapPin className="w-3.5 h-3.5 text-stone-500" />
          <span>{HOUSE_INFO.locationShort}</span>
        </a>

        <span className="text-stone-300 hidden sm:inline">·</span>

        <span className="text-stone-600 font-medium">
          Até {data?.settings.maxGuests || HOUSE_INFO.maxGuests} hóspedes ·{" "}
          {HOUSE_INFO.bedrooms} quartos · {HOUSE_INFO.beds} camas ·{" "}
          {HOUSE_INFO.baths} banheiro
        </span>
      </div>
    </div>
  );
};
