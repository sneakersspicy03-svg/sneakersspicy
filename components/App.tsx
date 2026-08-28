import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PRODUCTS, TENNIS_BRANDS, SOCKS_BRANDS, SPORTWEAR_CATEGORIES } from '../constants';
import { Product, CartItem, BrandStock, FilterState, SportwearCategory, Section } from '../types';
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
      const saved = localStorage.getItem('spicy_cart') || localStorage.getItem('base_cart');
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
  const [storeName, setStoreName] = useState<string>('SNEAKERS SPICY');
  const [primaryColor, setPrimaryColor] = useState<string>('#EF4444');

  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', primaryColor);
  }, [primaryColor]);
  const [currentProducts, setCurrentProducts] = useState<Product[]>([]);
  const [currentCategories, setCurrentCategories] = useState<SportwearCategory[]>([]);
  const [currentSections, setCurrentSections] = useState<Section[]>([]);
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
          
          // Lógica de Seeding para Secciones
          if (!cloudState.sections || cloudState.sections.length === 0) {
            const defaultSections: Omit<Section, 'id'>[] = [
              { name: "Calzado", emoji: "👟", photoCount: 6, sizeInputType: "numeric", orderIndex: 0 },
              { name: "Sportwear", emoji: "👕", photoCount: 2, sizeInputType: "clothing_letters", orderIndex: 1 },
              { name: "Medias", emoji: "🧦", photoCount: 2, sizeInputType: "clothing_letters", orderIndex: 2 }
            ];
            for (const s of defaultSections) {
              await syncService.saveSection(s);
            }
            // Recargar secciones después del seeding
            const freshSections = await syncService.getSections();
            setCurrentSections(freshSections);
          } else {
            setCurrentSections(cloudState.sections);
          }

          setTennisBrands(cloudState.tennisBrands || []);
          setSocksBrands(cloudState.socksBrands || []);
          setCustomLogo(cloudState.logo);
          if (cloudState.whatsappTemplate) setWhatsappTemplate(cloudState.whatsappTemplate);
          if (cloudState.storeName) setStoreName(cloudState.storeName);
          if (cloudState.primaryColor) setPrimaryColor(cloudState.primaryColor);
          if (cloudState.tennisBrands && cloudState.tennisBrands.length > 0) setActiveBrand(cloudState.tennisBrands[0]);
          setCloudOffline(false);
        }
      } catch (e) {
        setCloudOffline(true);
        const localInv = localStorage.getItem('spicy_inventory') || localStorage.getItem('base_inventory');
        if (localInv) {
          try {
            const parsed = JSON.parse(localInv);
            setCurrentProducts(parsed.products || []);
            setCurrentCategories(parsed.categories || []);
            setTennisBrands(parsed.tennisBrands || []);
            setSocksBrands(parsed.socksBrands || []);
            setCustomLogo(parsed.logo || null);
            if (parsed.whatsappTemplate) setWhatsappTemplate(parsed.whatsappTemplate);
            if (parsed.storeName) setStoreName(parsed.storeName);
            if (parsed.primaryColor) setPrimaryColor(parsed.primaryColor);
          } catch (err) {}
        }
      } finally {
        setTimeout(() => setIsLoading(false), 800);
      }
    };
    loadUniversalState();
  }, []);

  useEffect(() => {
    const unsubProducts = onSnapshot(collection(db, "productos"), (snapshot) => {
      const prods: Product[] = [];
      snapshot.forEach((doc) => {
        prods.push({ id: doc.id, ...doc.data() } as Product);
      });
      if (prods.length > 0) {
        setCurrentProducts(prods);
      }
    });

    const unsubBanners = onSnapshot(collection(db, "banners"), (snapshot) => {
      const banners: any[] = [];
      snapshot.forEach((doc) => {
        banners.push({ id: doc.id, ...doc.data() });
      });

      const isTennis = (b: any) => b.type === 'tennis' || b.type === 'shoes' || b.type === 'calzado' || b.category === 'calzado' || b.category === 'shoes' || b.category === 'tennis' || b.sectionId === 'calzado';
      const isSocks = (b: any) => b.type === 'socks' || b.type === 'medias' || b.category === 'medias' || b.category === 'socks' || b.sectionId === 'medias';
      const isSportwear = (b: any) => b.type === 'sportwear' || b.type === 'sportware' || b.type === 'ropa' || b.category === 'sportwear' || b.category === 'sportware' || b.category === 'ropa' || b.sectionId === 'sportwear' || b.sectionId === 'sportware' || (!isTennis(b) && !isSocks(b));

      const tBrands = banners.filter(isTennis);
      const sBrands = banners.filter(isSocks);
      const cats = banners.filter(isSportwear);

      setTennisBrands(tBrands);
      setSocksBrands(sBrands);
      setCurrentCategories(cats);

      if (tBrands.length > 0 && !activeBrand) {
         setActiveBrand(tBrands[0]);
      }
    });

    const unsubSections = onSnapshot(collection(db, "sections"), (snapshot) => {
      const sections: Section[] = [];
      snapshot.forEach((doc) => {
        sections.push({ id: doc.id, ...doc.data() } as Section);
      });
      setCurrentSections(sections.sort((a, b) => a.orderIndex - b.orderIndex));
    });

    return () => {
      unsubProducts();
      unsubBanners();
      unsubSections();
    };
  }, [activeBrand]);

  useEffect(() => {
    localStorage.setItem('spicy_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const publishState = useCallback(async (updates: Partial<GlobalState>) => {
    setIsPublishing(true);
    try {
      const newState: GlobalState = {
        products: updates.products ?? currentProducts,
        categories: updates.categories ?? currentCategories,
        sections: updates.sections ?? currentSections,
        tennisBrands: updates.tennisBrands ?? tennisBrands,
        socksBrands: updates.socksBrands ?? socksBrands,
        logo: updates.logo ?? customLogo,
        whatsappTemplate: updates.whatsappTemplate ?? whatsappTemplate,
        storeName: updates.storeName ?? storeName,
        primaryColor: updates.primaryColor ?? primaryColor,
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
  }, [currentProducts, currentCategories, tennisBrands, socksBrands, customLogo, whatsappTemplate, storeName, primaryColor]);

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
    console.log("🚀 Intentando borrar banner ID:", bannerId, "| Tipo:", type);
    
    if (!bannerId) {
      alert("🚨 ERROR: El banner no tiene un ID válido de Firebase.");
      return;
    }

    setIsPublishing(true);
    try {
      await syncService.deleteBanner(bannerId);
      console.log("✅ Banner borrado exitosamente de Firestore.");
    } catch (error: any) {
      console.error("❌ Error en Firestore:", error);
      alert(`Error al borrar: ${error.message || 'Error desconocido'}`);
    } finally {
      setIsPublishing(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return currentProducts.filter(p => {
      const pBrand = String(p.marca || p.brand || '').trim().toLowerCase();
      const pCat = String(p.category || '').trim().toLowerCase();
      const fBrand = filters.brand ? filters.brand.trim().toLowerCase() : null;
      const fCat = filters.category ? filters.category.trim().toLowerCase() : null;

      let bMatch = true;
      if (fBrand) {
        bMatch = pBrand === fBrand || pBrand.includes(fBrand) || fBrand.includes(pBrand);
      }

      let cMatch = true;
      if (fCat) {
        if (fCat.includes('sportwear') || fCat.includes('sportware') || fCat.includes('ropa') || fCat.includes('bermuda') || fCat.includes('licra')) {
          cMatch = pCat.includes('sportwear') || pCat.includes('sportware') || pCat.includes('ropa') || pCat.includes('bermuda') || pCat.includes('licra') || pCat === fCat;
        } else {
          cMatch = pCat === fCat || pCat.includes(fCat) || fCat.includes(pCat);
        }
      }

      let sMatch = true;
      if (filters.size) {
        const soldOuts = (p.soldOutSizes || []).map(String);
        sMatch = (p.availableSizes || []).map(String).includes(String(filters.size)) && !soldOuts.includes(String(filters.size));
      }

      const isBannerMatching = (fBrand && fCat) 
        ? (bMatch && cMatch) || (pBrand === fBrand) || (pCat === fCat) || (pBrand === fCat)
        : (bMatch && cMatch);

      return isBannerMatching && sMatch;
    });
  }, [currentProducts, filters]);

  const handleSelectSize = (brand: string, size: number | string, category?: string) => {
    setFilters({ brand, size, category: category || null });
    document.getElementById('product-grid')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAddToCart = (p: Product, s: number | string) => {
    setCartItems(prev => {
      const exIndex = prev.findIndex(i => i.id === p.id && String(i.selectedSize) === String(s));
      if (exIndex > -1) {
        const item = prev[exIndex];
        if (item.quantity >= (p.stock ?? 0)) {
          alert("⚠️ No hay más stock disponible de este par.");
          return prev;
        }
        return prev.map((item, idx) => idx === exIndex ? { ...item, quantity: item.quantity + 1 } : item);
      }
      if ((p.stock ?? 0) <= 0) {
        alert("⚠️ Este producto está agotado.");
        return prev;
      }
      return [...prev, { ...p, quantity: 1, selectedSize: s }];
    });
    setTimeout(() => setIsCartOpen(true), 50);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-8 text-center p-10">
        <div className="animate-pulse">
          {customLogo ? (
            <img src={customLogo} alt="Logo" className="h-24 md:h-32 object-contain mx-auto" />
          ) : (
            <div className="text-red-600 font-[1000] text-8xl italic">SP</div>
          )}
        </div>
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
        storeName={storeName}
      />

      <main className="pb-20">
        {currentSections.length > 0 ? (
          currentSections.map((section) => {
            const sectionName = section.name.toLowerCase();
            
            if (sectionName.includes('calzado') || sectionName.includes('tenis') || sectionName.includes('shoes')) {
              return (
                <Hero 
                  key={section.id}
                  title={section.name}
                  subtitle={section.subtitle}
                  brands={tennisBrands} 
                  products={currentProducts} 
                  onBrandSelect={setActiveBrand} 
                  activeBrand={activeBrand} 
                  isDevMode={isDevMode} 
                  onSelectSize={handleSelectSize} 
                  onQuickAdd={(b) => { setInitialDevBrand(b); setInitialDevType('shoes'); setIsDevPanelOpen(true); }} 
                />
              );
            }

            if (sectionName.includes('media') || sectionName.includes('socks')) {
              return (
                <Socks 
                  key={section.id}
                  title={section.name}
                  subtitle={section.subtitle}
                  brands={socksBrands} 
                  products={currentProducts} 
                  onBrandSelect={(b) => setFilters({ brand: b, size: null, category: section.name })} 
                  onSelectSize={handleSelectSize} 
                  isDevMode={isDevMode} 
                  onQuickAdd={(b) => { setInitialDevBrand(b); setInitialDevType('socks'); setIsDevPanelOpen(true); }} 
                />
              );
            }

            // Sportwear y cualquier otra categoría dinámica
            const sectionCategories = currentCategories.filter(c => 
              (c as any).sectionId === section.id ||
              c.name === section.name ||
              (c as any).category === section.name ||
              sectionName.includes('sportwear') || 
              sectionName.includes('sportware') || 
              sectionName.includes('ropa') || 
              sectionName.includes('prenda') ||
              sectionName.includes('textil') ||
              sectionName.includes('apparel') ||
              currentSections.filter(s => {
                const sn = s.name.toLowerCase();
                return !sn.includes('calzado') && !sn.includes('tenis') && !sn.includes('shoes') && !sn.includes('media') && !sn.includes('socks');
              }).length <= 1
            );

            return (
              <Sportwear 
                key={section.id}
                title={section.name}
                subtitle={section.subtitle}
                categories={sectionCategories.length > 0 ? sectionCategories : currentCategories} 
                products={currentProducts} 
                onCategorySelect={(b, c) => setFilters({brand: b, size: null, category: c})} 
                onSelectSize={handleSelectSize} 
                isDevMode={isDevMode} 
                onQuickAdd={(b) => { setInitialDevBrand(b); setInitialDevType('sportwear'); setIsDevPanelOpen(true); }} 
              />
            );
          })
        ) : (
          <>
            <Hero 
              brands={tennisBrands} 
              products={currentProducts} 
              onBrandSelect={setActiveBrand} 
              activeBrand={activeBrand} 
              isDevMode={isDevMode} 
              onSelectSize={handleSelectSize} 
              onQuickAdd={(b) => { setInitialDevBrand(b); setInitialDevType('shoes'); setIsDevPanelOpen(true); }} 
            />
            <Sportwear 
              title="Sportwear"
              subtitle="Performance Collection"
              categories={currentCategories} 
              products={currentProducts} 
              onCategorySelect={(b, c) => setFilters({brand: b, size: null, category: c})} 
              onSelectSize={handleSelectSize} 
              isDevMode={isDevMode} 
              onQuickAdd={(b) => { setInitialDevBrand(b); setInitialDevType('sportwear'); setIsDevPanelOpen(true); }} 
            />
            <Socks 
              brands={socksBrands} 
              products={currentProducts} 
              onBrandSelect={(b) => setFilters({ brand: b, size: null, category: 'Medias' })} 
              onSelectSize={handleSelectSize} 
              isDevMode={isDevMode} 
              onQuickAdd={(b) => { setInitialDevBrand(b); setInitialDevType('socks'); setIsDevPanelOpen(true); }} 
            />
          </>
        )}

        {/* Garantizar renderizado de Sportwear si existen banners pero ninguna sección los abarcó */}
        {currentSections.length > 0 && 
         !currentSections.some(s => {
           const sn = s.name.toLowerCase();
           return !sn.includes('calzado') && !sn.includes('tenis') && !sn.includes('shoes') && !sn.includes('media') && !sn.includes('socks');
         }) && 
         currentCategories.length > 0 && (
          <Sportwear 
            title="Sportwear"
            subtitle="Performance Collection"
            categories={currentCategories} 
            products={currentProducts} 
            onCategorySelect={(b, c) => setFilters({brand: b, size: null, category: c})} 
            onSelectSize={handleSelectSize} 
            isDevMode={isDevMode} 
            onQuickAdd={(b) => { setInitialDevBrand(b); setInitialDevType('sportwear'); setIsDevPanelOpen(true); }} 
          />
        )}
        
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

      <Cart 
        whatsappTemplate={whatsappTemplate} 
        logo={customLogo} 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cartItems} 
        allProducts={currentProducts}
        onRemove={(id, s) => setCartItems(prev => prev.filter(i => !(i.id === id && String(i.selectedSize) === String(s))))} 
        onUpdateQuantity={(id, s, d) => setCartItems(prev => prev.map(i => {
          if (i.id === id && String(i.selectedSize) === String(s)) {
            const newQty = Math.max(1, i.quantity + d);
            if (d > 0 && newQty > (i.stock ?? 0)) return i;
            return { ...i, quantity: newQty };
          }
          return i;
        }))} 
        onClearCart={() => setCartItems([])} 
      />
      <TermsAndConditions logo={customLogo} isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} onSecretTrigger={() => { setIsTermsOpen(false); setIsDevPanelOpen(true); }} />
      {selectedProduct && <ProductDetail whatsappTemplate={whatsappTemplate} logo={customLogo} product={selectedProduct} onClose={() => setSelectedProduct(null)} onAddToCart={handleAddToCart} />}
      <AIConsultant isOpen={isAIExpertOpen} onClose={() => setIsAIExpertOpen(false)} />
      
      <DeveloperMode 
        logo={customLogo} onUpdateLogo={(l) => { setCustomLogo(l); publishState({ logo: l }); }}
        whatsappTemplate={whatsappTemplate} onUpdateWhatsAppTemplate={(t) => { setWhatsappTemplate(t); publishState({ whatsappTemplate: t }); }}
        storeName={storeName} onUpdateStoreName={(n) => { setStoreName(n); publishState({ storeName: n }); }}
        primaryColor={primaryColor} onUpdatePrimaryColor={(c) => { setPrimaryColor(c); publishState({ primaryColor: c }); }}
        isOpen={isDevPanelOpen} onClose={() => { setIsDevPanelOpen(false); setInitialDevBrand(undefined); setInitialDevType(undefined); }}
        products={currentProducts} categories={currentCategories} tennisBrands={tennisBrands} socksBrands={socksBrands}
        sections={currentSections}
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
        onAddSection={async ns => {
          setIsPublishing(true);
          try {
            const secId = await syncService.saveSection(ns);
            const newSectionCreated: Section = { ...ns, id: secId };
            setCurrentSections(prev => {
              const updated = [...prev, newSectionCreated];
              return updated.sort((a, b) => a.orderIndex - b.orderIndex);
            });
            console.log("🚀 SECCIÓN CREADA EN FIRESTORE CON ID:", secId);
            alert(`✅ Sección "${ns.name}" creada con éxito.`);
          } catch (error) {
            console.error("❌ Error al crear sección:", error);
            alert("Error al crear la sección.");
          } finally { setIsPublishing(false); }
        }}
        onUpdateSection={async us => {
          setIsPublishing(true);
          try {
            await syncService.updateSection(us.id, us);
            setCurrentSections(prev => prev.map(s => s.id === us.id ? us : s).sort((a, b) => a.orderIndex - b.orderIndex));
            console.log("🚀 SECCIÓN ACTUALIZADA:", us.id);
          } catch (error) {
            console.error("Error al actualizar sección:", error);
          } finally { setIsPublishing(false); }
        }}
        onDeleteSection={async id => {
          if(confirm('¿Eliminar esta sección? Los productos vinculados podrían quedar huérfanos.')) {
            setIsPublishing(true);
            try {
              await syncService.deleteSection(id);
              setCurrentSections(prev => prev.filter(s => s.id !== id));
              console.log("🚀 SECCIÓN ELIMINADA:", id);
            } catch (e: any) { 
              console.error("Error al eliminar sección:", e);
            } finally { setIsPublishing(false); }
          }
        }}
        onReorderSections={async (s, t) => {
          const list = [...currentSections];
          const [r] = list.splice(s, 1);
          list.splice(t, 0, r);
          const updated = list.map((item, index) => ({ ...item, orderIndex: index }));
          setCurrentSections(updated);
          setIsPublishing(true);
          try {
            for (const item of updated) {
              await syncService.updateSection(item.id, { orderIndex: item.orderIndex });
            }
          } finally { setIsPublishing(false); }
        }}
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
            setCurrentSections(cloudState.sections || []);
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