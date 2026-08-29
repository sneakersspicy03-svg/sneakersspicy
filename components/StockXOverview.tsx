import React from 'react';
import { Product, Section, BrandStock, SportwearCategory } from '../types';

interface StockXOverviewProps {
  products: Product[];
  sections: Section[];
  tennisBrands: BrandStock[];
  categories: SportwearCategory[];
  socksBrands: BrandStock[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, size: number | string) => void;
  onCategoryClick: (categoryName: string) => void;
  onBrandClick: (brandName: string) => void;
}

const StockXOverview: React.FC<StockXOverviewProps> = ({
  products,
  sections,
  tennisBrands,
  categories,
  socksBrands,
  onSelectProduct,
  onAddToCart,
  onCategoryClick,
  onBrandClick
}) => {
  // Filtrar productos por sección/categoría
  const sneakerProducts = products.filter(p => {
    const cat = (p.category || '').toLowerCase();
    return cat.includes('shoes') || cat.includes('calzado') || cat.includes('tenis') || cat.includes('sneaker');
  });

  const apparelProducts = products.filter(p => {
    const cat = (p.category || '').toLowerCase();
    return cat.includes('sportwear') || cat.includes('ropa') || cat.includes('apparel') || cat.includes('bermuda') || cat.includes('licra') || cat.includes('textil');
  });

  const socksProducts = products.filter(p => {
    const cat = (p.category || '').toLowerCase();
    return cat.includes('media') || cat.includes('sock');
  });

  const recommendedProducts = products.slice(0, 8);

  // Categorías visuales dinámicas desde 'sections' de Firestore
  const categoryTiles = (sections && sections.length > 0 ? sections : [
    { id: 'sec-calzado', name: 'Calzado', emoji: '👟', photoCount: 6, sizeInputType: 'numeric' as const, orderIndex: 0 },
    { id: 'sec-sportwear', name: 'Sportwear', emoji: '👕', photoCount: 2, sizeInputType: 'clothing_letters' as const, orderIndex: 1 },
    { id: 'sec-medias', name: 'Medias', emoji: '🧦', photoCount: 2, sizeInputType: 'clothing_letters' as const, orderIndex: 2 },
  ]).map(sec => {
    let img = sec.imageUrl || '';
    if (!img) {
      const secName = sec.name.toLowerCase();
      const match = products.find(p => {
        if (p.sectionId && p.sectionId === sec.id) return true;
        const pCat = (p.category || '').toLowerCase();
        return pCat === secName || pCat.includes(secName) || secName.includes(pCat);
      });
      img = match?.image || '';
    }
    const count = products.filter(p => {
      if (p.sectionId && p.sectionId === sec.id) return true;
      const pCat = (p.category || '').toLowerCase();
      return pCat === sec.name.toLowerCase() || pCat.includes(sec.name.toLowerCase()) || sec.name.toLowerCase().includes(pCat);
    }).length;

    return {
      id: sec.id,
      title: sec.name,
      name: sec.name,
      emoji: sec.emoji || '👟',
      image: img,
      count: count || products.length
    };
  });

  // Componente de Tarjeta de Producto estilo StockX (Exacto al diseño de la imagen)
  const StockXCard: React.FC<{ product: Product }> = ({ product }) => {
    const isSoldOut = product.isSoldOut;
    return (
      <div 
        onClick={() => onSelectProduct(product)}
        className="w-[185px] sm:w-[210px] shrink-0 bg-zinc-950/90 rounded-2xl border border-white/10 hover:border-red-600/50 p-3 flex flex-col justify-between transition-all duration-300 group cursor-pointer active:scale-[0.98] shadow-md hover:shadow-red-950/20 relative"
      >
        {/* Botón Favorito / Corazón (Estilo StockX) */}
        <button 
          onClick={(e) => { e.stopPropagation(); }}
          className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-black/40 flex items-center justify-center text-zinc-400 hover:text-red-500 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        {/* Imagen limpia del producto */}
        <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-zinc-900/40 p-2 flex items-center justify-center mb-2.5">
          <img 
            src={product.image} 
            alt={product.name} 
            loading="lazy"
            className="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-500" 
          />
          {isSoldOut && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center">
              <span className="text-[10px] font-black uppercase text-red-500 border border-red-500 px-2 py-0.5 rounded">
                Agotado
              </span>
            </div>
          )}
        </div>

        {/* Título y Marca */}
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-white leading-tight line-clamp-2 min-h-[32px] group-hover:text-red-500 transition-colors">
            {product.name}
          </h4>
          
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
            Lowest Ask
          </p>

          {/* Precio prominente */}
          <div className="flex items-baseline justify-between pt-0.5">
            <span className="text-base font-black italic text-white tracking-tight">
              RD${product.price}
            </span>
          </div>

          {/* Badge StockX "Xpress Ship" */}
          <div className="pt-1.5 flex items-center">
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-zinc-900 border border-white/5 text-[9px] font-black text-zinc-300 uppercase tracking-wider">
              <svg className="w-2.5 h-2.5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.5a.75.75 0 01.75.75v1.284a7.502 7.502 0 016.716 6.716h1.284a.75.75 0 010 1.5h-1.284a7.502 7.502 0 01-6.716 6.716v1.284a.75.75 0 01-1.5 0v-1.284a7.502 7.502 0 01-6.716-6.716H3.25a.75.75 0 010-1.5h1.284a7.502 7.502 0 016.716-6.716V3.25a.75.75 0 01.75-.75z" />
              </svg>
              <span>Xpress Ship</span>
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 md:px-12 py-6 space-y-12 animate-fade-in">
      
      {/* 1. Banner Superior Estilo StockX Auction / Drop Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-950 via-zinc-900 to-black border border-emerald-500/20 p-6 md:p-10 shadow-2xl">
        <div className="relative z-10 max-w-xl space-y-3">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400">
            SNEAKERS SPICY • RESUMEN DE TIENDA
          </span>
          <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-white leading-tight">
            The Elite Vault <br /><span className="text-red-500">Live Collection</span>
          </h2>
          <p className="text-xs text-zinc-400 line-clamp-2">
            Navega por todas las categorías con un solo vistazo. Usa el gesto de pellizco en pantalla para alternar entre vista compacta y vista inmersiva.
          </p>
          <div className="pt-2 flex items-center space-x-3">
            <button 
              onClick={() => onCategoryClick('')}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-red-900/40 active:scale-95"
            >
              Explorar Todo
            </button>
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
              {products.length} Artículos Disponibles
            </span>
          </div>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-20 bg-gradient-to-l from-red-600 to-transparent pointer-events-none"></div>
      </div>

      {/* 2. Shop by Category (Exacto a la captura de StockX compartida) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl md:text-2xl font-black italic uppercase tracking-tight text-white flex items-center space-x-2">
            <span>Shop by Category</span>
            <span className="text-xs text-red-500 font-normal ml-2 tracking-widest">• StockX View</span>
          </h3>
          <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">
            Toca una categoría para ir directo
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-6">
          {categoryTiles.map(tile => (
            <div
              key={tile.id}
              onClick={() => onCategoryClick(tile.name)}
              className="group bg-zinc-950/80 rounded-2xl md:rounded-3xl border border-white/5 hover:border-red-600/50 p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 active:scale-95 hover:shadow-xl hover:shadow-red-950/20"
            >
              <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl bg-zinc-900/50 flex items-center justify-center p-2 mb-3 overflow-hidden border border-white/5 group-hover:border-red-600/30">
                {tile.image ? (
                  <img 
                    src={tile.image} 
                    alt={tile.title} 
                    className="w-full h-full object-contain transform group-hover:scale-115 transition-transform duration-500" 
                  />
                ) : (
                  <span className="text-4xl select-none group-hover:scale-115 transition-transform duration-300">
                    {tile.emoji}
                  </span>
                )}
              </div>
              <span className="text-sm font-black uppercase text-white group-hover:text-red-500 transition-colors tracking-tight">
                {tile.title}
              </span>
              <span className="text-[10px] font-bold text-zinc-500 tracking-wider">
                {tile.count} productos
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Recommended For You (Carrusel Horizontal Estilo StockX) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl md:text-2xl font-black italic uppercase tracking-tight text-white">
              Recommended For You
            </h3>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              Selección destacada para compra inmediata
            </p>
          </div>
          <button 
            onClick={() => onCategoryClick('')}
            className="text-xs font-black uppercase text-red-500 hover:text-white transition-colors"
          >
            Ver Más &rarr;
          </button>
        </div>

        <div className="flex space-x-4 overflow-x-auto no-scrollbar pb-3 pt-1">
          {recommendedProducts.map(p => (
            <StockXCard key={p.id} product={p} />
          ))}
        </div>
      </div>

      {/* 4. Sneakers / Calzado Row */}
      {sneakerProducts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xl">👟</span>
              <h3 className="text-xl md:text-2xl font-black italic uppercase tracking-tight text-white">
                Sneakers & Basketball
              </h3>
            </div>
            <button 
              onClick={() => onCategoryClick('Calzado')}
              className="text-xs font-black uppercase text-red-500 hover:text-white transition-colors"
            >
              Explorar [{sneakerProducts.length}] &rarr;
            </button>
          </div>

          <div className="flex space-x-4 overflow-x-auto no-scrollbar pb-3 pt-1">
            {sneakerProducts.map(p => (
              <StockXCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* 5. Apparel / Sportwear Row */}
      {apparelProducts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xl">👕</span>
              <h3 className="text-xl md:text-2xl font-black italic uppercase tracking-tight text-white">
                Apparel & Sportwear
              </h3>
            </div>
            <button 
              onClick={() => onCategoryClick('Sportwear')}
              className="text-xs font-black uppercase text-red-500 hover:text-white transition-colors"
            >
              Explorar [{apparelProducts.length}] &rarr;
            </button>
          </div>

          <div className="flex space-x-4 overflow-x-auto no-scrollbar pb-3 pt-1">
            {apparelProducts.map(p => (
              <StockXCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* 6. Socks / Medias Row */}
      {socksProducts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xl">🧦</span>
              <h3 className="text-xl md:text-2xl font-black italic uppercase tracking-tight text-white">
                Medias & Accesorios
              </h3>
            </div>
            <button 
              onClick={() => onCategoryClick('Medias')}
              className="text-xs font-black uppercase text-red-500 hover:text-white transition-colors"
            >
              Explorar [{socksProducts.length}] &rarr;
            </button>
          </div>

          <div className="flex space-x-4 overflow-x-auto no-scrollbar pb-3 pt-1">
            {socksProducts.map(p => (
              <StockXCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StockXOverview;
