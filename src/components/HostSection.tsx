import { useService, whatsapp } from "../service";
import React from "react";
import { HOUSE_INFO } from "../data/houseData";
import {
  Star,
  ShieldCheck,
  Clock,
  MessageSquare,
  Heart,
  Sparkles,
} from "lucide-react";
import { SmartImage } from "./SmartImage";

export const HostSection: React.FC = () => {
  const { data } = useService();
  const whatsappUrl = data
    ? whatsapp(
        data.settings.whatsappNumber,
        "Olá! Gostaria de conversar sobre uma reserva.",
      )
    : "#contato";

  return (
    <section className="py-10 border-t border-stone-200">
      <div className="bg-stone-50/80 rounded-3xl p-6 sm:p-8 border border-stone-200/80">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-stone-200">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <SmartImage
                src={HOUSE_INFO.catProfileImage}
                fallbackSources={[
                  "/images/venus_cat_profile_1789476877938.jpg",
                ]}
                alt="Vênus - Anfitriã Oficial e Mascote"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-4 ring-amber-400/80 shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 bg-amber-500 text-white rounded-full p-1.5 shadow-xs">
                <Sparkles className="w-4 h-4" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                  Hospedado por Vênus 🐾🪐
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-stone-600 mt-1">
                Anfitriã oficial da casa · Inspirando conexão, afeto e descanso
                sob o sol da Paraíba
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs font-semibold text-amber-800">
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  Atendimento direto
                </span>
                <span>·</span>
                <span>Casa de praia</span>
              </div>
            </div>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl text-sm font-semibold transition-all shadow-xs active:scale-95 shrink-0"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Falar com o Anfitrião</span>
          </a>
        </div>

        {/* Story & Host details */}
        <div className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-stone-700">
          <div className="md:col-span-2 space-y-3 leading-relaxed">
            <p className="font-serif italic text-stone-800 text-base">
              "Aqui você viverá momentos de alegria, confraternização e união.
              Será um refúgio para relaxar e se divertir junto aos amigos e a
              família."
            </p>
            <p>
              A Vênus Beach House nasceu do desejo de proporcionar um espaço
              acolhedor, vibrante e repleto de boas energias no litoral sul da
              Paraíba. Cada cômodo possui sua identidade própria — desde a arte
              mística da sala e a vibe cósmica dos quartos até a piscina
              privativa com churrasqueira e a calma da rede na área externa.
            </p>
          </div>

          <div className="space-y-3 bg-white p-4 rounded-2xl border border-stone-200/70 text-xs">
            <div className="flex items-center gap-2.5 text-stone-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Dúvidas sobre a hospedagem? Fale conosco.</span>
            </div>
            <div className="flex items-center gap-2.5 text-stone-700">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Consulte os horários de atendimento</span>
            </div>
            <div className="flex items-center gap-2.5 text-stone-700">
              <Heart className="w-4 h-4 text-rose-500 shrink-0" />
              <span>Pet friendly com muito amor e carinho</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
