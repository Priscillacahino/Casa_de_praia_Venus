import React from "react";
import {
  Sparkles,
  Waves,
  Sun,
  Users,
  Laptop,
  Film,
  Coffee,
  ShieldCheck,
} from "lucide-react";
import { HOUSE_INFO } from "../data/houseData";

export const AboutSection: React.FC = () => {
  return (
    <section id="sobre" className="py-8 border-t border-stone-200">
      {/* Host Intro Strip */}
      <div className="flex items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={HOUSE_INFO.catProfileImage}
              alt="Mascote Vênus Astronauta"
              className="w-16 h-16 sm:w-18 sm:h-18 rounded-full object-cover ring-4 ring-amber-200/70 shadow-sm"
              referrerPolicy="no-referrer"
            />
            <span className="absolute -bottom-1 -right-1 bg-amber-500 text-white rounded-full p-1 text-[10px] font-bold shadow-xs">
              ★
            </span>
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold font-serif text-stone-900">
              Casa inteira hospedada por Vênus 🐱🚀
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
              Hospedagem com atendimento direto da anfitriã
            </p>
          </div>
        </div>
      </div>

      {/* Main Introduction as requested */}
      <div className="py-6 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200/80 rounded-full text-xs font-semibold">
          <Sun className="w-3.5 h-3.5 text-amber-600" />
          Bem-vindo ao seu refúgio cósmico à beira-mar
        </div>

        <h3 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 leading-snug">
          Venus, sua casa de praia!
        </h3>

        <div className="prose prose-stone text-stone-700 leading-relaxed text-base sm:text-lg max-w-none space-y-4">
          <p className="font-medium text-stone-800">
            Aqui você viverá momentos de alegria, confraternização e união. Será
            um refúgio para relaxar e se divertir junto aos amigos e à família.
          </p>
          <p>
            Estamos localizados no litoral sul, próximo às praias paradisíacas
            da Paraíba, como a{" "}
            <strong className="text-stone-900">Praia do Amor</strong>,{" "}
            <strong className="text-stone-900">Jacumã</strong> e{" "}
            <strong className="text-stone-900">Carapibus</strong>, além de{" "}
            <strong className="text-stone-900">Tabatinga</strong> e{" "}
            <strong className="text-stone-900">Coqueirinho</strong> — entre
            outros paraísos do nordeste, todos situados em{" "}
            <strong className="text-stone-900">
              Conde, litoral sul da Paraíba
            </strong>
            .
          </p>
          <p className="text-amber-900/90 font-medium bg-amber-50/70 p-4 rounded-2xl border border-amber-200/50">
            ✨ Venha viver essa experiência única e criar memórias incríveis e
            inesquecíveis!
          </p>
        </div>
      </div>

      {/* Property key feature badges (Airbnb style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
        <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-stone-50/80 border border-stone-200/60">
          <div className="p-2.5 bg-amber-100/70 text-amber-800 rounded-xl">
            <Waves className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-stone-900">
              Piscina em L & Churrasqueira
            </h4>
            <p className="text-xs text-stone-600 mt-0.5">
              Área externa privativa para se refrescar nos dias ensolarados e
              fazer aquele churrasco especial.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-stone-50/80 border border-stone-200/60">
          <div className="p-2.5 bg-sky-100/70 text-sky-800 rounded-xl">
            <Laptop className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-stone-900">
              Escritório no Paraíso (Home Office)
            </h4>
            <p className="text-xs text-stone-600 mt-0.5">
              Mesa retrátil, cadeira ergonômica, suporte para monitor e Wi-Fi de
              alta velocidade para nômades.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-stone-50/80 border border-stone-200/60">
          <div className="p-2.5 bg-purple-100/70 text-purple-800 rounded-xl">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-stone-900">
              Cinema Smart na Sala
            </h4>
            <p className="text-xs text-stone-600 mt-0.5">
              Projetor smart integrado para assistir a filmes e séries após um
              dia inteiro de praia.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-stone-50/80 border border-stone-200/60">
          <div className="p-2.5 bg-emerald-100/70 text-emerald-800 rounded-xl">
            <Coffee className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-stone-900">
              Rede Nordestina & Jardim
            </h4>
            <p className="text-xs text-stone-600 mt-0.5">
              Ambiente 'Suave na nave' com rede tradicional para relaxar sob a
              brisa fresca e jardim suspenso.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
