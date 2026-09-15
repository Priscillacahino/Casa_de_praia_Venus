import React from 'react';
import { MessageCircle, MapPin, Sparkles, Compass, Home, Phone } from 'lucide-react';
import { HOUSE_INFO } from '../data/houseData';

interface HeaderProps {
  onOpenGallery: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenGallery }) => {
  const whatsappUrl = `https://wa.me/55${HOUSE_INFO.whatsappNumber}?text=Ol%C3%A1!%20Encontrei%20a%20V%C3%AAnus%20Beach%20House%20e%20gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20disponibilidade%20e%20reservas.`;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 transition-all shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand & Cat Profile */}
        <a href="#inicio" className="flex items-center gap-3 group">
          <div className="relative">
            <img
              src={HOUSE_INFO.catProfileImage}
              alt="Vênus - Mascote e Anfitriã Oficial"
              className="w-12 h-12 rounded-full object-cover ring-2 ring-amber-400 ring-offset-2 transition-transform group-hover:scale-105 shadow-sm"
              referrerPolicy="no-referrer"
            />
            <span className="absolute -bottom-1 -right-1 bg-amber-500 text-white rounded-full p-1 shadow-xs">
              <Sparkles className="w-2.5 h-2.5" />
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif font-bold text-xl tracking-tight text-stone-900 group-hover:text-amber-700 transition-colors">
                Vênus
              </span>
              <span className="text-xs uppercase tracking-widest font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                Beach House
              </span>
            </div>
            <p className="text-xs text-stone-500 flex items-center gap-1 font-medium">
              <MapPin className="w-3 h-3 text-amber-600" />
              Conde · Litoral Sul da Paraíba
            </p>
          </div>
        </a>

        {/* Navigation Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1">
          <a
            href="#sobre"
            className="px-3 py-1.5 rounded-full text-xs font-medium text-stone-700 hover:text-stone-950 hover:bg-stone-100 transition-colors"
          >
            A Casa
          </a>
          <a
            href="#comodos"
            className="px-3 py-1.5 rounded-full text-xs font-medium text-stone-700 hover:text-stone-950 hover:bg-stone-100 transition-colors"
          >
            Cômodos
          </a>
          <a
            href="#praias"
            className="px-3 py-1.5 rounded-full text-xs font-medium text-stone-700 hover:text-stone-950 hover:bg-stone-100 transition-colors"
          >
            Praias
          </a>
          <a
            href="#valores"
            className="px-3 py-1.5 rounded-full text-xs font-medium text-amber-800 hover:text-amber-950 hover:bg-amber-50 transition-colors font-semibold"
          >
            Tarifas
          </a>
          <a
            href="#reserva"
            className="px-3 py-1.5 rounded-full text-xs font-medium text-stone-700 hover:text-stone-950 hover:bg-stone-100 transition-colors"
          >
            Calendário
          </a>
          <a
            href="#avaliacoes"
            className="px-3 py-1.5 rounded-full text-xs font-medium text-stone-700 hover:text-stone-950 hover:bg-stone-100 transition-colors"
          >
            Avaliações
          </a>
          <a
            href="#contato"
            className="px-3 py-1.5 rounded-full text-xs font-medium text-stone-700 hover:text-stone-950 hover:bg-stone-100 transition-colors"
          >
            Contato
          </a>
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenGallery}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-stone-700 hover:text-stone-900 border border-stone-300 rounded-full hover:bg-stone-50 transition-colors"
          >
            <Compass className="w-3.5 h-3.5 text-stone-500" />
            Galeria
          </button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white px-4 py-2.5 rounded-full text-sm font-semibold transition-all shadow-sm hover:shadow-md active:scale-95"
            aria-label="Falar no WhatsApp com a Vênus Beach House"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span className="hidden sm:inline">Falar no WhatsApp</span>
            <span className="sm:hidden">WhatsApp</span>
          </a>
        </div>
      </div>
    </header>
  );
};
