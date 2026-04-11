import React, { useState, useEffect } from 'react';
import { Product, ProductImages, SportwearCategory, ProductCondition, BrandStock } from '../types';
import { syncService } from '../services/syncService';

interface DeveloperModeProps {
  logo?: string | null;
  onUpdateLogo: (logo: string | null) => void;
  whatsappTemplate?: string;
  onUpdateWhatsAppTemplate: (t: string) => void;
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  categories: SportwearCategory[];
  tennisBrands: BrandStock[];
  socksBrands: BrandStock[];
  isAuthorized: boolean;
  initialBrand?: string;
  initialType?: 'shoes' | 'sportwear' | 'socks';
  onLoginSuccess: () => void;
  onLogout: () => void;
  onAddProduct: (p: Product) => Promise<void>;
  onUpdateProduct: (p: Product) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
  onToggleStock: (id: string, s?: number | string) => Promise<void>;
  onLoadTestData?: () => Promise<void>;
  onClearInventory?: () => Promise<void>;
  onClearBanners?: () => Promise<void>;
  
  onAddTennisBrand: (b: BrandStock) => void;
  onDeleteTennisBrand: (name: string) => void;
  onUpdateTennisBrand: (b: BrandStock) => void;

  onAddSocksBrand: (b: BrandStock) => void;
  onDeleteSocksBrand: (name: string) => void;
  onUpdateSocksBrand: (b: BrandStock) => void;

  onAddCategory: (c: SportwearCategory) => void;
  onDeleteCategory: (name: string) => void;
  onUpdateCategory: (c: SportwearCategory) => void;

  onReorderTennis: (source: number, target: number) => void;
  onReorderSocks: (source: number, target: number) => void;
  onReorderCategory: (source: number, target: number) => void;
}

type AddType = 'shoes' | 'sportwear' | 'socks';

const DeveloperMode: React.FC<DeveloperModeProps> = ({ 
  logo, onUpdateLogo, whatsappTemplate, onUpdateWhatsAppTemplate, isOpen, onClose, products, categories, tennisBrands, socksBrands, isAuthorized, initialBrand, initialType, onLoginSuccess, onLogout, onAddProduct, onUpdateProduct, onDeleteProduct, onToggleStock, 
  onLoadTestData, onClearInventory, onClearBanners,
  onAddTennisBrand, onDeleteTennisBrand, onUpdateTennisBrand,
  onAddSocksBrand, onDeleteSocksBrand, onUpdateSocksBrand,
  onAddCategory, onDeleteCategory, onUpdateCategory,
  onReorderTennis, onReorderSocks, onReorderCategory
}) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'add' | 'banners' | 'config' | 'queue'>('inventory');
  const [addType, setAddType] = useState<AddType>('shoes');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [sizesText, setSizesText] = useState(''); 
  const [selectedSportwearSizes, setSelectedSportwearSizes] = useState<string[]>([]);
  
  const [showAddBannerForm, setShowAddBannerForm] = useState<{section: string | null}>({section: null});
  const [newBannerData, setNewBannerData] = useState({ name: '', title: '', subtitle: '', image: '', brand: '' });
  const [editingBanner, setEditingBanner] = useState<{type: 'tennis' | 'socks' | 'sportwear', data: any} | null>(null);

  const [newProduct, setNewProduct] = useState({
    name: '', brand: '', price: 0, description: '', category: 'Shoes', condition: 'nuevo' as ProductCondition, images: { front: '', back: '', left: '', right: '', top: '', bottom: '' }
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);

  // ESTADOS DE COLA DE SUBIDA AVANZADOS
  const [uploadQueue, setUploadQueue] = useState<Product[]>([]);
  const [activeUpload, setActiveUpload] = useState<Product | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadETA, setUploadETA] = useState<number | null>(null);
  const [uploadSpeed, setUploadSpeed] = useState<number>(0);

  // DESPACHADOR DE COLA SECUENCIAL (ARQUITECTURA DE FONDO)
  useEffect(() => {
    const processQueue = async () => {
      if (activeUpload || uploadQueue.length === 0) return;

      const nextProduct = uploadQueue[0];
      setUploadQueue(prev => prev.slice(1));
      setActiveUpload(nextProduct);
      setUploadProgress(0);
      setUploadETA(null);
      setUploadSpeed(0);

      try {
        const savedProduct = await syncService.saveProduct(nextProduct, (progress, eta, speed) => {
          setUploadProgress(progress);
          setUploadETA(eta);
          setUploadSpeed(speed);
        });
        
        await onUpdateProduct(savedProduct);
        console.log(`✅ [COLA] Completado: ${savedProduct.name} @ ${(uploadSpeed / 1024).toFixed(2)} KB/s`);
      } catch (error) {
        console.error("❌ [COLA] Fallo Crítico:", error);
      } finally {
        setActiveUpload(null);
        setUploadProgress(0);
        setUploadETA(null);
        setUploadSpeed(0);
      }
    };

    processQueue();
  }, [uploadQueue, activeUpload, onUpdateProduct]);

  const compressImage = (base64: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        let width = img.width;
        let height = img.height;
        if (width > MAX_WIDTH) { height = (MAX_WIDTH / width) * height; width = MAX_WIDTH; }
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        let quality = 0.7;
        let result = canvas.toDataURL('image/jpeg', quality);
        while (result.length * 0.75 > 400 * 1024 && quality > 0.1) { quality -= 0.05; result = canvas.toDataURL('image/jpeg', quality); }
        resolve(result);
      };
    });
  };

  useEffect(() => {
    if (isOpen && (initialBrand || initialType)) {
      const type = initialType || 'shoes';
      setAddType(type);
      setNewProduct(prev => ({ ...prev, brand: initialBrand || '', category: type === 'shoes' ? 'Shoes' : (type === 'socks' ? 'Medias' : 'Sportwear') }));
      setActiveTab('add');
    }
  }, [isOpen, initialBrand, initialType]);

  const handleLogin = () => {
    if (email.trim().toLowerCase() === 'admin@spicy.com' && password.trim() === 'spicy2025') onLoginSuccess();
    else alert('⚠️ Error: Credenciales incorrectas.');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, key: keyof ProductImages) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const base64 = ev.target?.result as string;
        const compressed = await compressImage(base64);
        setNewProduct(prev => ({ ...prev, images: { ...prev.images, [key]: compressed } }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const compressed = await compressImage(ev.target?.result as string);
        onUpdateLogo(compressed);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProduct = () => {
    let finalSizes: (string | number)[] = [];
    if (addType === 'shoes') finalSizes = sizesText.split(',').map(s => s.trim()).filter(s => s !== '');
    else if (addType === 'sportwear') finalSizes = selectedSportwearSizes;
    else finalSizes = ['Talla Única'];

    if (!newProduct.name || !newProduct.brand || !newProduct.price || !newProduct.images.front) return alert("⚠️ Faltan datos críticos.");
    if (finalSizes.length === 0) return alert("⚠️ Debes asignar las tallas.");

    const product: Product = {
      id: `spicy-${Date.now()}`, name: newProduct.name, brand: newProduct.brand, price: newProduct.price, description: newProduct.description, category: addType === 'shoes' ? 'Shoes' : (addType === 'socks' ? 'Medias' : 'Sportwear'), availableSizes: finalSizes, image: newProduct.images.front, images: { ...newProduct.images }
    };

    onAddProduct(product);
    setUploadQueue(prev => [...prev, product]);
    alert("🚀 ¡A la cola! El producto se subirá en segundo plano.");
    setNewProduct({ name: '', brand: '', price: 0, description: '', category: 'Shoes', condition: 'nuevo', images: { front: '', back: '', left: '', right: '', top: '', bottom: '' }});
    setSizesText('');
    setSelectedSportwearSizes([]);
    setActiveTab('queue');
  };

  const handleSaveNewBanner = async () => {
    if (!newBannerData.name || !newBannerData.image) return alert("⚠️ Nombre e imagen obligatorios.");
    setIsSaving(true);
    const compressedImage = await compressImage(newBannerData.image);
    let sizes: (string | number)[] = [];
    if (showAddBannerForm.section === 'Calzado') sizes = [7, 8, 9, 10, 11, 12];
    else if (showAddBannerForm.section === 'Sportwear') sizes = ['S', 'M', 'L', 'XL', 'XXL'];
    else sizes = ['Talla Única'];
    const common = { name: newBannerData.name, marqueeImage: compressedImage, bannerTitle: newBannerData.title, bannerSubtitle: newBannerData.subtitle, availableSizes: sizes };
    if (showAddBannerForm.section === 'Calzado') onAddTennisBrand({ ...common, logo: newBannerData.name[0] });
    else if (showAddBannerForm.section === 'Medias') onAddSocksBrand({ ...common, logo: newBannerData.name[0] });
    else if (showAddBannerForm.section === 'Sportwear') onAddCategory({ ...common, brand: newBannerData.brand || 'Nike', image: compressedImage });
    setShowAddBannerForm({section: null}); 
    setNewBannerData({name: '', title: '', subtitle: '', image: '', brand: ''});
    try { await syncService.uploadBannerImage(compressedImage, newBannerData.name); } catch (e) { console.error(e); } finally { setIsSaving(false); }
  };

  const handleSaveEditBanner = async () => {
    if (!editingBanner) return;
    setIsSaving(true);
    const compressed = await compressImage(editingBanner.data.marqueeImage || editingBanner.data.image);
    const updatedData = { ...editingBanner.data, marqueeImage: compressed, image: compressed };
    if (editingBanner.type === 'tennis') onUpdateTennisBrand(updatedData);
    else if (editingBanner.type === 'socks') onUpdateSocksBrand(updatedData);
    else if (editingBanner.type === 'sportwear') onUpdateCategory(updatedData);
    setEditingBanner(null);
    try { await syncService.uploadBannerImage(compressed, updatedData.name); alert("✅ Banner actualizado."); } catch (e) { console.error(e); } finally { setIsSaving(false); }
  };

  const migrateHistoricalData = async () => {
    setIsMigrating(true);
    try {
      const oldData = await import('../old_constants_migrate');
      if (oldData.TENNIS_BRANDS) for (const b of oldData.TENNIS_BRANDS) { const url = await syncService.uploadBannerImage(b.marqueeImage, `banner_tennis_${b.name}`); onAddTennisBrand({ ...b, marqueeImage: url }); }
      if (oldData.SOCKS_BRANDS) for (const b of oldData.SOCKS_BRANDS) { const url = await syncService.uploadBannerImage(b.marqueeImage, `banner_socks_${b.name}`); onAddSocksBrand({ ...b, marqueeImage: url }); }
      if (oldData.SPORTWEAR_CATEGORIES) for (const c of oldData.SPORTWEAR_CATEGORIES) { const url = await syncService.uploadBannerImage(c.image, `banner_sport_${c.name}`); onAddCategory({ ...c, image: url }); }
      if (oldData.PRODUCTS) for (const p of oldData.PRODUCTS) { await syncService.saveProduct(p); }
      alert("✅ Migración Completa."); if (onLoadTestData) await onLoadTestData();
    } catch (e) { alert("❌ Error en la migración."); } finally { setIsMigrating(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-0 md:p-10">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative w-full h-full md:max-w-6xl md:h-[95vh] bg-zinc-950 md:rounded-[3rem] border border-white/10 flex flex-col overflow-hidden shadow-2xl text-white">
        
        <div className="px-6 md:px-10 py-5 border-b border-white/5 bg-zinc-900/40 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-6">
            <h3 className="text-red-600 font-black italic text-xl md:text-2xl tracking-tighter">ADMIN_SPICY</h3>
            {isAuthorized && (
              <div className="flex bg-black p-1 rounded-xl border border-white/5 overflow-x-auto no-scrollbar">
                <button onClick={() => setActiveTab('inventory')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase whitespace-nowrap transition-all ${activeTab === 'inventory' ? 'bg-red-600 text-white' : 'text-zinc-500'}`}>📦 Stock</button>
                <button onClick={() => setActiveTab('add')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase whitespace-nowrap transition-all ${activeTab === 'add' ? 'bg-red-600 text-white' : 'text-zinc-500'}`}>➕ Nuevo</button>
                <button onClick={() => setActiveTab('queue')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase whitespace-nowrap transition-all ${activeTab === 'queue' ? 'bg-red-600 text-white' : 'text-zinc-500'}`}>🚀 Cola {uploadQueue.length > 0 ? `(${uploadQueue.length})` : ''}</button>
                <button onClick={() => setActiveTab('banners')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase whitespace-nowrap transition-all ${activeTab === 'banners' ? 'bg-red-600 text-white' : 'text-zinc-500'}`}>🖼️ Banners</button>
                <button onClick={() => setActiveTab('config')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase whitespace-nowrap transition-all ${activeTab === 'config' ? 'bg-red-600 text-white' : 'text-zinc-500'}`}>⚙️ Ajustes</button>
              </div>
            )}
          </div>
          <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white transition-colors"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2"/></svg></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
          {!isAuthorized ? (
            <div className="max-w-sm mx-auto py-24 space-y-6 text-center">
               <div className="text-red-600 font-black text-6xl italic mb-10">SP</div>
               <div className="space-y-4">
                  <input type="text" placeholder="USUARIO" className="w-full bg-zinc-900 border border-white/10 p-5 rounded-2xl text-xs font-bold text-white" onChange={e => setEmail(e.target.value)} value={email} />
                  <input type="password" placeholder="CONTRASEÑA" className="w-full bg-zinc-900 border border-white/10 p-5 rounded-2xl text-xs font-bold text-white" onChange={e => setPassword(e.target.value)} value={password} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
               </div>
               <button onClick={handleLogin} className="w-full bg-red-600 py-5 rounded-2xl font-black text-xs uppercase tracking-widest mt-6">ENTRAR</button>
            </div>
          ) : activeTab === 'queue' ? (
            <div className="max-w-5xl mx-auto space-y-12 pb-20 animate-fade-in">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-8">
                <div>
                  <h4 className="text-4xl font-black italic uppercase tracking-tighter">Terminal de Subida</h4>
                  <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mt-2">Gestión de activos en segundo plano</p>
                </div>
                <div className="bg-zinc-900 px-6 py-4 rounded-2xl border border-white/5">
                  <span className="text-zinc-500 text-[9px] font-black uppercase block">ETA GLOBAL ESTIMADO</span>
                  <span className="text-red-500 text-xl font-black italic">{activeUpload ? `${(uploadETA || 0) + (uploadQueue.length * 15)}s` : '0s'}</span>
                </div>
              </div>

              {activeUpload ? (
                <div className="bg-zinc-900/50 p-10 rounded-[3rem] border border-red-600/20 relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent animate-pulse"></div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-3 h-3 bg-red-600 rounded-full animate-ping"></div>
                        <span className="text-red-600 font-black uppercase text-xs tracking-widest">Transmitiendo...</span>
                      </div>
                      <h5 className="text-5xl font-black italic uppercase text-white leading-none">{activeUpload.name}</h5>
                      <div className="flex items-center space-x-6">
                        <div>
                          <p className="text-zinc-500 text-[9px] font-black uppercase">PROGRESO REAL</p>
                          <p className="text-2xl font-black italic">{Math.round(uploadProgress)}%</p>
                        </div>
                        <div className="w-px h-10 bg-white/10"></div>
                        <div>
                          <p className="text-zinc-500 text-[9px] font-black uppercase">TIEMPO RESTANTE</p>
                          <p className="text-2xl font-black italic text-red-500">{uploadETA || '--'}s</p>
                        </div>
                      </div>
                      <div className="w-full h-4 bg-black rounded-full overflow-hidden border border-white/5 p-1">
                        <div className="h-full bg-red-600 rounded-full transition-all duration-500 ease-out shadow-[0_0_20px_rgba(220,38,38,0.5)]" style={{ width: `${uploadProgress}%` }}></div>
                      </div>
                    </div>
                    <div className="relative group">
                      <div className="aspect-square bg-black rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl">
                        <img src={activeUpload.image} className="w-full h-full object-cover opacity-50 group-hover:opacity-80 transition-opacity" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <svg className="w-20 h-20 text-red-600 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
                  <p className="text-zinc-600 font-black italic text-2xl uppercase">Canal de subida inactivo</p>
                </div>
              )}

              <div className="space-y-6">
                <h6 className="text-xl font-black italic uppercase border-l-4 border-red-600 pl-4">Lista de Espera ({uploadQueue.length})</h6>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {uploadQueue.map((p, idx) => (
                    <div key={idx} className="bg-zinc-900/30 p-5 rounded-2xl border border-white/5 flex items-center space-x-4 opacity-50">
                      <div className="w-12 h-12 bg-black rounded-xl overflow-hidden grayscale">
                        <img src={p.image} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-white truncate max-w-[150px]">{p.name}</p>
                        <p className="text-[8px] font-bold text-zinc-600 uppercase">PENDIENTE</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : activeTab === 'add' ? (
            <div className="max-w-6xl mx-auto space-y-12 pb-20 animate-fade-in">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
                <h4 className="text-2xl font-black italic uppercase">Nueva Rúbrica de Producto</h4>
                <div className="flex space-x-2 bg-black p-1 rounded-2xl border border-white/5">
                  <button onClick={() => { setAddType('shoes'); setNewProduct(prev => ({...prev, category: 'Shoes'})); }} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase ${addType === 'shoes' ? 'bg-white text-black' : 'text-zinc-500'}`}>👟 Calzado</button>
                  <button onClick={() => { setAddType('sportwear'); setNewProduct(prev => ({...prev, category: 'Sportwear'})); }} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase ${addType === 'sportwear' ? 'bg-white text-black' : 'text-zinc-500'}`}>🎽 Sportwear</button>
                  <button onClick={() => { setAddType('socks'); setNewProduct(prev => ({...prev, category: 'Medias'})); }} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase ${addType === 'socks' ? 'bg-white text-black' : 'text-zinc-500'}`}>🧦 Medias</button>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-4">
                    <input placeholder="Modelo" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="bg-zinc-900 border border-white/10 p-4 rounded-xl text-xs font-bold" />
                    <input placeholder="Marca" value={newProduct.brand} onChange={e => setNewProduct({...newProduct, brand: e.target.value})} className="bg-zinc-900 border border-white/10 p-4 rounded-xl text-xs font-bold" />
                  </div>
                  <textarea placeholder="Reseña Técnica" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="w-full bg-zinc-900 border border-white/10 p-4 rounded-xl text-xs font-bold h-32" />
                  <input placeholder="Tallas (EJ: 7, 8.5, 10)" value={sizesText} onChange={e => setSizesText(e.target.value)} className="w-full bg-zinc-900 border border-white/10 p-4 rounded-xl text-xs font-black text-red-500" />
                  <input type="number" placeholder="Precio RD$" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})} className="w-full bg-zinc-900 border border-white/10 p-4 rounded-xl text-xs font-black text-red-500" />
                  <button onClick={handleSaveProduct} className="w-full bg-white text-black py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-xl">
                    Añadir a la Cola de Subida
                  </button>
                </div>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {(addType === 'shoes' ? ['front', 'back', 'left', 'right', 'top', 'bottom'] : ['front', 'back']).map((slot) => (
                      <div key={slot} className="aspect-square bg-zinc-900 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-red-600/40">
                        {newProduct.images[slot as keyof ProductImages] ? ( <img src={newProduct.images[slot as keyof ProductImages]} className="w-full h-full object-cover" /> ) : ( <div className="absolute inset-0 flex items-center justify-center opacity-20"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth="2"/></svg></div> )}
                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, slot as keyof ProductImages)} className="absolute inset-0 opacity-0 cursor-pointer" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'banners' ? (
            <div className="max-w-5xl mx-auto space-y-12 pb-20 animate-fade-in">
              <h4 className="text-3xl font-black italic uppercase text-white border-l-4 border-red-600 pl-6 tracking-tighter">Diseño & Banners</h4>
              {editingBanner && (
                <div className="bg-zinc-900 p-8 rounded-[2rem] border border-red-600/50 space-y-6 animate-scale-in shadow-2xl">
                  <h5 className="text-lg font-black uppercase text-red-600 italic">Editar Banner: {editingBanner.data.name}</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <input value={editingBanner.data.bannerTitle} onChange={e => setEditingBanner({...editingBanner, data: {...editingBanner.data, bannerTitle: e.target.value}})} className="bg-black border border-white/5 p-4 rounded-xl text-xs font-black text-white" placeholder="Título Blanco" />
                    <input value={editingBanner.data.bannerSubtitle} onChange={e => setEditingBanner({...editingBanner, data: {...editingBanner.data, bannerSubtitle: e.target.value}})} className="bg-black border border-white/5 p-4 rounded-xl text-xs font-bold text-zinc-500" placeholder="Subtítulo Gris" />
                    <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-white/5">
                       <img src={editingBanner.data.marqueeImage || editingBanner.data.image} className="w-full h-full object-cover" />
                       <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => { const f = e.target.files?.[0]; if(f){ const r = new FileReader(); r.onload = (ev) => setEditingBanner({...editingBanner, data: {...editingBanner.data, marqueeImage: ev.target?.result as string, image: ev.target?.result as string}}); r.readAsDataURL(f); }}} />
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button onClick={handleSaveEditBanner} disabled={isSaving} className="flex-1 bg-red-600 text-white py-4 rounded-xl font-black text-[10px] uppercase shadow-xl hover:bg-red-700">Actualizar</button>
                    <button onClick={() => setEditingBanner(null)} className="px-6 bg-zinc-800 text-zinc-500 py-4 rounded-xl font-black text-[10px] uppercase hover:text-white">Cancelar</button>
                  </div>
                </div>
              )}
              {['Calzado', 'Sportwear', 'Medias'].map((section) => {
                const list = section === 'Calzado' ? tennisBrands : section === 'Medias' ? socksBrands : categories;
                return (
                  <div key={section} className="space-y-8 bg-zinc-900/30 p-8 rounded-[3rem] border border-white/5">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xl font-black uppercase text-red-600 italic tracking-widest">{section}</h5>
                      <button onClick={() => setShowAddBannerForm({section})} className="px-6 py-3 bg-white text-black text-[10px] font-black uppercase rounded-2xl shadow-lg">+ Añadir</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {list.map((item: any, idx) => (
                        <div key={idx} className="bg-black/60 p-5 rounded-3xl border border-white/5 group relative hover:border-red-600/40 transition-all">
                          <div className="absolute top-4 right-4 flex space-x-2 z-20">
                            <button onClick={() => setEditingBanner({type: section === 'Calzado' ? 'tennis' : section === 'Medias' ? 'socks' : 'sportwear', data: item})} className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xl"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.036 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeWidth="2.5"/></svg></button>
                            <button onClick={(e) => { e.stopPropagation(); if(confirm('¿Borrar permanentemente?')) { if(section === 'Calzado') onDeleteTennisBrand(item.name); else if(section === 'Medias') onDeleteSocksBrand(item.name); else onDeleteCategory(item.name); } }} className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-xl"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2.5"/></svg></button>
                          </div>
                          <div className="aspect-video rounded-2xl overflow-hidden border border-white/5 mb-4 relative">
                            <img src={item.marqueeImage || item.image} className="w-full h-full object-cover transition-all duration-500" />
                          </div>
                          <p className="text-[10px] font-black uppercase text-white truncate">{item.bannerTitle || item.name}</p>
                          <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest truncate">{item.bannerSubtitle || 'SIN SUBTÍTULO'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : activeTab === 'config' ? (
            <div className="max-w-5xl mx-auto space-y-12 pb-20 animate-fade-in">
              <h4 className="text-3xl font-black italic uppercase text-white border-l-4 border-red-600 pl-6 tracking-tighter">Ajustes del Sistema</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-zinc-900/30 p-10 rounded-[3rem] border border-white/5">
                <div className="space-y-6 text-center md:text-left">
                  <label className="text-[11px] font-[1000] text-zinc-500 uppercase tracking-[0.3em] block">Identidad Visual (Logo)</label>
                  <div className="aspect-square w-48 bg-black rounded-[2.5rem] border border-white/10 flex items-center justify-center relative overflow-hidden group shadow-2xl mx-auto md:mx-0">
                    {logo ? <img src={logo} className="w-full h-full object-contain p-6" /> : <div className="text-red-600 font-black text-5xl italic">SP</div>}
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                </div>
                <div className="space-y-6">
                  <label className="text-[11px] font-[1000] text-zinc-500 uppercase tracking-[0.3em] block">Soporte WhatsApp</label>
                  <textarea value={whatsappTemplate} onChange={(e) => onUpdateWhatsAppTemplate(e.target.value)} className="w-full bg-black border border-white/10 p-6 rounded-3xl text-xs font-bold h-44 resize-none" />
                  <button onClick={migrateHistoricalData} disabled={isMigrating} className="w-full mt-4 py-4 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all disabled:opacity-50">
                    {isMigrating ? "Migrando Banners..." : "⚡ Migrar Banners Históricos (GitHub)"}
                  </button>
                  <button onClick={onClearBanners} className="w-full mt-2 py-4 bg-red-600/20 border border-red-500/30 text-red-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">
                    🗑️ Borrar Todos los Banners
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-12 max-w-5xl mx-auto pb-20 animate-fade-in">
               <h2 className="text-4xl font-black italic uppercase tracking-tighter border-l-4 border-red-600 pl-4">Stock de Productos</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {products.map(p => (
                   <div key={p.id} className="bg-zinc-900/50 p-4 rounded-[2rem] flex items-center justify-between border border-white/5 group hover:border-white/10 transition-all">
                     <div className="flex items-center space-x-5">
                       <div className="w-16 h-16 bg-black rounded-2xl border border-white/5 overflow-hidden"> <img src={p.image} className="w-full h-full object-cover" /> </div>
                       <div>
                         <p className="text-[10px] font-black uppercase text-white leading-tight">{p.name}</p>
                         <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.2em]">{p.brand} ● RD${p.price}</p>
                       </div>
                     </div>
                     <div className="flex items-center space-x-2">
                       <button onClick={() => onToggleStock(p.id)} className={`px-4 py-3 rounded-xl text-[9px] font-black uppercase transition-all ${p.isSoldOut ? 'bg-zinc-800 text-zinc-600' : 'bg-green-600/10 text-green-500 border border-green-500/20 shadow-lg'}`}>{p.isSoldOut ? 'SOLD OUT' : 'READY'}</button>
                       <button onClick={() => onDeleteProduct(p.id)} className="p-3 text-zinc-700 hover:text-red-600 transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2.5"/></svg></button>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          )}
        </div>
      </div>

      {(activeUpload || uploadQueue.length > 0) && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:right-10 md:translate-x-0 z-[200] w-[90%] max-w-sm animate-fade-in">
          <div className="bg-black/80 backdrop-blur-xl border border-red-600/50 rounded-3xl p-6 shadow-[0_20px_50px_rgba(220,38,38,0.3)] space-y-4 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600/40 to-transparent"></div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse shadow-[0_0_10px_rgba(220,38,38,1)]"></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Subiendo a la Nube</span>
              </div>
              {uploadETA !== null && <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Restan: {uploadETA}s</span>}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <p className="text-sm font-black italic uppercase truncate max-w-[70%] text-white">{activeUpload?.name || 'Iniciando...'}</p>
                <p className="text-xs font-black text-red-600">{Math.round(uploadProgress)}%</p>
              </div>
              <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)] transition-all duration-300 ease-out" style={{ width: `${uploadProgress}%` }}></div>
              </div>
            </div>
            {uploadQueue.length > 0 && (
              <div className="pt-3 border-t border-white/5">
                <p className="text-[8px] font-black text-zinc-500 uppercase mb-2">En espera ({uploadQueue.length}):</p>
                <div className="flex flex-wrap gap-2">
                  {uploadQueue.map((p, i) => (
                    <span key={i} className="text-[8px] font-bold bg-zinc-900 px-2 py-1 rounded-md text-zinc-400 border border-white/5">{p.name}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DeveloperMode;