import React from 'react';
import { MapPin, Navigation2, ExternalLink, Compass, Car, Plane, Info } from 'lucide-react';
import { HOUSE_INFO } from '../data/houseData';

export const MapSection: React.FC = () => {
  return (
    <section id="localizacao" className="py-10 border-t border-stone-200 scroll-mt-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-700">
            Localização Exata
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-1">
            Onde você estará
          </h2>
          <p className="text-sm text-stone-600 mt-1">
            Conde, Litoral Sul da Paraíba. Tranquilidade para relaxar com acesso rápido a todas as praias e comércios de Jacumã.
          </p>
        </div>

        <a
          href={HOUSE_INFO.googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs self-start active:scale-95"
        >
          <ExternalLink className="w-4 h-4 text-amber-400" />
          <span>Abrir no Google Maps</span>
        </a>
      </div>

      {/* Google Maps Embed Space */}
      <div className="relative rounded-3xl overflow-hidden border border-stone-200/90 shadow-sm bg-stone-100">
        <div className="w-full h-[380px] sm:h-[440px] relative">
          <iframe
            title="Localização Vênus Beach House no Google Maps"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3958.058345719332!2d-34.8398453!3d-7.2343806!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x7acc21f9644e5d7%3A0x6b8bcbf7d40409a8!2sConde%2C%20PB!5e0!3m2!1spt-BR!2sbr!4v1710500000000!5m2!1spt-BR!2sbr"
            className="w-full h-full border-0"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />

          {/* Overlay Card for Airbnb look */}
          <div className="absolute top-4 left-4 right-4 sm:right-auto sm:max-w-xs bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-stone-200/90 shadow-md">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 text-amber-800 rounded-xl shrink-0 mt-0.5">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-900">Vênus Beach House</h4>
                <p className="text-xs text-stone-600 mt-0.5">
                  Conde, Litoral Sul - PB, Brasil
                </p>
                <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    Bairro calmo & seguro
                  </span>
                  <a
                    href={HOUSE_INFO.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-bold text-amber-700 hover:underline"
                  >
                    Rotas GPS →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Proximidades e distâncias estimadas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
        <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/60">
          <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium mb-1">
            <Car className="w-3.5 h-3.5 text-amber-600" />
            <span>Praia de Carapibus</span>
          </div>
          <p className="text-sm font-bold text-stone-900">3 a 5 min</p>
        </div>

        <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/60">
          <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium mb-1">
            <Car className="w-3.5 h-3.5 text-amber-600" />
            <span>Praia de Tabatinga</span>
          </div>
          <p className="text-sm font-bold text-stone-900">5 a 7 min</p>
        </div>

        <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/60">
          <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium mb-1">
            <Car className="w-3.5 h-3.5 text-amber-600" />
            <span>Praia de Coqueirinho</span>
          </div>
          <p className="text-sm font-bold text-stone-900">8 a 10 min</p>
        </div>

        <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/60">
          <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium mb-1">
            <Plane className="w-3.5 h-3.5 text-amber-600" />
            <span>Aeroporto JPA (Castro Pinto)</span>
          </div>
          <p className="text-sm font-bold text-stone-900">~35 a 40 min</p>
        </div>
      </div>
    </section>
  );
};
