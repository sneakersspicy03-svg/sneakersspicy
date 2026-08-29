import React from 'react';
import { Product, Section } from '../types';

interface StockXCategoryGridProps {
  products: Product[];
  sections?: Section[];
  activeCategory?: string | null;
  onSelectCategory: (categoryName: string) => void;
}

export const StockXCategoryGrid: React.FC<StockXCategoryGridProps> = ({
  products,
  sections = [],
  activeCategory,
  onSelectCategory,
}) => {
  // Helper to find a representative image for a section
  const getSectionImage = (section: Section): string | null => {
    if (section.imageUrl && section.imageUrl.trim()) {
      return section.imageUrl.trim();
    }

    const secName = (section.name || '').toLowerCase();
    const found = products.find(p => {
      if (p.sectionId && p.sectionId === section.id) return true;
      const pCat = (p.category || '').toLowerCase();
      if (pCat === secName || pCat.includes(secName) || secName.includes(pCat)) return true;
      if ((secName.includes('calzado') || secName.includes('tenis') || secName.includes('shoe') || secName.includes('sneaker')) &&
          (pCat.includes('calzado') || pCat.includes('tenis') || pCat.includes('shoe') || pCat.includes('sneaker'))) return true;
      if ((secName.includes('sportwear') || secName.includes('ropa') || secName.includes('apparel')) &&
          (pCat.includes('sportwear') || pCat.includes('ropa') || pCat.includes('apparel') || pCat.includes('bermuda') || pCat.includes('licra'))) return true;
      if ((secName.includes('media') || secName.includes('sock')) &&
          (pCat.includes('media') || pCat.includes('sock'))) return true;
      return false;
    });

    return found?.image || null;
  };

  // Fallback if no sections in database yet
  const displaySections: Section[] = sections.length > 0 ? sections : [
    { id: 'sec-calzado', name: 'Calzado', emoji: '👟', photoCount: 6, sizeInputType: 'numeric', orderIndex: 0 },
    { id: 'sec-sportwear', name: 'Sportwear', emoji: '👕', photoCount: 2, sizeInputType: 'clothing_letters', orderIndex: 1 },
    { id: 'sec-medias', name: 'Medias', emoji: '🧦', photoCount: 2, sizeInputType: 'clothing_letters', orderIndex: 2 },
  ];

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 py-8 select-none">
      {/* Section Header */}
      <div className="space-y-1 mb-5">
        <div className="flex items-center space-x-3">
          <span className="w-8 h-[2px] bg-red-600"></span>
          <span className="text-[10px] font-black tracking-[0.4em] uppercase text-red-500">
            INVENTARIO ÉLITE
          </span>
        </div>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl sm:text-4xl font-[1000] italic uppercase tracking-tighter text-white">
            Shop by <span className="text-zinc-500">Category</span>
          </h2>
          {activeCategory && (
            <button
              onClick={() => onSelectCategory('')}
              className="text-xs font-black uppercase text-red-500 hover:text-white transition-colors"
            >
              Ver Todo &rarr;
            </button>
          )}
        </div>
      </div>

      {/* Horizontal Slice on Mobile / Grid on Tablet & Desktop */}
      <div className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory gap-3 sm:grid sm:grid-cols-4 sm:gap-5 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {displaySections.map((sec) => {
          const isSelected = activeCategory?.toLowerCase() === sec.name.toLowerCase();
          const imgUrl = getSectionImage(sec);

          return (
            <div
              key={sec.id}
              onClick={() => onSelectCategory(isSelected ? '' : sec.name)}
              className="group flex flex-col items-center cursor-pointer active:scale-95 transition-transform w-[135px] sm:w-auto shrink-0 snap-start"
            >
              {/* Dark Square Container */}
              <div
                className={`relative aspect-square w-full rounded-2xl md:rounded-3xl bg-[#0F0F12] border ${
                  isSelected 
                    ? 'border-red-600 ring-2 ring-red-600/30 shadow-[0_0_30px_rgba(239,68,68,0.2)]' 
                    : 'border-white/10 hover:border-red-600/60'
                } p-3.5 sm:p-6 flex items-center justify-center overflow-hidden transition-all duration-300 shadow-xl group-hover:shadow-red-950/20`}
              >
                {imgUrl ? (
                  <img
                    src={imgUrl}
                    alt={sec.name}
                    loading="lazy"
                    className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)] group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center">
                    <span className="text-4xl sm:text-5xl select-none group-hover:scale-110 transition-transform duration-300 drop-shadow">
                      {sec.emoji || '👟'}
                    </span>
                  </div>
                )}
              </div>

              {/* Category Label Below Container */}
              <span
                className={`mt-2.5 text-xs sm:text-base font-black italic uppercase tracking-tight transition-colors text-center ${
                  isSelected ? 'text-red-500' : 'text-white group-hover:text-red-500'
                }`}
              >
                {sec.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StockXCategoryGrid;
