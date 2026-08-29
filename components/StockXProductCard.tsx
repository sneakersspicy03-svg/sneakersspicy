import React, { useState } from 'react';
import { Product } from '../types';

interface StockXProductCardProps {
  product: Product;
  onClick: () => void;
  onAddToCart?: (product: Product, size: number | string) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (productId: string) => void;
}

export const StockXProductCard: React.FC<StockXProductCardProps> = ({
  product,
  onClick,
  onAddToCart,
  isWishlisted = false,
  onToggleWishlist,
}) => {
  const [favorite, setFavorite] = useState(isWishlisted);

  if (!product || typeof product !== 'object') return null;

  const isSoldOut = product.isSoldOut || (product.stock !== undefined && product.stock <= 0);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorite(prev => !prev);
    if (onToggleWishlist) {
      onToggleWishlist(product.id);
    }
  };

  return (
    <div
      onClick={onClick}
      className="group relative flex flex-col bg-[#0D0D0F] rounded-2xl border border-white/10 hover:border-red-600/60 transition-all duration-300 cursor-pointer overflow-hidden p-3 hover:shadow-2xl hover:shadow-red-950/20 select-none w-full active:scale-[0.98]"
    >
      {/* Product Image Container */}
      <div className="relative aspect-[4/3] w-full flex items-center justify-center bg-zinc-900/60 rounded-xl p-2 overflow-hidden mb-2.5 border border-white/5">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-contain filter drop-shadow-[0_10px_15px_rgba(0,0,0,0.8)] transition-transform duration-500 group-hover:scale-110"
        />
        {isSoldOut && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-[1px] flex items-center justify-center">
            <span className="text-[10px] font-black uppercase tracking-wider text-red-500 bg-black/90 border border-red-500/60 px-2.5 py-0.5 rounded shadow-lg">
              Agotado
            </span>
          </div>
        )}
      </div>

      {/* Product Info (StockX exact typography & hierarchy in Spicy Dark) */}
      <div className="flex flex-col flex-1 justify-between pt-1 space-y-1">
        <div>
          {/* Title */}
          <h3 className="text-[13px] sm:text-[14px] font-bold text-white leading-tight line-clamp-2 min-h-[34px] group-hover:text-red-500 transition-colors">
            {product.name}
          </h3>

          {/* Subtitle / Lowest Ask Label */}
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mt-1">
            Lowest Ask
          </p>

          {/* Price */}
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-[17px] sm:text-[18px] font-black italic text-white tracking-tight">
              RD${Number(product.price).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Xpress Ship Badge */}
        <div className="mt-2 flex items-center">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-zinc-900 text-zinc-300 text-[10px] font-bold uppercase tracking-wider border border-white/10">
            <svg className="w-3 h-3 text-red-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.5a.75.75 0 01.75.75v1.284a7.502 7.502 0 016.716 6.716h1.284a.75.75 0 010 1.5h-1.284a7.502 7.502 0 01-6.716 6.716v1.284a.75.75 0 01-1.5 0v-1.284a7.502 7.502 0 01-6.716-6.716H3.25a.75.75 0 010-1.5h1.284a7.502 7.502 0 016.716-6.716V3.25a.75.75 0 01.75-.75z" />
            </svg>
            <span>Xpress Ship</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default StockXProductCard;
