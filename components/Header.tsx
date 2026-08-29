import React, { useState } from 'react';

interface HeaderProps {
  logo?: string | null;
  cartCount: number;
  wishlistCount?: number;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onOpenCart: () => void;
  onOpenWishlist?: () => void;
  onOpenTerms: () => void;
  onOpenDev: () => void;
  onHome: () => void;
  isDevMode?: boolean;
  isAdminAuthorized?: boolean;
  onToggleDevMode?: () => void;
  storeName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  logo,
  cartCount,
  wishlistCount = 0,
  searchQuery = '',
  onSearchChange,
  onOpenCart,
  onOpenWishlist,
  onOpenTerms,
  onOpenDev,
  onHome,
  isDevMode = false,
  isAdminAuthorized = false,
  onToggleDevMode,
  storeName = 'SNEAKERS SPICY'
}) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-xl border-b border-white/10 transition-all duration-300">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-3.5 flex items-center justify-between gap-3 sm:gap-6">
        
        {/* Left: SP Logo & Brand Wordmark */}
        <div 
          onClick={onHome}
          className="flex items-center space-x-3 cursor-pointer shrink-0 select-none group"
        >
          {logo ? (
            <img 
              src={logo} 
              alt={storeName} 
              className="h-10 md:h-12 object-contain transform group-hover:scale-105 transition-transform drop-shadow-[0_0_15px_rgba(239,68,68,0.3)]"
              crossOrigin="anonymous"
            />
          ) : (
            <div className="flex items-center space-x-2.5">
              {/* Fiery Red SP Badge */}
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 via-red-700 to-black flex items-center justify-center border border-red-500/50 shadow-lg shadow-red-900/40 group-hover:scale-105 transition-transform">
                <span className="text-white font-[1000] text-xl italic tracking-tighter drop-shadow">
                  SP
                </span>
              </div>
              
              {/* Wordmark: SNEAKERS SPICY */}
              <div className="flex items-baseline space-x-1.5">
                <span className="text-lg sm:text-2xl font-[900] tracking-tighter text-white uppercase font-sans">
                  SNEAKERS
                </span>
                <span className="text-lg sm:text-2xl font-[900] tracking-tighter text-zinc-500 uppercase italic font-sans group-hover:text-red-500 transition-colors">
                  SPICY
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-xl relative">
          <div className={`relative flex items-center w-full rounded-2xl border bg-zinc-900/90 transition-all duration-300 ${
            isSearchFocused 
              ? 'border-red-500 bg-black ring-2 ring-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]' 
              : 'border-white/10 hover:border-white/20'
          }`}>
            <div className="pl-3.5 pr-2 flex items-center pointer-events-none text-zinc-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              placeholder="Search for brand, color, etc."
              className="w-full bg-transparent py-2.5 pr-4 text-xs sm:text-sm text-white placeholder:text-zinc-500 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange?.('')}
                className="pr-3 text-zinc-500 hover:text-white"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Right Actions: Términos (Red Button), Wishlist, Cart */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          
          {/* Admin Dev Mode Controls */}
          {isAdminAuthorized && (
            <div className="hidden md:flex items-center space-x-2">
              <button 
                onClick={onOpenDev} 
                className="px-3.5 py-2 rounded-xl border border-white/10 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-[10px] font-black uppercase tracking-widest transition-colors"
              >
                Dev Panel
              </button>
              <button 
                onClick={onToggleDevMode} 
                className={`px-3.5 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                  isDevMode 
                    ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-900/40' 
                    : 'border-white/10 text-zinc-400 hover:border-red-500 hover:text-red-500'
                }`}
              >
                {isDevMode ? 'Admin Activo' : 'Activar Admin'}
              </button>
            </div>
          )}

          {/* Términos (Red Button) */}
          <button
            onClick={onOpenTerms}
            className="flex items-center space-x-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/30 active:scale-95 transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="hidden sm:inline">Términos</span>
          </button>

          {/* Cart Button */}
          <button
            onClick={onOpenCart}
            aria-label="Carrito de compras"
            className="relative p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-300 hover:text-white transition-all group active:scale-95"
          >
            <svg className="w-5 h-5 group-hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25c-.669 0-1.189-.578-1.119-1.243l1.263-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-lg shadow-red-900/50 animate-pulse">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
