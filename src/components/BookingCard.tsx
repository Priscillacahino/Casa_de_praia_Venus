import React, { useState } from 'react';
import { Star, Calendar, Users, MessageCircle, Mail, ShieldCheck, ChevronDown, Check, Tag, Info } from 'lucide-react';
import { HOUSE_INFO, calculateStayPricing } from '../data/houseData';

interface BookingCardProps {
  checkIn?: string;
  checkOut?: string;
  onDatesChange?: (checkIn: string, checkOut: string) => void;
}

export const BookingCard: React.FC<BookingCardProps> = ({
  checkIn: externalCheckIn,
  checkOut: externalCheckOut,
  onDatesChange,
}) => {
  // Default dates: tomorrow and 3 days later if not passed
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const checkoutDate = new Date(tomorrow);
  checkoutDate.setDate(checkoutDate.getDate() + 2);

  const formatDateForInput = (d: Date) => d.toISOString().split('T')[0];

  const [internalCheckIn, setInternalCheckIn] = useState<string>(formatDateForInput(tomorrow));
  const [internalCheckOut, setInternalCheckOut] = useState<string>(formatDateForInput(checkoutDate));
  
  const checkIn = externalCheckIn !== undefined ? externalCheckIn : internalCheckIn;
  const checkOut = externalCheckOut !== undefined ? externalCheckOut : internalCheckOut;

  const handleDateChange = (newIn: string, newOut: string) => {
    if (onDatesChange) {
      onDatesChange(newIn, newOut);
    } else {
      setInternalCheckIn(newIn);
      setInternalCheckOut(newOut);
    }
  };

  const [guests, setGuests] = useState<number>(4);
  const [hasPet, setHasPet] = useState<boolean>(false);

  // Calculate pricing dynamically based on seasonal and weekday/weekend rules
  const pricing = calculateStayPricing(checkIn, checkOut);

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '--/--/----';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const generateWhatsAppMessage = () => {
    let breakdownText = '';
    if (pricing.nightlyDetails.length > 0) {
      breakdownText = pricing.nightlyDetails
        .map((d) => `  • ${formatDateDisplay(d.dateStr)} (${d.dayOfWeek.slice(0, 3)}): R$ ${d.rate}`)
        .join('%0A');
    }

    const text = `🌊 Olá! Gostaria de consultar a disponibilidade da *${HOUSE_INFO.name}* para reserva:%0A%0A` +
      `📅 *Check-in:* ${formatDateDisplay(checkIn)}%0A` +
      `📅 *Check-out:* ${formatDateDisplay(checkOut)} (${pricing.nights} diária${pricing.nights > 1 ? 's' : ''})%0A` +
      `👥 *Hóspedes:* ${guests} pessoa${guests > 1 ? 's' : ''}${hasPet ? ' (com pet 🐾)' : ''}%0A%0A` +
      (breakdownText ? `💵 *Diárias calculadas:*%0A${breakdownText}%0A` : '') +
      `🧹 *Taxa de limpeza:* R$ ${pricing.cleaningFee}%0A` +
      `💰 *Estimativa total:* R$ ${pricing.total}%0A%0A` +
      `A casa está disponível nessas datas?`;
    return `https://wa.me/55${HOUSE_INFO.whatsappNumber}?text=${text}`;
  };

  const generateEmailSubject = () => {
    return encodeURIComponent(`Reserva Vênus Beach House - ${formatDateDisplay(checkIn)} a ${formatDateDisplay(checkOut)}`);
  };

  const generateEmailBody = () => {
    const body = `Olá!\n\nGostaria de solicitar reserva na Vênus Beach House:\n\n` +
      `- Check-in: ${formatDateDisplay(checkIn)}\n` +
      `- Check-out: ${formatDateDisplay(checkOut)} (${pricing.nights} noites)\n` +
      `- Quantidade de hóspedes: ${guests} pessoas\n` +
      `- Com pet: ${hasPet ? 'Sim' : 'Não'}\n` +
      `- Subtotal de diárias: R$ ${pricing.subtotal}\n` +
      `- Taxa única de limpeza: R$ ${pricing.cleaningFee}\n` +
      `- Valor estimado: R$ ${pricing.total}\n\n` +
      `Poderiam confirmar a disponibilidade e dados para prosseguir?\n\nObrigado!`;
    return encodeURIComponent(body);
  };

  const avgNightlyRate = pricing.nights > 0 ? Math.round(pricing.subtotal / pricing.nights) : 240;

  return (
    <>
      {/* Desktop Sticky Card */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-lg p-6 sticky top-28">
        <div className="flex items-baseline justify-between mb-3">
          <div>
            <span className="text-xs text-stone-500 font-medium block">a partir de</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-serif text-stone-900">
                R$ {avgNightlyRate}
              </span>
              <span className="text-xs text-stone-500 font-medium"> / noite</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-stone-800">
            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span>{HOUSE_INFO.rating.toFixed(2)}</span>
            <span className="text-stone-400 font-normal">·</span>
            <a href="#avaliacoes" className="text-stone-600 underline hover:text-amber-700">
              {HOUSE_INFO.reviewCount} avaliações
            </a>
          </div>
        </div>

        {/* Link to seasonal pricing and calendar */}
        <div className="flex items-center justify-between text-[11px] mb-3 text-amber-800 bg-amber-50/70 px-3 py-1.5 rounded-xl border border-amber-200/60">
          <span className="flex items-center gap-1 font-semibold">
            <Tag className="w-3.5 h-3.5 text-amber-600" />
            Diárias por Temporada
          </span>
          <a href="#valores" className="underline font-bold hover:text-amber-950">
            Ver tabela →
          </a>
        </div>

        {/* Date & Guest Inputs */}
        <div className="border border-stone-300 rounded-2xl overflow-hidden mb-3 divide-y divide-stone-200">
          <div className="grid grid-cols-2 divide-x divide-stone-200">
            <div className="p-2.5 bg-stone-50/40">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">
                Check-in
              </label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => handleDateChange(e.target.value, checkOut)}
                className="w-full text-xs font-semibold text-stone-900 bg-transparent border-0 p-0 focus:ring-0 focus:outline-hidden cursor-pointer"
              />
            </div>
            <div className="p-2.5 bg-stone-50/40">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">
                Check-out
              </label>
              <input
                type="date"
                value={checkOut}
                min={checkIn}
                onChange={(e) => handleDateChange(checkIn, e.target.value)}
                className="w-full text-xs font-semibold text-stone-900 bg-transparent border-0 p-0 focus:ring-0 focus:outline-hidden cursor-pointer"
              />
            </div>
          </div>

          <div className="p-2.5 bg-stone-50/40 flex items-center justify-between">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">
                Hóspedes
              </label>
              <select
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="text-xs font-semibold text-stone-900 bg-transparent border-0 p-0 focus:ring-0 focus:outline-hidden cursor-pointer"
              >
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <option key={num} value={num}>
                    {num} hóspede{num > 1 ? 's' : ''} {num === 6 ? '(máx)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-stone-700 select-none">
              <input
                type="checkbox"
                checked={hasPet}
                onChange={(e) => setHasPet(e.target.checked)}
                className="rounded text-amber-600 focus:ring-amber-500 w-3.5 h-3.5"
              />
              <span>Com Pet 🐾</span>
            </label>
          </div>
        </div>

        {/* View on visual calendar shortcut */}
        <a
          href="#reserva"
          className="w-full mb-3 py-1.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors"
        >
          <Calendar className="w-3.5 h-3.5 text-stone-500" />
          <span>Ver disponibilidade no Calendário Visual</span>
        </a>

        {/* WhatsApp Reservation Button */}
        <a
          href={generateWhatsAppMessage()}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white py-3 px-4 rounded-2xl font-bold text-sm transition-all shadow-sm hover:shadow-md active:scale-98"
        >
          <MessageCircle className="w-4 h-4 fill-white" />
          <span>Reservar pelo WhatsApp</span>
        </a>

        {/* Email button */}
        <a
          href={`mailto:${HOUSE_INFO.email}?subject=${generateEmailSubject()}&body=${generateEmailBody()}`}
          className="w-full mt-2 flex items-center justify-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-800 py-2.5 px-4 rounded-2xl font-semibold text-xs transition-colors"
        >
          <Mail className="w-4 h-4 text-stone-600" />
          <span>Solicitar reserva por E-mail</span>
        </a>

        <p className="text-center text-[11px] text-stone-500 mt-2">
          Você não será cobrado agora · Atendimento direto com a anfitriã
        </p>

        {/* Price Breakdown Calculation */}
        <div className="mt-4 pt-3 border-t border-stone-200/80 space-y-2 text-xs text-stone-600">
          <div className="flex justify-between">
            <span>
              Diárias ({pricing.nights} noite{pricing.nights > 1 ? 's' : ''})
            </span>
            <span className="text-stone-900 font-medium">R$ {pricing.subtotal}</span>
          </div>

          {pricing.nightlyDetails.length > 0 && (
            <div className="bg-stone-50 p-2 rounded-lg text-[10px] space-y-0.5 text-stone-500 border border-stone-100">
              {pricing.nightlyDetails.slice(0, 3).map((d, i) => (
                <div key={i} className="flex justify-between">
                  <span>{formatDateDisplay(d.dateStr)} ({d.label.split(' ')[0]})</span>
                  <span className="font-semibold text-stone-700">R$ {d.rate}</span>
                </div>
              ))}
              {pricing.nightlyDetails.length > 3 && (
                <div className="text-right text-stone-400">
                  +{pricing.nightlyDetails.length - 3} outra(s) diária(s)
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between">
            <span>Taxa única de limpeza</span>
            <span className="text-stone-900 font-medium">R$ {pricing.cleaningFee}</span>
          </div>
          <div className="pt-2 border-t border-stone-200 flex justify-between text-sm font-bold text-stone-900">
            <span>Total estimado</span>
            <span className="text-amber-800">R$ {pricing.total}</span>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-3 pt-3 border-t border-stone-100 flex items-center gap-2 text-[11px] text-emerald-700 bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200/60">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Aluguel direto: sem taxa de serviço de plataformas</span>
        </div>
      </div>

      {/* Mobile Fixed Bottom Floating Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-stone-200 p-3 px-4 flex items-center justify-between shadow-lg">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold font-serif text-stone-900">
              R$ {avgNightlyRate}
            </span>
            <span className="text-xs text-stone-500">/ noite</span>
          </div>
          <div className="text-[11px] text-stone-600 flex items-center gap-1">
            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
            <span className="font-semibold">{HOUSE_INFO.rating.toFixed(2)}</span>
            <span>·</span>
            <span>{pricing.nights} noites: R$ {pricing.total}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="#reserva"
            className="p-2.5 rounded-full bg-stone-100 text-stone-700 hover:bg-stone-200"
            aria-label="Ver calendário"
          >
            <Calendar className="w-4 h-4" />
          </a>
          <a
            href={generateWhatsAppMessage()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white px-4 py-2.5 rounded-full text-xs font-bold shadow-md active:scale-95"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Reservar</span>
          </a>
        </div>
      </div>
    </>
  );
};
