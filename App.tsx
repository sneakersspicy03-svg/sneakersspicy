
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PRODUCTS, TENNIS_BRANDS, SOCKS_BRANDS, SPORTWEAR_CATEGORIES } from './constants';
import { Product, CartItem, BrandStock, FilterState, SportwearCategory } from './types';
import { syncService, GlobalState } from './services/syncService';
import Header from './components/Header';
import Hero from './components/Hero';
import Sportwear from './components/Sportwear';
import Socks from './components/Socks';
import ProductCard from './components/ProductCard';
import ProductDetail from './components/ProductDetail';
import Cart from './components/Cart';
import TermsAndConditions from './components/TermsAndConditions';
import DeveloperMode from './components/DeveloperMode';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [cloudOffline, setCloudOffline] = useState(false);
  const [filters, setFilters] = useState<FilterState>({ brand: null, size: null, category: null });
  
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('spicy_cart');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isDevMode, setIsDevMode] = useState(false); 
  const [isAdminAuthorized, setIsAdminAuthorized] = useState(false);
  const [isDevPanelOpen, setIsDevPanelOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeBrand, setActiveBrand] = useState<BrandStock | null>(TENNIS_BRANDS[0]);

  const [initialDevBrand, setInitialDevBrand] = useState<string | undefined>(undefined);
  const [initialDevType, setInitialDevType] = useState<'shoes' | 'sportwear' | 'socks' | undefined>(undefined);

  const [customLogo, setCustomLogo] = useState<string | null>(null);
  const [whatsappTemplate, setWhatsappTemplate] = useState<string>('¡Hola! Quiero confirmar el siguiente pedido:\n\n[DETALLES]\n\n• TOTAL FINAL: [TOTAL]\n\n¿Tienen disponibilidad para entrega hoy?');
  const [currentProducts, setCurrentProducts] = useState<Product[]>(PRODUCTS);
  const [currentCategories, setCurrentCategories] = useState<SportwearCategory[]>(SPORTWEAR_CATEGORIES);
  const [tennisBrands, setTennisBrands] = useState<BrandStock[]>(TENNIS_BRANDS);
  const [socksBrands, setSocksBrands] = useState<BrandStock[]>(SOCKS_BRANDS);

  useEffect(() => {
    const loadUniversalState = async () => {
      setIsLoading(true);
      try {
        const cloudState = await syncService.fetchState();
        if (cloudState) {
          setCurrentProducts(cloudState.products || PRODUCTS);
          setCurrentCategories(cloudState.categories || SPORTWEAR_CATEGORIES);
          setTennisBrands(cloudState.tennisBrands || TENNIS_BRANDS);
          setSocksBrands(cloudState.socksBrands || SOCKS_BRANDS);
          setCustomLogo(cloudState.logo);
          if (cloudState.whatsappTemplate) setWhatsappTemplate(cloudState.whatsappTemplate);
          if (cloudState.tennisBrands && cloudState.tennisBrands.length > 0) setActiveBrand(cloudState.tennisBrands[0]);
          setCloudOffline(false);
        } else {
          throw new Error('Cloud offline');
        }
      } catch (e) {
        setCloudOffline(true);
        const localInv = localStorage.getItem('spicy_inventory');
        if (localInv) {
          try {
            const parsed = JSON.parse(localInv);
            setCurrentProducts(parsed.products || PRODUCTS);
            setCurrentCategories(parsed.categories || SPORTWEAR_CATEGORIES);
            setTennisBrands(parsed.tennisBrands || TENNIS_BRANDS);
            setSocksBrands(parsed.socksBrands || SOCKS_BRANDS);
            setCustomLogo(parsed.logo || null);
            if (parsed.whatsappTemplate) setWhatsappTemplate(parsed.whatsappTemplate);
          } catch (err) {}
        }
      } finally {
        setTimeout(() => setIsLoading(false), 800);
      }
    };
    loadUniversalState();
  }, []);

  const publishState = useCallback(async (updates: Partial<GlobalState>) => {
    setIsPublishing(true);
    const newState: GlobalState = {
      products: updates.products ?? currentProducts,
      categories: updates.categories ?? currentCategories,
      tennisBrands: updates.tennisBrands ?? tennisBrands,
      socksBrands: updates.socksBrands ?? socksBrands,
      logo: updates.logo ?? customLogo,
      whatsappTemplate: updates.whatsappTemplate ?? whatsappTemplate,
      lastUpdated: Date.now()
    };
    localStorage.setItem('spicy_inventory', JSON.stringify(newState));
    const success = await syncService.pushState(newState);
    setCloudOffline(!success);
    setIsPublishing(false);
  }, [currentProducts, currentCategories, tennisBrands, socksBrands, customLogo, whatsappTemplate]);

  const filteredProducts = useMemo(() => {
    return currentProducts.filter(p => {
      const bMatch = !filters.brand || p.brand === filters.brand;
      const sMatch = !filters.size || (p.availableSizes && p.availableSizes.map(String).includes(String(filters.size)));
      const cMatch = !filters.category || p.category === filters.category;
      return bMatch && sMatch && cMatch;
    });
  }, [currentProducts, filters]);

  const handleSelectSize = (brand: string, size: number | string, category?: string) => {
    setFilters({ brand, size, category: category || null });
    document.getElementById('product-grid')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleQuickAdd = (brand: string, type: 'shoes' | 'sportwear' | 'socks') => {
    setInitialDevBrand(brand);
    setInitialDevType(type);
    setIsDevPanelOpen(true);
  };

  const handleAddToCart = (p: Product, s: number | string) => {
    setCartItems(prev => {
      const exIndex = prev.findIndex(i => i.id === p.id && String(i.selectedSize) === String(s));
      if (exIndex > -1) {
        const newItems = [...prev];
        newItems[exIndex] = { ...newItems[exIndex], quantity: newItems[exIndex].quantity + 1 };
        return newItems;
      }
      return [...prev, { ...p, quantity: 1, selectedSize: s }];
    });
    setTimeout(() => setIsCartOpen(true), 50);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-8 text-center">
        <div className="text-red-600 font-[1000] text-8xl italic animate-pulse">SP</div>
        <p className="text-zinc-500 font-black uppercase tracking-[0.5em] text-[10px]">Sincronizando con Spicy Vault</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {isPublishing && <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] bg-red-600 px-8 py-3 rounded-full shadow-2xl animate-bounce"><span className="text-[10px] font-black uppercase">Sincronizando Cambios...</span></div>}
      
      <Header 
        logo={customLogo} cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)} 
        onOpenCart={() => setIsCartOpen(true)} onOpenTerms={() => setIsTermsOpen(true)} onOpenDev={() => setIsDevPanelOpen(true)}
        onHome={() => { setFilters({ brand: null, size: null, category: null }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        isDevMode={isDevMode} isAdminAuthorized={isAdminAuthorized} onToggleDevMode={() => setIsDevMode(!isDevMode)}
      />

      <main className="pb-20">
        <Hero brands={tennisBrands} onBrandSelect={setActiveBrand} activeBrand={activeBrand} isDevMode={isDevMode} onSelectSize={handleSelectSize} onQuickAdd={(b) => handleQuickAdd(b, 'shoes')} />
        <Sportwear categories={currentCategories} onCategorySelect={(b, c) => setFilters({brand: b, size: null, category: c})} onSelectSize={handleSelectSize} isDevMode={isDevMode} onQuickAdd={(b) => handleQuickAdd(b, 'sportwear')} />
        <Socks brands={socksBrands} onBrandSelect={(b) => setFilters({ brand: b, size: null, category: 'Medias' })} onSelectSize={handleSelectSize} isDevMode={isDevMode} onQuickAdd={(b) => handleQuickAdd(b, 'socks')} />
        
        <section id="product-grid" className="px-6 md:px-20 py-24 scroll-mt-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <h2 className="text-4xl md:text-7xl font-[1000] italic uppercase tracking-tighter leading-none">{filters.category || filters.brand || 'Explorar Todo'}</h2>
            {(filters.brand || filters.size || filters.category) && <button onClick={() => setFilters({brand: null, size: null, category: null})} className="text-[10px] font-black uppercase text-zinc-500 hover:text-white border-b border-zinc-800">Limpiar Filtros</button>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map(p => <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} onClick={() => setSelectedProduct(p)} />)}
          </div>
        </section>
      </main>

      <Cart whatsappTemplate={whatsappTemplate} logo={customLogo} isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={cartItems} onRemove={(id, s) => setCartItems(prev => prev.filter(i => !(i.id === id && String(i.selectedSize) === String(s))))} onUpdateQuantity={(id, s, d) => setCartItems(prev => prev.map(i => (i.id === id && String(i.selectedSize) === String(s)) ? { ...i, quantity: Math.max(1, i.quantity + d) } : i))} onClearCart={() => setCartItems([])} />
      <TermsAndConditions logo={customLogo} isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} onSecretTrigger={() => { setIsTermsOpen(false); setIsDevPanelOpen(true); }} />
      {selectedProduct && <ProductDetail whatsappTemplate={whatsappTemplate} logo={customLogo} product={selectedProduct} onClose={() => setSelectedProduct(null)} onAddToCart={handleAddToCart} />}
      
      <DeveloperMode 
        logo={customLogo} onUpdateLogo={(l) => { setCustomLogo(l); publishState({ logo: l }); }}
        whatsappTemplate={whatsappTemplate} onUpdateWhatsAppTemplate={(t) => { setWhatsappTemplate(t); publishState({ whatsappTemplate: t }); }}
        isOpen={isDevPanelOpen} onClose={() => { setIsDevPanelOpen(false); setInitialDevBrand(undefined); setInitialDevType(undefined); }}
        products={currentProducts} categories={currentCategories} tennisBrands={tennisBrands} socksBrands={socksBrands}
        isAuthorized={isAdminAuthorized} initialBrand={initialDevBrand} initialType={initialDevType}
        onLoginSuccess={() => { setIsAdminAuthorized(true); setIsDevMode(true); }}
        onAddProduct={np => { const updated = [np, ...currentProducts]; setCurrentProducts(updated); publishState({ products: updated }); }}
        onDeleteProduct={id => { const updated = currentProducts.filter(p => p.id !== id); setCurrentProducts(updated); publishState({ products: updated }); }}
        onToggleStock={(id) => { const updated = currentProducts.map(p => p.id === id ? { ...p, isSoldOut: !p.isSoldOut } : p); setCurrentProducts(updated); publishState({ products: updated }); }}
        onAddTennisBrand={nb => { const updated = [...tennisBrands, nb]; setTennisBrands(updated); publishState({ tennisBrands: updated }); }}
        onDeleteTennisBrand={name => { const updated = tennisBrands.filter(b => b.name !== name); setTennisBrands(updated); publishState({ tennisBrands: updated }); }}
        onUpdateTennisBrand={ub => { const updated = tennisBrands.map(b => b.name === ub.name ? ub : b); setTennisBrands(updated); publishState({ tennisBrands: updated }); }}
        onAddSocksBrand={nb => { const updated = [...socksBrands, nb]; setSocksBrands(updated); publishState({ socksBrands: updated }); }}
        onDeleteSocksBrand={name => { const updated = socksBrands.filter(b => b.name !== name); setSocksBrands(updated); publishState({ socksBrands: updated }); }}
        onUpdateSocksBrand={ub => { const updated = socksBrands.map(b => b.name === ub.name ? ub : b); setSocksBrands(updated); publishState({ socksBrands: updated }); }}
        onAddCategory={nc => { const updated = [...currentCategories, nc]; setCurrentCategories(updated); publishState({ categories: updated }); }}
        onDeleteCategory={name => { const updated = currentCategories.filter(c => c.name !== name); setCurrentCategories(updated); publishState({ categories: updated }); }}
        onUpdateCategory={uc => { const updated = currentCategories.map(c => c.name === uc.name ? uc : c); setCurrentCategories(updated); publishState({ categories: updated }); }}
        onReorderTennis={(s, t) => { const list = [...tennisBrands]; const [r] = list.splice(s, 1); list.splice(t, 0, r); setTennisBrands(list); publishState({ tennisBrands: list }); }}
        onReorderSocks={(s, t) => { const list = [...socksBrands]; const [r] = list.splice(s, 1); list.splice(t, 0, r); setSocksBrands(list); publishState({ socksBrands: list }); }}
        onReorderCategory={(s, t) => { const list = [...currentCategories]; const [r] = list.splice(s, 1); list.splice(t, 0, r); setCurrentCategories(list); publishState({ categories: list }); }}
        onUpdateProduct={(p) => { const updated = currentProducts.map(cp => cp.id === p.id ? p : cp); setCurrentProducts(updated); publishState({ products: updated }); }}
        onLogout={() => { setIsAdminAuthorized(false); setIsDevMode(false); }}
      />
    </div>
  );
};

export default App;
