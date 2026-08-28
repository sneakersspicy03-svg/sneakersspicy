import React from 'react';
import { SportwearCategory, Product } from '../types';

interface SportwearProps {
  categories: SportwearCategory[];
  products: Product[];
  onCategorySelect: (brand: string, category: string) => void;
  onSelectSize?: (brand: string, size: string, category: string) => void;
  onQuickAdd?: (brand: string) => void;
  isDevMode?: boolean;
  title?: string;
  subtitle?: string;
}

const FALLBACK_SPORTWEAR_IMAGE = 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&q=80&w=800';

const CLOTHING_SIZE_ORDER = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL', '4XL'];

export const Sportwear: React.FC<SportwearProps> = ({ 
  categories, 
  products, 
  onCategorySelect, 
  onSelectSize, 
  onQuickAdd, 
  isDevMode = false, 
  title, 
  subtitle 
}) => {
  if (!categories || !Array.isArray(categories) || categories.length === 0) return null;

  return (
    <div className="relative w-full overflow-hidden flex flex-col bg-[#050505] py-24 transition-all duration-700">
      <div className="relative z-10 w-full max-w-[1600px] mx-auto">
        <div className="px-6 md:px-20 mb-12 space-y-8 animate-fade-in">
          <div className="space-y-2">
            <div className="flex items-center space-x-4">
              <span className="w-12 h-[1px] bg-red-500/50"></span>
              <span className="text-[10px] font-black tracking-[0.4em] uppercase text-red-500/60">{subtitle || 'Performance Collection'}</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">{title || <>Sport<span className="text-white/20">wear</span></>}</h2>
          </div>
        </div>

        <div className="px-6 md:px-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((cat, index) => {
              const brandName = (cat.brand || cat.name || 'Sportwear').toUpperCase();
              const bannerTitle = cat.bannerTitle || cat.name;

              // Calcular tallas dinámicas reales vinculadas al inventario disponible
              const brandProducts = products.filter(p => {
                const bName = String(cat.brand || "").trim().toLowerCase();
                const cName = String(cat.name || "").trim().toLowerCase();
                const title = String(cat.bannerTitle || "").trim().toLowerCase();
                const pBrand = String(p.marca || p.brand || "").trim().toLowerCase();
                const pCat = String(p.category || "").trim().toLowerCase();
                const pName = String(p.name || "").trim().toLowerCase();
                
                const matchesBrand = Boolean(bName && (pBrand === bName || pBrand.includes(bName) || bName.includes(pBrand) || pName.includes(bName)));
                const matchesCatName = Boolean(cName && (pBrand === cName || pCat === cName || pCat.includes(cName) || cName.includes(pCat) || pName.includes(cName)));
                const matchesTitle = Boolean(title && (pBrand === title || pCat === title || pName.includes(title)));
                const isGeneralSportwear = pCat.includes('sportwear') || pCat.includes('sportware') || pCat.includes('ropa') || pCat.includes('bermuda') || pCat.includes('licra');
                
                const matches = matchesBrand || matchesCatName || matchesTitle || (categories.length === 1 && isGeneralSportwear);
                const isAvailable = !p.isSoldOut && (p.stock === undefined || p.stock > 0);
                
                return matches && isAvailable;
              });

              // Extraer sólo tallas con stock real
              const allAvailableSizes = brandProducts.flatMap(p => {
                const soldOuts = (p.soldOutSizes || []).map(String);
                return (p.availableSizes || []).filter(s => !soldOuts.includes(String(s)));
              });

              // Ordenar tallas lógicamente
              const dynamicSizes = Array.from(new Set(allAvailableSizes)).sort((a, b) => {
                const idxA = CLOTHING_SIZE_ORDER.indexOf(String(a).toUpperCase());
                const idxB = CLOTHING_SIZE_ORDER.indexOf(String(b).toUpperCase());
                if (idxA !== -1 && idxB !== -1) return idxA - idxB;
                if (idxA !== -1) return -1;
                if (idxB !== -1) return 1;
                return String(a).localeCompare(String(b), undefined, { numeric: true });
              });

              const formatClass = cat.format === 'vertical' ? 'aspect-[9/16]' : cat.format === 'rectangular' ? 'aspect-[21/9] lg:col-span-2' : 'aspect-video';
              const bannerImg = cat.image || cat.marqueeImage || FALLBACK_SPORTWEAR_IMAGE;

              const targetBrand = cat.brand || cat.name;
              const targetCategory = cat.name || 'Sportwear';

              return (
                <div
                  key={cat.id || index}
                  onClick={() => onCategorySelect(targetBrand, targetCategory)}
                  className={`relative ${formatClass} rounded-[3.5rem] overflow-hidden shadow-2xl border transition-all duration-500 group bg-zinc-900 cursor-pointer ${isDevMode ? 'border-red-500/40 shadow-[0_0_40px_rgba(239,68,68,0.1)]' : 'border-white/5 hover:border-red-600/40'}`}
                >
                  <img 
                    src={bannerImg} 
                    alt={bannerTitle} 
                    onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_SPORTWEAR_IMAGE; }}
                    className="w-full h-full object-cover transition-transform duration-[2500ms] group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/10 to-transparent"></div>
                  
                  {/* Badge Rojo y Textos */}
                  <div className="absolute inset-x-0 bottom-0 p-10 flex flex-col items-start space-y-4 transition-all duration-500 group-hover:opacity-0 group-hover:translate-y-4">
                    <div className="bg-red-600 px-5 py-2 rounded-sm shadow-2xl inline-block transform -skew-x-12">
                      <span className="text-white text-[10px] font-[1000] uppercase tracking-[0.3em] italic skew-x-12 block">{brandName}</span>
                    </div>
                    <div className="flex flex-col items-start text-left w-full origin-left">
                      {cat.bannerSubtitle && <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-white/40 mb-1 italic">{cat.bannerSubtitle}</span>}
                      <h3 className="text-3xl sm:text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white leading-[0.85]">{bannerTitle}</h3>
                    </div>
                  </div>

                  {/* Overlay al hacer Hover */}
                  <div className="absolute inset-0 bg-black/85 backdrop-blur-3xl transition-all duration-700 flex flex-col items-center justify-center p-10 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 text-center z-50">
                     <div className="space-y-6 w-full max-w-[280px]">
                        <div className="space-y-2">
                          <div className="text-red-600 font-black text-6xl italic tracking-tighter">SP</div>
                          <p className="font-black uppercase tracking-[0.4em] text-[9px] italic text-zinc-500">
                            {dynamicSizes.length > 0 ? 'Seleccionar Talla' : 'Colección Sportwear'}
                          </p>
                        </div>

                        {/* Mostrar ÚNICAMENTE tallas disponibles si existen */}
                        {dynamicSizes.length > 0 ? (
                          <div className="grid grid-cols-3 gap-3">
                            {dynamicSizes.map(size => (
                              <button 
                                key={size} 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  onSelectSize?.(targetBrand, String(size), targetCategory); 
                                }} 
                                className="aspect-square rounded-2xl border border-white/10 flex items-center justify-center bg-white/5 hover:bg-red-600 hover:text-white transition-all text-sm font-black italic shadow-lg"
                              >
                                {size}
                              </button>
                            ))}
                            {isDevMode && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); if(onQuickAdd) onQuickAdd(targetBrand); }} 
                                className="aspect-square rounded-2xl border-2 border-dashed border-red-500/50 flex items-center justify-center bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
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
                                onCategorySelect(targetBrand, targetCategory); 
                              }}
                              className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-red-900/40"
                            >
                              Ver Colección
                            </button>
                            {isDevMode && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); if(onQuickAdd) onQuickAdd(targetBrand); }} 
                                className="w-full py-2.5 border-2 border-dashed border-red-500/50 rounded-xl text-red-500 hover:bg-red-500 hover:text-white text-xs font-black uppercase tracking-wider transition-all"
                              >
                                + Añadir Pieza a este Banner
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

export default Sportwear;