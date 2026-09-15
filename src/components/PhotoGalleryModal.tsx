import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Sparkles, Image as ImageIcon } from 'lucide-react';
import { GALLERY_PHOTOS } from '../data/houseData';
import { SmartImage } from './SmartImage';

interface PhotoGalleryModalProps {
  isOpen: boolean;
  initialIndex?: number;
  onClose: () => void;
}

export const PhotoGalleryModal: React.FC<PhotoGalleryModalProps> = ({
  isOpen,
  initialIndex = 0,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [activeCategory, setActiveCategory] = useState<string>('Todas');

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, initialIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, activeCategory]);

  if (!isOpen) return null;

  const categories = ['Todas', ...Array.from(new Set(GALLERY_PHOTOS.map((p) => p.category)))];

  const filteredPhotos = activeCategory === 'Todas'
    ? GALLERY_PHOTOS
    : GALLERY_PHOTOS.filter((p) => p.category === activeCategory);

  const activePhoto = filteredPhotos[currentIndex] || filteredPhotos[0] || GALLERY_PHOTOS[0];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredPhotos.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + filteredPhotos.length) % filteredPhotos.length);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 text-white flex flex-col justify-between backdrop-blur-md animate-in fade-in duration-200">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 sm:px-8 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold tracking-wide">
            {currentIndex + 1} / {filteredPhotos.length}
          </span>
          <span className="text-white/40 hidden sm:inline">·</span>
          <span className="text-xs text-amber-400 font-medium hidden sm:inline">
            Vênus Beach House
          </span>
        </div>

        {/* Category Filter Pills */}
        <div className="hidden md:flex items-center gap-1.5 bg-white/10 p-1 rounded-full text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setCurrentIndex(0);
              }}
              className={`px-3 py-1 rounded-full transition-all ${
                activeCategory === cat
                  ? 'bg-white text-stone-900 font-bold shadow-xs'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          aria-label="Fechar galeria"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Photo Display Stage */}
      <div className="relative flex-1 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
        {/* Navigation Arrows */}
        <button
          onClick={handlePrev}
          className="absolute left-4 sm:left-8 z-10 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/20 transition-all hover:scale-110 active:scale-95"
          aria-label="Foto anterior"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="max-w-5xl max-h-[70vh] flex flex-col items-center justify-center">
          <SmartImage
            src={activePhoto.url}
            fallbackSources={activePhoto.fallbackSources}
            alt={activePhoto.title}
            className="max-h-[62vh] w-auto max-w-full object-contain rounded-xl sm:rounded-2xl shadow-2xl transition-all"
          />
          <div className="text-center mt-3 max-w-xl">
            <h4 className="text-base sm:text-lg font-bold font-serif text-white">
              {activePhoto.title}
            </h4>
            <p className="text-xs sm:text-sm text-stone-300 mt-1">
              {activePhoto.description}
            </p>
          </div>
        </div>

        <button
          onClick={handleNext}
          className="absolute right-4 sm:right-8 z-10 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/20 transition-all hover:scale-110 active:scale-95"
          aria-label="Próxima foto"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Bottom Thumbnail Strip */}
      <div className="p-4 border-t border-white/10 bg-black/40 overflow-x-auto">
        <div className="flex items-center justify-center gap-2 min-w-max mx-auto">
          {filteredPhotos.map((photo, idx) => (
            <button
              key={photo.id}
              onClick={() => setCurrentIndex(idx)}
              className={`relative w-16 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                currentIndex === idx
                  ? 'border-amber-400 scale-105 opacity-100 shadow-md ring-2 ring-amber-400/40'
                  : 'border-transparent opacity-50 hover:opacity-80'
              }`}
            >
              <SmartImage
                src={photo.url}
                fallbackSources={photo.fallbackSources}
                alt={photo.title}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
