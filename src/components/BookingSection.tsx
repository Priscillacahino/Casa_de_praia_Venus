import React, { useState } from 'react';
import { Calendar, Users, MessageCircle, Mail, ShieldCheck, Sparkles, Check, ChevronRight, AlertCircle, Info, Heart } from 'lucide-react';
import { BookingCalendar } from './BookingCalendar';
import { HOUSE_INFO, calculateStayPricing } from '../data/houseData';

interface BookingSectionProps {
  checkIn: string;
  checkOut: string;
  onDatesChange: (checkIn: string, checkOut: string) => void;
}

export const BookingSection: React.FC<BookingSectionProps> = ({
  checkIn,
  checkOut,
  onDatesChange,
}) => {
  const [guests, setGuests] = useState<number>(4);
  const [hasPet, setHasPet] = useState<boolean>(false);
  const [guestName, setGuestName] = useState<string>('');
  const [guestEmail, setGuestEmail] = useState<string>('');
  const [guestPhone, setGuestPhone] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  
  const [showRequestModal, setShowRequestModal] = useState<boolean>(false);
  const [submittedSuccess, setSubmittedSuccess] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');

  const pricing = calculateStayPricing(checkIn, checkOut);

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '--/--/----';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  const generateWhatsAppUrl = () => {
    let breakdownText = '';
    if (pricing.nightlyDetails.length > 0) {
      breakdownText = pricing.nightlyDetails
        .map((d) => `  • ${formatDateDisplay(d.dateStr)} (${d.dayOfWeek}): R$ ${d.rate}`)
        .join('%0A');
    }

    const text = `🌊 *Pedido de Reserva - ${HOUSE_INFO.name}*%0A%0A` +
      `👤 *Hóspede:* ${guestName || 'A definir'}%0A` +
      `📞 *Contato:* ${guestPhone || 'Não informado'} | ${guestEmail || ''}%0A` +
      `📅 *Check-in:* ${formatDateDisplay(checkIn)} (a partir das 14h)%0A` +
      `📅 *Check-out:* ${formatDateDisplay(checkOut)} (até às 11h)%0A` +
      `🌙 *Total de noites:* ${pricing.nights} noites%0A` +
      `👥 *Hóspedes:* ${guests} pessoa${guests > 1 ? 's' : ''}${hasPet ? ' (com pet 🐾)' : ''}%0A%0A` +
      (breakdownText ? `💵 *Diárias detalhadas:*%0A${breakdownText}%0A%0A` : '') +
      `🧹 *Taxa única de limpeza:* R$ ${pricing.cleaningFee}%0A` +
      `💰 *Total Geral:* R$ ${pricing.total}%0A%0A` +
      (notes ? `📝 *Observações:* ${encodeURIComponent(notes)}%0A%0A` : '') +
      `Olá! Gostaria de verificar a disponibilidade e os dados para formalizar a reserva!`;

    return `https://wa.me/55${HOUSE_INFO.whatsappNumber}?text=${text}`;
  };

  const generateEmailHref = () => {
    const subject = encodeURIComponent(`Pedido de Reserva Vênus Beach House - ${formatDateDisplay(checkIn)} a ${formatDateDisplay(checkOut)}`);
    const body = `Olá!\n\nGostaria de solicitar a reserva da Vênus Beach House:\n\n` +
      `- Hóspede: ${guestName}\n` +
      `- E-mail: ${guestEmail}\n` +
      `- Telefone/WhatsApp: ${guestPhone}\n` +
      `- Check-in: ${formatDateDisplay(checkIn)}\n` +
      `- Check-out: ${formatDateDisplay(checkOut)} (${pricing.nights} noites)\n` +
      `- Quantidade de hóspedes: ${guests} pessoas\n` +
      `- Com animal de estimação: ${hasPet ? 'Sim' : 'Não'}\n` +
      `- Subtotal de diárias: R$ ${pricing.subtotal}\n` +
      `- Taxa única de limpeza: R$ ${pricing.cleaningFee}\n` +
      `- Valor total estimado: R$ ${pricing.total}\n\n` +
      (notes ? `Observações:\n${notes}\n\n` : '') +
      `Aguardo retorno com as orientações de pagamento do sinal (50%) e confirmação.\n\nObrigado!`;
    return `mailto:${HOUSE_INFO.email}?subject=${subject}&body=${encodeURIComponent(body)}`;
  };

  const handleOpenSubmitModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkIn || !checkOut || pricing.nights === 0) {
      setFormError('Por favor, selecione as datas de check-in e check-out no calendário.');
      return;
    }
    setFormError('');
    setShowRequestModal(true);
  };

  const handleFinalSubmit = (channel: 'whatsapp' | 'email') => {
    if (!guestName.trim()) {
      setFormError('Por favor, informe seu nome completo.');
      return;
    }
    if (!guestEmail.trim() || !guestEmail.includes('@')) {
      setFormError('Por favor, informe um e-mail válido.');
      return;
    }
    if (!guestPhone.trim()) {
      setFormError('Por favor, informe um número de telefone/WhatsApp.');
      return;
    }

    setSubmittedSuccess(true);

    if (channel === 'whatsapp') {
      window.open(generateWhatsAppUrl(), '_blank');
    } else {
      window.location.href = generateEmailHref();
    }
  };

  return (
    <section id="reserva" className="py-12 border-t border-stone-200 scroll-mt-20">
      <div className="mb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-amber-700 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-amber-600" />
          Sistema de Reservas Diretas
        </span>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-1">
          Reserve sua estadia na Vênus Beach House
        </h2>
        <p className="text-sm text-stone-600 mt-1 max-w-2xl">
          Consulte as datas disponíveis no calendário visual abaixo, selecione seu período e envie seu pedido de reserva direto para a anfitriã, com cálculo transparente das tarifas da época.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Visual Interactive Calendar (Left 7 cols) */}
        <div className="lg:col-span-7">
          <BookingCalendar
            checkIn={checkIn}
            checkOut={checkOut}
            onSelectDates={onDatesChange}
          />
        </div>

        {/* Selected Period & Real-time Seasonal Calculation (Right 5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-stone-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Resumo da Reserva
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/70">
                Tarifa Direta sem Taxa de App
              </span>
            </div>

            {/* Dates chosen */}
            <div className="grid grid-cols-2 gap-3 my-4">
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/70">
                <span className="text-[10px] uppercase font-bold text-stone-500 block">
                  Check-in
                </span>
                <span className="text-sm font-bold text-stone-900 mt-0.5 block">
                  {formatDateDisplay(checkIn)}
                </span>
                <span className="text-[10px] text-stone-500">A partir das 14h</span>
              </div>

              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/70">
                <span className="text-[10px] uppercase font-bold text-stone-500 block">
                  Check-out
                </span>
                <span className="text-sm font-bold text-stone-900 mt-0.5 block">
                  {formatDateDisplay(checkOut)}
                </span>
                <span className="text-[10px] text-stone-500">Até às 11h</span>
              </div>
            </div>

            {/* Guests & Pet options */}
            <div className="space-y-3 mb-5">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-50/70 border border-stone-200/60 text-xs">
                <span className="font-semibold text-stone-700 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-amber-600" />
                  Quantidade de Hóspedes:
                </span>
                <select
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="font-bold text-stone-900 bg-white border border-stone-300 rounded-lg px-2 py-1 text-xs focus:ring-amber-500"
                >
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>
                      {n} pessoa{n > 1 ? 's' : ''} {n === 6 ? '(máx)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <label className="flex items-center justify-between p-3 rounded-2xl bg-stone-50/70 border border-stone-200/60 text-xs cursor-pointer select-none">
                <span className="font-semibold text-stone-700 flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-rose-500" />
                  Levar animal de estimação (Pet):
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-bold">
                    Grátis
                  </span>
                  <input
                    type="checkbox"
                    checked={hasPet}
                    onChange={(e) => setHasPet(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                  />
                </div>
              </label>
            </div>

            {/* Error message if dates not chosen */}
            {formError && (
              <div className="mb-4 p-3 bg-rose-50 text-rose-800 rounded-xl text-xs flex items-center gap-2 border border-rose-200">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Live Pricing Breakdown */}
            {pricing.nights > 0 ? (
              <div className="space-y-2 text-xs border-t border-stone-100 pt-3">
                <div className="flex items-center justify-between text-stone-600">
                  <span>
                    Diárias calculadas ({pricing.nights} noite{pricing.nights > 1 ? 's' : ''})
                  </span>
                  <span className="font-semibold text-stone-900">R$ {pricing.subtotal}</span>
                </div>

                {/* Nightly preview accordion / list */}
                <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/60 max-h-32 overflow-y-auto space-y-1 text-[11px]">
                  {pricing.nightlyDetails.map((detail, idx) => (
                    <div key={idx} className="flex justify-between items-center text-stone-600">
                      <span>
                        {formatDateDisplay(detail.dateStr)} ({detail.dayOfWeek.slice(0, 3)}) - {detail.label}
                      </span>
                      <span className="font-bold text-stone-800">R$ {detail.rate}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-stone-600">
                  <span>Taxa única de limpeza e higienização</span>
                  <span className="font-semibold text-stone-900">R$ {pricing.cleaningFee}</span>
                </div>

                <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-base font-bold text-stone-900">
                  <span>Total estimado da estadia</span>
                  <span className="text-xl font-serif text-amber-800">R$ {pricing.total}</span>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/60 text-center text-xs text-amber-900">
                <p className="font-semibold">Selecione as datas no calendário</p>
                <p className="text-[11px] text-amber-800/80 mt-1">
                  O valor total será calculado automaticamente conforme a temporada e dias da semana.
                </p>
              </div>
            )}
          </div>

          {/* Action button */}
          <div className="mt-5 pt-4 border-t border-stone-100">
            <button
              type="button"
              onClick={handleOpenSubmitModal}
              disabled={pricing.nights === 0}
              className="w-full flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 disabled:cursor-not-allowed text-white py-3 px-4 rounded-xl font-bold text-sm transition-all shadow-xs active:scale-98"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Solicitar Reserva deste Período</span>
            </button>
            <p className="text-center text-[10px] text-stone-400 mt-2">
              Você revisará os dados antes do envio · Sem cobrança imediata
            </p>
          </div>
        </div>
      </div>

      {/* Booking Details Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 animate-in fade-in duration-150 max-h-[90vh] overflow-y-auto">
            {!submittedSuccess ? (
              <>
                <div className="flex items-center justify-between pb-4 border-b border-stone-200">
                  <div>
                    <h3 className="text-xl font-serif font-bold text-stone-900">
                      Finalizar Pedido de Reserva
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Vênus Beach House · Conde - PB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowRequestModal(false)}
                    className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500"
                  >
                    ✕
                  </button>
                </div>

                {/* Stay Summary badge */}
                <div className="my-4 p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs space-y-1 text-amber-950">
                  <div className="flex justify-between font-bold">
                    <span>{formatDateDisplay(checkIn)} até {formatDateDisplay(checkOut)}</span>
                    <span>{pricing.nights} noites</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>{guests} hóspedes {hasPet ? '· Com Pet 🐾' : ''}</span>
                    <span className="font-bold text-amber-900">Total: R$ {pricing.total}</span>
                  </div>
                </div>

                {formError && (
                  <div className="mb-4 p-3 bg-rose-50 text-rose-800 rounded-xl text-xs flex items-center gap-2 border border-rose-200">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Form Inputs */}
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Seu Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Ex: Ana Maria Silveira"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                        Seu E-mail *
                      </label>
                      <input
                        type="email"
                        required
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        placeholder="seu@email.com"
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                        WhatsApp / Celular *
                      </label>
                      <input
                        type="tel"
                        required
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        placeholder="(83) 99999-9999"
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Observações ou Solicitações Especiais
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Ex: Horário previsto de chegada, berço ou dúvidas adicionais..."
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-stone-200 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => handleFinalSubmit('whatsapp')}
                    className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white py-3 px-4 rounded-xl font-bold text-sm transition-all shadow-xs active:scale-98"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>Enviar Pedido via WhatsApp Oficial</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFinalSubmit('email')}
                    className="w-full flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-800 text-white py-2.5 px-4 rounded-xl font-semibold text-xs transition-all active:scale-98"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Enviar Pedido por E-mail</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-xs">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-serif font-bold text-stone-900">
                  Pedido Encaminhado com Sucesso!
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed max-w-sm mx-auto">
                  A mensagem foi formatada e aberta no seu canal escolhido. Entraremos em contato para confirmar a reserva e passar as orientações para o sinal.
                </p>
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs text-left space-y-1">
                  <p><strong>Hóspede:</strong> {guestName}</p>
                  <p><strong>Período:</strong> {formatDateDisplay(checkIn)} a {formatDateDisplay(checkOut)} ({pricing.nights} noites)</p>
                  <p><strong>Total Estimado:</strong> R$ {pricing.total}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowRequestModal(false);
                    setSubmittedSuccess(false);
                  }}
                  className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-semibold text-xs"
                >
                  Concluir e Fechar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
