import React, { useState } from 'react';
import { Header } from './components/Header';
import { HeroGallery } from './components/HeroGallery';
import { PropertyHeader } from './components/PropertyHeader';
import { AboutSection } from './components/AboutSection';
import { RoomsSection } from './components/RoomsSection';
import { AmenitiesSection } from './components/AmenitiesSection';
import { BeachesSection } from './components/BeachesSection';
import { PricingSection } from './components/PricingSection';
import { BookingSection } from './components/BookingSection';
import { MapSection } from './components/MapSection';
import { HostSection } from './components/HostSection';
import { ReviewsSection } from './components/ReviewsSection';
import { BookingCard } from './components/BookingCard';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { PhotoGalleryModal } from './components/PhotoGalleryModal';
import { MessageCircle } from 'lucide-react';
import { HOUSE_INFO } from './data/houseData';

export default function App() {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [initialPhotoIndex, setInitialPhotoIndex] = useState(0);

  // Synchronized date selection across components
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const checkoutDate = new Date(tomorrow);
  checkoutDate.setDate(checkoutDate.getDate() + 2);

  const formatDateForInput = (d: Date) => d.toISOString().split('T')[0];

  const [selectedCheckIn, setSelectedCheckIn] = useState<string>(formatDateForInput(tomorrow));
  const [selectedCheckOut, setSelectedCheckOut] = useState<string>(formatDateForInput(checkoutDate));

  const handleOpenGallery = (index: number = 0) => {
    setInitialPhotoIndex(index);
    setGalleryOpen(true);
  };

  const handleDatesChange = (checkIn: string, checkOut: string) => {
    setSelectedCheckIn(checkIn);
    setSelectedCheckOut(checkOut);
  };

  const whatsappFloatingUrl = `https://wa.me/55${HOUSE_INFO.whatsappNumber}?text=Ol%C3%A1!%20Gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20a%20V%C3%AAnus%20Beach%20House.`;

  return (
    <div id="inicio" className="min-h-screen bg-[#faf9f6] text-stone-900 flex flex-col selection:bg-amber-500 selection:text-white">
      {/* Top Airbnb-style Navbar */}
      <Header onOpenGallery={() => handleOpenGallery(0)} />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 w-full pb-16">
        {/* Airbnb 5-Photo Mosaic Hero */}
        <HeroGallery onOpenGallery={handleOpenGallery} />

        {/* Title, Badges, Reviews & Share/Save Buttons */}
        <PropertyHeader />

        {/* Two-Column Layout (Content on Left, Sticky Booking on Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mt-4 items-start">
          {/* Main Column */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-2">
            {/* Introduction & Highlights */}
            <AboutSection />

            {/* Virtual Room-by-Room Tour */}
            <RoomsSection onOpenGalleryWithPhoto={() => handleOpenGallery(1)} />

            {/* Amenities Grid */}
            <AmenitiesSection />

            {/* Beaches of Conde (Tabatinga, Coqueirinho, etc.) */}
            <BeachesSection />

            {/* Seasonal Pricing & Rates Table */}
            <PricingSection />

            {/* Visual Calendar & Reservation System */}
            <BookingSection
              checkIn={selectedCheckIn}
              checkOut={selectedCheckOut}
              onDatesChange={handleDatesChange}
            />

            {/* Google Maps Location Embed & Link */}
            <MapSection />

            {/* Host Section with Cat Mascot Profile */}
            <HostSection />

            {/* Guest Reviews & Submission Form */}
            <ReviewsSection />

            {/* Secure Contact & Message Form */}
            <ContactSection />
          </div>

          {/* Sticky Reservation Widget (Right Column on Desktop) */}
          <div className="hidden lg:block lg:col-span-5 xl:col-span-4">
            <BookingCard
              checkIn={selectedCheckIn}
              checkOut={selectedCheckOut}
              onDatesChange={handleDatesChange}
            />
          </div>
        </div>

        {/* Mobile Booking Bar */}
        <div className="lg:hidden">
          <BookingCard
            checkIn={selectedCheckIn}
            checkOut={selectedCheckOut}
            onDatesChange={handleDatesChange}
          />
        </div>
      </main>

      {/* Floating WhatsApp Quick Contact Badge */}
      <a
        href={whatsappFloatingUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar com a Vênus no WhatsApp"
        className="fixed bottom-20 md:bottom-8 right-5 z-40 flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white py-3 px-4 sm:px-5 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all active:scale-95 group ring-4 ring-white/80"
      >
        <div className="relative">
          <img
            src={HOUSE_INFO.catProfileImage}
            alt="Mascote Vênus"
            className="w-7 h-7 rounded-full object-cover ring-2 ring-white"
            referrerPolicy="no-referrer"
          />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-300 rounded-full animate-ping" />
        </div>
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-[10px] uppercase font-bold text-white/90 leading-tight">Fale Conosco</span>
          <span className="text-xs font-extrabold text-white leading-tight">WhatsApp</span>
        </div>
        <MessageCircle className="w-5 h-5 fill-white sm:hidden" />
      </a>

      {/* Fullscreen Photo Lightbox Modal */}
      <PhotoGalleryModal
        isOpen={galleryOpen}
        initialIndex={initialPhotoIndex}
        onClose={() => setGalleryOpen(false)}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
