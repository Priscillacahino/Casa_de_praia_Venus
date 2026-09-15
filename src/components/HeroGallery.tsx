import React from 'react';
import { Grid, Sparkles } from 'lucide-react';
import { GALLERY_PHOTOS } from '../data/houseData';
import { SmartImage } from './SmartImage';

interface HeroGalleryProps {
  onOpenGallery: (photoIndex?: number) => void;
}

export const HeroGallery: React.FC<HeroGalleryProps> = ({ onOpenGallery }) => {
  const mainPhoto = GALLERY_PHOTOS[0]; // Piscina e churrasqueira
  const sidePhotos = GALLERY_PHOTOS.slice(1, 5); // Quarto 01, Quarto 01 (ângulo 2), Quarto 02, Sala

  return (
    <section className="relative mt-4">
      {/* 5-Photo Airbnb Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-3 rounded-2xl md:rounded-3xl overflow-hidden max-h-[520px]">
        {/* Main Hero Photo (Takes 2 cols on md) */}
        <div
          onClick={() => onOpenGallery(0)}
          className="relative md:col-span-2 aspect-4/3 md:aspect-auto md:h-[480px] group cursor-pointer overflow-hidden bg-stone-100"
        >
          <SmartImage
            src={mainPhoto.url}
            fallbackSources={mainPhoto.fallbackSources}
            alt={mainPhoto.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
          />
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between pointer-events-none">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-900/80 backdrop-blur-md rounded-xl text-white border border-white/20 shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span className="text-xs font-semibold">{mainPhoto.title}</span>
            </div>
          </div>
        </div>

        {/* 4 Secondary Photos (2x2 grid on the right) */}
        <div className="hidden md:grid md:col-span-2 grid-cols-2 gap-2 md:gap-3 h-[480px]">
          {sidePhotos.map((photo, index) => (
            <div
              key={photo.id}
              onClick={() => onOpenGallery(index + 1)}
              className="relative aspect-4/3 md:aspect-auto h-full group cursor-pointer overflow-hidden bg-stone-100"
            >
              <SmartImage
                src={photo.url}
                fallbackSources={photo.fallbackSources}
                alt={photo.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
              />
              <div className="absolute bottom-2.5 left-2.5 right-2.5 pointer-events-none">
                <span className="text-xs font-medium text-white px-2.5 py-1 bg-stone-900/80 backdrop-blur-md rounded-lg inline-block max-w-full truncate shadow-sm border border-white/10">
                  {photo.title}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating "Mostrar todas as fotos" button */}
      <button
        onClick={() => onOpenGallery(0)}
        className="absolute bottom-4 right-4 z-10 inline-flex items-center gap-2 px-4 py-2.5 bg-white/90 hover:bg-white text-stone-900 text-xs sm:text-sm font-semibold rounded-xl shadow-md backdrop-blur-md border border-stone-200 transition-all hover:scale-102 active:scale-95"
      >
        <Grid className="w-4 h-4 text-stone-700" />
        <span>Mostrar todas as fotos ({GALLERY_PHOTOS.length})</span>
      </button>
    </section>
  );
};
