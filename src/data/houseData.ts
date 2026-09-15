import { RoomItem, BeachItem, GalleryPhoto } from '../types';

export const HOUSE_INFO = {
  name: 'Vênus Beach House',
  tagline: 'Venus, sua casa de praia!',
  intro: 'Aqui você viverá momentos de alegria, confraternização e união. Será um refúgio para relaxar e se divertir junto aos amigos e à família.',
  locationShort: 'Conde, Litoral Sul da Paraíba, Brasil',
  locationDetails: 'Localizada estrategicamente no litoral sul paraibano, a poucos minutos das praias mais cobiçadas do Nordeste, em um bairro tranquilo e acolhedor em Conde - PB.',
  rating: 4.98,
  reviewCount: 24,
  maxGuests: 6,
  bedrooms: 2,
  beds: 3, // Cama de casal, Cama retrátil de casal, Sofá bicama de solteiro
  baths: 1,
  basePrice: 280, // R$ por diária
  cleaningFee: 120,
  whatsappNumber: '83986705999',
  whatsappDisplay: '(83) 98670-5999',
  email: 'priscillacahinoo@gmail.com',
  instagramUrl: 'https://www.instagram.com/venuscasadepraiapb?stkn=MWpvd3cwMWpvbmJ2Mg==',
  instagramHandle: '@venuscasadepraiapb',
  googleMapsUrl: 'https://maps.app.goo.gl/QdquwUhCt9KzitQr8',
  catProfileImage: '/images/cat_profile.jpg',
  heroMainImage: 'https://i.imgur.com/WUdjZuz.jpg',
};

export const ROOMS_DATA: RoomItem[] = [
  {
    id: 'quarto-01',
    title: 'Quarto 01 - Fui abduzido 👽🛸',
    subtitle: 'Suíte Cósmica & Conforto',
    emoji: '🛸',
    category: 'quarto',
    description: 'Este quarto conta com cama de casal, ventilador e porta para acesso ao banheiro principal.',
    features: [
      'Cama de casal com colcha preta espacial de OVNI e vaquinha abduzida',
      'Ventilador de parede de alta potência',
      'Tapeçaria mística feminina com arco-íris e estrelas na parede',
      'Banquinho decorativo arco-íris e tomadas acessíveis',
      'Porta com acesso direto ao banheiro privativo',
    ],
    image: 'https://i.imgur.com/HjDwdau.jpg',
    fallbackSources: ['/images/quarto_abduzido.jpg', '/images/IMG-20260311-WA0001.jpg', 'https://i.imgur.com/HjDwdau.jpg'],
    alt: 'Quarto 01 - Fui Abduzido na Vênus Beach House',
  },
  {
    id: 'quarto-02',
    title: 'Quarto 02 - Escritório no Paraíso 💻🌴',
    subtitle: 'Home Office & Cama Retrátil Inteligente',
    emoji: '💻',
    category: 'quarto',
    description: 'Este quarto conta com cama de casal retrátil, ventilador, mesa retrátil, cadeira e suporte para monitor.',
    features: [
      'Estante e cama retrátil em madeira com armário',
      'Mesa de trabalho com cadeira de escritório giratória ergonômica preta',
      'Ventilador de parede potente',
      'Janela com cortina persiana e excelente claridade natural',
      'Placa de porta decorativa redonda com arco-íris e inscrição Amor',
    ],
    image: 'https://i.imgur.com/3fPuKGp.jpg',
    fallbackSources: ['/images/quarto_escritorio.jpg', '/images/IMG-20260311-WA0003.jpg', 'https://i.imgur.com/3fPuKGp.jpg'],
    alt: 'Quarto 02 - Escritório no Paraíso na Vênus Beach House',
  },
  {
    id: 'area-externa-01',
    title: 'Área externa 01 - Ilhado em Vênus 🏊‍♂️🥩',
    subtitle: 'Piscina em L & Churrasqueira',
    emoji: '🏊‍♂️',
    category: 'externo',
    description: 'Este espaço conta com a nossa churrasqueira pré-moldada e uma singela piscina em L. Também pode ser utilizado como garagem, suportando até 1 carro de passeio.',
    features: [
      'Piscina privativa refrescante com design em L e pastilhas azuis',
      'Churrasqueira de tijolos à vista para confraternizações',
      'Varanda coberta com telhado colonial e cortinas decorativas',
      'Plantas ornamentais em vasos e decoração de praia',
      'Garagem privativa fechada para 1 carro de passeio',
    ],
    image: 'https://i.imgur.com/WUdjZuz.jpg',
    fallbackSources: ['/images/piscina_churrasqueira.jpg', '/images/IMG-20260311-WA0002.jpg', 'https://i.imgur.com/WUdjZuz.jpg'],
    alt: 'Área externa 01 com piscina em L e churrasqueira',
  },
  {
    id: 'area-externa-02',
    title: 'Área externa 02 - Suave na nave 🌴🪢',
    subtitle: 'Varanda Colonial & Jardim Suspenso',
    emoji: '🌴',
    category: 'externo',
    description: 'Neste espaço temos o nosso jardim suspenso para dar vida ao ambientes e também uma rede tipicamente nordestina para que você possa relaxar ao ar livre.',
    features: [
      'Varanda colonial sombreada e ventilada para relaxar ao ar livre',
      'Ambiente arejado com plantas tropicais em vasos e jardim vertical',
      'Espaço para rede e descanso revigorante',
      'Decoração alegre com cortinas coloridas e estilo rústico',
    ],
    image: '/images/suave_na_nave.png',
    fallbackSources: ['/images/suave_na_nave.png', '/images/suave_na_nave_vertical.webp', '/images/area_externa_rede.jpg'],
    alt: 'Área externa 02 Suave na Nave com varanda, jardim vertical e rede',
  },
  {
    id: 'sala',
    title: 'Sala - Divindade ancestral 🎬✨',
    subtitle: 'Cinema Smart & Convivência Integrada',
    emoji: '🎬',
    category: 'social',
    description: 'Temos sofa Bicama de solteiro, mesa bancada, cadeiras e projetor smart.',
    features: [
      'Sofá de madeira bicama com almofadas temáticas sol e girassol',
      'Bancada americana de granito com cadeiras pretas modernas',
      'Quadros com arte de divindades ancestrais na parede',
      'Geladeira duplex e integração aberta com a cozinha',
      'Projetor smart para noites de streaming e cinema',
    ],
    image: 'https://i.imgur.com/CqSYWHX.jpg',
    fallbackSources: ['/images/sala_divindade.jpg', '/images/IMG-20260311-WA0004.jpg', 'https://i.imgur.com/CqSYWHX.jpg'],
    alt: 'Sala Divindade Ancestral com sofá bicama e bancada integrada',
  },
  {
    id: 'cozinha',
    title: 'Cozinha - Chef no rolê 🍳🧑‍🍳',
    subtitle: 'Completa & Prática para suas Férias',
    emoji: '🍳',
    category: 'social',
    description: 'Nossa cozinha conta com geladeira, fogão, Airfryer e utensílios.',
    features: [
      'Geladeira duplex espaçosa e bancada prática',
      'Fogão a gás para refeições completas',
      'Fritadeira elétrica Airfryer para petiscos práticos',
      'Kit completo de panelas, pratos, copos e talheres',
      'Liquidificador, cafeteira e itens essenciais',
    ],
    image: 'https://i.imgur.com/CqSYWHX.jpg',
    fallbackSources: ['/images/cozinha_chef.jpg', '/images/IMG-20260311-WA0004.jpg', 'https://i.imgur.com/CqSYWHX.jpg'],
    alt: 'Cozinha Chef no Rolê integrada à sala americana',
  },
];

export interface NearbyBeachGuide {
  name: string;
  distance: string;
  description: string;
}

export const OTHER_NEARBY_BEACHES: NearbyBeachGuide[] = [
  { name: 'Praia de Carapibus', distance: '~3 a 5 min', description: 'Piscinas naturais de corais e quiosques charmosos à beira-mar.' },
  { name: 'Praia do Amor', distance: '~5 min', description: 'Pedra Furada, mirante natural e falésias deslumbrantes.' },
  { name: 'Praia de Jacumã', distance: '~4 min', description: 'Centro comercial, artesanato, mercados e culinária paraibana.' },
  { name: 'Praia de Tambaba', distance: '~12 min', description: 'Referência internacional por suas falésias e natureza preservada.' },
];

export const BEACHES_DATA: BeachItem[] = [
  {
    id: 'tabatinga',
    name: 'Praia de Tabatinga',
    distance: '~5 a 7 min',
    description: 'Famosa pelas imponentes falésias coloridas, encontro do rio com o mar e piscinas naturais mornas e cristalinas.',
    highlights: ['Falésias exuberantes', 'Encontro do Rio com o Mar', 'Piscinas naturais na maré baixa'],
    image: '/images/tabatinga.jpg',
    fallbackSources: ['/images/tabatinga.jpg', '/images/praia_tabatinga_1789476903652.jpg'],
  },
  {
    id: 'coqueirinho',
    name: 'Praia de Coqueirinho',
    distance: '~8 a 10 min',
    description: 'Considerada uma das praias mais bonitas do Brasil, cercada por coqueirais ondulantes, mar verde esmeralda e cânions multicoloridos.',
    highlights: ['Eleita uma das mais belas do país', 'Mar verde-esmeralda calmo', 'Cânions e Mirante do Dedo de Deus'],
    image: '/images/coqueirinho.jpg',
    fallbackSources: ['/images/coqueirinho.jpg', '/images/praia_coqueirinho_1789476924242.jpg'],
  },
];

export const GALLERY_PHOTOS: GalleryPhoto[] = [
  {
    id: 'p1',
    url: 'https://i.imgur.com/WUdjZuz.jpg',
    fallbackSources: ['/images/piscina_churrasqueira.jpg', '/images/IMG-20260311-WA0002.jpg', 'https://i.imgur.com/WUdjZuz.jpg'],
    title: 'Área externa 01 - Ilhado em Vênus 🏊‍♂️🥩',
    category: 'Lazer & Área Externa',
    description: 'Área externa 01 - Ilhado em Vênus com piscina privativa em L, churrasqueira de tijolos, varanda colonial e plantas.',
  },
  {
    id: 'p1-b',
    url: '/images/suave_na_nave.png',
    fallbackSources: ['/images/suave_na_nave.png', '/images/suave_na_nave_vertical.webp', '/images/area_externa_rede.jpg'],
    title: 'Área externa 02 - Suave na nave 🌴🪢',
    category: 'Lazer & Área Externa',
    description: 'Varanda colonial com jardim vertical e rede tipicamente nordestina para relaxar ao ar livre.',
  },
  {
    id: 'p2',
    url: 'https://i.imgur.com/HjDwdau.jpg',
    fallbackSources: ['/images/quarto_abduzido.jpg', '/images/IMG-20260311-WA0001.jpg', 'https://i.imgur.com/HjDwdau.jpg'],
    title: 'Quarto 01 - Fui abduzido 👽🛸',
    category: 'Cômodos',
    description: 'Cama de casal com colcha espacial exclusiva de OVNI abduzindo a vaquinha e tapeçaria mística de divindade celestial.',
  },
  {
    id: 'p3',
    url: 'https://i.imgur.com/OcSEyFV.jpg',
    fallbackSources: ['/images/quarto_abduzido_angulo2.jpg', '/images/IMG-20260311-WA0005.jpg', 'https://i.imgur.com/OcSEyFV.jpg'],
    title: 'Quarto 01 - Vista das Portas & Ventilador 🚪💨',
    category: 'Cômodos',
    description: 'Segundo ângulo do Quarto 01 mostrando o ventilador de parede potente, portas para o banheiro privativo e corredor.',
  },
  {
    id: 'p4',
    url: 'https://i.imgur.com/3fPuKGp.jpg',
    fallbackSources: ['/images/quarto_escritorio.jpg', '/images/IMG-20260311-WA0003.jpg', 'https://i.imgur.com/3fPuKGp.jpg'],
    title: 'Quarto 02 - Escritório no Paraíso 💻🌴',
    category: 'Cômodos',
    description: 'Cama retrátil de madeira inteligente, bancada home office branca com cadeira ergonômica giratória e enfeite Amor.',
  },
  {
    id: 'p5',
    url: 'https://i.imgur.com/CqSYWHX.jpg',
    fallbackSources: ['/images/sala_divindade.jpg', '/images/cozinha_chef.jpg', '/images/IMG-20260311-WA0004.jpg', 'https://i.imgur.com/CqSYWHX.jpg'],
    title: 'Sala & Cozinha Americana Integrada 🎬🍳',
    category: 'Cômodos',
    description: 'Sofá bicama de madeira com almofadas sol e girassol, bancada americana de granito preto, geladeira duplex e quadros de divindades.',
  },
  {
    id: 'p6',
    url: '/images/tabatinga.jpg',
    fallbackSources: ['/images/tabatinga.jpg', '/images/praia_tabatinga_1789476903652.jpg'],
    title: 'Praia de Tabatinga 🏖️',
    category: 'Praias de Conde',
    description: 'Falésias coloridas, encontro do rio com o mar e piscinas de águas mornas a 5 min da casa.',
  },
  {
    id: 'p7',
    url: '/images/coqueirinho.jpg',
    fallbackSources: ['/images/coqueirinho.jpg', '/images/praia_coqueirinho_1789476924242.jpg'],
    title: 'Praia de Coqueirinho 🥥🌴',
    category: 'Praias de Conde',
    description: 'Cânions multicoloridos, coqueirais ondulantes e mar verde-esmeralda, um dos cartões postais mais famosos da Paraíba.',
  },
  {
    id: 'p8',
    url: '/images/cat_profile.jpg',
    fallbackSources: ['/images/venus_cat_profile_1789476877938.jpg'],
    title: 'Vênus Astronauta (Mascote & Anfitriã) 🐱🚀',
    category: 'Lazer & Área Externa',
    description: 'A gatinha anfitriã e mascote oficial que dá nome e personalidade à Vênus Beach House!',
  },
];

export const INITIAL_REVIEWS: import('../types').ReviewItem[] = [
  {
    id: 'rev-1',
    name: 'Camila Albuquerque',
    date: 'Fevereiro de 2026',
    rating: 5,
    tripType: 'Família',
    comment:
      'A casa é maravilhosa! A piscina em L e a churrasqueira foram perfeitas para os finais de tarde após voltar das praias. O quarto Fui Abduzido é super criativo e confortável. Fica pertinho de Tabatinga e Coqueirinho!',
    verified: true,
    createdAt: 1770000000000,
  },
  {
    id: 'rev-2',
    name: 'Rafael Mendes',
    date: 'Janeiro de 2026',
    rating: 5,
    tripType: 'Home Office',
    comment:
      'Trabalhei a semana inteira no quarto Escritório no Paraíso enquanto minha família aproveitava a praia e a piscina. A internet é muito rápida, a mesa retrátil e o suporte de monitor salvaram meu home office. À noite assistimos filmes no projetor da sala!',
    verified: true,
    createdAt: 1768000000000,
  },
  {
    id: 'rev-3',
    name: 'Juliana & Thiago',
    date: 'Dezembro de 2025',
    rating: 5,
    tripType: 'Casal',
    comment:
      'O espaço Suave na Nave com a rede nordestina e as plantinhas suspensas é pura paz! Levamos nosso cachorrinho e ele amou o quintal. A anfitriã responde super rápido no WhatsApp e nos deu dicas ótimas de quiosques em Carapibus.',
    verified: true,
    createdAt: 1765000000000,
  },
  {
    id: 'rev-4',
    name: 'Lucas Ferreira',
    date: 'Novembro de 2025',
    rating: 5,
    tripType: 'Amigos',
    comment:
      'Cozinha com Airfryer facilitou muito a nossa vida. Casa limpa, ventilada e super bem localizada em Conde. A vibe cósmica da casa com a anfitriã gatinha astronauta é única!',
    verified: true,
    createdAt: 1762000000000,
  },
  {
    id: 'rev-5',
    name: 'Beatriz Vasconcelos',
    date: 'Outubro de 2025',
    rating: 5,
    tripType: 'Família',
    comment:
      'Lugar silencioso, seguro e acolhedor. Nossos filhos adoraram a piscina privativa. Foi ótimo fazer churrasco ouvindo música tranquilamente. Voltaremos com certeza!',
    verified: true,
    createdAt: 1759000000000,
  },
];

export const PRICING_TIERS: import('../types').PricingTier[] = [
  {
    id: 'baixa-temporada',
    season: 'Baixa Temporada',
    period: 'Março a Novembro (exceto Julho e Feriados)',
    weekdayPrice: 240,
    weekendPrice: 320,
    minNights: 2,
    description: 'A melhor época para quem busca sossego absoluto, praias mais tranquilas e excelente custo-benefício.',
    badge: 'Melhor Custo-Benefício',
    highlight: false,
  },
  {
    id: 'alta-temporada',
    season: 'Alta Temporada',
    period: 'Dezembro, Janeiro, Fevereiro e Férias de Julho',
    weekdayPrice: 360,
    weekendPrice: 420,
    minNights: 2,
    description: 'Dias ensolarados vibrantes, água do mar morna e cristalina e energia contagiante do litoral sul da Paraíba.',
    badge: 'Mais Procurado',
    highlight: true,
  },
  {
    id: 'feriados-pacotes',
    season: 'Feriados Prolongados & Festas',
    period: 'Carnaval, Réveillon, Semana Santa, São João e Feriadões',
    weekdayPrice: 480,
    weekendPrice: 580,
    minNights: 3,
    description: 'Tarifas especiais sob consulta ou pacotes fechados para datas festivas e feriados nacionais.',
    badge: 'Datas Festivas',
    highlight: false,
  },
];

export const SPECIAL_HOLIDAYS: import('../types').SpecialHolidayRate[] = [
  {
    id: 'reveillon',
    name: 'Réveillon na Praia',
    period: '28 de Dez a 02 de Jan',
    pricePerNight: 750,
    minNights: 5,
    datesRange: '12-28 a 01-02',
    notes: 'Pacote especial de virada de ano na praia com piscina privativa e churrasco.',
  },
  {
    id: 'carnaval',
    name: 'Carnaval no Litoral',
    period: 'Sexta a Quarta de Cinzas',
    pricePerNight: 650,
    minNights: 4,
    datesRange: 'Fevereiro',
    notes: 'Aproveite o feriadão mais animado do ano com total privacidade.',
  },
  {
    id: 'sao-joao',
    name: 'São João Paraibano',
    period: 'Semana de 20 a 25 de Junho',
    pricePerNight: 480,
    minNights: 3,
    datesRange: '06-20 a 06-25',
    notes: 'Aproveite o autêntico clima junino da Paraíba com o mar a poucos passos.',
  },
  {
    id: 'semana-santa',
    name: 'Semana Santa',
    period: 'Quinta a Domingo',
    pricePerNight: 480,
    minNights: 3,
    datesRange: 'Março/Abril',
    notes: 'Feriado em família com descanso à beira da piscina privativa.',
  },
];

// Realistic occupied dates for calendar visualization
export const KNOWN_BLOCKED_DATES: string[] = [
  // Sample blocked ranges to showcase realistic availability
  '2026-09-18', '2026-09-19', '2026-09-20',
  '2026-09-26', '2026-09-27',
  '2026-10-09', '2026-10-10', '2026-10-11', '2026-10-12', // Feriado N. Sra Aparecida
  '2026-11-13', '2026-11-14', '2026-11-15', // Feriado Proclamação da República
  '2026-12-29', '2026-12-30', '2026-12-31', '2027-01-01', '2027-01-02', // Réveillon
];

export function isDateBlocked(dateStr: string): boolean {
  return KNOWN_BLOCKED_DATES.includes(dateStr);
}

/**
 * Calculates exact pricing for a stay based on date ranges, seasons, weekdays vs weekends, and holidays
 */
export function calculateStayPricing(checkInStr: string, checkOutStr: string) {
  if (!checkInStr || !checkOutStr) {
    return {
      nights: 0,
      nightlyDetails: [],
      subtotal: 0,
      cleaningFee: HOUSE_INFO.cleaningFee,
      total: 0,
    };
  }

  const checkIn = new Date(`${checkInStr}T00:00:00`);
  const checkOut = new Date(`${checkOutStr}T00:00:00`);

  if (checkOut <= checkIn) {
    return {
      nights: 0,
      nightlyDetails: [],
      subtotal: 0,
      cleaningFee: HOUSE_INFO.cleaningFee,
      total: 0,
    };
  }

  const nightlyDetails: import('../types').DatePriceDetail[] = [];
  const curr = new Date(checkIn);

  while (curr < checkOut) {
    const year = curr.getFullYear();
    const month = curr.getMonth() + 1; // 1-12
    const day = curr.getDate();
    const dayOfWeekIndex = curr.getDay(); // 0 = Dom, 1 = Seg, 2 = Ter, 3 = Qua, 4 = Qui, 5 = Sex, 6 = Sáb
    
    // Format YYYY-MM-DD
    const yStr = year.toString();
    const mStr = month < 10 ? `0${month}` : `${month}`;
    const dStr = day < 10 ? `0${day}` : `${day}`;
    const dateFormatted = `${yStr}-${mStr}-${dStr}`;

    const daysOfWeekNames = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const dayName = daysOfWeekNames[dayOfWeekIndex];

    // Friday and Saturday nights are considered weekend stays (checkout Sat or Sun)
    const isWeekend = dayOfWeekIndex === 5 || dayOfWeekIndex === 6;

    // High season months: Dec (12), Jan (1), Feb (2), Jul (7)
    const isHighSeason = month === 12 || month === 1 || month === 2 || month === 7;

    // Fixed / Special Holidays in Brazil
    const isReveillon = (month === 12 && day >= 28) || (month === 1 && day <= 2);
    const isSaoJoao = month === 6 && day >= 20 && day <= 25;
    const isIndependencia = month === 9 && (day === 6 || day === 7);
    const isAparecida = month === 10 && (day === 11 || day === 12);
    const isFinados = month === 11 && (day === 1 || day === 2);
    const isRepublica = month === 11 && (day === 14 || day === 15);

    let rate = 240; // Default baixa dia de semana
    let label = 'Baixa Estação (Semana)';
    let isHoliday = false;

    if (isReveillon) {
      rate = 750;
      label = 'Pacote Réveillon';
      isHoliday = true;
    } else if (isSaoJoao || isIndependencia || isAparecida || isFinados || isRepublica) {
      rate = 480;
      label = 'Feriado Especial';
      isHoliday = true;
    } else if (isHighSeason) {
      if (isWeekend) {
        rate = 420;
        label = 'Alta Estação (Fim de Semana)';
      } else {
        rate = 360;
        label = 'Alta Estação (Semana)';
      }
    } else {
      // Low season
      if (isWeekend) {
        rate = 320;
        label = 'Baixa Estação (Fim de Semana)';
      } else {
        rate = 240;
        label = 'Baixa Estação (Semana)';
      }
    }

    nightlyDetails.push({
      dateStr: dateFormatted,
      dayOfWeek: dayName,
      rate,
      label,
      isHoliday,
      isWeekend,
    });

    // Move to next night
    curr.setDate(curr.getDate() + 1);
  }

  const subtotal = nightlyDetails.reduce((sum, item) => sum + item.rate, 0);
  const cleaningFee = HOUSE_INFO.cleaningFee;
  const total = subtotal + cleaningFee;

  return {
    nights: nightlyDetails.length,
    nightlyDetails,
    subtotal,
    cleaningFee,
    total,
  };
}
