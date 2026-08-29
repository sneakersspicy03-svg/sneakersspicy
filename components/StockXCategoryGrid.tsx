import React from 'react';
import { Product, Section } from '../types';

interface StockXCategoryGridProps {
  products: Product[];
  sections?: Section[];
  activeCategory?: string | null;
  onSelectCategory: (categoryName: string) => void;
}

interface CategoryItem {
  id: string;
  name: string;
  displayTitle: string;
  image: string;
  fallbackQuery: string;
}

export const StockXCategoryGrid: React.FC<StockXCategoryGridProps> = ({
  products,
  sections = [],
  activeCategory,
  onSelectCategory,
}) => {
  // Find clean representative images from products
  const getProductImageByFilter = (filterFn: (p: Product) => boolean, fallback: string) => {
    const found = products.find(filterFn);
    return found?.image || fallback;
  };

  const defaultCategories: CategoryItem[] = [
    {
      id: 'sneakers',
      name: 'Calzado',
      displayTitle: 'Sneakers',
      image: getProductImageByFilter(
        p => (p.category || '').toLowerCase().includes('calzado') || (p.category || '').toLowerCase().includes('tenis') || (p.category || '').toLowerCase().includes('shoes'),
        'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&q=80&w=400'
      ),
      fallbackQuery: 'sneakers'
    },
    {
      id: 'shoes',
      name: 'Calzado',
      displayTitle: 'Shoes',
      image: getProductImageByFilter(
        p => (p.name || '').toLowerCase().includes('slide') || (p.name || '').toLowerCase().includes('croc') || (p.name || '').toLowerCase().includes('foam'),
        'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=400'
      ),
      fallbackQuery: 'shoes'
    },
    {
      id: 'apparel',
      name: 'Sportwear',
      displayTitle: 'Apparel',
      image: getProductImageByFilter(
        p => (p.category || '').toLowerCase().includes('sportwear') || (p.category || '').toLowerCase().includes('ropa') || (p.category || '').toLowerCase().includes('apparel') || (p.category || '').toLowerCase().includes('bermuda') || (p.category || '').toLowerCase().includes('licra'),
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=400'
      ),
      fallbackQuery: 'apparel'
    },
    {
      id: 'socks',
      name: 'Medias',
      displayTitle: 'Socks',
      image: getProductImageByFilter(
        p => (p.category || '').toLowerCase().includes('media') || (p.category || '').toLowerCase().includes('sock'),
        'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?auto=format&fit=crop&q=80&w=400'
      ),
      fallbackQuery: 'socks'
    }
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
        {defaultCategories.map((cat) => {
          const isSelected = activeCategory?.toLowerCase() === cat.name.toLowerCase() || activeCategory?.toLowerCase() === cat.displayTitle.toLowerCase();

          return (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.name)}
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
                <img
                  src={cat.image}
                  alt={cat.displayTitle}
                  loading="lazy"
                  className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)] group-hover:scale-115 transition-transform duration-500"
                />
              </div>

              {/* Category Label Below Container */}
              <span
                className={`mt-2.5 text-xs sm:text-base font-black italic uppercase tracking-tight transition-colors text-center ${
                  isSelected ? 'text-red-500' : 'text-white group-hover:text-red-500'
                }`}
              >
                {cat.displayTitle}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StockXCategoryGrid;
