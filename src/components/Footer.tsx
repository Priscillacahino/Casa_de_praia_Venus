import React from 'react';
import { HOUSE_INFO } from '../data/houseData';
import { Instagram, MessageCircle, MapPin, Mail, Sparkles, Heart, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-14 pb-20 md:pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-12 border-b border-stone-800">
          {/* Brand & Cat Profile */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={HOUSE_INFO.catProfileImage}
                alt="Vênus Astronauta"
                className="w-12 h-12 rounded-full object-cover ring-2 ring-amber-400"
                referrerPolicy="no-referrer"
              />
              <div>
                <h4 className="font-serif font-bold text-lg text-white">Vênus Beach House</h4>
                <p className="text-xs text-amber-400 font-medium">Sua casa de praia no Conde - PB</p>
              </div>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Aqui você viverá momentos de alegria, confraternização e união. Um refúgio completo com piscina, churrasqueira, home office e pertinho do mar.
            </p>
            {/* Social Buttons */}
            <div className="flex items-center gap-2.5 pt-2">
              <a
                href={HOUSE_INFO.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram da Vênus Beach House"
                className="p-2.5 bg-stone-800 hover:bg-gradient-to-tr hover:from-amber-500 hover:to-pink-600 text-stone-200 hover:text-white rounded-xl transition-all"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={`https://wa.me/55${HOUSE_INFO.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp da Vênus Beach House"
                className="p-2.5 bg-stone-800 hover:bg-[#25D366] text-stone-200 hover:text-white rounded-xl transition-all"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href={HOUSE_INFO.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Localização no Google Maps"
                className="p-2.5 bg-stone-800 hover:bg-sky-600 text-stone-200 hover:text-white rounded-xl transition-all"
              >
                <MapPin className="w-4 h-4" />
              </a>
              <a
                href={`mailto:${HOUSE_INFO.email}`}
                aria-label="E-mail de contato"
                className="p-2.5 bg-stone-800 hover:bg-amber-600 text-stone-200 hover:text-white rounded-xl transition-all"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="text-sm font-bold text-white uppercase tracking-wider mb-3 font-mono">
              Navegação
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#inicio" className="hover:text-amber-400 transition-colors">
                  Início
                </a>
              </li>
              <li>
                <a href="#sobre" className="hover:text-amber-400 transition-colors">
                  A Casa
                </a>
              </li>
              <li>
                <a href="#comodos" className="hover:text-amber-400 transition-colors">
                  Cômodos & Estrutura
                </a>
              </li>
              <li>
                <a href="#praias" className="hover:text-amber-400 transition-colors">
                  Praias de Conde (Tabatinga, Coqueirinho...)
                </a>
              </li>
              <li>
                <a href="#comodidades" className="hover:text-amber-400 transition-colors">
                  Comodidades
                </a>
              </li>
              <li>
                <a href="#localizacao" className="hover:text-amber-400 transition-colors">
                  Google Maps & Rotas
                </a>
              </li>
              <li>
                <a href="#contato" className="hover:text-amber-400 transition-colors">
                  Fale Conosco
                </a>
              </li>
            </ul>
          </div>

          {/* Regras e Informações da Casa */}
          <div>
            <h5 className="text-sm font-bold text-white uppercase tracking-wider mb-3 font-mono">
              Regras da Casa
            </h5>
            <ul className="space-y-2 text-xs text-stone-400">
              <li className="flex items-center gap-1.5">
                <span className="text-amber-400">🕒</span> Check-in a partir das 14:00
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-amber-400">🕚</span> Check-out até às 11:00
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-amber-400">🐾</span> Animais de estimação permitidos
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-amber-400">🚗</span> Garagem privativa para 1 carro
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-amber-400">🔇</span> Lei do silêncio após as 22h
              </li>
            </ul>
          </div>

          {/* Contato Direto */}
          <div>
            <h5 className="text-sm font-bold text-white uppercase tracking-wider mb-3 font-mono">
              Fale com a Vênus
            </h5>
            <div className="space-y-2.5 text-xs text-stone-400">
              <p>
                <strong className="text-white">WhatsApp:</strong>{' '}
                <a
                  href={`https://wa.me/55${HOUSE_INFO.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400 hover:underline"
                >
                  {HOUSE_INFO.whatsappDisplay}
                </a>
              </p>
              <p>
                <strong className="text-white">E-mail:</strong>{' '}
                <a
                  href={`mailto:${HOUSE_INFO.email}`}
                  className="text-amber-400 hover:underline break-all"
                >
                  {HOUSE_INFO.email}
                </a>
              </p>
              <p>
                <strong className="text-white">Instagram:</strong>{' '}
                <a
                  href={HOUSE_INFO.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400 hover:underline"
                >
                  {HOUSE_INFO.instagramHandle}
                </a>
              </p>
              <p>
                <strong className="text-white">Local:</strong> Conde, Litoral Sul - PB
              </p>
            </div>
          </div>
        </div>

        {/* Bottom legal & tribute */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} Vênus Beach House. Todos os direitos reservados.</p>
          <div className="flex items-center gap-1 text-stone-400">
            <span>Feito com carinho para suas melhores férias no Conde</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </div>
        </div>
      </div>
    </footer>
  );
};
