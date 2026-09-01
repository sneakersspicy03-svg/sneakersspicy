
import React from 'react';
import { BrandStock, Product } from '../types';

interface HeroProps {
  brands: BrandStock[];
  products: Product[];
  onBrandSelect: (brand: BrandStock) => void;
  activeBrand: BrandStock | null;
  isDevMode?: boolean;
  onQuickAdd?: (brandName: string) => void;
  onSelectSize?: (brand: string, size: number | string, category?: string) => void;
  title?: string;
  subtitle?: string;
}

const Hero: React.FC<HeroProps> = ({ 
  brands,
  products,
  onBrandSelect, 
  activeBrand, 
  isDevMode = false,
  onQuickAdd,
  onSelectSize,
  title,
  subtitle
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
                {subtitle || (isDevMode ? 'PROTOCOLO DE ACCESO TOTAL' : 'Inventario Élite')}
              </span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">
              {title || <>Calzado de <span className="text-white/20">Basket</span></>}
            </h2>
          </div>
        </div>

        <div className="px-6 md:px-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {brands.map((brand) => {
              const bannerBrand = (brand.brand || (brand as any).nombre || brand.name || brand.bannerTitle || 'MARCA').trim();
              const bannerBrandNorm = bannerBrand.toLowerCase();

              const normalizeSection = (sec?: string) => {
                const s = String(sec || '').toLowerCase().trim();
                if (s.includes('calzado') || s.includes('tenis') || s.includes('shoe') || s.includes('sneaker') || s === 'shoes') return 'calzado';
                if (s.includes('sportwear') || s.includes('sportware') || s.includes('ropa')) return 'sportwear';
                if (s.includes('media') || s.includes('sock')) return 'medias';
                return s;
              };

              const bannerSectionNorm = 'calzado';

              // 1. Filtrado estricto por MARCA y SECCIÓN con stock disponible
              const matchingProducts = products.filter(p => {
                const pBrand = String(p.brand || p.marca || '').trim().toLowerCase();
                const pSection = normalizeSection((p as any).section || (p as any).category || (p as any).sectionId);
                const hasStock = !p.isSoldOut && (p.stock === undefined || p.stock > 0);
                
                return pBrand === bannerBrandNorm && pSection === bannerSectionNorm && hasStock;
              });

              // 2. Extraer tallas de matchingProducts (array de tallas o string único)
              const allSizes = matchingProducts.flatMap(p => {
                let list: (string | number)[] = [];
                if (Array.isArray(p.availableSizes) && p.availableSizes.length > 0) {
                  list = p.availableSizes;
                } else if (Array.isArray((p as any).sizes) && (p as any).sizes.length > 0) {
                  list = (p as any).sizes;
                } else if (typeof (p as any).size === 'string' && (p as any).size.trim()) {
                  list = [(p as any).size.trim()];
                } else if (typeof p.availableSizes === 'string') {
                  list = (p.availableSizes as string).split(',').map(s => s.trim());
                }
                const soldOuts = ((p.soldOutSizes || (p as any).agotadas || []) as any[]).map(s => String(s).trim().toUpperCase());
                return list.map(s => String(s).trim()).filter(s => s && !soldOuts.includes(s.toUpperCase()));
              });

              const dynamicSizes = Array.from(new Set(allSizes)).sort((a, b) => {
                const numA = Number(a);
                const numB = Number(b);
                if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
                return String(a).localeCompare(String(b), undefined, { numeric: true });
              });

              const formatClass = brand.format === 'vertical' ? 'aspect-[9/16]' : brand.format === 'rectangular' ? 'aspect-[21/9] lg:col-span-2' : 'aspect-video';

              return (
                <div
                  key={brand.name}
                  onClick={() => onBrandSelect(brand)}
                  className={`relative ${formatClass} rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl border transition-all duration-500 group bg-zinc-900 cursor-pointer ${isDevMode ? 'border-red-500/40 shadow-[0_0_30px_rgba(239,68,68,0.1)]' : 'border-white/5 hover:border-red-600/40'}`}
                >
                  <img src={brand.marqueeImage} alt={brand.name} className="w-full h-full object-cover transition-transform duration-[2000ms] ease-out group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-700"></div>
                  
                  {/* Badge Rojo Dinámico y Textos */}
                  <div className="absolute inset-x-0 bottom-0 p-8 md:p-10 flex flex-col items-start space-y-3 transition-all duration-500 group-hover:opacity-0 group-hover:translate-y-4">
                    <div className="bg-red-600 px-4 py-1.5 rounded-sm shadow-2xl inline-block transform -skew-x-12">
                      <span className="text-white text-[10px] font-[1000] uppercase tracking-[0.3em] italic skew-x-12 block">{brand.brand || (brand as any).nombre || brand.name || brand.bannerTitle || 'MARCA'}</span>
                    </div>
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
                      
                      {dynamicSizes.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2.5 w-full mx-auto relative">
                          {dynamicSizes.map(size => (
                            <button 
                              key={size}
                              onClick={(e) => { e.stopPropagation(); onSelectSize?.(bannerBrand, size, 'Calzado'); }}
                              className="min-w-[40px] h-10 px-2 flex items-center justify-center bg-white/10 hover:bg-red-600 border border-white/20 rounded-xl text-sm font-bold text-white transition-all z-10"
                            >
                              {size}
                            </button>
                          ))}
                          {isDevMode && (
                            <button 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                if(onQuickAdd) onQuickAdd(bannerBrand); 
                              }}
                              className="min-w-[40px] h-10 px-2 border-2 border-dashed border-red-500/50 flex items-center justify-center bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 rounded-xl transition-all cursor-pointer z-[70]"
                            >
                              <span className="text-xl font-bold">+</span>
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <button 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              onBrandSelect(brand); 
                            }}
                            className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-red-900/40"
                          >
                            Ver Colección
                          </button>
                        </div>
                      )}
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

export default Hero;
