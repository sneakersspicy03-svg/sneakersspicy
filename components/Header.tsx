
import React from 'react';

interface HeaderProps {
  logo?: string | null;
  cartCount: number;
  onOpenCart: () => void;
  onOpenTerms: () => void;
  onOpenDev: () => void;
  onHome: () => void;
  isDevMode?: boolean;
  isAdminAuthorized?: boolean;
  onToggleDevMode?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  logo,
  cartCount, 
  onOpenCart, 
  onOpenTerms, 
  onOpenDev, 
  onHome,
  isDevMode = false,
  isAdminAuthorized = false,
  onToggleDevMode
}) => {
  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${isDevMode ? 'bg-zinc-950/90 border-b border-red-500' : 'bg-black/95 border-b border-white/5'} backdrop-blur-2xl px-4 md:px-8 py-3 flex items-center justify-between`}>
      <div className="flex items-center space-x-2 md:space-x-4">
        <div 
          className="w-14 h-14 flex items-center justify-center transition-all cursor-pointer group relative select-none"
          onClick={onHome}
        >
          {logo ? (
            <img 
              src={logo} 
              alt="Logo" 
              className="max-w-full max-h-full object-contain transform group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]"
            />
          ) : (
            <div className="text-red-600 font-[1000] text-4xl md:text-5xl tracking-tighter italic transform group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_15px_rgba(220,38,38,0.6)]">
              SP
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-center leading-none select-none">
          <h1 className="text-xl md:text-2xl font-[900] tracking-tighter uppercase text-white">
            SNEAKERS
          </h1>
          <h1 className="text-xl md:text-2xl font-[900] tracking-tighter uppercase text-zinc-500 italic md:ml-2">
            SPICY
          </h1>
        </div>
      </div>

      <div className="flex items-center space-x-3 md:space-x-6">
        {isAdminAuthorized && (
          <button 
            onClick={onToggleDevMode} 
            className={`px-5 py-2.5 rounded-xl border-2 transition-all font-black text-[10px] tracking-widest uppercase ${isDevMode ? 'bg-red-600 border-red-600 text-white hover:bg-red-700 shadow-[0_0_20px_rgba(220,38,38,0.4)]' : 'border-white/10 text-zinc-500 hover:border-red-500 hover:text-red-500'}`}
          >
            {isDevMode ? 'SALIR ADMIN' : 'MODO ADMIN'}
          </button>
        )}

        <button 
          onClick={onOpenTerms}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-900/40"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="hidden sm:inline">Términos</span>
        </button>

        <button onClick={onOpenCart} className="relative p-2.5 bg-zinc-900 hover:bg-zinc-800 rounded-xl transition-all border border-white/5 group">
          <svg className="w-5 h-5 text-white/80 group-hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-full bg-red-600 text-white animate-pulse">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
};

export default Header;
