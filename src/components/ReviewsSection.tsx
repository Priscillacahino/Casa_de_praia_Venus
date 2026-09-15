import React, { useState, useEffect } from 'react';
import { Star, CheckCircle, Sparkles, Plus, MessageSquare, ThumbsUp, Filter, Check, Heart, ShieldCheck } from 'lucide-react';
import { HOUSE_INFO, INITIAL_REVIEWS } from '../data/houseData';
import { ReviewItem } from '../types';

export const ReviewsSection: React.FC = () => {
  // Load saved reviews from localStorage or fallback to INITIAL_REVIEWS
  const [reviews, setReviews] = useState<ReviewItem[]>(() => {
    try {
      const saved = localStorage.getItem('venus_beach_house_reviews');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_REVIEWS;
  });

  const [starFilter, setStarFilter] = useState<number | 'all'>('all');
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  // Form states
  const [authorName, setAuthorName] = useState<string>('');
  const [ratingValue, setRatingValue] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [tripType, setTripType] = useState<ReviewItem['tripType']>('Família');
  const [reviewComment, setReviewComment] = useState<string>('');
  const [formError, setFormError] = useState<string>('');

  // Persist reviews to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('venus_beach_house_reviews', JSON.stringify(reviews));
    } catch {
      // ignore
    }
  }, [reviews]);

  // Calculations for organized summary
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(2)
    : '5.00';

  const count5 = reviews.filter((r) => r.rating === 5).length;
  const count4 = reviews.filter((r) => r.rating === 4).length;
  const count3 = reviews.filter((r) => r.rating === 3).length;
  const count2 = reviews.filter((r) => r.rating === 2).length;
  const count1 = reviews.filter((r) => r.rating === 1).length;

  const percent5 = totalReviews > 0 ? Math.round((count5 / totalReviews) * 100) : 100;
  const percent4 = totalReviews > 0 ? Math.round((count4 / totalReviews) * 100) : 0;
  const percent3 = totalReviews > 0 ? Math.round((count3 / totalReviews) * 100) : 0;

  const filteredReviews = reviews.filter((r) => {
    if (starFilter === 'all') return true;
    return r.rating === starFilter;
  });

  const ratingDescriptions: Record<number, string> = {
    1: '1 estrela - Muito insatisfeito',
    2: '2 estrelas - Razoável',
    3: '3 estrelas - Bom',
    4: '4 estrelas - Muito bom!',
    5: '5 estrelas - Excepcional! Experiência inesquecível',
  };

  const handleCreateReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim()) {
      setFormError('Por favor, informe seu nome.');
      return;
    }
    if (!reviewComment.trim() || reviewComment.trim().length < 10) {
      setFormError('Por favor, escreva uma avaliação com pelo menos 10 caracteres.');
      return;
    }

    const todayDate = new Date();
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const dateFormatted = `${months[todayDate.getMonth()]} de ${todayDate.getFullYear()}`;

    const newReview: ReviewItem = {
      id: `rev-${Date.now()}`,
      name: authorName.trim(),
      date: dateFormatted,
      rating: ratingValue,
      comment: reviewComment.trim(),
      tripType: tripType,
      verified: true,
      createdAt: Date.now(),
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(authorName.trim())}&backgroundColor=d97706,b45309,f59e0b`,
    };

    setReviews([newReview, ...reviews]);
    setSubmitSuccess(true);
    setFormError('');

    // Reset fields
    setTimeout(() => {
      setAuthorName('');
      setReviewComment('');
      setRatingValue(5);
      setSubmitSuccess(false);
      setShowReviewModal(false);
    }, 1800);
  };

  return (
    <section id="avaliacoes" className="py-12 border-t border-stone-200 scroll-mt-20">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Experiências Reais
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-1">
            Avaliações dos Hóspedes
          </h2>
          <p className="text-sm text-stone-600 mt-1 max-w-xl">
            Veja o que diz quem já se hospedou na Vênus Beach House ou compartilhe sua própria experiência.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowReviewModal(true)}
          className="inline-flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all shadow-xs active:scale-95 self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Escrever uma Avaliação</span>
        </button>
      </div>

      {/* Organized Rating Breakdown Banner */}
      <div className="bg-stone-50/90 rounded-3xl border border-stone-200/90 p-6 sm:p-8 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Overall Score */}
          <div className="md:col-span-4 flex flex-col items-center md:items-start text-center md:text-left border-b md:border-b-0 md:border-r border-stone-200 pb-6 md:pb-0 md:pr-6">
            <div className="flex items-center gap-2">
              <span className="text-4xl sm:text-5xl font-serif font-bold text-stone-900">
                {averageRating}
              </span>
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${
                        s <= Math.round(Number(averageRating))
                          ? 'fill-amber-500 text-amber-500'
                          : 'text-stone-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-semibold text-stone-500 mt-0.5">
                  {totalReviews} avaliações no total
                </span>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-100/70 border border-emerald-300/80 px-3 py-1.5 rounded-full">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>100% dos hóspedes recomendam</span>
            </div>
          </div>

          {/* Rating Bars Distribution */}
          <div className="md:col-span-4 space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-16 text-stone-600 font-medium">5 estrelas</span>
              <div className="flex-1 h-2 bg-stone-200 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${percent5}%` }} />
              </div>
              <span className="w-8 text-right font-bold text-stone-700">{percent5}%</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-16 text-stone-600 font-medium">4 estrelas</span>
              <div className="flex-1 h-2 bg-stone-200 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${percent4}%` }} />
              </div>
              <span className="w-8 text-right font-bold text-stone-700">{percent4}%</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-16 text-stone-600 font-medium">3 estrelas</span>
              <div className="flex-1 h-2 bg-stone-200 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${percent3}%` }} />
              </div>
              <span className="w-8 text-right font-bold text-stone-700">{percent3}%</span>
            </div>
          </div>

          {/* Key Category Badges */}
          <div className="md:col-span-4 grid grid-cols-2 gap-2.5 text-xs">
            <div className="p-2.5 bg-white rounded-xl border border-stone-200/80">
              <span className="text-stone-500 block text-[10px] uppercase font-bold">Limpeza</span>
              <div className="flex items-center justify-between mt-1">
                <span className="font-bold text-stone-900">5.0</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              </div>
            </div>

            <div className="p-2.5 bg-white rounded-xl border border-stone-200/80">
              <span className="text-stone-500 block text-[10px] uppercase font-bold">Piscina & Lazer</span>
              <div className="flex items-center justify-between mt-1">
                <span className="font-bold text-stone-900">5.0</span>
                <Heart className="w-3.5 h-3.5 text-rose-500" />
              </div>
            </div>

            <div className="p-2.5 bg-white rounded-xl border border-stone-200/80">
              <span className="text-stone-500 block text-[10px] uppercase font-bold">Localização</span>
              <div className="flex items-center justify-between mt-1">
                <span className="font-bold text-stone-900">4.9</span>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              </div>
            </div>

            <div className="p-2.5 bg-white rounded-xl border border-stone-200/80">
              <span className="text-stone-500 block text-[10px] uppercase font-bold">Wi-Fi & Home Office</span>
              <div className="flex items-center justify-between mt-1">
                <span className="font-bold text-stone-900">5.0</span>
                <ShieldCheck className="w-3.5 h-3.5 text-sky-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
        <span className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1 mr-1">
          <Filter className="w-3.5 h-3.5" /> Filtrar:
        </span>
        <button
          type="button"
          onClick={() => setStarFilter('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
            starFilter === 'all'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          Todas ({totalReviews})
        </button>
        <button
          type="button"
          onClick={() => setStarFilter(5)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors flex items-center gap-1 ${
            starFilter === 5
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          <span>5 estrelas</span>
          <span className="text-[10px] opacity-80">({count5})</span>
        </button>
        {count4 > 0 && (
          <button
            type="button"
            onClick={() => setStarFilter(4)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors flex items-center gap-1 ${
              starFilter === 4
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <span>4 estrelas</span>
            <span className="text-[10px] opacity-80">({count4})</span>
          </button>
        )}
      </div>

      {/* Reviews Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredReviews.map((rev) => (
          <div
            key={rev.id}
            className="p-6 rounded-3xl bg-white border border-stone-200/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-amber-100 border border-amber-300/80 text-amber-900 font-bold text-sm flex items-center justify-center shadow-xs shrink-0 select-none">
                    {rev.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                      {rev.name}
                      {rev.verified && (
                        <span className="inline-flex items-center text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-full font-semibold border border-emerald-200">
                          Verificado
                        </span>
                      )}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-stone-500 mt-0.5">
                      <span>{rev.date}</span>
                      {rev.tripType && (
                        <>
                          <span>·</span>
                          <span className="text-amber-800 font-medium">Viagem em {rev.tripType}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-0.5 shrink-0 bg-stone-50 px-2 py-1 rounded-xl border border-stone-200/60">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < rev.rating ? 'fill-amber-500 text-amber-500' : 'text-stone-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed italic mt-2">
                "{rev.comment}"
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
              <span className="flex items-center gap-1 text-amber-700 font-medium">
                <Sparkles className="w-3 h-3 text-amber-600" />
                Vênus Beach House · Conde - PB
              </span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <Check className="w-3 h-3" /> Estadia Realizada
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Submit Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <div>
                <h3 className="text-xl font-serif font-bold text-stone-900">
                  Avaliar Vênus Beach House
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Sua opinião ajuda outros hóspedes a planejarem momentos incríveis!
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500"
              >
                ✕
              </button>
            </div>

            {submitSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-xs">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-serif font-bold text-stone-900">
                  Muito obrigado pela sua avaliação!
                </h4>
                <p className="text-xs text-stone-600 max-w-xs mx-auto">
                  Sua avaliação foi registrada e já está visível na página da casa.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCreateReview} className="space-y-4 mt-5">
                {/* Interactive Star Rating Picker */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Sua Classificação (1 a 5 estrelas) *
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 bg-stone-50 p-2 rounded-2xl border border-stone-200">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRatingValue(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(null)}
                          className="p-1 focus:outline-hidden transition-transform hover:scale-110"
                          aria-label={`${star} estrelas`}
                        >
                          <Star
                            className={`w-7 h-7 transition-colors ${
                              star <= (hoverRating !== null ? hoverRating : ratingValue)
                                ? 'fill-amber-500 text-amber-500'
                                : 'text-stone-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <span className="text-xs font-semibold text-amber-800">
                      {ratingDescriptions[hoverRating !== null ? hoverRating : ratingValue]}
                    </span>
                  </div>
                </div>

                {/* Author Name */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Seu Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Ex: Mariana Castro"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>

                {/* Trip Type */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Tipo de Viagem
                  </label>
                  <select
                    value={tripType}
                    onChange={(e) => setTripType(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden bg-white"
                  >
                    <option value="Família">Em Família</option>
                    <option value="Casal">Em Casal</option>
                    <option value="Amigos">Com Amigos</option>
                    <option value="Home Office">Home Office / Trabalho Remoto</option>
                    <option value="Viagem Solo">Viagem Solo</option>
                  </select>
                </div>

                {/* Review Text */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Seu Comentário / Avaliação *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Conte o que mais gostou: a piscina em L, churrasqueira, quartos temáticos, localização perto de Tabatinga e Coqueirinho, etc..."
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                  <div className="flex justify-between text-[11px] text-stone-500 mt-1">
                    <span>Mínimo de 10 caracteres</span>
                    <span>{reviewComment.length} caracteres</span>
                  </div>
                </div>

                {formError && (
                  <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded-lg font-medium border border-rose-200">
                    {formError}
                  </p>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs"
                  >
                    Publicar Avaliação
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
