
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
      className={`group relative bg-zinc-950 rounded-[2.5rem] border border-white/5 overflow-hidden transition-all duration-500 hover:border-red-600/50 cursor-pointer ${isAllSoldOut ? 'opacity-60 grayscale' : ''}`}
      onClick={onClick}
    >
      {/* Imagen del Producto */}
      <div className="relative aspect-[4/5] overflow-hidden">
        {isAllSoldOut && (
          <div className="absolute inset-0 z-40 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
            <span className="text-xl font-black italic uppercase tracking-tighter text-white border-y-2 border-red-600 px-4 py-1 rotate-[-5deg]">
              AGOTADO
            </span>
          </div>
        )}
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
        />
        <div className="absolute top-5 left-5">
          <span className="px-3 py-1 bg-red-600 text-white text-[9px] font-black uppercase tracking-widest rounded shadow-lg italic">
            {product.brand}
          </span>
        </div>
      </div>

      {/* Información Básica */}
      <div className="p-6 pb-8">
        <div className="flex justify-between items-start gap-4">
          <h3 className="font-bold text-[14px] tracking-tight uppercase leading-tight text-white group-hover:text-red-500 transition-colors">
            {product.name}
          </h3>
          <p className="font-black italic text-base tracking-tighter text-red-600 whitespace-nowrap">
            RD${product.price}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
