
import React from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, size: number | string) => void;
  onClick: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onClick }) => {
  if (!product || typeof product !== 'object') return null;

  const isAllSoldOut = product.isSoldOut;

  return (
    <div 
      className={`group relative bg-zinc-950 rounded-2xl md:rounded-3xl border border-white/10 overflow-hidden transition-all duration-300 hover:border-red-600/50 cursor-pointer ${isAllSoldOut ? 'opacity-60 grayscale' : ''} active:scale-[0.98] shadow-md hover:shadow-red-950/20`}
      onClick={onClick}
    >
      {/* Imagen del Producto */}
      <div className="relative aspect-square w-full flex items-center justify-center bg-zinc-900/60 rounded-xl p-1.5 sm:p-2 overflow-hidden border-b border-white/5">
        {isAllSoldOut && (
          <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-[1px] flex items-center justify-center">
            <span className="text-sm sm:text-base font-black italic uppercase tracking-tighter text-red-500 border border-red-500/60 px-3 py-0.5 rounded shadow-lg rotate-[-5deg]">
              AGOTADO
            </span>
          </div>
        )}
        <img 
          src={product.image} 
          alt={product.name} 
          loading="lazy"
          className="w-full h-full object-contain max-h-[85%] drop-shadow-2xl transition-transform duration-300 group-hover:scale-105" 
        />
        <div className="absolute top-2.5 left-2.5">
          <span className="px-2.5 py-0.5 bg-red-600 text-white text-[9px] font-black uppercase tracking-widest rounded shadow-lg italic">
            {product.brand}
          </span>
        </div>
      </div>

      {/* Información Básica */}
      <div className="p-3 sm:p-4">
        <div className="flex flex-col justify-between gap-1.5">
          <h3 className="font-bold text-[13px] sm:text-[14px] tracking-tight uppercase leading-tight text-white group-hover:text-red-500 transition-colors line-clamp-2 min-h-[34px]">
            {product.name}
          </h3>
          <p className="font-black italic text-base sm:text-lg tracking-tighter text-red-600 whitespace-nowrap">
            RD${Number(product.price).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
