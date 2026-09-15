export interface RoomItem {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  category: 'quarto' | 'externo' | 'social' | 'servico';
  description: string;
  features: string[];
  image: string;
  alt: string;
  fallbackSources?: string[];
}

export interface BeachItem {
  id: string;
  name: string;
  distance: string;
  description: string;
  highlights: string[];
  image: string;
  fallbackSources?: string[];
}

export interface AmenityCategory {
  title: string;
  items: {
    name: string;
    icon: string;
    description?: string;
  }[];
}

export interface GalleryPhoto {
  id: string;
  url: string;
  title: string;
  category: 'Cômodos' | 'Lazer & Área Externa' | 'Praias de Conde';
  description: string;
  fallbackSources?: string[];
}

export interface ReviewItem {
  id: string;
  name: string;
  date: string;
  rating: number;
  comment: string;
  tripType?: 'Família' | 'Amigos' | 'Casal' | 'Home Office' | 'Viagem Solo';
  avatar?: string;
  verified?: boolean;
  createdAt: number;
}

export interface PricingTier {
  id: string;
  season: string;
  period: string;
  weekdayPrice: number;
  weekendPrice: number;
  minNights: number;
  description: string;
  badge?: string;
  highlight?: boolean;
}

export interface SpecialHolidayRate {
  id: string;
  name: string;
  period: string;
  pricePerNight: number;
  minNights: number;
  datesRange: string;
  notes: string;
}

export interface DatePriceDetail {
  dateStr: string; // YYYY-MM-DD
  dayOfWeek: string;
  rate: number;
  label: string;
  isHoliday?: boolean;
  isWeekend?: boolean;
}

