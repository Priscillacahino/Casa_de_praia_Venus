import React, { useState } from 'react';
import { ROOMS_DATA } from '../data/houseData';
import { Bed, Wind, CheckCircle2, ChevronRight, Eye } from 'lucide-react';
import { RoomItem } from '../types';
import { SmartImage } from './SmartImage';

interface RoomsSectionProps {
  onOpenGalleryWithPhoto?: (photoUrl: string) => void;
}

export const RoomsSection: React.FC<RoomsSectionProps> = ({ onOpenGalleryWithPhoto }) => {
  const [activeFilter, setActiveFilter] = useState<'todos' | 'quarto' | 'externo' | 'social'>('todos');

  const filteredRooms = activeFilter === 'todos' 
    ? ROOMS_DATA 
    : ROOMS_DATA.filter((r) => r.category === activeFilter);

  return (
    <section id="comodos" className="py-10 border-t border-stone-200 scroll-mt-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-700">
            Tour Virtual & Detalhes
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-1">
            Conheça todos os cômodos da Vênus
          </h2>
          <p className="text-sm text-stone-600 mt-1">
            Espaços planejados com personalidade, conforto e tudo o que você precisa para uma estadia inesquecível.
          </p>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-stone-100/90 rounded-2xl self-start">
          <button
            onClick={() => setActiveFilter('todos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeFilter === 'todos'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Todos ({ROOMS_DATA.length})
          </button>
          <button
            onClick={() => setActiveFilter('quarto')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeFilter === 'quarto'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Quartos (2)
          </button>
          <button
            onClick={() => setActiveFilter('externo')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeFilter === 'externo'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Área Externa & Piscina (2)
          </button>
          <button
            onClick={() => setActiveFilter('social')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeFilter === 'social'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Sala & Cozinha (2)
          </button>
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredRooms.map((room) => (
          <div
            key={room.id}
            id={room.id}
            className="group flex flex-col bg-white rounded-3xl border border-stone-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300"
          >
            {/* Room Image */}
            <div className="relative aspect-16/10 overflow-hidden bg-stone-100">
              <SmartImage
                src={room.image}
                fallbackSources={room.fallbackSources}
                alt={room.alt}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-104"
              />
              <div className="absolute top-3 left-3 bg-stone-950/70 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5">
                <span>{room.emoji}</span>
                <span>{room.subtitle}</span>
              </div>
            </div>

            {/* Room Content */}
            <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-serif font-bold text-stone-900 tracking-tight flex items-center gap-2">
                  <span>{room.title}</span>
                </h3>

                {/* Exact User Description Quote */}
                <p className="text-sm text-stone-700 bg-amber-50/50 p-3 rounded-xl border border-amber-200/40 my-3 leading-relaxed">
                  "{room.description}"
                </p>

                {/* Features checklist */}
                <ul className="space-y-1.5 my-3">
                  {room.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-stone-600">
                      <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-3 mt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                <span className="font-medium">
                  {room.category === 'quarto' ? 'Acomodações privativas' : 'Uso exclusivo da casa'}
                </span>
                <span className="text-amber-700 font-semibold flex items-center gap-0.5">
                  Vênus Beach House
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
