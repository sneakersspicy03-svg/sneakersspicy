import React from 'react';
import { Section } from '../types';

interface QuickNavPillsProps {
  sections: Section[];
  activeSection?: string | null;
  onSelectSection: (sectionName: string) => void;
  viewMode: 'detailed' | 'compact';
  onToggleViewMode: () => void;
  isOffline?: boolean;
}

const QuickNavPills: React.FC<QuickNavPillsProps> = ({
  sections,
  activeSection,
  onSelectSection,
  viewMode,
  onToggleViewMode,
  isOffline = false
}) => {
  const defaultItems = [
    { id: 'all', name: 'Todos', icon: '🔥' },
    { id: 'calzado', name: 'Calzado', icon: '👟' },
    { id: 'sportwear', name: 'Sportwear', icon: '👕' },
    { id: 'medias', name: 'Medias', icon: '🧦' },
    { id: 'product-grid', name: 'Catálogo', icon: '⚡' }
  ];

  // Si hay secciones personalizadas, las mapeamos
  const items = sections.length > 0 ? [
    { id: 'all', name: 'Todos', icon: '🔥' },
    ...sections.map(s => {
      const lower = s.name.toLowerCase();
      let icon = s.emoji || '📦';
      if (lower.includes('calzado') || lower.includes('tenis') || lower.includes('shoes')) icon = '👟';
      else if (lower.includes('sportwear') || lower.includes('ropa') || lower.includes('apparel')) icon = '👕';
      else if (lower.includes('media') || lower.includes('sock')) icon = '🧦';
      return { id: s.id, name: s.name, icon };
    }),
    { id: 'product-grid', name: 'Catálogo', icon: '⚡' }
  ] : defaultItems;

  return (
    <div 
      style={{
        top: isOffline ? 'calc(env(safe-area-inset-top, 0px) + 6.2rem)' : 'calc(env(safe-area-inset-top, 0px) + 4.2rem)'
      }}
      className="sticky z-40 w-full bg-black/90 backdrop-blur-xl border-b border-white/5 py-2.5 px-4 transition-all duration-300 shadow-xl"
    >
      <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-3">
        {/* Carrusel de Píldoras de Navegación Rápida (Estilo Nike / StockX) */}
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-0.5 flex-1 pr-2">
          {items.map(item => {
            const isActive = activeSection === item.name || (item.id === 'all' && !activeSection);
            return (
              <button
                key={item.id}
                onClick={() => onSelectSection(item.name === 'Todos' ? '' : item.name)}
                className={`min-h-[40px] px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 flex items-center space-x-1.5 shrink-0 active:scale-95 ${
                  isActive
                    ? 'bg-red-600 text-white shadow-lg shadow-red-900/40 border border-red-500 scale-105'
                    : 'bg-zinc-900/90 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-white/5'
                }`}
              >
                <span className="text-sm">{item.icon}</span>
                <span className="whitespace-nowrap">{item.name}</span>
              </button>
            );
          })}
        </div>

        {/* Botón Switch de Modo de Vista (Detallado / Compacto StockX) */}
        <div className="shrink-0 flex items-center pl-2 border-l border-white/10">
          <button
            onClick={onToggleViewMode}
            className="min-h-[40px] px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded-xl flex items-center space-x-2 text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 group shadow-lg"
            title="Cambiar vista (Pellizca la pantalla para zoom / zoom inverso)"
          >
            {viewMode === 'compact' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
                <svg className="w-3.5 h-3.5 text-white group-hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                <span className="text-white hidden sm:inline">StockX</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                <svg className="w-3.5 h-3.5 text-white group-hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <span className="text-white hidden sm:inline">Nike</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickNavPills;
