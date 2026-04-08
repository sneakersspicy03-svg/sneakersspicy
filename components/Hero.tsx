
import React from 'react';
import { BrandStock } from '../types';

interface HeroProps {
  brands: BrandStock[];
  onBrandSelect: (brand: BrandStock) => void;
  activeBrand: BrandStock | null;
  isDevMode?: boolean;
  onQuickAdd?: (brandName: string) => void;
  onSelectSize?: (brand: string, size: number) => void;
}

const Hero: React.FC<HeroProps> = ({ 
  brands,
  onBrandSelect, 
  activeBrand, 
  isDevMode = false,
  onQuickAdd,
  onSelectSize
}) => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col bg-[#020202] pt-28 pb-12 transition-all duration-700">
      <div className="absolute inset-0 z-0">
        <div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-b ${isDevMode ? 'from-red-500/10' : 'from-red-500/5'} to-transparent opacity-20`}></div>
      </div>

      <div className="relative z-10 w-full max-w-[1600px] mx-auto">
        <div className="px-6 md:px-20 mb-12 space-y-8 animate-fade-in">
          <div className="space-y-2">
            <div className="flex items-center space-x-4">
              <span className="w-12 h-[1px] bg-red-500/50"></span>
              <span className="text-[10px] font-black tracking-[0.4em] uppercase text-red-500/60">
                {isDevMode ? 'PROTOCOLO DE ACCESO TOTAL' : 'Inventario Élite'}
              </span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">
              Calzado de <span className="text-white/20">Basket</span>
            </h2>
          </div>
        </div>

        <div className="px-6 md:px-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {brands.map((brand) => (
              <div
                key={brand.name}
                onClick={() => onBrandSelect(brand)}
                className={`relative h-[50vh] md:h-[60vh] rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl border transition-all duration-500 group bg-zinc-900 cursor-pointer ${isDevMode ? 'border-red-500/40 shadow-[0_0_30px_rgba(239,68,68,0.1)]' : 'border-white/5 hover:border-red-600/40'}`}
              >
                <img src={brand.marqueeImage} alt={brand.name} className="w-full h-full object-cover transition-transform duration-[2000ms] ease-out group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-700"></div>
                
                <div className="absolute inset-x-0 bottom-0 p-8 md:p-10 flex flex-col items-start space-y-3 transition-all duration-500 group-hover:opacity-0 group-hover:translate-y-4">
                  {brand.bannerSubtitle && (
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-1 italic">
                      {brand.bannerSubtitle}
                    </span>
                  )}
                  <h3 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white leading-none">
                    {brand.bannerTitle || brand.name}
                  </h3>
                </div>

                <div className="absolute inset-0 bg-black/80 backdrop-blur-xl transition-all duration-700 flex flex-col items-center justify-center p-8 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 z-[60]">
                  <div className="text-center space-y-5 w-full max-w-[280px]">
                    <span className="text-red-500 text-[9px] font-black uppercase tracking-[0.5em] block">Filtrar por Talla</span>
                    
                    <div className="grid grid-cols-4 gap-2 w-full mx-auto relative">
                      {(brand.availableSizes || []).map(size => (
                        <button 
                          key={size}
                          onClick={(e) => { e.stopPropagation(); onSelectSize?.(brand.name, size); }}
                          className="aspect-square rounded-xl border border-white/10 flex items-center justify-center bg-white/5 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all text-[11px] font-black italic z-10"
                        >
                          {size}
                        </button>
                      ))}
                      {isDevMode && (
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            if(onQuickAdd) onQuickAdd(brand.name); 
                          }}
                          className="aspect-square rounded-xl border-2 border-dashed border-red-500/50 flex items-center justify-center bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 transition-all cursor-pointer z-[70]"
                        >
                          <span className="text-xl font-bold">+</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
