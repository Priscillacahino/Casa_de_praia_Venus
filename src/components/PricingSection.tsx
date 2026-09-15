import React, { useState } from 'react';
import { PRICING_TIERS, SPECIAL_HOLIDAYS, HOUSE_INFO } from '../data/houseData';
import { Calendar, Tag, Sparkles, Check, Info, ShieldCheck, Sun, Umbrella, Waves, PartyPopper } from 'lucide-react';

export const PricingSection: React.FC = () => {
  const [selectedSeason, setSelectedSeason] = useState<string>('all');

  return (
    <section id="valores" className="py-12 border-t border-stone-200 scroll-mt-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-700 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-amber-600" />
            Transparência & Melhores Tarifas
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-1">
            Tabela de Valores & Temporadas
          </h2>
          <p className="text-sm text-stone-600 mt-1 max-w-2xl">
            As diárias da Vênus Beach House variam de acordo com a época do ano, dias de semana, finais de semana, feriados prolongados e altas estações. Aluguel direto com o anfitrião, sem taxas abusivas de intermediários!
          </p>
        </div>

        <a
          href="#reserva"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs active:scale-95 self-start"
        >
          <Calendar className="w-4 h-4" />
          <span>Ver Calendário de Disponibilidade</span>
        </a>
      </div>

      {/* Main Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {PRICING_TIERS.map((tier) => (
          <div
            key={tier.id}
            className={`rounded-3xl p-6 transition-all flex flex-col justify-between border relative ${
              tier.highlight
                ? 'bg-gradient-to-b from-amber-50/80 to-white border-amber-300/80 shadow-md ring-1 ring-amber-400/40'
                : 'bg-white border-stone-200/90 shadow-2xs hover:shadow-xs'
            }`}
          >
            {tier.badge && (
              <div className="absolute -top-3 right-6">
                <span className="bg-amber-500 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-xs flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {tier.badge}
                </span>
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 mb-2">
                {tier.id === 'baixa-temporada' && <Waves className="w-5 h-5 text-sky-600" />}
                {tier.id === 'alta-temporada' && <Sun className="w-5 h-5 text-amber-500" />}
                {tier.id === 'feriados-pacotes' && <PartyPopper className="w-5 h-5 text-purple-600" />}
                <h3 className="font-serif font-bold text-xl text-stone-900">{tier.season}</h3>
              </div>

              <p className="text-xs text-stone-500 font-medium mb-4 min-h-[32px]">
                {tier.period}
              </p>

              {/* Price comparison */}
              <div className="space-y-3 bg-stone-50/70 p-4 rounded-2xl border border-stone-200/70 mb-5">
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider block">
                    Dias de Semana (Dom a Qui)
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-2xl font-bold font-serif text-stone-900">
                      R$ {tier.weekdayPrice}
                    </span>
                    <span className="text-xs text-stone-500">/ noite</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-200/60">
                  <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider block">
                    Finais de Semana (Sex e Sáb)
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-2xl font-bold font-serif text-stone-900">
                      R$ {tier.weekendPrice}
                    </span>
                    <span className="text-xs text-stone-500">/ noite</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-stone-600 leading-relaxed mb-4">
                {tier.description}
              </p>
            </div>

            <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
              <span>Mínimo de estadia:</span>
              <span className="font-bold text-stone-800">{tier.minNights} noites</span>
            </div>
          </div>
        ))}
      </div>

      {/* Special Holidays and Packages Table */}
      <div className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-8 shadow-xs mb-8">
        <div className="flex items-center gap-2 mb-2">
          <PartyPopper className="w-5 h-5 text-amber-600" />
          <h3 className="font-serif font-bold text-lg sm:text-xl text-stone-900">
            Feriados Prolongados & Pacotes Festivos
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-stone-600 mb-6">
          Para datas comemorativas e feriados nacionais, trabalhamos com pacotes especiais que garantem a casa inteira com piscina privativa exclusiva para você e sua família:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 font-mono text-[11px] uppercase tracking-wider">
                <th className="pb-3 font-semibold">Feriado / Evento</th>
                <th className="pb-3 font-semibold">Período / Época</th>
                <th className="pb-3 font-semibold">Mínimo</th>
                <th className="pb-3 font-semibold">Valor da Diária</th>
                <th className="pb-3 font-semibold">Observações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {SPECIAL_HOLIDAYS.map((holiday) => (
                <tr key={holiday.id} className="hover:bg-stone-50/60 transition-colors">
                  <td className="py-3.5 font-bold text-stone-900">{holiday.name}</td>
                  <td className="py-3.5 text-stone-600">{holiday.period}</td>
                  <td className="py-3.5 text-stone-700 font-semibold">{holiday.minNights} noites</td>
                  <td className="py-3.5 font-bold text-amber-800">
                    R$ {holiday.pricePerNight} <span className="text-[11px] text-stone-500 font-normal">/ noite</span>
                  </td>
                  <td className="py-3.5 text-xs text-stone-500 max-w-xs">{holiday.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inclusions & Rental Conditions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-stone-50/80 border border-stone-200/80">
          <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2 mb-3">
            <Check className="w-4 h-4 text-emerald-600" />
            O que está incluso em todas as diárias:
          </h4>
          <ul className="space-y-2 text-xs text-stone-600">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
              <span>Uso 100% exclusivo e privativo de toda a casa (não há compartilhamento de áreas).</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
              <span>Piscina privativa em L com cascata e ducha externa.</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
              <span>Churrasqueira pré-moldada privativa com grelha.</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
              <span>Wi-Fi de fibra ótica de alta velocidade com estação dedicada de Home Office.</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
              <span>Pet Friendly: seu animalzinho é bem-vindo sem cobrança de taxa adicional! 🐾</span>
            </li>
          </ul>
        </div>

        <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200/70">
          <h4 className="text-sm font-bold text-amber-950 flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-amber-700" />
            Condições & Taxa Única de Limpeza:
          </h4>
          <ul className="space-y-2 text-xs text-amber-900/90">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0 mt-1" />
              <span>
                <strong>Taxa única de limpeza e higienização:</strong> R$ {HOUSE_INFO.cleaningFee} por estadia (independente do número de noites).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0 mt-1" />
              <span>
                <strong>Horários:</strong> Check-in a partir das 14h / Check-out até às 11h (flexibilidade sob consulta prévia).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0 mt-1" />
              <span>
                <strong>Capacidade:</strong> Acomoda com conforto até 6 hóspedes (incluindo adultos e crianças).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0 mt-1" />
              <span>
                <strong>Reserva Garantida:</strong> 50% de sinal no momento da confirmação e 50% no check-in.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};
