import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PRODUCTS, TENNIS_BRANDS, SOCKS_BRANDS, SPORTWEAR_CATEGORIES } from '../constants';
import { Product, CartItem, BrandStock, FilterState, SportwearCategory, Section } from '../types';
import { syncService, GlobalState, db } from '../services/syncService';
import { collection, onSnapshot } from 'firebase/firestore';
import { App as CapApp } from '@capacitor/app';
import { isBannerForCategory } from '../services/categoryUtils';

import Header from './Header';
import StockXHeroBanner from './StockXHeroBanner';
import StockXRecommendedSection from './StockXRecommendedSection';
import StockXCategoryGrid from './StockXCategoryGrid';
import StockXBrandPills from './StockXBrandPills';
import StockXProductCard from './StockXProductCard';
import CategoryBannersView from './CategoryBannersView';
import ProductDetail from './ProductDetail';
import Cart from './Cart';
import TermsAndConditions from './TermsAndConditions';
import DeveloperMode from './DeveloperMode';
import AIConsultant from './AIConsultant';
import AppUpdateModal, { AppUpdateInfo } from './AppUpdateModal';

export const CURRENT_APP_VERSION = "2.0.0";
export const CURRENT_VERSION_CODE = 2;

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [cloudOffline, setCloudOffline] = useState(false);
  
  // App Auto-Update State
  const [availableUpdate, setAvailableUpdate] = useState<AppUpdateInfo | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({ brand: null, size: null, category: null });
  
  // Wishlist State (persisted in localStorage)
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('spicy_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  // Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('spicy_cart') || localStorage.getItem('base_cart');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // Modal states
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isAIExpertOpen, setIsAIExpertOpen] = useState(false);
  const [isDevMode, setIsDevMode] = useState(false); 
  const [isAdminAuthorized, setIsAdminAuthorized] = useState(false);
  const [isDevPanelOpen, setIsDevPanelOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeBrand, setActiveBrand] = useState<BrandStock | null>(null);

  const [initialDevBrand, setInitialDevBrand] = useState<string | undefined>(undefined);
  const [initialDevType, setInitialDevType] = useState<'shoes' | 'sportwear' | 'socks' | undefined>(undefined);

  const [customLogo, setCustomLogo] = useState<string | null>(null);
  const [whatsappTemplate, setWhatsappTemplate] = useState<string>('¡Hola! Quiero confirmar el siguiente pedido:\n\n[DETALLES]\n\n• TOTAL FINAL: [TOTAL]\n\n¿Tienen disponibilidad para entrega hoy?');
  const [storeName, setStoreName] = useState<string>('SNEAKERS SPICY');
  const [primaryColor, setPrimaryColor] = useState<string>('#EF4444');

  const [currentProducts, setCurrentProducts] = useState<Product[]>([]);
  const [currentCategories, setCurrentCategories] = useState<SportwearCategory[]>([]);
  const [currentSections, setCurrentSections] = useState<Section[]>([]);
  const [tennisBrands, setTennisBrands] = useState<BrandStock[]>([]);
  const [socksBrands, setSocksBrands] = useState<BrandStock[]>([]);

  // Toggle Wishlist
  const handleToggleWishlist = (productId: string) => {
    setWishlistIds(prev => {
      const exists = prev.includes(productId);
      const updated = exists ? prev.filter(id => id !== productId) : [...prev, productId];
      localStorage.setItem('spicy_wishlist', JSON.stringify(updated));
      return updated;
    });
  };

  // Initial Data Fetch
  useEffect(() => {
    const loadUniversalState = async () => {
      setIsLoading(true);
      try {
        const cloudState = await syncService.fetchState();
        if (cloudState) {
          setCurrentProducts(cloudState.products || []);
          setCurrentCategories(cloudState.categories || []);
          
          if (!cloudState.sections || cloudState.sections.length === 0) {
            const defaultSections: Omit<Section, 'id'>[] = [
              { name: "Calzado", emoji: "👟", photoCount: 6, sizeInputType: "numeric", orderIndex: 0 },
              { name: "Sportwear", emoji: "👕", photoCount: 2, sizeInputType: "clothing_letters", orderIndex: 1 },
              { name: "Medias", emoji: "🧦", photoCount: 2, sizeInputType: "clothing_letters", orderIndex: 2 }
            ];
            for (const s of defaultSections) {
              await syncService.saveSection(s);
            }
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
        setTimeout(() => setIsLoading(false), 400);
      }
    };
    loadUniversalState();
  }, []);

  // Check for Remote App Updates
  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        const res = await fetch(`https://sneakers-spicy-db.web.app/version.json?t=${Date.now()}`, { cache: 'no-store' });
        if (res.ok) {
          const info: AppUpdateInfo = await res.json();
          if (info && Number(info.versionCode) > CURRENT_VERSION_CODE) {
            setAvailableUpdate(info);
            setIsUpdateModalOpen(true);
          }
        }
      } catch (err) {
        console.log("No update detected or offline:", err);
      }
    };
    checkForUpdates();
  }, []);

  // Realtime Products, Banners & Sections Listener
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

      const tBrands = banners.filter(b => isBannerForCategory(b, 'calzado'));
      const sBrands = banners.filter(b => isBannerForCategory(b, 'medias'));
      const cats = banners.filter(b => isBannerForCategory(b, 'sportwear'));

      setTennisBrands(tBrands);
      setSocksBrands(sBrands);
      setCurrentCategories(cats);
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
  }, []);

  // Sync Cart to LocalStorage
  useEffect(() => {
    localStorage.setItem('spicy_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Native Mobile Back Button & PopState Navigation Stack Handler
  useEffect(() => {
    const handleBackNavigation = (): boolean => {
      // 1. Si está abierto el detalle de un producto -> Cerrar modal de producto
      if (selectedProduct) {
        setSelectedProduct(null);
        return true;
      }
      // 2. Si está abierto el carrito -> Cerrar carrito
      if (isCartOpen) {
        setIsCartOpen(false);
        return true;
      }
      // 3. Si están abiertos los favoritos -> Cerrar favoritos
      if (isWishlistOpen) {
        setIsWishlistOpen(false);
        return true;
      }
      // 4. Si está abierto el panel de desarrollador -> Cerrar modo dev
      if (isDevPanelOpen) {
        setIsDevPanelOpen(false);
        return true;
      }
      // 5. Si está abierto el consultor IA -> Cerrar consultor IA
      if (isAIExpertOpen) {
        setIsAIExpertOpen(false);
        return true;
      }
      // 6. Si están abiertos los términos y condiciones -> Cerrar términos
      if (isTermsOpen) {
        setIsTermsOpen(false);
        return true;
      }
      // 7. Si está abierto el modal de actualización -> Cerrar modal
      if (isUpdateModalOpen) {
        setIsUpdateModalOpen(false);
        return true;
      }
      // 8. Si hay una búsqueda de texto activa -> Limpiar búsqueda
      if (searchQuery.trim()) {
        setSearchQuery('');
        return true;
      }
      // 9. Si hay una marca o talla seleccionada -> Limpiar marca/talla para regresar a la lista de marcas/banners
      if (filters.brand || filters.size) {
        setFilters(prev => ({ ...prev, brand: null, size: null }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return true;
      }
      // 10. Si hay una categoría seleccionada -> Limpiar categoría para regresar a la vista Home principal
      if (filters.category) {
        setFilters({ brand: null, size: null, category: null });
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return true;
      }

      // No hay overlays ni filtros activos: estamos en la raíz del inicio
      return false;
    };

    // Capacitor Native Android Hardware Back Button listener
    let backListenerHandle: any = null;
    try {
      CapApp.addListener('backButton', ({ canGoBack }) => {
        const handled = handleBackNavigation();
        if (!handled) {
          CapApp.exitApp();
        }
      }).then(handle => {
        backListenerHandle = handle;
      }).catch(err => {
        console.log("Capacitor App listener not active in web mode:", err);
      });
    } catch (e) {
      console.log("Capacitor App listener error:", e);
    }

    // Web PopState listener (Browser back gesture / button)
    const handlePopState = () => {
      const handled = handleBackNavigation();
      if (handled) {
        try {
          window.history.pushState({ appNav: true }, '');
        } catch (e) {}
      }
    };

    try {
      window.history.replaceState({ appNav: true }, '');
      window.addEventListener('popstate', handlePopState);
    } catch (e) {}

    return () => {
      if (backListenerHandle && typeof backListenerHandle.remove === 'function') {
        backListenerHandle.remove();
      }
      window.removeEventListener('popstate', handlePopState);
    };
  }, [
    selectedProduct,
    isCartOpen,
    isWishlistOpen,
    isDevPanelOpen,
    isAIExpertOpen,
    isTermsOpen,
    isUpdateModalOpen,
    searchQuery,
    filters
  ]);

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
  }, [currentProducts, currentCategories, currentSections, tennisBrands, socksBrands, customLogo, whatsappTemplate, storeName, primaryColor]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return currentProducts.filter(p => {
      // Search text filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = (p.name || '').toLowerCase().includes(q);
        const brandMatch = (p.brand || '').toLowerCase().includes(q) || (p.marca || '').toLowerCase().includes(q);
        const catMatch = (p.category || '').toLowerCase().includes(q);
        if (!nameMatch && !brandMatch && !catMatch) return false;
      }

      // Brand filter
      if (filters.brand) {
        const targetBrand = filters.brand.toLowerCase().trim();
        const pBrand = (p.brand || '').toLowerCase().trim();
        const pMarca = (p.marca || '').toLowerCase().trim();
        if (!pBrand.includes(targetBrand) && !pMarca.includes(targetBrand)) return false;
      }

      // Size filter
      if (filters.size) {
        if (!p.availableSizes || !p.availableSizes.map(String).includes(String(filters.size))) {
          return false;
        }
      }

      // Category filter
      if (filters.category) {
        const catQuery = filters.category.toLowerCase().trim();
        const pCat = (p.category || '').toLowerCase().trim();
        if (catQuery === 'calzado' || catQuery === 'sneakers' || catQuery === 'shoes') {
          if (!pCat.includes('calzado') && !pCat.includes('tenis') && !pCat.includes('shoes') && !pCat.includes('sneaker')) return false;
        } else if (catQuery === 'sportwear' || catQuery === 'apparel' || catQuery === 'ropa') {
          if (!pCat.includes('sportwear') && !pCat.includes('ropa') && !pCat.includes('apparel') && !pCat.includes('bermuda') && !pCat.includes('licra')) return false;
        } else if (catQuery === 'medias' || catQuery === 'socks') {
          if (!pCat.includes('media') && !pCat.includes('sock')) return false;
        } else {
          if (!pCat.includes(catQuery)) return false;
        }
      }

      return true;
    });
  }, [currentProducts, filters, searchQuery]);

  // Recommended Products
  const recommendedProducts = useMemo(() => {
    return currentProducts.slice(0, 10);
  }, [currentProducts]);

  // Sneakers specific
  const sneakerProducts = useMemo(() => {
    return currentProducts.filter(p => {
      const c = (p.category || '').toLowerCase();
      return c.includes('calzado') || c.includes('tenis') || c.includes('shoes') || c.includes('sneaker');
    });
  }, [currentProducts]);

  // Apparel specific
  const apparelProducts = useMemo(() => {
    return currentProducts.filter(p => {
      const c = (p.category || '').toLowerCase();
      return c.includes('sportwear') || c.includes('ropa') || c.includes('apparel') || c.includes('bermuda') || c.includes('licra');
    });
  }, [currentProducts]);

  // Determine current active banners for selected category (strictly only banners of that category)
  const activeCategoryBanners = useMemo(() => {
    if (!filters.category) return [];
    const allBanners = [...tennisBrands, ...socksBrands, ...currentCategories];
    return allBanners.filter(b => isBannerForCategory(b, filters.category));
  }, [filters.category, tennisBrands, socksBrands, currentCategories]);

  const handleSelectCategory = (categoryName: string) => {
    try { window.history.pushState({ appNav: true }, ''); } catch (e) {}
    setFilters(prev => ({
      ...prev,
      category: categoryName || null,
      brand: null, // reset brand to show all banners for that category
      size: null,
    }));
    // Dejar al usuario en la parte superior donde están las marcas y los banners
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectBrand = (brandName: string | null) => {
    if (brandName) {
      try { window.history.pushState({ appNav: true }, ''); } catch (e) {}
    }
    setFilters(prev => ({
      ...prev,
      brand: brandName
    }));
    if (brandName) {
      document.getElementById('explore-grid')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectBrandAndSize = (brandName: string, size: number | string) => {
    try { window.history.pushState({ appNav: true }, ''); } catch (e) {}
    setFilters(prev => ({
      ...prev,
      brand: brandName,
      size: size
    }));
    document.getElementById('explore-grid')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleResetFilters = () => {
    setFilters({ brand: null, size: null, category: null });
    setSearchQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenProduct = (p: Product) => {
    try { window.history.pushState({ appNav: true }, ''); } catch (e) {}
    setSelectedProduct(p);
  };

  const handleOpenCart = () => {
    try { window.history.pushState({ appNav: true }, ''); } catch (e) {}
    setIsCartOpen(true);
  };

  const handleOpenWishlist = () => {
    try { window.history.pushState({ appNav: true }, ''); } catch (e) {}
    setIsWishlistOpen(true);
  };

  const handleOpenTerms = () => {
    try { window.history.pushState({ appNav: true }, ''); } catch (e) {}
    setIsTermsOpen(true);
  };

  const handleOpenDev = () => {
    try { window.history.pushState({ appNav: true }, ''); } catch (e) {}
    setIsDevPanelOpen(true);
  };

  const handleOpenAI = () => {
    try { window.history.pushState({ appNav: true }, ''); } catch (e) {}
    setIsAIExpertOpen(true);
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
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center space-y-6 text-center p-10 select-none">
        <div className="animate-pulse flex items-center space-x-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 via-red-700 to-black flex items-center justify-center border border-red-500/60 shadow-[0_0_40px_rgba(239,68,68,0.5)]">
            <span className="text-white font-[1000] text-2xl italic tracking-tighter">SP</span>
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-3xl font-[900] tracking-tighter text-white uppercase font-sans">
              SNEAKERS
            </span>
            <span className="text-3xl font-[900] tracking-tighter text-red-600 uppercase italic font-sans">
              SPICY
            </span>
          </div>
        </div>
        <p className="text-zinc-500 font-bold uppercase tracking-[0.3em] text-[11px]">
          Sincronizando con Spicy Vault...
        </p>
      </div>
    );
  }

  const isFilteringActive = Boolean(filters.brand || filters.size || filters.category || searchQuery);

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col selection:bg-red-600 selection:text-white">
      
      {/* Synchronization Notification */}
      {isPublishing && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] bg-zinc-950/90 backdrop-blur-md border border-red-500/50 text-white text-[11px] font-black uppercase tracking-widest px-6 py-2.5 rounded-full shadow-[0_0_30px_rgba(239,68,68,0.3)] flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span>Sincronizando con Firebase Vault...</span>
        </div>
      )}

      {/* Spicy Dark Header (Top notice bar removed) */}
      <Header 
        logo={customLogo} 
        cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
        wishlistCount={wishlistIds.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenCart={handleOpenCart} 
        onOpenWishlist={handleOpenWishlist}
        onOpenTerms={handleOpenTerms} 
        onOpenDev={handleOpenDev}
        onHome={handleResetFilters}
        isDevMode={isDevMode} 
        isAdminAuthorized={isAdminAuthorized} 
        onToggleDevMode={() => setIsDevMode(!isDevMode)}
        storeName={storeName}
      />

      <main className="flex-1 pb-24">
        
        {/* If user is not searching or filtering, show complete StockX overview in Spicy Dark theme */}
        {!isFilteringActive ? (
          <>
            {/* 1. Top Promo Banner Carousel with Touch Swipe Support (Only User-Created Banners) */}
            <StockXHeroBanner 
              customBanners={[...tennisBrands, ...socksBrands, ...currentCategories]}
              onBannerClick={(slide) => {
                const b = slide?.originalBanner;
                if (b) {
                  if (b.name) handleSelectBrand(b.name);
                  else if (b.brand) handleSelectBrand(b.brand);
                }
                document.getElementById('explore-grid')?.scrollIntoView({ behavior: 'smooth' });
              }}
              onExploreClick={() => {
                document.getElementById('explore-grid')?.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            {/* 2. "Recommended For You" Horizontal Carousel */}
            <StockXRecommendedSection 
              title="Recommended For You"
              products={recommendedProducts}
              onSelectProduct={handleOpenProduct}
              onAddToCart={handleAddToCart}
              wishlistedIds={wishlistIds}
              onToggleWishlist={handleToggleWishlist}
              onSeeAll={() => {
                document.getElementById('explore-grid')?.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            {/* 3. "Shop by Category" (4 Dark Square Containers + text below) */}
            <StockXCategoryGrid 
              products={currentProducts}
              sections={currentSections}
              activeCategory={filters.category}
              onSelectCategory={handleSelectCategory}
            />

            {/* 4. Popular Brand Filter Pills */}
            <StockXBrandPills 
              brands={[...tennisBrands, ...socksBrands]}
              selectedBrand={filters.brand}
              onSelectBrand={handleSelectBrand}
            />
          </>
        ) : (
          /* If a category is selected and no specific brand chosen yet, display Category Banners View */
          filters.category && !filters.brand && activeCategoryBanners.length > 0 ? (
            <CategoryBannersView 
              categoryName={filters.category}
              banners={activeCategoryBanners}
              products={currentProducts}
              onSelectBrand={(brandName) => handleSelectBrand(brandName)}
              onSelectSize={(brandName, size) => handleSelectBrandAndSize(brandName, size)}
              onBack={handleResetFilters}
            />
          ) : null
        )}

        {/* Explore All / Filtered Grid Section */}
        <section id="explore-grid" className="w-full max-w-[1600px] mx-auto px-4 md:px-8 py-6">
          
          {/* Brand Selector Pills ALWAYS Accessible when searching or viewing brands */}
          {isFilteringActive && (
            <div className="mb-4">
              <StockXBrandPills 
                brands={[...tennisBrands, ...socksBrands]}
                selectedBrand={filters.brand}
                onSelectBrand={handleSelectBrand}
                onBack={handleResetFilters}
              />
            </div>
          )}

          <div className="space-y-1 mb-6 pb-4 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <span className="w-8 h-[2px] bg-red-600"></span>
              <span className="text-[10px] font-black tracking-[0.4em] uppercase text-red-500">
                INVENTARIO ÉLITE
              </span>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-4xl font-[1000] italic uppercase tracking-tighter text-white">
                  {filters.brand ? `Marca: ${filters.brand}` : filters.category ? `Categoría: ${filters.category}` : searchQuery ? `Búsqueda: "${searchQuery}"` : 'Explorar Catálogo'}
                </h2>
                <p className="text-xs text-zinc-400 font-medium mt-1">
                  {filteredProducts.length} artículo(s) disponible(s) en la bóveda
                </p>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 space-y-4">
              <div className="w-20 h-20 bg-zinc-900/80 rounded-3xl mx-auto flex items-center justify-center text-zinc-600 border border-white/5">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-[1000] italic uppercase text-white">No encontramos coincidencias</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto font-medium">
                Prueba con otro término de búsqueda o limpia los filtros activos.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-red-900/40"
              >
                Atrás / Ver Todo
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
              {filteredProducts.map((product) => (
                <StockXProductCard 
                  key={product.id}
                  product={product}
                  onClick={() => handleOpenProduct(product)}
                  onAddToCart={handleAddToCart}
                  isWishlisted={wishlistIds.includes(product.id)}
                  onToggleWishlist={handleToggleWishlist}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Floating AI Consultant Button with Spicy Flame Glow */}
      <button
        onClick={handleOpenAI}
        aria-label="Consultor IA de Sneakers"
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white p-3.5 sm:px-5 sm:py-3.5 rounded-2xl shadow-[0_0_30px_rgba(239,68,68,0.4)] flex items-center space-x-2.5 transition-all duration-300 hover:scale-105 active:scale-95 border border-red-500/50"
      >
        <span className="text-lg">🤖</span>
        <span className="hidden sm:inline text-xs font-black uppercase tracking-wider">AI Consultant</span>
      </button>

      {/* Modals & Drawers */}
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
            return { ...i, quantity: newQty };
          }
          return i;
        }))} 
        onClearCart={() => setCartItems([])} 
      />

      {/* Wishlist Drawer / Modal in Dark Spicy Theme */}
      {isWishlistOpen && (
        <div className="fixed inset-0 z-[110] flex justify-end animate-fade-in">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsWishlistOpen(false)} />
          <div className="relative w-full max-w-md bg-[#08080A] h-full shadow-2xl flex flex-col border-l border-white/10 z-10 text-white">
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-black/60 backdrop-blur-md">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-[1000] italic uppercase tracking-tight text-white">Mis Favoritos</h3>
                <span className="text-xs font-bold text-red-500 bg-zinc-900 border border-white/5 px-2 py-0.5 rounded-full">
                  {wishlistIds.length}
                </span>
              </div>
              <button onClick={() => setIsWishlistOpen(false)} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
              {wishlistIds.length === 0 ? (
                <div className="text-center py-20 space-y-2">
                  <div className="w-16 h-16 bg-zinc-900 rounded-2xl mx-auto flex items-center justify-center text-zinc-600 border border-white/5">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                  </div>
                  <p className="text-sm font-[1000] italic uppercase text-white">No tienes artículos guardados</p>
                  <p className="text-xs text-zinc-400">Toca el corazón en cualquier sneaker para guardarlo aquí.</p>
                </div>
              ) : (
                currentProducts
                  .filter(p => wishlistIds.includes(p.id))
                  .map(p => (
                    <div 
                      key={p.id}
                      onClick={() => {
                        handleOpenProduct(p);
                        setIsWishlistOpen(false);
                      }}
                      className="flex items-center space-x-3.5 p-3 rounded-2xl border border-white/10 bg-zinc-900/60 hover:border-red-600/50 cursor-pointer transition-all shadow-md"
                    >
                      <img src={p.image} alt={p.name} className="w-16 h-16 object-contain" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">{p.name}</h4>
                        <p className="text-xs font-black italic text-red-500 mt-0.5">RD${Number(p.price).toLocaleString()}</p>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleWishlist(p.id);
                        }}
                        className="text-zinc-500 hover:text-red-500 p-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {selectedProduct && (
        <ProductDetail 
          whatsappTemplate={whatsappTemplate} 
          logo={customLogo} 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
          onAddToCart={handleAddToCart} 
        />
      )}

      <TermsAndConditions 
        logo={customLogo}
        isOpen={isTermsOpen} 
        onClose={() => setIsTermsOpen(false)} 
        onSecretTrigger={() => {
          setIsTermsOpen(false);
          setIsDevPanelOpen(true);
        }}
      />

      <AIConsultant 
        isOpen={isAIExpertOpen} 
        onClose={() => setIsAIExpertOpen(false)} 
      />

      <AppUpdateModal 
        isOpen={isUpdateModalOpen}
        updateInfo={availableUpdate}
        currentVersion={CURRENT_APP_VERSION}
        onClose={() => setIsUpdateModalOpen(false)}
      />

      <DeveloperMode 
        isOpen={isDevPanelOpen} 
        onClose={() => setIsDevPanelOpen(false)} 
        products={currentProducts} 
        categories={currentCategories} 
        tennisBrands={tennisBrands} 
        socksBrands={socksBrands}
        sections={currentSections}
        isAuthorized={isAdminAuthorized} 
        initialBrand={initialDevBrand}
        initialType={initialDevType}
        logo={customLogo}
        whatsappTemplate={whatsappTemplate}
        storeName={storeName}
        primaryColor={primaryColor}
        onUpdateLogo={async (logo) => { setCustomLogo(logo); await publishState({ logo }); }}
        onUpdateWhatsAppTemplate={async (whatsappTemplate) => { setWhatsappTemplate(whatsappTemplate); await publishState({ whatsappTemplate }); }}
        onUpdateStoreName={async (storeName) => { setStoreName(storeName); await publishState({ storeName }); }}
        onUpdatePrimaryColor={async (primaryColor) => { setPrimaryColor(primaryColor); await publishState({ primaryColor }); }}
        onLoginSuccess={() => { setIsAdminAuthorized(true); setIsDevMode(true); }}
        onAddProduct={async (p) => { 
          const updated = [p, ...currentProducts]; 
          setCurrentProducts(updated); 
          await publishState({ products: updated }); 
        }}
        onDeleteProduct={async (id) => { 
          const updated = currentProducts.filter(p => p.id !== id); 
          setCurrentProducts(updated); 
          await syncService.deleteProduct(id);
          await publishState({ products: updated }); 
        }}
        onToggleStock={async (id, size) => {
          const updated = currentProducts.map(p => {
            if (p.id === id) {
              if (size) {
                const currentSold = p.soldOutSizes || [];
                const isSold = currentSold.map(String).includes(String(size));
                const newSold = isSold ? currentSold.filter(s => String(s) !== String(size)) : [...currentSold, size];
                return { ...p, soldOutSizes: newSold };
              } else {
                return { ...p, isSoldOut: !p.isSoldOut, stock: p.isSoldOut ? 1 : 0 };
              }
            }
            return p;
          });
          setCurrentProducts(updated);
          const target = updated.find(p => p.id === id);
          if (target) await syncService.saveProduct(target);
          await publishState({ products: updated });
        }}
        onAddTennisBrand={async (b) => { const list = [...tennisBrands, b]; setTennisBrands(list); await syncService.saveBanner({ ...b, type: 'tennis' }); }}
        onDeleteTennisBrand={async (name) => { const target = tennisBrands.find(b => b.name === name); if(target?.id) await syncService.deleteBanner(target.id); const list = tennisBrands.filter(b => b.name !== name); setTennisBrands(list); }}
        onUpdateTennisBrand={async (b) => { if(b.id) await syncService.updateBanner(b.id, b); const list = tennisBrands.map(item => item.id === b.id ? b : item); setTennisBrands(list); }}
        onAddSocksBrand={async (b) => { const list = [...socksBrands, b]; setSocksBrands(list); await syncService.saveBanner({ ...b, type: 'socks' }); }}
        onDeleteSocksBrand={async (name) => { const target = socksBrands.find(b => b.name === name); if(target?.id) await syncService.deleteBanner(target.id); const list = socksBrands.filter(b => b.name !== name); setSocksBrands(list); }}
        onUpdateSocksBrand={async (b) => { if(b.id) await syncService.updateBanner(b.id, b); const list = socksBrands.map(item => item.id === b.id ? b : item); setSocksBrands(list); }}
        onAddCategory={async (c) => { const list = [...currentCategories, c]; setCurrentCategories(list); await syncService.saveBanner({ ...c, type: 'sportwear' }); }}
        onDeleteCategory={async (name) => { const target = currentCategories.find(c => c.name === name); if(target?.id) await syncService.deleteBanner(target.id); const list = currentCategories.filter(c => c.name !== name); setCurrentCategories(list); }}
        onUpdateCategory={async (c) => { if(c.id) await syncService.updateBanner(c.id, c); const list = currentCategories.map(item => item.id === c.id ? c : item); setCurrentCategories(list); }}
        onReorderTennis={(source, target) => { const list = [...tennisBrands]; const [rem] = list.splice(source, 1); list.splice(target, 0, rem); setTennisBrands(list); publishState({ tennisBrands: list }); }}
        onReorderSocks={(source, target) => { const list = [...socksBrands]; const [rem] = list.splice(source, 1); list.splice(target, 0, rem); setSocksBrands(list); publishState({ socksBrands: list }); }}
        onReorderCategory={(source, target) => { const list = [...currentCategories]; const [rem] = list.splice(source, 1); list.splice(target, 0, rem); setCurrentCategories(list); publishState({ categories: list }); }}
        onAddSection={async (s) => { const secId = await syncService.saveSection(s); setCurrentSections(prev => [...prev, { ...s, id: secId }]); }}
        onUpdateSection={async (s) => { await syncService.updateSection(s.id, s); setCurrentSections(prev => prev.map(sec => sec.id === s.id ? s : sec)); }}
        onDeleteSection={async (id) => { await syncService.deleteSection(id); setCurrentSections(prev => prev.filter(sec => sec.id !== id)); }}
        onReorderSections={(source, target) => { const list = [...currentSections]; const [rem] = list.splice(source, 1); list.splice(target, 0, rem); const updated = list.map((sec, idx) => ({ ...sec, orderIndex: idx })); setCurrentSections(updated); updated.forEach(sec => syncService.updateSection(sec.id, sec)); }}
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