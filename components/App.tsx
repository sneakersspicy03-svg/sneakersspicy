import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PRODUCTS, TENNIS_BRANDS, SOCKS_BRANDS, SPORTWEAR_CATEGORIES } from '../constants';
import { Product, CartItem, BrandStock, FilterState, SportwearCategory } from '../types';
import { syncService, GlobalState, db } from '../services/syncService';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import Header from './Header';
// ... rest of imports
import Hero from './Hero';
import Sportwear from './Sportwear';
import Socks from './Socks';
import ProductCard from './ProductCard';
import ProductDetail from './ProductDetail';
import Cart from './Cart';
import TermsAndConditions from './TermsAndConditions';
import DeveloperMode from './DeveloperMode';
import AIConsultant from './AIConsultant';

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
  const [isAIExpertOpen, setIsAIExpertOpen] = useState(false);
  const [isDevMode, setIsDevMode] = useState(false); 
  const [isAdminAuthorized, setIsAdminAuthorized] = useState(false);
  const [isDevPanelOpen, setIsDevPanelOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeBrand, setActiveBrand] = useState<BrandStock | null>(TENNIS_BRANDS[0]);

  const [initialDevBrand, setInitialDevBrand] = useState<string | undefined>(undefined);
  const [initialDevType, setInitialDevType] = useState<'shoes' | 'sportwear' | 'socks' | undefined>(undefined);

  const [customLogo, setCustomLogo] = useState<string | null>(null);
  const [whatsappTemplate, setWhatsappTemplate] = useState<string>('¡Hola! Quiero confirmar el siguiente pedido:\n\n[DETALLES]\n\n• TOTAL FINAL: [TOTAL]\n\n¿Tienen disponibilidad para entrega hoy?');
  const [currentProducts, setCurrentProducts] = useState<Product[]>([]);
  const [currentCategories, setCurrentCategories] = useState<SportwearCategory[]>([]);
  const [tennisBrands, setTennisBrands] = useState<BrandStock[]>([]);
  const [socksBrands, setSocksBrands] = useState<BrandStock[]>([]);

  useEffect(() => {
    const loadUniversalState = async () => {
      setIsLoading(true);
      try {
        const cloudState = await syncService.fetchState();
        if (cloudState) {
          setCurrentProducts(cloudState.products || []);
          setCurrentCategories(cloudState.categories || []);
          setTennisBrands(cloudState.tennisBrands || []);
          setSocksBrands(cloudState.socksBrands || []);
          setCustomLogo(cloudState.logo);
          if (cloudState.whatsappTemplate) setWhatsappTemplate(cloudState.whatsappTemplate);
          if (cloudState.tennisBrands && cloudState.tennisBrands.length > 0) setActiveBrand(cloudState.tennisBrands[0]);
          setCloudOffline(false);
        }
      } catch (e) {
        setCloudOffline(true);
        const localInv = localStorage.getItem('spicy_inventory');
        if (localInv) {
          try {
            const parsed = JSON.parse(localInv);
            setCurrentProducts(parsed.products || []);
            setCurrentCategories(parsed.categories || []);
            setTennisBrands(parsed.tennisBrands || []);
            setSocksBrands(parsed.socksBrands || []);
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

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "banners"), (snapshot) => {
      const banners: any[] = [];
      snapshot.forEach((doc) => {
        banners.push({ id: doc.id, ...doc.data() });
      });

      const tBrands = banners.filter(b => b.type === 'tennis');
      const sBrands = banners.filter(b => b.type === 'socks');
      const cats = banners.filter(b => b.type === 'sportwear');

      setTennisBrands(tBrands);
      setSocksBrands(sBrands);
      setCurrentCategories(cats);

      if (tBrands.length > 0 && !activeBrand) {
         setActiveBrand(tBrands[0]);
      }
    });
    return () => unsubscribe();
  }, [activeBrand]);

  const publishState = useCallback(async (updates: Partial<GlobalState>) => {
    setIsPublishing(true);
    try {
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
    } catch (e) {
      console.error("Error publishing state:", e);
    } finally {
      setIsPublishing(false);
    }
  }, [currentProducts, currentCategories, tennisBrands, socksBrands, customLogo, whatsappTemplate]);

  const handleAddBanner = async (banner: any, type: 'tennis' | 'socks' | 'sportwear') => {
    setIsPublishing(true);
    try {
      await syncService.saveBanner({ ...banner, type });
    } catch (e) {
      console.error("Error adding banner:", e);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleUpdateBanner = async (banner: any, type: 'tennis' | 'socks' | 'sportwear') => {
    if (!banner.id) {
      console.warn("QA Warning: Banner sin ID detectado, redireccionando a creación.");
      return handleAddBanner(banner, type);
    }
    setIsPublishing(true);
    try {
      await syncService.updateBanner(banner.id, banner);
    } catch (e) {
      console.error("Error updating banner:", e);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDeleteBanner = async (bannerId: string, type: 'tennis' | 'socks' | 'sportwear') => {
    console.log("🔥 Iniciando borrado de banner. ID recibido:", bannerId, "Tipo:", type);
    
    if (!bannerId) {
      alert("🚨 ERROR LÓGICO: El botón no está enviando el ID del banner.");
      return;
    }

    setIsPublishing(true);
    try {
      await syncService.deleteBanner(bannerId);
      console.log("✅ Borrado exitoso en Firestore para el ID:", bannerId);
    } catch (error: any) {
      console.error("❌ Fallo de Firebase en eliminación:", error);
      alert(`⚠️ Error bloqueando el borrado: ${error.message || 'Error desconocido'}`);
    } finally {
      setIsPublishing(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return currentProducts.filter(p => {
      const bMatch = !filters.brand || p.marca === filters.brand || p.brand === filters.brand;
      const sMatch = !filters.size || (p.availableSizes && p.availableSizes.map(String).includes(String(filters.size)));
      const cMatch = !filters.category || p.category === filters.category;
      return bMatch && sMatch && cMatch;
    });
  }, [currentProducts, filters]);

  // REPARAR VINCULACIÓN: Consulta directa a Firestore por marca
  useEffect(() => {
    if (filters.brand) {
      const q = query(collection(db, 'productos'), where('marca', '==', filters.brand));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const brandSpecificProducts: Product[] = [];
        snapshot.forEach((doc) => {
          brandSpecificProducts.push({ id: doc.id, ...doc.data() } as Product);
        });
        
        // Sincronizar con el estado global sin duplicar
        setCurrentProducts(prev => {
          const otherProducts = prev.filter(p => p.marca !== filters.brand && p.brand !== filters.brand);
          return [...brandSpecificProducts, ...otherProducts];
        });
      });
      return () => unsubscribe();
    }
  }, [filters.brand]);

  const handleSelectSize = (brand: string, size: number | string, category?: string) => {
    setFilters({ brand, size, category: category || null });
    document.getElementById('product-grid')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAddToCart = (p: Product, s: number | string) => {
    setCartItems(prev => {
      const exIndex = prev.findIndex(i => i.id === p.id && String(i.selectedSize) === String(s));
      const newItems = exIndex > -1 
        ? prev.map((item, idx) => idx === exIndex ? { ...item, quantity: item.quantity + 1 } : item)
        : [...prev, { ...p, quantity: 1, selectedSize: s }];
      localStorage.setItem('spicy_cart', JSON.stringify(newItems));
      return newItems;
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
        <Hero brands={tennisBrands} products={currentProducts} onBrandSelect={setActiveBrand} activeBrand={activeBrand} isDevMode={isDevMode} onSelectSize={handleSelectSize} onQuickAdd={(b) => { setInitialDevBrand(b); setInitialDevType('shoes'); setIsDevPanelOpen(true); }} />
        <Sportwear categories={currentCategories} products={currentProducts} onCategorySelect={(b, c) => setFilters({brand: b, size: null, category: c})} onSelectSize={handleSelectSize} isDevMode={isDevMode} onQuickAdd={(b) => { setInitialDevBrand(b); setInitialDevType('sportwear'); setIsDevPanelOpen(true); }} />
        <Socks brands={socksBrands} products={currentProducts} onBrandSelect={(b) => setFilters({ brand: b, size: null, category: 'Medias' })} onSelectSize={handleSelectSize} isDevMode={isDevMode} onQuickAdd={(b) => { setInitialDevBrand(b); setInitialDevType('socks'); setIsDevPanelOpen(true); }} />
        
        <section id="product-grid" className="px-4 md:px-20 py-24 scroll-mt-24">
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
      <AIConsultant isOpen={isAIExpertOpen} onClose={() => setIsAIExpertOpen(false)} />
      
      <DeveloperMode 
        logo={customLogo} onUpdateLogo={(l) => { setCustomLogo(l); publishState({ logo: l }); }}
        whatsappTemplate={whatsappTemplate} onUpdateWhatsAppTemplate={(t) => { setWhatsappTemplate(t); publishState({ whatsappTemplate: t }); }}
        isOpen={isDevPanelOpen} onClose={() => { setIsDevPanelOpen(false); setInitialDevBrand(undefined); setInitialDevType(undefined); }}
        products={currentProducts} categories={currentCategories} tennisBrands={tennisBrands} socksBrands={socksBrands}
        isAuthorized={isAdminAuthorized} initialBrand={initialDevBrand} initialType={initialDevType}
        onLoginSuccess={() => { setIsAdminAuthorized(true); setIsDevMode(true); }}
        onAddProduct={async np => { 
          const updated = [np, ...currentProducts];
          setCurrentProducts(updated);
          await publishState({ products: updated });
        }}
        onDeleteProduct={async id => { 
          if(confirm('¿Seguro que deseas eliminar este producto?')) {
            try {
              await syncService.deleteProduct(id);
              const updated = currentProducts.filter(p => p.id !== id);
              setCurrentProducts(updated);
              await publishState({ products: updated });
            } catch (e: any) { 
              console.error("❌ Error al eliminar producto:", e);
              alert(`🚨 ERROR AL BORRAR:\n\n${e.message || 'Error desconocido'}`); 
            }
          }
        }}
        onToggleStock={async (id) => { 
          const product = currentProducts.find(p => p.id === id);
          if (product) {
            const newStatus = !product.isSoldOut;
            const updated = currentProducts.map(p => p.id === id ? { ...p, isSoldOut: newStatus } : p);
            setCurrentProducts(updated);
            try {
              await syncService.toggleStock(id, newStatus);
              await publishState({ products: updated });
            } catch (e) { setCurrentProducts(currentProducts); }
          }
        }}
        onAddTennisBrand={nb => handleAddBanner(nb, 'tennis')}
        onDeleteTennisBrand={id => {
          if (!id) return alert("Error: ID de banner no encontrado.");
          handleDeleteBanner(id, 'tennis');
        }}
        onUpdateTennisBrand={ub => handleUpdateBanner(ub, 'tennis')}
        onAddSocksBrand={ns => handleAddBanner(ns, 'socks')}
        onDeleteSocksBrand={id => {
          if (!id) return alert("Error: ID de banner no encontrado.");
          handleDeleteBanner(id, 'socks');
        }}
        onUpdateSocksBrand={ub => handleUpdateBanner(ub, 'socks')}
        onAddCategory={nc => handleAddBanner(nc, 'sportwear')}
        onDeleteCategory={id => {
          if (!id) return alert("Error: ID de banner no encontrado.");
          handleDeleteBanner(id, 'sportwear');
        }}
        onUpdateCategory={uc => handleUpdateBanner(uc, 'sportwear')}
        onReorderTennis={(s, t) => { const list = [...tennisBrands]; const [r] = list.splice(s, 1); list.splice(t, 0, r); setTennisBrands(list); publishState({ tennisBrands: list }); }}
        onReorderSocks={(s, t) => { const list = [...socksBrands]; const [r] = list.splice(s, 1); list.splice(t, 0, r); setSocksBrands(list); publishState({ socksBrands: list }); }}
        onReorderCategory={(s, t) => { const list = [...currentCategories]; const [r] = list.splice(s, 1); list.splice(t, 0, r); setCurrentCategories(list); publishState({ categories: list }); }}
        onUpdateProduct={async (p) => { 
          const updated = currentProducts.map(cp => cp.id === p.id ? p : cp); 
          setCurrentProducts(updated); 
          await publishState({ products: updated }); 
        }}
        onLogout={() => { setIsAdminAuthorized(false); setIsDevMode(false); }}
        onLoadTestData={async () => {
          const cloudState = await syncService.fetchState();
          if (cloudState) {
            setCurrentProducts(cloudState.products);
            setTennisBrands(cloudState.tennisBrands);
            setSocksBrands(cloudState.socksBrands);
            setCurrentCategories(cloudState.categories);
            setCustomLogo(cloudState.logo);
            alert("Sincronización exitosa.");
          }
        }}
        onClearInventory={async () => {
          if(confirm("¿Vaciado total?")) {
            for (const p of currentProducts) await syncService.deleteProduct(p.id);
            setCurrentProducts([]);
            await publishState({ products: [] });
          }
        }}
        onClearBanners={async () => {
          if(confirm("¿Borrar banners?")) {
            for (const b of tennisBrands) if(b.id) await syncService.deleteBanner(b.id);
            for (const b of socksBrands) if(b.id) await syncService.deleteBanner(b.id);
            for (const c of currentCategories) if(c.id) await syncService.deleteBanner(c.id);
            setTennisBrands([]); setSocksBrands([]); setCurrentCategories([]);
            await publishState({ tennisBrands: [], socksBrands: [], categories: [] });
          }
        }}
      />
    </div>
  );
};

export default App;