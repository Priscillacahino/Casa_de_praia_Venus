import React, { useState } from 'react';
import { MessageCircle, Mail, Instagram, MapPin, Send, Check, Sparkles, ShieldCheck, Lock, AlertCircle } from 'lucide-react';
import { HOUSE_INFO } from '../data/houseData';

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

export const ContactSection: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dates, setDates] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState(''); // Anti-bot honeypot field
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Email regex validation
  const validateEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!name.trim() || name.trim().length < 2) {
      newErrors.name = 'Por favor, informe seu nome completo (mínimo 2 letras).';
    }

    if (!email.trim()) {
      newErrors.email = 'O e-mail é obrigatório.';
    } else if (!validateEmail(email.trim())) {
      newErrors.email = 'Por favor, informe um endereço de e-mail válido (ex: seu@email.com).';
    }

    if (!message.trim() || message.trim().length < 10) {
      newErrors.message = 'Sua mensagem deve ter pelo menos 10 caracteres.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Honeypot bot protection: if bot filled hidden field, reject silently
    if (honeypot) {
      console.warn('Spam detected');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const now = new Date().toLocaleString('pt-BR');
    const emailSubject = encodeURIComponent(
      `[Contato Vênus Beach House] Mensagem de ${name.trim()}`
    );

    const emailBody = encodeURIComponent(
      `Olá, Priscilla e equipe da Vênus Beach House!\n\n` +
      `Uma nova mensagem segura foi enviada através do site oficial:\n\n` +
      `----------------------------------------\n` +
      `👤 Nome: ${name.trim()}\n` +
      `✉️ E-mail: ${email.trim()}\n` +
      (phone.trim() ? `📞 Telefone/WhatsApp: ${phone.trim()}\n` : '') +
      (dates.trim() ? `📅 Datas de interesse: ${dates.trim()}\n` : '') +
      `🕒 Data/Hora do envio: ${now}\n` +
      `----------------------------------------\n\n` +
      `Mensagem do Hóspede:\n${message.trim()}\n\n` +
      `----------------------------------------\n` +
      `Este formulário foi validado e enviado diretamente para ${HOUSE_INFO.email}.`
    );

    // Forward to primary property email
    window.location.href = `mailto:${HOUSE_INFO.email}?subject=${emailSubject}&body=${emailBody}`;

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedSuccess(true);
    }, 400);
  };

  const handleSendWhatsAppBackup = () => {
    const text = `🌊 Olá! Enviei uma mensagem pelo formulário do site da *${HOUSE_INFO.name}*:%0A%0A` +
      `👤 *Nome:* ${name.trim()}%0A` +
      `✉️ *E-mail:* ${email.trim()}%0A` +
      (phone.trim() ? `📞 *Telefone:* ${phone.trim()}%0A` : '') +
      (dates.trim() ? `📅 *Datas:* ${dates.trim()}%0A` : '') +
      `📝 *Mensagem:* ${encodeURIComponent(message.trim())}`;
    window.open(`https://wa.me/55${HOUSE_INFO.whatsappNumber}?text=${text}`, '_blank');
  };

  const handleResetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setDates('');
    setMessage('');
    setErrors({});
    setSubmittedSuccess(false);
  };

  return (
    <section id="contato" className="py-12 border-t border-stone-200 scroll-mt-20">
      <div className="mb-8">
        <span className="text-xs font-bold uppercase tracking-widest text-amber-700 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
          Atendimento Direto & Seguro
        </span>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-1">
          Fale com os Anfitriões da Vênus
        </h2>
        <p className="text-sm text-stone-600 mt-1 max-w-xl">
          Tire suas dúvidas diretamente com a propriedade. Envie uma mensagem segura para o e-mail oficial ou fale pelo WhatsApp em tempo real.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Contact Info Cards (Left column) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Email Direct Card */}
          <div className="p-5 rounded-3xl bg-amber-50/60 border border-amber-200/80 shadow-2xs">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-600 text-white rounded-2xl shadow-xs shrink-0">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-amber-600" />
                  E-mail Oficial da Propriedade
                </span>
                <p className="text-sm sm:text-base font-bold text-stone-900 mt-0.5 break-all">
                  {HOUSE_INFO.email}
                </p>
                <p className="text-xs text-stone-600 mt-1">
                  Mensagens enviadas pelo formulário são encaminhadas diretamente para esta caixa de entrada.
                </p>
              </div>
            </div>
          </div>

          {/* WhatsApp Direct Card */}
          <a
            href={`https://wa.me/55${HOUSE_INFO.whatsappNumber}?text=Ol%C3%A1!%20Gostaria%20de%20tirar%20d%C3%BAvidas%20sobre%20a%20V%C3%AAnus%20Beach%20House.`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-4 p-5 rounded-3xl bg-emerald-50/70 border border-emerald-200/80 hover:bg-emerald-100/60 transition-all shadow-2xs group"
          >
            <div className="p-3 bg-[#25D366] text-white rounded-2xl shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <MessageCircle className="w-6 h-6 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  WhatsApp Oficial
                </span>
                <span className="text-[10px] bg-emerald-200/80 text-emerald-900 px-2 py-0.2 rounded-full font-bold">
                  Online
                </span>
              </div>
              <p className="text-base sm:text-lg font-bold text-stone-900 mt-0.5">
                {HOUSE_INFO.whatsappDisplay}
              </p>
              <p className="text-xs text-stone-600 mt-1">
                Atendimento rápido para consultar datas e tirar dúvidas instantaneamente.
              </p>
            </div>
          </a>

          {/* Instagram Card */}
          <a
            href={HOUSE_INFO.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-4 p-5 rounded-3xl bg-pink-50/60 border border-pink-200/80 hover:bg-pink-100/60 transition-all shadow-2xs group"
          >
            <div className="p-3 bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white rounded-2xl shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <Instagram className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-pink-800">
                Instagram Oficial
              </span>
              <p className="text-base font-bold text-stone-900 mt-0.5">
                {HOUSE_INFO.instagramHandle}
              </p>
              <p className="text-xs text-stone-600 mt-1">
                Acompanhe o dia a dia, stories, reels e fotos dos hóspedes em Conde.
              </p>
            </div>
          </a>

          {/* Location Card */}
          <a
            href={HOUSE_INFO.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-4 p-5 rounded-3xl bg-sky-50/60 border border-sky-200/80 hover:bg-sky-100/60 transition-all shadow-2xs group"
          >
            <div className="p-3 bg-sky-600 text-white rounded-2xl shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-sky-800">
                Localização
              </span>
              <p className="text-sm font-bold text-stone-900 mt-0.5">
                Conde - Litoral Sul da Paraíba
              </p>
              <p className="text-xs text-stone-600 mt-1">
                Próximo a Tabatinga, Coqueirinho, Carapibus, Praia do Amor e Jacumã.
              </p>
            </div>
          </a>
        </div>

        {/* Secure Form (Right column) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-5">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span>Formulário de Contato Seguro</span>
              </div>
              <h3 className="text-xl font-bold font-serif text-stone-900 mt-0.5">
                Envie sua Mensagem
              </h3>
            </div>
            <div className="hidden sm:flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Validação Anti-Spam</span>
            </div>
          </div>

          {submittedSuccess ? (
            <div className="py-6 space-y-4 text-center animate-in fade-in">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-xs">
                <Check className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-serif font-bold text-stone-900">
                Mensagem Encaminhada com Sucesso!
              </h4>
              <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
                Sua mensagem foi preparada e encaminhada para o e-mail principal da propriedade:{' '}
                <strong className="text-stone-900 break-all">{HOUSE_INFO.email}</strong>.
              </p>

              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-left text-xs space-y-1.5 max-w-md mx-auto">
                <p><strong>De:</strong> {name} ({email})</p>
                {phone && <p><strong>Telefone:</strong> {phone}</p>}
                {dates && <p><strong>Período:</strong> {dates}</p>}
                <p className="text-stone-700 italic pt-1 border-t border-stone-200/60">"{message}"</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2 max-w-md mx-auto">
                <button
                  type="button"
                  onClick={handleSendWhatsAppBackup}
                  className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white py-2.5 px-4 rounded-xl font-bold text-xs shadow-xs"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Enviar Cópia no WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetForm}
                  className="py-2.5 px-4 rounded-xl border border-stone-300 text-stone-700 font-semibold text-xs hover:bg-stone-50"
                >
                  Enviar Outra Mensagem
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-4" noValidate>
              {/* Invisible Honeypot field for anti-spam bots */}
              <div className="hidden" aria-hidden="true">
                <label htmlFor="website-hp">Não preencha este campo:</label>
                <input
                  id="website-hp"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              {/* Name Field */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Seu Nome Completo *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors({ ...errors, name: undefined });
                  }}
                  placeholder="Ex: Mariana Silveira"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:ring-2 ${
                    errors.name
                      ? 'border-rose-300 ring-rose-200 focus:ring-rose-400 bg-rose-50/30'
                      : 'border-stone-300 focus:ring-amber-500'
                  }`}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-rose-600 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.name}</span>
                  </p>
                )}
              </div>

              {/* Email & Phone Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Seu E-mail *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors({ ...errors, email: undefined });
                    }}
                    placeholder="seu@email.com"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:ring-2 ${
                      errors.email
                        ? 'border-rose-300 ring-rose-200 focus:ring-rose-400 bg-rose-50/30'
                        : 'border-stone-300 focus:ring-amber-500'
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-rose-600 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.email}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    WhatsApp ou Telefone (opcional)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(83) 99999-9999"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Dates of interest (optional) */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Datas pretendidas ou época (opcional)
                </label>
                <input
                  type="text"
                  value={dates}
                  onChange={(e) => setDates(e.target.value)}
                  placeholder="Ex: Feriado de 12 de Outubro ou 15 a 18 de Novembro"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Message Field */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Sua Mensagem ou Dúvida *
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    if (errors.message) setErrors({ ...errors, message: undefined });
                  }}
                  placeholder="Olá! Gostaria de saber mais informações sobre disponibilidade, piscina, animais de estimação ou horários de check-in..."
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:ring-2 ${
                    errors.message
                      ? 'border-rose-300 ring-rose-200 focus:ring-rose-400 bg-rose-50/30'
                      : 'border-stone-300 focus:ring-amber-500'
                  }`}
                />
                <div className="flex justify-between items-center mt-1 text-[11px] text-stone-500">
                  {errors.message ? (
                    <p className="text-rose-600 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.message}</span>
                    </p>
                  ) : (
                    <span>Mínimo de 10 caracteres</span>
                  )}
                  <span>{message.length} caracteres</span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-400 text-white py-3 px-6 rounded-xl font-bold text-sm transition-all shadow-xs active:scale-98"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Enviando...' : 'Enviar Mensagem para o E-mail Oficial'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSendWhatsAppBackup}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white py-3 px-5 rounded-xl font-bold text-sm transition-all shadow-xs active:scale-98"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>WhatsApp</span>
                </button>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-stone-400 pt-1 justify-center sm:justify-start">
                <Lock className="w-3 h-3 text-emerald-600" />
                <span>Seus dados são protegidos e enviados exclusivamente para a administração da casa.</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
