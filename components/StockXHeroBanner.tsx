import React, { useState, useEffect, useRef } from 'react';
import { BrandStock, SportwearCategory } from '../types';

interface StockXHeroBannerProps {
  customBanners?: (BrandStock | SportwearCategory | any)[];
  onBannerClick?: (banner: any) => void;
  onExploreClick?: () => void;
}

interface PromoSlide {
  id: string;
  badge?: string;
  title: string;
  subtitle: string;
  ctaText: string;
  bgGradient?: string;
  textColor?: string;
  accentColor?: string;
  image?: string;
  isCustom?: boolean;
  originalBanner?: any;
}

export const StockXHeroBanner: React.FC<StockXHeroBannerProps> = ({
  customBanners = [],
  onBannerClick,
  onExploreClick,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Strictly use user-created banners from Firestore
  const validBanners = customBanners.filter(b => b.marqueeImage || (b as any).image || b.logo);

  const slides: PromoSlide[] = validBanners.map((b, idx) => {
    const rawImage = b.marqueeImage || (b as any).image || b.logo || '';
    const title = b.bannerTitle || b.name || (b as any).title || 'Colección Especial';
    const brandName = (b.brand || b.name || (b as any).nombre || (b as any).title || 'SPICY VAULT').trim();
    const badge = brandName.toUpperCase();
    const subtitle = b.bannerSubtitle || (b.brand ? `Explora toda la línea exclusiva de ${b.brand}` : 'Disponibilidad inmediata en Spicy Vault');

    return {
      id: b.id || `banner-${idx}`,
      badge,
      title,
      subtitle,
      ctaText: 'Explorar Marca',
      image: rawImage,
      isCustom: true,
      originalBanner: b
    };
  });

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Touch Swipe Handlers for Cellphones
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 35; // px

    if (distance > minSwipeDistance) {
      // Swiped Left -> Next Slide (Avanzar)
      handleNext();
    } else if (distance < -minSwipeDistance) {
      // Swiped Right -> Prev Slide (Retroceder)
      handlePrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (slides.length === 0) return null;

  const activeSlide = slides[currentIndex] || slides[0];

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 pt-3 pb-6 select-none">
      <div 
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative w-full rounded-2xl md:rounded-3xl overflow-hidden bg-zinc-950 border border-white/10 min-h-[220px] sm:min-h-[260px] md:min-h-[300px] shadow-2xl transition-all duration-700 flex items-center justify-between p-6 sm:p-8 md:p-12 cursor-pointer group"
        onClick={() => {
          if (activeSlide.isCustom && onBannerClick) {
            onBannerClick(activeSlide);
          } else if (onExploreClick) {
            onExploreClick();
          }
        }}
      >
        {/* Full Cover Background Image with smooth transition */}
        {activeSlide.image && (
          <div className="absolute inset-0 z-0 overflow-hidden bg-black">
            <img
              key={activeSlide.id}
              src={activeSlide.image}
              alt={activeSlide.title}
              className="w-full h-full object-cover object-center transform transition-transform duration-[2000ms] ease-out group-hover:scale-105 animate-fade-in"
            />
            {/* Left-to-Right cinematic gradient ensuring text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/75 to-black/25 sm:via-black/70 sm:to-transparent pointer-events-none" />
            {/* Top & Bottom subtle vignettes */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30 pointer-events-none" />
          </div>
        )}

        {/* Left Editorial Content */}
        <div className="relative z-10 max-w-lg md:max-w-xl space-y-2">
          {/* Badge */}
          {activeSlide.badge && (
            <div className="flex items-center space-x-2">
              <div className="bg-red-600 px-4 py-1.5 rounded-sm shadow-2xl inline-block transform -skew-x-12">
                <span className="text-white text-[10px] md:text-[11px] font-[1000] tracking-[0.3em] uppercase italic skew-x-12 block">
                  {activeSlide.badge}
                </span>
              </div>
            </div>
          )}

          {/* Heading */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-[1000] italic uppercase tracking-tighter text-white leading-[1.05] drop-shadow-lg">
            {activeSlide.title}
          </h2>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm font-semibold text-zinc-300 max-w-md pt-0.5 leading-snug drop-shadow">
            {activeSlide.subtitle}
          </p>

          {/* CTA Link / Button */}
          <div className="pt-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onBannerClick) {
                  onBannerClick(activeSlide);
                } else if (onExploreClick) {
                  onExploreClick();
                }
              }}
              className="inline-flex items-center text-xs sm:text-sm font-black uppercase tracking-wider text-white hover:text-red-500 underline underline-offset-4 transition-colors group/btn"
            >
              <span>{activeSlide.ctaText}</span>
              <svg className="w-4 h-4 ml-1.5 text-red-500 transform group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Pagination Dots (Bottom-Right Pill Indicator) */}
        {slides.length > 1 && (
          <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-20 flex items-center space-x-1.5 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-lg">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                aria-label={`Slide ${idx + 1}`}
                className={`transition-all duration-300 rounded-full ${
                  currentIndex === idx
                    ? 'w-5 h-2 bg-red-600 shadow-md shadow-red-900/60'
                    : 'w-2 h-2 bg-white/30 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StockXHeroBanner;
