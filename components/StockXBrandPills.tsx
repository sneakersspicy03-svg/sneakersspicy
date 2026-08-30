import React, { useMemo } from 'react';
import { BrandStock, SportwearCategory, Product } from '../types';

interface StockXBrandPillsProps {
  brands?: (BrandStock | SportwearCategory | any)[];
  products?: Product[];
  selectedBrand: string | null;
  onSelectBrand: (brandName: string | null) => void;
  onBack?: () => void;
}

export const StockXBrandPills: React.FC<StockXBrandPillsProps> = ({
  brands = [],
  products = [],
  selectedBrand,
  onSelectBrand,
  onBack,
}) => {
  // Extraemos dinámicamente y de forma 100% real todas las marcas únicas
  const allBrandNames = useMemo(() => {
    const rawNames: string[] = [];

    // 1. Extraer nombres de banners personalizados
    brands.forEach(b => {
      const name = b.name || (b as any).nombre || b.brand;
      if (name && typeof name === 'string' && name.trim()) {
        rawNames.push(name.trim());
      }
    });

    // 2. Extraer marcas de los productos existentes en el inventario
    products.forEach(p => {
      const brand = p.brand || (p as any).marca;
      if (brand && typeof brand === 'string' && brand.trim()) {
        rawNames.push(brand.trim());
      }
    });

    // 3. Deduplicación estricta insensible a mayúsculas/minúsculas y espacios
    const brandMap = new Map<string, string>(); // clave minúscula -> versión formateada
    rawNames.forEach(name => {
      const lower = name.toLowerCase();
      if (!brandMap.has(lower)) {
        brandMap.set(lower, name);
      }
    });

    // 4. Ordenar alfabéticamente
    return Array.from(brandMap.values()).sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: 'base' })
    );
  }, [brands, products]);

  // Si no hay marcas reales y no hay filtro activo, no mostramos el contenedor
  if (allBrandNames.length === 0 && !selectedBrand) {
    return null;
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 py-3 select-none">
      <div className="flex items-center space-x-2.5 overflow-x-auto no-scrollbar py-1">
        {/* Si hay una marca activa, opción rápida de retroceder */}
        {selectedBrand && onBack && (
          <button
            onClick={onBack}
            className="px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap bg-zinc-900 text-red-500 hover:bg-zinc-800 border border-red-500/40 flex items-center space-x-1.5 transition-all active:scale-95 shrink-0"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
            <span>Atrás</span>
          </button>
        )}

        {/* Botón Todas las Marcas */}
        <button
          onClick={() => onSelectBrand(null)}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all duration-200 active:scale-95 shrink-0 ${
            selectedBrand === null
              ? 'bg-red-600 text-white shadow-lg shadow-red-900/40 border border-red-500'
              : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-white/10'
          }`}
        >
          Todas las Marcas
        </button>

        {/* Píldoras de Marcas Reales Únicas */}
        {allBrandNames.map((brandName) => {
          const isSelected = selectedBrand?.toLowerCase().trim() === brandName.toLowerCase().trim();
          return (
            <button
              key={brandName}
              onClick={() => onSelectBrand(isSelected ? null : brandName)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all duration-200 active:scale-95 shrink-0 ${
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
