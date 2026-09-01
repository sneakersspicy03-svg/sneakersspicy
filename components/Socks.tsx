import React from 'react';
import { BrandStock, Product, isProductInBanner } from '../types';

interface SocksProps {
  brands: BrandStock[];
  products: Product[];
  onBrandSelect: (brand: string, bannerId?: string) => void;
  onQuickAdd?: (brand: string) => void;
  isDevMode?: boolean;
  onSelectSize?: (brand: string, size: number | string, category: string, bannerId?: string) => void;
  title?: string;
  subtitle?: string;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?auto=format&fit=crop&q=80&w=1200';

const Socks: React.FC<SocksProps> = ({ brands, products, onBrandSelect, onQuickAdd, isDevMode = false, onSelectSize, title, subtitle }) => {
  return (
    <div className="relative w-full overflow-hidden flex flex-col bg-[#020202] py-24 transition-all duration-700">
      <div className="relative z-10 w-full max-w-[1600px] mx-auto">
        <div className="px-6 md:px-20 mb-12 space-y-8 animate-fade-in">
          <div className="space-y-2">
            <div className="flex items-center space-x-4">
              <span className="w-12 h-[1px] bg-red-500/50"></span>
              <span className="text-[10px] font-black tracking-[0.4em] uppercase text-red-500/60">{subtitle || 'Premium Accessories'}</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">{title || <>Medias <span className="text-white/20">Elite</span></>}</h2>
          </div>
        </div>

        <div className="px-6 md:px-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {brands.map((brand) => {
              const bannerBrand = ((brand as any).brand || (brand as any).nombre || brand.name || brand.bannerTitle || 'MARCA').trim();

              // 1. Filtrado exacto con isProductInBanner
              const matchingProducts = products.filter(p => isProductInBanner(p, { ...brand, section: 'medias' }, brands));

              // 2. Extraer tallas de matchingProducts
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
                const soldOuts = ((p.soldOutSizes || (p as any).agotadas || []) as any[]).map(String);
                return list.map(s => String(s).trim()).filter(s => s && !soldOuts.includes(s.toUpperCase()));
              });

              const dynamicSizes = Array.from(new Set(allSizes)).sort((a, b) => String(a).localeCompare(String(b)));

              const formatClass = brand.format === 'vertical' ? 'aspect-[9/16]' : brand.format === 'rectangular' ? 'aspect-[21/9] lg:col-span-2' : 'aspect-video';

              return (
                <div
                  key={brand.id || brand.name}
                  onClick={() => onBrandSelect(bannerBrand, brand.id)}
                  className={`relative ${formatClass} rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden shadow-2xl border transition-all duration-500 group bg-zinc-900 cursor-pointer ${isDevMode ? 'border-red-500/40 shadow-[0_0_30px_rgba(239,68,68,0.1)]' : 'border-white/5 hover:border-red-600/50'}`}
                >
                  <img src={brand.marqueeImage} alt={brand.name} className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110" onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                  
                  {/* Badge Rojo Dinámico y Textos */}
                  <div className="absolute inset-x-0 bottom-10 px-10 space-y-3 transition-all duration-500 group-hover:opacity-0 group-hover:translate-y-4">
                    <div className="bg-red-600 px-4 py-1.5 rounded-sm shadow-2xl inline-block transform -skew-x-12">
                      <span className="text-white text-[10px] font-[1000] uppercase tracking-[0.3em] italic skew-x-12 block">{bannerBrand}</span>
                    </div>
                    {brand.bannerSubtitle && <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 italic">{brand.bannerSubtitle}</span>}
                    <h3 className="text-[40px] md:text-[50px] font-black italic uppercase tracking-tighter text-white leading-none drop-shadow-2xl">{brand.bannerTitle || brand.name}</h3>
                  </div>

                  <div className="absolute inset-0 bg-black/85 backdrop-blur-xl transition-all duration-700 flex flex-col items-center justify-center p-8 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 z-50">
                    <div className="text-center space-y-8 w-full max-w-[240px]">
                      <div className="space-y-2">
                        <div className="text-red-600 font-black text-6xl italic tracking-tighter">SP</div>
                        <p className="font-black uppercase tracking-[0.4em] text-[9px] italic text-zinc-500">Colección Premium</p>
                      </div>

                      {dynamicSizes.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2.5">
                          {dynamicSizes.map(size => (
                            <button
                              key={size}
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectSize ? onSelectSize(bannerBrand, size, 'Medias', brand.id) : onBrandSelect(bannerBrand, brand.id);
                              }}
                              className="min-w-[40px] h-10 px-2 flex items-center justify-center bg-white/10 hover:bg-red-600 border border-white/20 rounded-xl text-xs font-bold text-white transition-all shadow-lg"
                            >
                              {size}
                            </button>
                          ))}
                          {isDevMode && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onQuickAdd) onQuickAdd(bannerBrand);
                              }}
                              className="min-w-[40px] h-10 px-2 border-2 border-dashed border-red-500/50 flex items-center justify-center bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all"
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
                              onBrandSelect(bannerBrand, brand.id);
                            }}
                            className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-red-900/40"
                          >
                            Ver Colección
                          </button>
                          {isDevMode && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onQuickAdd) onQuickAdd(bannerBrand);
                              }}
                              className="w-full py-2.5 border-2 border-dashed border-red-500/50 rounded-xl text-red-500 hover:bg-red-500 hover:text-white text-xs font-black uppercase tracking-wider transition-all"
                            >
                              + Añadir Medias
                            </button>
                          )}
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

export default Socks;
