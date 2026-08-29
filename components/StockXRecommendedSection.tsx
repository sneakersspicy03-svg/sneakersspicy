import React, { useRef } from 'react';
import { Product } from '../types';
import StockXProductCard from './StockXProductCard';

interface StockXRecommendedSectionProps {
  title?: string;
  subtitle?: string;
  badge?: string;
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onAddToCart?: (product: Product, size: number | string) => void;
  wishlistedIds?: string[];
  onToggleWishlist?: (id: string) => void;
  onSeeAll?: () => void;
}

export const StockXRecommendedSection: React.FC<StockXRecommendedSectionProps> = ({
  title = 'Recommended For You',
  subtitle,
  badge = 'INVENTARIO ÉLITE',
  products,
  onSelectProduct,
  onAddToCart,
  wishlistedIds = [],
  onToggleWishlist,
  onSeeAll,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!products || products.length === 0) return null;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="w-full max-w-[1600px] mx-auto px-4 md:px-8 py-6 select-none">
      {/* Section Header with Spicy subtitle line */}
      <div className="flex items-end justify-between mb-5">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <span className="w-8 h-[2px] bg-red-600"></span>
            <span className="text-[10px] font-black tracking-[0.4em] uppercase text-red-500">
              {badge}
            </span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-[1000] italic uppercase tracking-tighter text-white">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-zinc-400 font-medium">{subtitle}</p>
          )}
        </div>

        {/* Scroll Arrows & See All */}
        <div className="flex items-center space-x-2">
          {onSeeAll && (
            <button
              onClick={onSeeAll}
              className="text-xs font-black uppercase text-red-500 hover:text-white transition-colors mr-2"
            >
              Ver Todo &rarr;
            </button>
          )}
          <button
            onClick={() => scroll('left')}
            aria-label="Anterior"
            className="hidden sm:flex w-9 h-9 rounded-xl border border-white/10 bg-zinc-900 items-center justify-center text-zinc-300 hover:text-white hover:border-red-500 active:scale-95 transition-all shadow-md"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => scroll('right')}
            aria-label="Siguiente"
            className="hidden sm:flex w-9 h-9 rounded-xl border border-white/10 bg-zinc-900 items-center justify-center text-zinc-300 hover:text-white hover:border-red-500 active:scale-95 transition-all shadow-md"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Horizontal Carousel (StockX Exact Layout in Dark Spicy Theme) */}
      <div
        ref={scrollRef}
        className="flex space-x-3 sm:space-x-4 overflow-x-auto no-scrollbar pb-3 pt-1 snap-x snap-mandatory"
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="w-[180px] sm:w-[220px] md:w-[240px] shrink-0 snap-start flex"
          >
            <StockXProductCard
              product={product}
              onClick={() => onSelectProduct(product)}
              onAddToCart={onAddToCart}
              isWishlisted={wishlistedIds.includes(product.id)}
              onToggleWishlist={onToggleWishlist}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default StockXRecommendedSection;
