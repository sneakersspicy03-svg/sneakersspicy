
import React from 'react';
import { SportwearCategory } from '../types';

interface SportwearProps {
  categories: SportwearCategory[];
  onCategorySelect: (brand: string, category: string) => void;
  onSelectSize?: (brand: string, size: string, category: string) => void;
  onQuickAdd?: (brand: string) => void;
  isDevMode?: boolean;
}

const SPORTWEAR_SIZES = ['L', 'XL', 'XXL'];

const Sportwear: React.FC<SportwearProps> = ({ categories, onCategorySelect, onSelectSize, onQuickAdd, isDevMode = false }) => {
  if (!categories || !Array.isArray(categories)) return null;

  return (
    <div className="relative w-full overflow-hidden flex flex-col bg-[#050505] py-24 transition-all duration-700">
      <div className="relative z-10 w-full max-w-[1600px] mx-auto">
        <div className="px-6 md:px-20 mb-12 space-y-8 animate-fade-in">
          <div className="space-y-2">
            <div className="flex items-center space-x-4">
              <span className="w-12 h-[1px] bg-red-500/50"></span>
              <span className="text-[10px] font-black tracking-[0.4em] uppercase text-red-500/60">Performance Collection</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">Sport<span className="text-white/20">wear</span></h2>
          </div>
        </div>

        <div className="px-6 md:px-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((cat, index) => {
              const brandName = (cat.brand || 'Nike').toUpperCase();
              const title = cat.bannerTitle || cat.name;

              return (
                <div
                  key={index}
                  onClick={() => onCategorySelect(cat.brand || 'Nike', cat.name)}
                  className={`relative h-[65vh] md:h-[75vh] rounded-[3.5rem] overflow-hidden shadow-2xl border transition-all duration-500 group bg-zinc-900 cursor-pointer ${isDevMode ? 'border-red-500/40 shadow-[0_0_40px_rgba(239,68,68,0.1)]' : 'border-white/5 hover:border-red-600/40'}`}
                >
                  <img src={cat.image} alt={title} className="w-full h-full object-cover transition-transform duration-[2500ms] group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/10 to-transparent"></div>
                  
                  {/* Badge Rojo y Textos */}
                  <div className="absolute inset-x-0 bottom-0 p-10 flex flex-col items-start space-y-4 transition-all duration-500 group-hover:opacity-0 group-hover:translate-y-4">
                    <div className="bg-red-600 px-5 py-2 rounded-sm shadow-2xl inline-block transform -skew-x-12">
                      <span className="text-white text-[10px] font-[1000] uppercase tracking-[0.3em] italic skew-x-12 block">{brandName}</span>
                    </div>
                    <div className="flex flex-col items-start text-left w-full origin-left">
                      {cat.bannerSubtitle && <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-white/40 mb-1 italic">{cat.bannerSubtitle}</span>}
                      <h3 className="text-3xl sm:text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white leading-[0.85]">{title}</h3>
                    </div>
                  </div>

                  <div className="absolute inset-0 bg-black/85 backdrop-blur-3xl transition-all duration-700 flex flex-col items-center justify-center p-10 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 text-center">
                     <div className="space-y-8 w-full max-w-[280px]">
                        <div className="space-y-2">
                          <div className="text-red-600 font-black text-6xl italic tracking-tighter">SP</div>
                          <p className="font-black uppercase tracking-[0.4em] text-[9px] italic text-zinc-500">Seleccionar Talla</p>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          {SPORTWEAR_SIZES.map(size => (
                            <button key={size} onClick={(e) => { e.stopPropagation(); onSelectSize?.(cat.brand || 'Nike', size, cat.name); }} className="aspect-square rounded-2xl border border-white/10 flex items-center justify-center bg-white/5 hover:bg-red-600 hover:text-white transition-all text-sm font-black italic">{size}</button>
                          ))}
                          {isDevMode && (
                            <button onClick={(e) => { e.stopPropagation(); if(onQuickAdd) onQuickAdd(cat.brand || 'Nike'); }} className="aspect-square rounded-2xl border-2 border-dashed border-red-500/50 flex items-center justify-center bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"><span className="text-xl font-bold">+</span></button>
                          )}
                        </div>
                     </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sportwear;
