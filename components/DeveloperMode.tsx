
import React, { useState, useEffect } from 'react';
import { Product, ProductImages, SportwearCategory, ProductCondition, BrandStock, Section, SizeInputType, BannerFormat } from '../types';
import { doc, updateDoc, setDoc, collection, onSnapshot, query, where, deleteDoc } from 'firebase/firestore';
import { syncService, db } from '../services/syncService';

interface DeveloperModeProps {
  logo?: string | null;
  onUpdateLogo: (logo: string | null) => void;
  whatsappTemplate?: string;
  onUpdateWhatsAppTemplate: (t: string) => void;
  storeName?: string;
  onUpdateStoreName: (n: string) => void;
  primaryColor?: string;
  onUpdatePrimaryColor: (c: string) => void;
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

  sections: Section[];
  onAddSection: (s: Omit<Section, 'id'>) => Promise<void>;
  onUpdateSection: (s: Section) => Promise<void>;
  onDeleteSection: (id: string) => Promise<void>;
  onReorderSections: (source: number, target: number) => void;
}

type AddType = 'shoes' | 'sportwear' | 'socks';

const DeveloperMode: React.FC<DeveloperModeProps> = ({ 
  logo, onUpdateLogo, whatsappTemplate, onUpdateWhatsAppTemplate,
  storeName = 'SNEAKERS SPICY', onUpdateStoreName,
  primaryColor = '#EF4444', onUpdatePrimaryColor,
  isOpen, onClose, products, categories, tennisBrands, socksBrands, isAuthorized, initialBrand, initialType, onLoginSuccess, onLogout, onAddProduct, onUpdateProduct, onDeleteProduct, onToggleStock, 
  onLoadTestData, onClearInventory, onClearBanners,
  onAddTennisBrand, onDeleteTennisBrand, onUpdateTennisBrand,
  onAddSocksBrand, onDeleteSocksBrand, onUpdateSocksBrand,
  onAddCategory, onDeleteCategory, onUpdateCategory,
  onReorderTennis, onReorderSocks, onReorderCategory,
  sections, onAddSection, onUpdateSection, onDeleteSection, onReorderSections
}) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'add' | 'banners' | 'sections' | 'config'>('inventory');
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [showAddSectionForm, setShowAddSectionForm] = useState(false);
  const [newSectionData, setNewSectionData] = useState<Omit<Section, 'id' | 'orderIndex'>>({
    name: '', subtitle: '', emoji: '👟', photoCount: 6, sizeInputType: 'numeric'
  });
  const [editingSection, setEditingSection] = useState<Section | null>(null);

  useEffect(() => {
    if (activeTab === 'add' && !selectedSectionId && sections.length > 0) {
      setSelectedSectionId(sections[0].id);
      setNewProduct(prev => ({ ...prev, category: sections[0].name }));
    }
  }, [activeTab, sections, selectedSectionId]);
  const [addType, setAddType] = useState<AddType>('shoes');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [sizesText, setSizesText] = useState(''); 
  const [selectedSportwearSizes, setSelectedSportwearSizes] = useState<string[]>([]);
  
  const [showAddBannerForm, setShowAddBannerForm] = useState<{section: string | null}>({section: null});
  const [newBannerData, setNewBannerData] = useState({ name: '', title: '', subtitle: '', image: '', brand: '', format: 'horizontal' as BannerFormat });
  const [editingBanner, setEditingBanner] = useState<{type: 'tennis' | 'socks' | 'sportwear', data: any} | null>(null);

  const [newProduct, setNewProduct] = useState({
    name: '', brand: '', price: 0, description: '', category: 'Shoes', condition: 'nuevo' as ProductCondition, 
    images: { front: '', back: '', left: '', right: '', top: '', bottom: '' },
    stock: 1
  });

  const [isSaving, setIsSaving] = useState(false);
  const [dbBrands, setDbBrands] = useState<string[]>([]);
  const [isMigrating, setIsMigrating] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  useEffect(() => {
    const selectedSection = sections.find(s => s.id === selectedSectionId);
    let bannerType = 'tennis';
    
    if (selectedSection) {
      const name = selectedSection.name.toLowerCase();
      if (name.includes('calzado') || name.includes('shoes') || name.includes('tenis')) bannerType = 'tennis';
      else if (name.includes('media') || name.includes('socks')) bannerType = 'socks';
      else if (name.includes('ropa') || name.includes('sportwear') || name.includes('sportware') || name.includes('prenda')) bannerType = 'sportwear';
      else bannerType = 'tennis'; // Default
    }

    const q = query(
      collection(db, 'banners'), 
      where('type', '==', bannerType)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const names = snapshot.docs.map(doc => (doc.data().nombre || doc.data().name || "") as string);
      setDbBrands(Array.from(new Set(names)).filter(Boolean).sort());
    });
    return () => unsubscribe();
  }, [addType, selectedSectionId, sections]);

  useEffect(() => {
    const selectedSection = sections.find(s => s.id === selectedSectionId);
    if (selectedSection) {
      const name = selectedSection.name.toLowerCase();
      if (name.includes('calzado') || name.includes('shoes') || name.includes('tenis')) {
        setAddType('shoes');
      } else if (name.includes('media') || name.includes('socks')) {
        setAddType('socks');
      } else if (name.includes('ropa') || name.includes('sportwear') || name.includes('sportware') || name.includes('prenda')) {
        setAddType('sportwear');
      }
    }
    if (!editingProductId) {
      setNewProduct(prev => ({ ...prev, brand: '' }));
    }
  }, [selectedSectionId, sections, editingProductId]);

  const resetForm = () => {
    setEditingProductId(null);
    setNewProduct({
      name: '', brand: '', price: 0, description: '', category: 'Shoes', condition: 'nuevo' as ProductCondition, 
      images: { front: '', back: '', left: '', right: '', top: '', bottom: '' },
      stock: 1
    });
    setSizesText('');
    setSelectedSportwearSizes([]);
  };

  const handleTabChange = (tab: 'inventory' | 'add' | 'banners' | 'sections' | 'config') => {
    if (tab === 'add' && activeTab !== 'add') {
      resetForm();
    }
    setActiveTab(tab);
  };

  const handleEditProductClick = (p: Product) => {
    setEditingProductId(p.id);
    setAddType(p.category === 'Shoes' ? 'shoes' : (p.category === 'Medias' ? 'socks' : 'sportwear'));
    setNewProduct({
      name: p.name, brand: p.brand, price: p.price, description: p.description || '', 
      category: p.category, condition: (p as any).condition || 'nuevo',
      stock: p.stock ?? 1,
      images: {
        front: p.images?.front || p.image || '',
        back: p.images?.back || '',
        left: p.images?.left || '',
        right: p.images?.right || '',
        top: p.images?.top || '',
        bottom: p.images?.bottom || '',
      }
    });
    setSizesText(p.availableSizes ? p.availableSizes.join(', ') : '');
    setSelectedSportwearSizes(p.category === 'Sportwear' ? p.availableSizes.map(String) : []);
    setActiveTab('add');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, slot: string, target: 'product' | 'banner' | 'logo' = 'product') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsSaving(true);
    try {
      // Identificar imagen antigua para borrar
      let oldUrl: string | null = null;
      if (target === 'product') {
        oldUrl = (newProduct.images as any)[slot] || null;
      } else if (target === 'banner') {
        oldUrl = editingBanner ? (editingBanner.data.marqueeImage || editingBanner.data.image) : newBannerData.image;
      } else if (target === 'logo') {
        oldUrl = logo || null;
      }

      const url = await syncService.uploadImage(file);
      
      if (target === 'product') {
        setNewProduct(prev => ({ ...prev, images: { ...prev.images, [slot]: url } }));
      } else if (target === 'banner') {
        if (editingBanner) {
          setEditingBanner({ ...editingBanner, data: { ...editingBanner.data, marqueeImage: url, image: url } });
        } else {
          setNewBannerData(prev => ({ ...prev, image: url }));
        }
      } else if (target === 'logo') {
        onUpdateLogo(url);
      }
    } catch (error: any) {
      alert(`❌ Error al subir a Cloudinary: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
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

  const handleSaveProduct = async () => {
    let finalSizes: (string | number)[] = [];
    if (sizesText && sizesText.trim()) {
      finalSizes = sizesText.split(',').map(s => s.trim().toUpperCase()).filter(s => s !== '');
    } else if (selectedSportwearSizes.length > 0) {
      finalSizes = selectedSportwearSizes.map(s => s.trim().toUpperCase());
    } else if (addType === 'sportwear') {
      finalSizes = ['XL'];
    } else if (addType === 'shoes') {
      finalSizes = [7, 8, 9, 10, 11];
    } else {
      finalSizes = ['Talla Única'];
    }

    if (!newProduct.name || !newProduct.brand || !newProduct.price || !newProduct.images.front) {
      return alert("⚠️ Faltan datos críticos (Nombre, Marca, Precio y URL Imagen Principal).");
    }

    const productId = editingProductId || `spicy-${Date.now()}`;
    const selectedSection = sections.find(s => s.id === selectedSectionId);
    
    // Asegurarse de guardar como un objeto plano con strings vacías en los slots no completados
    const imagesObject = {
      front: newProduct.images.front || '',
      back: newProduct.images.back || '',
      left: newProduct.images.left || '',
      right: newProduct.images.right || '',
      top: newProduct.images.top || '',
      bottom: newProduct.images.bottom || '',
    };

    const resolvedCategory = selectedSection?.name || 
      (addType === 'shoes' ? 'Shoes' : addType === 'sportwear' ? 'Sportwear' : 'Medias');

    const productToSave: any = {
      id: productId, 
      name: newProduct.name, 
      brand: newProduct.brand, 
      marca: newProduct.brand, 
      price: newProduct.price, 
      description: newProduct.description, 
      category: resolvedCategory,
      sectionId: selectedSectionId || (addType === 'shoes' ? 'calzado' : addType === 'sportwear' ? 'sportwear' : 'medias'),
      availableSizes: finalSizes, 
      image: newProduct.images.front, 
      images: imagesObject,
      stock: newProduct.stock,
      isSoldOut: newProduct.stock === 0
    };

    setIsSaving(true);
    try {
      const confirmedProduct = await syncService.saveProduct(productToSave);
      if (editingProductId) {
        await onUpdateProduct(confirmedProduct);
        alert(`✅ ¡Actualizado! "${confirmedProduct.name}" ha sido guardado.`);
      } else {
        await onAddProduct(confirmedProduct);
        alert(`✅ ¡Publicado! "${confirmedProduct.name}" ya está disponible vía URL.`);
      }
      setNewProduct({ name: '', brand: '', price: 0, description: '', category: 'Shoes', condition: 'nuevo', stock: 1, images: { front: '', back: '', left: '', right: '', top: '', bottom: '' }});
      setSizesText('');
      setSelectedSportwearSizes([]);
      setEditingProductId(null);
      setActiveTab('inventory');
    } catch (error: any) {
      alert(`❌ Error al guardar: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSection = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    try {
      if (editingSection) {
        await onUpdateSection({ ...editingSection, ...newSectionData });
        setEditingSection(null);
      } else {
        await onAddSection({ ...newSectionData, orderIndex: sections.length });
      }
      setShowAddSectionForm(false);
      setNewSectionData({ name: '', subtitle: '', emoji: '👟', photoCount: 6, sizeInputType: 'numeric' });
    } catch (err: any) {
      console.error("❌ Error en handleSaveSection:", err);
      alert(`Error al guardar sección: ${err.message}`);
    }
  };

  const handleSaveNewBanner = async () => {
    if (!newBannerData.title || !newBannerData.image) return alert("⚠️ Datos faltantes (Título Blanco e Imagen).");
    setIsSaving(true);
    try {
      let sizes: (string | number)[] = [];
      if (showAddBannerForm.section === 'Calzado') sizes = [7, 8, 9, 10, 11, 12];
      else if (showAddBannerForm.section === 'Sportwear') sizes = ['S', 'M', 'L', 'XL', 'XXL'];
      else sizes = ['Talla Única'];
      const common = { name: newBannerData.name || newBannerData.title, marqueeImage: newBannerData.image, bannerTitle: newBannerData.title, bannerSubtitle: newBannerData.subtitle, availableSizes: sizes, format: newBannerData.format };
      if (showAddBannerForm.section === 'Calzado') await onAddTennisBrand({ ...common, logo: (newBannerData.name || newBannerData.title)[0] });
      else if (showAddBannerForm.section === 'Medias') await onAddSocksBrand({ ...common, logo: (newBannerData.name || newBannerData.title)[0] });
      else if (showAddBannerForm.section === 'Sportwear') await onAddCategory({ ...common, brand: newBannerData.brand || 'Nike', image: newBannerData.image });
      setShowAddBannerForm({section: null}); 
      setNewBannerData({name: '', title: '', subtitle: '', image: '', brand: '', format: 'horizontal' });
    } catch (e: any) { alert(`Error: ${e.message}`); } finally { setIsSaving(false); }
  };

  const handleSaveEditBanner = async () => {
    if (!editingBanner) return;
    setIsSaving(true);
    try {
      const bannerId = editingBanner.data.id || editingBanner.data.uid || `banner-${Date.now()}`;
      const updatedData = { 
        ...editingBanner.data, 
        id: bannerId,
        name: editingBanner.data.name || '',
        bannerTitle: editingBanner.data.bannerTitle || editingBanner.data.name || '',
        bannerSubtitle: editingBanner.data.bannerSubtitle || '',
        marqueeImage: editingBanner.data.marqueeImage || editingBanner.data.image || '', 
        image: editingBanner.data.image || editingBanner.data.marqueeImage || '',
        format: editingBanner.data.format || 'horizontal',
        type: editingBanner.type,
        lastUpdated: Date.now()
      };

      const bannerRef = doc(db, 'banners', bannerId);
      await setDoc(bannerRef, updatedData, { merge: true });

      // Sincronizar estado local
      if (editingBanner.type === 'tennis') await onUpdateTennisBrand(updatedData);
      else if (editingBanner.type === 'socks') await onUpdateSocksBrand(updatedData);
      else if (editingBanner.type === 'sportwear') await onUpdateCategory(updatedData);

      setEditingBanner(null);
      alert("✅ Banner actualizado exitosamente en base de datos.");
    } catch (e: any) { 
      console.error("Error al actualizar banner:", e);
      alert(`❌ Error al guardar banner: ${e.message || 'Error desconocido'}`); 
    } finally { 
      setIsSaving(false); 
    }
  };

  const handleDeleteBanner = async (bannerId: string) => {
    alert(`Iniciando borrado para ID: ${bannerId}`);
    if (!bannerId) {
      alert("❌ ERROR: No se encontró el ID del banner.");
      return;
    }
    try {
      await deleteDoc(doc(db, 'banners', bannerId));
      alert("✅ BANNER BORRADO EXITOSAMENTE DE FIREBASE");
    } catch (error: any) {
      alert(`❌ ERROR DE FIREBASE: ${error.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-0 md:p-6 lg:p-10">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative w-full h-full md:max-w-7xl md:h-[90vh] bg-zinc-950 md:rounded-[3rem] border-x-0 md:border border-white/10 flex flex-col overflow-hidden shadow-2xl text-white">
        
        {isSaving && (
          <div className="absolute inset-0 z-[200] bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white font-black uppercase tracking-[0.3em] text-[10px]">Guardando...</p>
          </div>
        )}

        <div className="sticky top-0 z-[160] px-4 md:px-10 py-5 border-b border-white/5 bg-zinc-900/80 backdrop-blur-xl flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-4 md:space-x-6 overflow-x-auto no-scrollbar">
            <h3 className="text-red-600 font-black italic text-lg md:text-2xl tracking-tighter shrink-0">MODO_DEV</h3>
            {isAuthorized && (
              <div className="flex bg-black/50 p-1 rounded-xl border border-white/5 whitespace-nowrap">
                <button onClick={() => handleTabChange('inventory')} className={`px-3 md:px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${activeTab === 'inventory' ? 'bg-red-600 text-white shadow-lg' : 'text-zinc-500'}`}>Stock</button>
                <button onClick={() => handleTabChange('add')} className={`px-3 md:px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${activeTab === 'add' ? 'bg-red-600 text-white shadow-lg' : 'text-zinc-500'}`}>+ Nuevo</button>
                <button onClick={() => handleTabChange('sections')} className={`px-3 md:px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${activeTab === 'sections' ? 'bg-red-600 text-white shadow-lg' : 'text-zinc-500'}`}>Secciones</button>
                <button onClick={() => handleTabChange('banners')} className={`px-3 md:px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${activeTab === 'banners' ? 'bg-red-600 text-white shadow-lg' : 'text-zinc-500'}`}>Banners</button>
                <button onClick={() => handleTabChange('config')} className={`px-3 md:px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${activeTab === 'config' ? 'bg-red-600 text-white shadow-lg' : 'text-zinc-500'}`}>⚙️</button>
              </div>
            )}
          </div>
          <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors ml-4 focus:ring-2 focus:ring-red-600"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5"/></svg></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar overscroll-contain">
          {!isAuthorized ? (
            <div className="max-w-sm mx-auto py-24 space-y-6 text-center">
               <div className="mb-10">
                  {logo ? (
                    <img src={logo} alt="Logo" className="h-16 md:h-20 object-contain mx-auto" />
                  ) : (
                    <div className="text-red-600 font-black text-6xl italic">SP</div>
                  )}
               </div>
               <div className="space-y-4">
                  <input type="text" placeholder="USUARIO" className="w-full bg-zinc-900 border border-white/10 p-5 rounded-2xl text-xs font-bold text-white" onChange={e => setEmail(e.target.value)} value={email} />
                  <input type="password" placeholder="CONTRASEÑA" className="w-full bg-zinc-900 border border-white/10 p-5 rounded-2xl text-xs font-bold text-white" onChange={e => setPassword(e.target.value)} value={password} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
               </div>
               <button onClick={handleLogin} className="w-full bg-red-600 py-5 rounded-2xl font-black text-xs uppercase tracking-widest mt-6">ENTRAR</button>
            </div>
          ) : activeTab === 'add' ? (
            <div className="max-w-6xl mx-auto space-y-12 pb-20 animate-fade-in">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
                <h4 className="text-2xl font-black italic uppercase">{editingProductId ? 'Editando Rúbrica' : 'Nueva Rúbrica de Producto'} (Modo URL)</h4>
                <div className="flex items-center gap-4">
                  {editingProductId && (
                    <button onClick={() => { setEditingProductId(null); setNewProduct({ name: '', brand: '', price: 0, description: '', category: 'Shoes', condition: 'nuevo', stock: 1, images: { front: '', back: '', left: '', right: '', top: '', bottom: '' }}); }} className="px-4 py-2 bg-zinc-800 text-[9px] font-black uppercase rounded-lg hover:bg-zinc-700">Cancelar Edición</button>
                  )}
                  <div className="flex flex-wrap gap-2 bg-black p-1 rounded-2xl border border-white/5">
                    {sections.map(section => (
                      <button 
                        key={section.id}
                        onClick={() => { 
                          setSelectedSectionId(section.id); 
                          setNewProduct(prev => ({...prev, category: section.name})); 
                        }} 
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${selectedSectionId === section.id ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}
                      >
                        {section.emoji} {section.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {selectedSectionId ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                  <div className="space-y-8">
                    <div className="grid grid-cols-2 gap-4">
                      <input placeholder="Modelo" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="bg-zinc-900 border border-white/10 p-4 rounded-xl text-xs font-bold" />
                      <select 
                        required
                        value={newProduct.brand} 
                        onChange={e => setNewProduct({...newProduct, brand: e.target.value})} 
                        className="bg-zinc-900 border border-white/10 p-4 rounded-xl text-xs font-bold text-white appearance-none cursor-pointer hover:border-red-600/50 transition-colors"
                      >
                        <option value="" disabled>Selecciona una marca</option>
                        {dbBrands.map((brandName, idx) => (
                          <option key={idx} value={brandName}>{brandName}</option>
                        ))}
                      </select>
                    </div>
                    <textarea placeholder="Reseña Técnica" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="w-full bg-zinc-900 border border-white/10 p-4 rounded-xl text-xs font-bold h-32" />
                    
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-zinc-500 ml-2">
                        {sections.find(s => s.id === selectedSectionId)?.sizeInputType === 'numeric' ? 'Tallas Numéricas (EJ: 7, 8.5, 10)' : 'Tallas por Letras (EJ: S, M, L, XL)'}
                      </label>
                      <input 
                        placeholder={sections.find(s => s.id === selectedSectionId)?.sizeInputType === 'numeric' ? "EJ: 7, 8.5, 10" : "EJ: S, M, L, XL"} 
                        value={sizesText} 
                        onChange={e => setSizesText(e.target.value)} 
                        className="w-full bg-zinc-900 border border-white/10 p-4 rounded-xl text-xs font-black text-red-500" 
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-zinc-500 ml-2">Precio RD$</label>
                        <input type="number" placeholder="Precio RD$" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})} className="w-full bg-zinc-900 border border-white/10 p-4 rounded-xl text-xs font-black text-red-500" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-zinc-500 ml-2">Stock Disponible</label>
                        <input type="number" min="0" placeholder="Cantidad" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: Number(e.target.value)})} className="w-full bg-zinc-900 border border-white/10 p-4 rounded-xl text-xs font-black text-red-500" />
                      </div>
                    </div>
                    <button onClick={handleSaveProduct} disabled={isSaving} className="w-full bg-white text-black py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-xl disabled:opacity-50">
                      {isSaving ? "SINCRONIZANDO..." : editingProductId ? "GUARDAR CAMBIOS" : "PUBLICAR PRODUCTO"}
                    </button>
                  </div>
                  
                  <div className="space-y-6">
                    <p className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em] mb-4">Captura de Imágenes (Upload Only)</p>
                    <div className="grid grid-cols-2 gap-6">
                      {Array.from({ length: sections.find(s => s.id === selectedSectionId)?.photoCount || 2 }).map((_, idx) => {
                        const slots = ['front', 'back', 'left', 'right', 'top', 'bottom'];
                        const slot = slots[idx];
                        return (
                          <div key={slot} className="flex flex-col space-y-3 bg-black/40 p-5 rounded-3xl border border-white/5 group hover:border-red-600/30 transition-all">
                            <div className="flex items-center justify-between">
                              <label className="text-[9px] font-[1000] uppercase text-zinc-500 tracking-widest">{slot}</label>
                              {newProduct.images[slot as keyof ProductImages] && (
                                <span className="text-[8px] font-black text-green-500 flex items-center gap-1 animate-pulse">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/></svg>
                                  LISTO
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-4">
                              <label className="flex-1 cursor-pointer group/btn overflow-hidden">
                                 <div className={`flex items-center justify-center gap-3 p-4 rounded-2xl border-2 border-dashed transition-all ${newProduct.images[slot as keyof ProductImages] ? 'border-green-600/20 bg-green-600/5' : 'border-zinc-800 bg-zinc-900/50 hover:border-red-600/40 hover:bg-zinc-900'}`}>
                                   <svg className={`w-5 h-5 ${newProduct.images[slot as keyof ProductImages] ? 'text-green-500' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                   <span className="text-[10px] font-black uppercase text-white tracking-tighter">
                                     {newProduct.images[slot as keyof ProductImages] ? "Cambiar" : "Subir Foto"}
                                   </span>
                                 </div>
                                 <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, slot)} accept="image/*" />
                              </label>
                              {newProduct.images[slot as keyof ProductImages] && (
                                <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white/10 shrink-0 shadow-2xl rotate-2 hover:rotate-0 transition-transform">
                                   <img src={newProduct.images[slot as keyof ProductImages]} className="w-full h-full object-cover" alt="Preview" />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-20 text-center space-y-4">
                  <div className="text-zinc-800 text-6xl font-black uppercase italic">Selecciona una Sección</div>
                  <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">Para comenzar a cargar productos en la bóveda.</p>
                </div>
              )}
            </div>

          ) : activeTab === 'banners' ? (
            <div className="max-w-5xl mx-auto space-y-12 pb-20 animate-fade-in">
              <h4 className="text-3xl font-black italic uppercase text-white border-l-4 border-red-600 pl-6 tracking-tighter">Diseño & Banners (Modo URL)</h4>
              {/* Modal Flotante para Editar Banner */}
              {editingBanner && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
                  <div className="bg-zinc-950 p-6 md:p-8 rounded-[2.5rem] border border-red-600/50 space-y-6 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <h5 className="text-xl font-black uppercase text-red-600 italic">
                        Editar Banner: {editingBanner.data.name || 'Sin Nombre'}
                      </h5>
                      <button 
                        onClick={() => setEditingBanner(null)}
                        className="p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-900"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="text-[10px] font-black uppercase text-zinc-500 mb-1 block">Nombre / Marca</label>
                        <input 
                          value={editingBanner.data.name || ''} 
                          onChange={e => setEditingBanner({...editingBanner, data: {...editingBanner.data, name: e.target.value}})} 
                          className="w-full bg-black border border-white/10 p-4 rounded-xl text-xs font-bold text-white focus:border-red-500 focus:outline-none" 
                          placeholder="Nombre de Marca (Nike, Sets...)" 
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-black uppercase text-zinc-500 mb-1 block">Título Principal (Texto Blanco)</label>
                        <input 
                          value={editingBanner.data.bannerTitle || ''} 
                          onChange={e => setEditingBanner({...editingBanner, data: {...editingBanner.data, bannerTitle: e.target.value}})} 
                          className="w-full bg-black border border-white/10 p-4 rounded-xl text-xs font-black text-white focus:border-red-500 focus:outline-none" 
                          placeholder="Título Blanco" 
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-black uppercase text-zinc-500 mb-1 block">Subtítulo (Texto Gris / Badge)</label>
                        <input 
                          value={editingBanner.data.bannerSubtitle || ''} 
                          onChange={e => setEditingBanner({...editingBanner, data: {...editingBanner.data, bannerSubtitle: e.target.value}})} 
                          className="w-full bg-black border border-white/10 p-4 rounded-xl text-xs font-bold text-zinc-400 focus:border-red-500 focus:outline-none" 
                          placeholder="Subtítulo Gris" 
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-zinc-500 block">Formato Visual</label>
                        <div className="flex gap-2">
                          {(['horizontal', 'vertical', 'rectangular'] as BannerFormat[]).map(f => (
                            <button 
                              key={f}
                              type="button"
                              onClick={() => setEditingBanner({...editingBanner, data: {...editingBanner.data, format: f}})}
                              className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase transition-all ${
                                (editingBanner.data.format || 'horizontal') === f 
                                  ? 'bg-red-600 text-white shadow-lg shadow-red-900/50' 
                                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/5'
                              }`}
                            >
                              {f}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-zinc-500 block">Imagen del Banner</label>
                        <div className="flex items-center space-x-4">
                          <div className="flex-1 bg-black border border-white/10 p-4 rounded-xl text-[10px] font-bold text-zinc-400 italic truncate">
                            {editingBanner.data.marqueeImage || editingBanner.data.image ? "✅ Imagen asignada" : "Selecciona una imagen"}
                          </div>
                          <label className="cursor-pointer bg-red-600 hover:bg-red-500 p-4 rounded-xl transition-all shadow-lg active:scale-95 text-white">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'marqueeImage', 'banner')} accept="image/*" />
                          </label>
                        </div>
                      </div>

                      {(editingBanner.data.marqueeImage || editingBanner.data.image) && (
                        <div className="rounded-xl overflow-hidden border border-white/10 aspect-video bg-black">
                          <img 
                            src={editingBanner.data.marqueeImage || editingBanner.data.image} 
                            className="w-full h-full object-cover" 
                            alt="Preview" 
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-3 pt-2">
                      <button 
                        onClick={handleSaveEditBanner} 
                        disabled={isSaving} 
                        className="flex-1 bg-red-600 hover:bg-red-500 text-white py-4 rounded-xl font-black text-xs uppercase shadow-xl active:scale-95 transition-all"
                      >
                        {isSaving ? 'Guardando...' : 'Actualizar Banner'}
                      </button>
                      <button 
                        onClick={() => setEditingBanner(null)} 
                        className="px-6 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 py-4 rounded-xl font-black text-xs uppercase hover:text-white transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
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
                    {showAddBannerForm.section === section && (
                      <div className="bg-black p-8 rounded-[2rem] border border-red-600/30 animate-scale-in space-y-6 shadow-2xl">
                         <div className="grid grid-cols-1 gap-4">
                            <input value={newBannerData.name} onChange={e => setNewBannerData({...newBannerData, name: e.target.value})} className="bg-zinc-900 border border-white/5 p-4 rounded-xl text-xs font-bold" placeholder="Nombre (Nike...)" />
                            <input value={newBannerData.title} onChange={e => setNewBannerData({...newBannerData, title: e.target.value})} className="bg-zinc-900 border border-white/5 p-4 rounded-xl text-xs font-black text-white" placeholder="Título Blanco (Obligatorio)" />
                            <input value={newBannerData.subtitle} onChange={e => setNewBannerData({...newBannerData, subtitle: e.target.value})} className="bg-zinc-900 border border-white/5 p-4 rounded-xl text-xs font-bold text-zinc-500" placeholder="Subtítulo Gris (Opcional)" />
                            <div className="space-y-2">
                              <label className="text-[9px] font-black uppercase text-zinc-500 ml-2">Formato Visual</label>
                              <div className="flex gap-2">
                                {(['horizontal', 'vertical', 'rectangular'] as BannerFormat[]).map(f => (
                                  <button 
                                    key={f}
                                    onClick={() => setNewBannerData({...newBannerData, format: f})}
                                    className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase transition-all ${newBannerData.format === f ? 'bg-red-600 text-white shadow-lg' : 'bg-zinc-900 text-zinc-500 hover:text-white'}`}
                                  >
                                    {f}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <div className="flex-1 bg-zinc-900 border border-white/5 p-4 rounded-xl text-[10px] font-bold text-zinc-500 italic">
                                    {newBannerData.image ? "✅ Imagen lista" : "Subir imagen del banner"}
                                </div>
                                <label className="cursor-pointer bg-red-600 p-4 rounded-xl hover:bg-red-700 transition-all shadow-lg active:scale-95">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                    <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'image', 'banner')} accept="image/*" />
                                </label>
                            </div>
                            {newBannerData.image && <img src={newBannerData.image} className="aspect-video w-full object-cover rounded-xl shadow-2xl border border-white/10" />}
                         </div>
                         <div className="flex space-x-3">
                            <button onClick={handleSaveNewBanner} disabled={isSaving} className="flex-1 bg-red-600 text-white py-4 rounded-xl font-black text-[10px] uppercase shadow-xl hover:bg-red-700">Guardar Banner</button>
                            <button onClick={() => setShowAddBannerForm({section: null})} className="px-6 bg-zinc-800 text-zinc-500 py-4 rounded-xl font-black text-[10px] uppercase hover:text-white">Cancelar</button>
                         </div>
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                      {list.map((item: any, idx) => (
                        <div key={idx} className="bg-black/60 p-4 md:p-5 rounded-3xl border border-white/5 group relative hover:border-red-600/40 transition-all">
                          <div className="absolute top-4 right-4 flex space-x-2 z-20">
                            <button onClick={() => setEditingBanner({type: section === 'Calzado' ? 'tennis' : section === 'Medias' ? 'socks' : 'sportwear', data: item})} className="p-3 bg-blue-600/90 hover:bg-blue-600 text-white rounded-xl shadow-xl backdrop-blur-sm active:scale-95 transition-all"><svg className="w-5 h-5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.036 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeWidth="2.5"/></svg></button>
                            <button 
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleDeleteBanner(item.id || (item as any).uid);
                              }} 
                              className="p-3 bg-red-600/90 hover:bg-red-600 text-white rounded-xl shadow-xl backdrop-blur-sm active:scale-95 transition-all relative z-50 pointer-events-auto"
                            >
                              <svg className="w-5 h-5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2.5"/>
                              </svg>
                            </button>
                          </div>
                          <div className="aspect-video rounded-2xl overflow-hidden border border-white/5 mb-4 relative">
                            <img src={item.marqueeImage || item.image} className="w-full h-full object-cover" alt={item.name} />
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
          ) : activeTab === 'sections' ? (
            <div className="max-w-6xl mx-auto space-y-12 pb-20 animate-fade-in">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
                <div>
                  <h4 className="text-2xl font-black italic uppercase">Gestión de Secciones</h4>
                  <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mt-1">Controla las categorías dinámicas y sus rúbricas.</p>
                </div>
                <button 
                  onClick={() => setShowAddSectionForm(true)} 
                  className="px-8 py-4 bg-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-[0_10px_30px_rgba(220,38,38,0.3)] hover:brightness-110 active:scale-95 transition-all"
                >
                  + Nueva Sección
                </button>
              </div>

              {showAddSectionForm && (
                <div className="bg-zinc-900/50 p-8 rounded-[2.5rem] border border-white/10 space-y-6 animate-slide-up">
                  <div className="flex justify-between items-center mb-2">
                    <h5 className="text-sm font-black uppercase text-red-600 italic">{editingSection ? 'Editando Sección' : 'Nueva Sección'}</h5>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase text-zinc-500 ml-2">Emoji</label>
                      <input 
                        value={newSectionData.emoji} 
                        onChange={e => setNewSectionData({...newSectionData, emoji: e.target.value})} 
                        className="w-full bg-black border border-white/10 p-4 rounded-xl text-xl text-center" 
                      />
                    </div>
                    <div className="space-y-2 lg:col-span-2">
                      <label className="text-[9px] font-black uppercase text-zinc-500 ml-2">Nombre de Sección</label>
                      <input
                        placeholder="EJ: Calzado Pro"
                        value={newSectionData.name}
                        onChange={e => setNewSectionData({...newSectionData, name: e.target.value})}
                        className="w-full bg-black border border-white/10 p-4 rounded-xl text-xs font-bold"
                      />
                    </div>
                    <div className="space-y-2 lg:col-span-2">
                      <label className="text-[9px] font-black uppercase text-zinc-500 ml-2">Subtítulo (Opcional)</label>
                      <input
                        placeholder="EJ: INVENTARIO ELITE"
                        value={newSectionData.subtitle}
                        onChange={e => setNewSectionData({...newSectionData, subtitle: e.target.value})}
                        className="w-full bg-black border border-white/10 p-4 rounded-xl text-xs font-bold"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase text-zinc-500 ml-2">Fotos (1-6)</label>
                      <input 
                        type="number" min="1" max="6" 
                        value={newSectionData.photoCount} 
                        onChange={e => setNewSectionData({...newSectionData, photoCount: Number(e.target.value)})} 
                        className="w-full bg-black border border-white/10 p-4 rounded-xl text-xs font-bold" 
                      />
                    </div>
                    <div className="space-y-2 lg:col-span-2">
                      <label className="text-[9px] font-black uppercase text-zinc-500 ml-2">Tipo de Tallas</label>
                      <select 
                        value={newSectionData.sizeInputType} 
                        onChange={e => setNewSectionData({...newSectionData, sizeInputType: e.target.value as SizeInputType})} 
                        className="w-full bg-black border border-white/10 p-4 rounded-xl text-xs font-bold text-white"
                      >
                        <option value="numeric">Numérico (7, 8.5, 10...)</option>
                        <option value="clothing_letters">Letras (S, M, L, XL...)</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex space-x-4 pt-4">
                    <button 
                      onClick={handleSaveSection} 
                      className="flex-1 bg-white text-black py-4 rounded-xl font-black text-[10px] uppercase hover:bg-red-600 hover:text-white transition-all shadow-xl"
                    >
                      {editingSection ? 'Guardar Cambios' : 'Crear Sección'}
                    </button>
                    <button onClick={() => { setShowAddSectionForm(false); setEditingSection(null); setNewSectionData({ name: '', subtitle: '', emoji: '👟', photoCount: 6, sizeInputType: 'numeric' }); }} className="px-8 bg-zinc-800 text-zinc-500 py-4 rounded-xl font-black text-[10px] uppercase hover:text-white">Cancelar</button>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-4 max-w-4xl mx-auto">
                {sections.map((section, idx) => (
                  <div 
                    key={section.id} 
                    draggable 
                    onDragStart={(e) => e.dataTransfer.setData('text/plain', idx.toString())}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      const sourceIdx = parseInt(e.dataTransfer.getData('text/plain'));
                      onReorderSections(sourceIdx, idx);
                    }}
                    className="bg-black/40 p-6 rounded-[2.5rem] border border-white/5 group hover:border-red-600/30 transition-all relative overflow-hidden"
                  >
                    <div className="flex items-center space-x-5">
                      <div className="text-4xl bg-zinc-900 w-16 h-16 flex items-center justify-center rounded-2xl shadow-inner group-hover:scale-110 transition-transform">{section.emoji}</div>
                      <div className="flex-1">
                        <h5 className="font-black text-sm uppercase italic tracking-tighter">{section.name}</h5>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-[8px] font-black bg-zinc-800 px-2 py-0.5 rounded text-zinc-500 uppercase">{section.photoCount} FOTOS</span>
                          <span className="text-[8px] font-black bg-zinc-800 px-2 py-0.5 rounded text-zinc-500 uppercase">{section.sizeInputType === 'numeric' ? 'NUM' : 'ALF'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-6 right-6 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => {
                          setEditingSection(section);
                          setNewSectionData({ name: section.name, subtitle: section.subtitle || '', emoji: section.emoji, photoCount: section.photoCount, sizeInputType: section.sizeInputType });
                          setShowAddSectionForm(true);
                        }} 
                        className="p-2 text-zinc-500 hover:text-blue-500 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeWidth="2.5"/></svg>
                      </button>
                      <button onClick={() => onDeleteSection(section.id)} className="p-2 text-zinc-500 hover:text-red-500 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2" /></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          ) : activeTab === 'config' ? (
            <div className="max-w-5xl mx-auto space-y-12 pb-20 animate-fade-in">
              <h4 className="text-3xl font-black italic uppercase text-white border-l-4 border-red-600 pl-6 tracking-tighter">Ajustes del Sistema</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-zinc-900/30 p-10 rounded-[3rem] border border-white/5">
                <div className="space-y-6 text-center md:text-left">
                  <label className="text-[11px] font-[1000] text-zinc-500 uppercase tracking-[0.3em] block">Identidad Visual (Cloudinary)</label>
                  <div className="flex items-center space-x-4">
                    <input value={logo || ''} onChange={(e) => onUpdateLogo(e.target.value)} placeholder="URL del Logo..." className="flex-1 bg-black border border-white/10 p-5 rounded-2xl text-xs font-bold text-white" />
                    <label className="cursor-pointer bg-red-600 p-5 rounded-2xl hover:bg-red-700 transition-all shadow-lg active:scale-95">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'logo', 'logo')} accept="image/*" />
                    </label>
                  </div>
                  <div className="aspect-square w-48 bg-black rounded-[2.5rem] border border-white/10 flex items-center justify-center relative overflow-hidden group shadow-2xl mx-auto md:mx-0">
                    {logo ? <img src={logo} className="w-full h-full object-contain p-6" /> : <div className="text-red-600 font-black text-5xl italic">SP</div>}
                  </div>
                </div>
                <div className="space-y-6">
                  <label className="text-[11px] font-[1000] text-zinc-500 uppercase tracking-[0.3em] block">Soporte WhatsApp</label>
                  <textarea value={whatsappTemplate} onChange={(e) => onUpdateWhatsAppTemplate(e.target.value)} className="w-full bg-black border border-white/10 p-6 rounded-3xl text-xs font-bold h-44 resize-none" />
                  <button onClick={onClearBanners} className="w-full mt-2 py-4 bg-red-600/20 border border-red-500/30 text-red-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">
                    🗑️ Borrar Todos los Banners
                  </button>
                </div>
              </div>

              {/* Personalización Dinámica de Tema y Marca */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-zinc-900/30 p-10 rounded-[3rem] border border-white/5 mt-8">
                <div className="space-y-6">
                  <label className="text-[11px] font-[1000] text-zinc-500 uppercase tracking-[0.3em] block">Nombre de la Tienda</label>
                  <input 
                    type="text" 
                    value={storeName} 
                    onChange={(e) => onUpdateStoreName(e.target.value)} 
                    placeholder="Nombre de la Tienda..." 
                    className="w-full bg-black border border-white/10 p-5 rounded-2xl text-xs font-bold text-white animate-scale-in" 
                  />
                  <p className="text-[9px] text-zinc-500 uppercase tracking-widest">Fallback por defecto: SNEAKERS SPICY</p>
                </div>

                <div className="space-y-6">
                  <label className="text-[11px] font-[1000] text-zinc-500 uppercase tracking-[0.3em] block">Color de Acento Cromático</label>
                  <div className="flex items-center space-x-6">
                    <input 
                      type="color" 
                      value={primaryColor} 
                      onChange={(e) => onUpdatePrimaryColor(e.target.value)} 
                      className="w-16 h-16 bg-transparent border-0 cursor-pointer rounded-2xl overflow-hidden shrink-0 shadow-2xl" 
                    />
                    <div className="flex-1">
                      <div className="text-xs font-black text-white mb-1 uppercase tracking-wider">{primaryColor}</div>
                      <p className="text-[9px] text-zinc-500 uppercase tracking-widest">Tematiza botones, bordes y textos en tiempo real</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-zinc-500 tracking-wider">Colores Rápidos</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { name: 'Rojo Spicy', value: '#EF4444' },
                        { name: 'Azul', value: '#3B82F6' },
                        { name: 'Verde', value: '#10B981' },
                        { name: 'Violeta', value: '#8B5CF6' },
                        { name: 'Naranja', value: '#F97316' }
                      ].map((c) => (
                        <button
                          key={c.value}
                          onClick={() => onUpdatePrimaryColor(c.value)}
                          style={{ borderColor: c.value }}
                          className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase border transition-all hover:scale-105 active:scale-95 ${primaryColor.toLowerCase() === c.value.toLowerCase() ? 'bg-zinc-800 text-white shadow-lg' : 'bg-black text-zinc-500 hover:text-white'}`}
                        >
                          <span className="inline-block w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: c.value }} />
                          {c.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8 max-w-5xl mx-auto pb-20 animate-fade-in px-2 md:px-0">
               <h2 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter border-l-4 border-red-600 pl-4">Stock</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {products.map(p => (
                   <div key={p.id} className="bg-zinc-900/50 p-4 rounded-[2rem] flex flex-row items-center justify-between border border-white/5 group hover:border-white/10 transition-all relative overflow-x-auto no-scrollbar whitespace-nowrap snap-x">
                     <div className="flex items-center space-x-4 min-w-max pr-8 snap-start">
                       <div className="w-14 h-14 md:w-16 md:h-16 bg-black rounded-2xl border border-white/5 overflow-hidden shrink-0"> <img src={p.image} className="w-full h-full object-cover" alt={p.name} /> </div>
                       <div>
                         <p className="text-[10px] md:text-xs font-black uppercase text-white leading-tight block">{p.name}</p>
                         <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.1em]">RD${p.price.toLocaleString()}</p>
                       </div>
                     </div>
                     <div className="flex items-center space-x-2 shrink-0 ml-auto bg-zinc-900/80 backdrop-blur-md pl-4 py-1 rounded-2xl snap-end">
                       <button onClick={() => handleEditProductClick(p)} className="p-3 text-zinc-500 hover:text-blue-500 transition-colors active:scale-90 flex-shrink-0">
                         <svg className="w-6 h-6 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.036 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeWidth="2.5"/>
                         </svg>
                       </button>
                       <button onClick={() => onToggleStock(p.id)} className={`px-4 py-3 rounded-xl text-[9px] font-black uppercase transition-all active:scale-95 flex-shrink-0 ${p.isSoldOut ? 'bg-zinc-800 text-zinc-600' : 'bg-green-600/10 text-green-500 border border-green-500/20 shadow-lg'}`}>{p.isSoldOut ? 'SOLD' : 'READY'}</button>
                       <button onClick={() => onDeleteProduct(p.id)} className="p-3 text-zinc-500 hover:text-red-600 transition-colors active:scale-90 flex-shrink-0"><svg className="w-6 h-6 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2.5"/></svg></button>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeveloperMode;