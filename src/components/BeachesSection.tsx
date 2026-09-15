import React from 'react';
import { BEACHES_DATA, OTHER_NEARBY_BEACHES } from '../data/houseData';
import { MapPin, Navigation, Compass, Sparkles, Waves } from 'lucide-react';
import { SmartImage } from './SmartImage';

export const BeachesSection: React.FC = () => {
  return (
    <section id="praias" className="py-10 border-t border-stone-200 scroll-mt-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-700">
            Litoral Sul da Paraíba · Conde
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-1">
            Praias paradisíacas ao seu redor
          </h2>
          <p className="text-sm text-stone-600 mt-1 max-w-2xl">
            A Vênus Beach House está cercada pelos cenários mais deslumbrantes do Nordeste. Em poucos minutos de carro, você chega a falésias multicoloridas, piscinas naturais e mar de águas mornas.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-50 text-amber-900 border border-amber-200/80 rounded-full text-xs font-semibold self-start">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          A poucos minutos de carro da casa
        </div>
      </div>

      {/* Featured Beach Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {BEACHES_DATA.map((beach) => (
          <div
            key={beach.id}
            className="group flex flex-col bg-white rounded-3xl border border-stone-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300"
          >
            {/* Beach Photo */}
            <div className="relative aspect-16/10 overflow-hidden bg-stone-100">
              <SmartImage
                src={beach.image}
                fallbackSources={beach.fallbackSources}
                alt={beach.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
              />
              <div className="absolute top-3 right-3 bg-stone-900/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xs">
                <Navigation className="w-3 h-3 text-amber-400" />
                <span>{beach.distance}</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold font-serif text-stone-900 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{beach.name}</span>
                </h3>

                <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
                  {beach.description}
                </p>

                {/* Highlights tags */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {beach.highlights.map((h, i) => (
                    <span
                      key={i}
                      className="text-[11px] font-medium bg-stone-100 text-stone-700 px-2.5 py-1 rounded-lg"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 text-xs text-amber-800 font-semibold flex items-center justify-between">
                <span>Conde · Paraíba</span>
                <a
                  href="#localizacao"
                  className="group-hover:translate-x-1 transition-transform inline-flex items-center gap-1"
                >
                  Ver no mapa →
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Other nearby beaches list */}
      <div className="mt-6 p-5 rounded-3xl bg-white border border-stone-200/80 shadow-xs">
        <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2 mb-3">
          <Waves className="w-4 h-4 text-amber-600" />
          Outras Praias e Pontos Famosos de Conde a Poucos Minutos:
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {OTHER_NEARBY_BEACHES.map((item, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-stone-50 border border-stone-100 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="font-bold text-xs text-stone-900">{item.name}</span>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                    {item.distance}
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-xs sm:text-sm text-amber-950 font-medium">
          Dica da anfitriã Vênus: Visite Tabatinga e Coqueirinho na maré baixa para desfrutar das piscinas naturais mornas!
        </p>
        <a
          href="#localizacao"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold transition-colors shrink-0 shadow-2xs"
        >
          <Compass className="w-3.5 h-3.5" />
          Como Chegar
        </a>
      </div>
    </section>
  );
};
