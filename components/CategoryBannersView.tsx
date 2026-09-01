import React, { useRef } from 'react';
import { BrandStock, SportwearCategory, Product, isProductInBanner } from '../types';

interface CategoryBannersViewProps {
  categoryName: string;
  banners: (BrandStock | SportwearCategory | any)[];
  products: Product[];
  onSelectBrand: (brandName: string, bannerId?: string) => void;
  onSelectSize?: (brandName: string, size: number | string, bannerId?: string) => void;
  onBack: () => void;
}

export const CategoryBannersView: React.FC<CategoryBannersViewProps> = ({
  categoryName,
  banners,
  products,
  onSelectBrand,
  onSelectSize,
  onBack,
}) => {
  const sliderRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 py-6 select-none animate-fade-in">
      {/* Category Header with Back Button */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <span className="w-8 h-[2px] bg-red-600"></span>
            <span className="text-[10px] font-black tracking-[0.4em] uppercase text-red-500">
              COLECCIONES DE {categoryName.toUpperCase()}
            </span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-[1000] italic uppercase tracking-tighter text-white">
            Elige una <span className="text-red-500">Marca / Línea</span>
          </h2>
        </div>

        {/* Back Button ("Atrás") */}
        <button
          onClick={onBack}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 hover:border-red-500 text-xs font-black uppercase tracking-wider text-red-500 hover:text-white transition-all shadow-md active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
          <span>Atrás</span>
        </button>
      </div>

      {/* Horizontal Swipeable Vertical Cards Slider */}
      <div className="relative">
        {/* Navigation Arrows for desktop/tablet */}
        {banners.length > 3 && (
          <>
            <button
              onClick={() => scroll('left')}
              aria-label="Anterior"
              className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/80 border border-white/20 items-center justify-center text-white hover:bg-red-600 transition-all shadow-xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => scroll('right')}
              aria-label="Siguiente"
              className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/80 border border-white/20 items-center justify-center text-white hover:bg-red-600 transition-all shadow-xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Scrollable Container with Snap */}
        <div
          ref={sliderRef}
          className="flex space-x-4 sm:space-x-6 overflow-x-auto no-scrollbar pb-4 pt-1 snap-x snap-mandatory scroll-smooth"
        >
          {banners.map((brand) => {
            const brandName = brand.brand || brand.name || (brand as any).nombre || '';
            const brandImage = brand.marqueeImage || brand.image || brand.logo || 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&q=80&w=600';
            
            // Available sizes calculated strictly for this exact banner
            const brandProducts = products.filter(p => isProductInBanner(p, brand, banners));
            
            const allSizes = brandProducts.flatMap(p => {
              const rawSizes: (string | number)[] = Array.isArray(p.availableSizes)
                ? p.availableSizes
                : (Array.isArray(p.sizes) ? p.sizes : (p.size ? [p.size] : (typeof p.availableSizes === 'string' ? (p.availableSizes as string).split(',') : [])));
              const soldOuts = (p.soldOutSizes || []).map(String);
              return rawSizes.map(String).map(s => s.trim()).filter(s => s && !soldOuts.includes(s));
            });

            const isClothing = categoryName.toLowerCase().includes('sportwear') || categoryName.toLowerCase().includes('ropa');
            const clothingOrder = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL', '4XL'];
            
            const dynamicSizes = Array.from(new Set(allSizes)).sort((a, b) => {
              if (isClothing) {
                const idxA = clothingOrder.indexOf(String(a).toUpperCase());
                const idxB = clothingOrder.indexOf(String(b).toUpperCase());
                if (idxA !== -1 && idxB !== -1) return idxA - idxB;
                if (idxA !== -1) return -1;
                if (idxB !== -1) return 1;
              }
              const numA = Number(a);
              const numB = Number(b);
              if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
              return String(a).localeCompare(String(b), undefined, { numeric: true });
            }).slice(0, 6);

            return (
              <div
                key={brand.id || brandName}
                onClick={() => onSelectBrand(brandName, brand.id)}
                className="w-[200px] sm:w-[240px] md:w-[280px] shrink-0 snap-start relative aspect-[9/14] sm:aspect-[9/15] rounded-3xl overflow-hidden bg-zinc-950 border border-white/10 hover:border-red-600/60 shadow-2xl cursor-pointer group transition-all duration-500 active:scale-95 flex flex-col justify-end p-5 sm:p-6"
              >
                {/* Full Bleed Background Image */}
                <img
                  src={brandImage}
                  alt={brandName}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover object-center transform transition-transform duration-[1500ms] ease-out group-hover:scale-110"
                />

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent transition-opacity duration-500" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />

                {/* Brand Details at Bottom */}
                <div className="relative z-10 space-y-1.5 transform transition-transform duration-300 group-hover:-translate-y-2">
                  {/* Dynamic Red Brand Badge */}
                  <div className="bg-red-600 px-3.5 py-1 rounded-sm shadow-2xl inline-block transform -skew-x-12 mb-1 self-start">
                    <span className="text-white text-[9px] font-[1000] uppercase tracking-[0.3em] italic skew-x-12 block">
                      {brand.brand || brand.name || (brand as any).nombre || (brand as any).bannerTitle || 'MARCA'}
                    </span>
                  </div>

                  {brand.bannerSubtitle && (
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 block drop-shadow">
                      {brand.bannerSubtitle}
                    </span>
                  )}
                  <h3 className="text-2xl sm:text-3xl font-[1000] italic uppercase tracking-tighter text-white leading-none drop-shadow-lg">
                    {brand.bannerTitle || brandName}
                  </h3>

                  {/* Size Quick Access on hover/tap */}
                  {dynamicSizes.length > 0 && (
                    <div className="pt-2 flex flex-wrap gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                      {dynamicSizes.map((size: any) => (
                        <button
                          key={size}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectSize ? onSelectSize(brandName, size, brand.id) : onSelectBrand(brandName, brand.id);
                          }}
                          className="px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 hover:bg-red-600 hover:border-red-600 text-[10px] font-black italic text-white transition-colors"
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="pt-1.5 flex items-center text-[10px] font-black uppercase tracking-wider text-red-500 group-hover:text-white transition-colors">
                    <span>Ver Colección &rarr;</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoryBannersView;
