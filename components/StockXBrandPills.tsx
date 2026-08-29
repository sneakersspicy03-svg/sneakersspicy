import React from 'react';
import { BrandStock } from '../types';

interface StockXBrandPillsProps {
  brands: BrandStock[];
  selectedBrand: string | null;
  onSelectBrand: (brandName: string | null) => void;
  onBack?: () => void;
}

const DEFAULT_POPULAR_BRANDS = [
  'Jordan',
  'Nike',
  'Adidas',
  'Yeezy',
  'New Balance',
  'Fear of God',
  'Travis Scott',
  'Puma',
  'Under Armour',
  'Converse',
  'Asia Shoes'
];

export const StockXBrandPills: React.FC<StockXBrandPillsProps> = ({
  brands = [],
  selectedBrand,
  onSelectBrand,
  onBack,
}) => {
  const customBrandNames = brands.map(b => b.name || (b as any).nombre || b.brand).filter(Boolean) as string[];
  const allBrandNames = Array.from(new Set([...customBrandNames, ...DEFAULT_POPULAR_BRANDS]));

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 py-3 select-none">
      <div className="flex items-center space-x-2.5 overflow-x-auto no-scrollbar py-1">
        {/* If brand is active, give quick option to go back or select all */}
        {selectedBrand && onBack && (
          <button
            onClick={onBack}
            className="px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap bg-zinc-900 text-red-500 hover:bg-zinc-800 border border-red-500/40 flex items-center space-x-1.5 transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
            <span>Atrás</span>
          </button>
        )}

        <button
          onClick={() => onSelectBrand(null)}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all duration-200 ${
            selectedBrand === null
              ? 'bg-red-600 text-white shadow-lg shadow-red-900/40 border border-red-500'
              : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-white/10'
          }`}
        >
          Todas las Marcas
        </button>

        {allBrandNames.map((brandName) => {
          const isSelected = selectedBrand?.toLowerCase() === brandName.toLowerCase();
          return (
            <button
              key={brandName}
              onClick={() => onSelectBrand(isSelected ? null : brandName)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all duration-200 ${
                isSelected
                  ? 'bg-red-600 text-white shadow-lg shadow-red-900/40 border border-red-500 scale-105'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-white/10'
              }`}
            >
              {brandName}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StockXBrandPills;
