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
const CLOTHING_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

const DeveloperMode: React.FC<DeveloperModeProps> = ({ 
  logo, onUpdateLogo, whatsappTemplate, onUpdateWhatsAppTemplate, isOpen, onClose, products, categories, tennisBrands, socksBrands, isAuthorized, initialBrand, initialType, onLoginSuccess, onLogout, onAddProduct, onUpdateProduct, onDeleteProduct, onToggleStock, 
  onLoadTestData, onClearInventory,
  onAddTennisBrand, onDeleteTennisBrand, onUpdateTennisBrand,
  onAddSocksBrand, onDeleteSocksBrand, onUpdateSocksBrand,
  onAddCategory, onDeleteCategory, onUpdateCategory,
  onReorderTennis, onReorderSocks, onReorderCategory
}) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'add' | 'banners' | 'config'>('inventory');
  const [addType, setAddType] = useState<AddType>('shoes');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [sizesText, setSizesText] = useState(''); 
  const [selectedSportwearSizes, setSelectedSportwearSizes] = useState<string[]>([]);
  
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [draggedSection, setDraggedSection] = useState<string | null>(null);

  const [showAddBannerForm, setShowAddBannerForm] = useState<{section: string | null}>({section: null});
  const [newBannerData, setNewBannerData] = useState({ name: '', title: '', subtitle: '', image: '', brand: '' });

  const [newProduct, setNewProduct] = useState({
    name: '', brand: '', price: 0, description: '', category: 'Shoes', condition: 'nuevo' as ProductCondition, images: { front: '', back: '', left: '', right: '', top: '', bottom: '' }
  });

  const [isSaving, setIsSaving] = useState(false);

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

  const handleToggleSportwearSize = (size: string) => {
    setSelectedSportwearSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, key: keyof ProductImages) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setNewProduct(prev => ({ ...prev, images: { ...prev.images, [key]: ev.target?.result as string } }));
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProduct = async () => {
    let finalSizes: (string | number)[] = [];
    if (addType === 'shoes') finalSizes = sizesText.split(',').map(s => s.trim()).filter(s => s !== '');
    else if (addType === 'sportwear') finalSizes = selectedSportwearSizes;
    else finalSizes = ['Talla Única'];

    if (!newProduct.name || !newProduct.brand || !newProduct.price || !newProduct.images.front) return alert("⚠️ Faltan datos críticos.");
    
    setIsSaving(true);
    try {
      const product: Product = {
        id: `spicy-${Date.now()}`, name: newProduct.name, brand: newProduct.brand, price: newProduct.price, description: newProduct.description, category: addType === 'shoes' ? 'Shoes' : (addType === 'socks' ? 'Medias' : 'Sportwear'), availableSizes: finalSizes, image: newProduct.images.front, images: { ...newProduct.images }
      };
      await onAddProduct(product);
      alert("✅ Producto subido.");
      setActiveTab('inventory');
      setNewProduct({ name: '', brand: '', price: 0, description: '', category: 'Shoes', condition: 'nuevo', images: { front: '', back: '', left: '', right: '', top: '', bottom: '' }});
      setSizesText('');
      setSelectedSportwearSizes([]);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNewBanner = () => {
    if (!newBannerData.name || !newBannerData.image) return alert("⚠️ Nombre e imagen obligatorios.");
    if (showAddBannerForm.section === 'Calzado') onAddTennisBrand({ name: newBannerData.name, logo: newBannerData.name[0], availableSizes: [7, 8, 9, 10, 11, 12], marqueeImage: newBannerData.image, bannerTitle: newBannerData.title, bannerSubtitle: newBannerData.subtitle });
    else if (showAddBannerForm.section === 'Medias') onAddSocksBrand({ name: newBannerData.name, logo: newBannerData.name[0], availableSizes: [8, 9, 10], marqueeImage: newBannerData.image, bannerTitle: newBannerData.title, bannerSubtitle: newBannerData.subtitle });
    else if (showAddBannerForm.section === 'Sportwear') onAddCategory({ name: newBannerData.name, brand: newBannerData.brand || 'Nike', image: newBannerData.image, bannerTitle: newBannerData.title, bannerSubtitle: newBannerData.subtitle });
    setShowAddBannerForm({section: null}); setNewBannerData({name: '', title: '', subtitle: '', image: '', brand: ''});
  };

  const shoesInv = products.filter(p => p.category === 'Shoes');
  const clothesInv = products.filter(p => p.category === 'Sportwear');
  const socksInv = products.filter(p => p.category === 'Medias');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-0 md:p-10">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative w-full h-full md:max-w-6xl md:h-[95vh] bg-zinc-950 md:rounded-[3rem] border border-white/10 flex flex-col overflow-hidden shadow-2xl text-white">
        
        <div className="px-6 md:px-10 py-5 border-b border-white/5 bg-zinc-900/40 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-6">
            <h3 className="text-red-600 font-black italic text-xl md:text-2xl tracking-tighter">ADMIN_SPICY</h3>
            {isAuthorized && (
              <div className="flex bg-black p-1 rounded-xl border border-white/5">
                <button onClick={() => setActiveTab('inventory')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${activeTab === 'inventory' ? 'bg-red-600 text-white' : 'text-zinc-500'}`}>📦 Stock</button>
                <button onClick={() => setActiveTab('add')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${activeTab === 'add' ? 'bg-red-600 text-white' : 'text-zinc-500'}`}>➕ Nuevo</button>
                <button onClick={() => setActiveTab('banners')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${activeTab === 'banners' ? 'bg-red-600 text-white' : 'text-zinc-500'}`}>🖼️ Banners</button>
                <button onClick={() => setActiveTab('config')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${activeTab === 'config' ? 'bg-red-600 text-white' : 'text-zinc-500'}`}>⚙️ Ajustes</button>
              </div>
            )}
          </div>
          <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white transition-colors"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
          {!isAuthorized ? (
            <div className="max-w-sm mx-auto py-24 space-y-6 text-center">
               <div className="text-red-600 font-black text-6xl italic mb-10 text-glow">SP</div>
               <div className="space-y-4">
                  <input type="text" placeholder="USUARIO" className="w-full bg-zinc-900 border border-white/10 p-5 rounded-2xl text-xs font-bold text-white transition-all focus:border-red-600" onChange={e => setEmail(e.target.value)} value={email} />
                  <input type="password" placeholder="CONTRASEÑA" className="w-full bg-zinc-900 border border-white/10 p-5 rounded-2xl text-xs font-bold text-white transition-all focus:border-red-600" onChange={e => setPassword(e.target.value)} value={password} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
               </div>
               <button onClick={handleLogin} className="w-full bg-red-600 py-5 rounded-2xl font-black text-xs uppercase tracking-widest mt-6 active:scale-95 shadow-lg">ENTRAR</button>
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
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Modelo</label>
                      <input value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full bg-zinc-900 border border-white/10 p-4 rounded-xl text-xs font-bold" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Marca</label>
                      <input value={newProduct.brand} onChange={e => setNewProduct({...newProduct, brand: e.target.value})} className="w-full bg-zinc-900 border border-white/10 p-4 rounded-xl text-xs font-bold" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Reseña Técnica</label>
                    <textarea value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="w-full bg-zinc-900 border border-white/10 p-4 rounded-xl text-xs font-bold h-32 resize-none" />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[9px] font-black text-zinc-500 uppercase block italic tracking-widest">Tallas Disponibles</label>
                    {addType === 'shoes' ? (
                       <input placeholder="EJ: 7, 8.5, 9, 10, 11" className="w-full bg-zinc-900 border border-white/10 p-4 rounded-xl text-xs font-black text-red-500 uppercase" value={sizesText} onChange={e => setSizesText(e.target.value)} />
                    ) : addType === 'sportwear' ? (
                      <div className="flex flex-wrap gap-2">
                        {CLOTHING_SIZES.map(s => (
                          <button key={s} onClick={() => handleToggleSportwearSize(s)} className={`w-12 h-12 rounded-xl text-[10px] font-black border-2 transition-all ${selectedSportwearSizes.includes(s) ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-900/40' : 'bg-zinc-900 border-white/5 text-zinc-500'}`}>{s}</button>
                        ))}
                      </div>
                    ) : ( <p className="text-[10px] font-black uppercase text-red-600 italic">Talla Única Automática</p> )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Precio RD$</label>
                    <input type="number" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})} className="w-full bg-zinc-900 border border-white/10 p-4 rounded-xl text-xs font-black text-red-500" />
                  </div>
                  <button onClick={handleSaveProduct} disabled={isSaving} className="w-full bg-white text-black py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-xl disabled:opacity-50">
                    {isSaving ? "Guardando..." : "Publicar"}
                  </button>
                </div>
                <div className="space-y-6">
                  <h4 className="text-[10px] font-black uppercase text-red-600 italic tracking-widest border-l-2 border-red-600 pl-4">Fotos de la Pieza</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {(addType === 'shoes' ? ['front', 'back', 'left', 'right', 'top', 'bottom'] : ['front', 'back']).map((slot) => (
                      <div key={slot} className="space-y-1">
                        <label className="text-[8px] font-black text-zinc-600 uppercase block text-center italic">{slot.toUpperCase()}</label>
                        <div className="aspect-square bg-zinc-900 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-red-600/40">
                          {newProduct.images[slot as keyof ProductImages] ? ( <img src={newProduct.images[slot as keyof ProductImages]} className="w-full h-full object-cover" alt="" /> ) : ( <div className="absolute inset-0 flex items-center justify-center opacity-20"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth="2" strokeLinecap="round"/></svg></div> )}
                          <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, slot as keyof ProductImages)} className="absolute inset-0 opacity-0 cursor-pointer" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'banners' ? (
            <div className="max-w-5xl mx-auto space-y-12 pb-20 animate-fade-in">
              <h4 className="text-3xl font-black italic uppercase text-white border-l-4 border-red-600 pl-6 tracking-tighter">Diseño & Banners</h4>
              {['Calzado', 'Sportwear', 'Medias'].map((section) => {
                const list = section === 'Calzado' ? tennisBrands : section === 'Medias' ? socksBrands : categories;
                return (
                  <div key={section} className="space-y-8 bg-zinc-900/30 p-8 rounded-[3rem] border border-white/5">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xl font-black uppercase text-red-600 italic tracking-widest">{section}</h5>
                      <button onClick={() => setShowAddBannerForm({section})} className="px-6 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-red-600 hover:text-white transition-all active:scale-95 shadow-lg">+ Añadir {section}</button>
                    </div>
                    {showAddBannerForm.section === section && (
                      <div className="bg-black p-8 rounded-[2rem] border border-red-600/30 animate-scale-in space-y-6 shadow-2xl">
                         <div className="grid grid-cols-2 gap-4">
                            <input value={newBannerData.name} onChange={e => setNewBannerData({...newBannerData, name: e.target.value})} className="bg-zinc-900 border border-white/5 p-4 rounded-xl text-xs font-bold" placeholder="Nombre (Nike...)" />
                            <input value={newBannerData.title} onChange={e => setNewBannerData({...newBannerData, title: e.target.value})} className="bg-zinc-900 border border-white/5 p-4 rounded-xl text-xs font-black text-white" placeholder="Título Blanco" />
                            <input value={newBannerData.subtitle} onChange={e => setNewBannerData({...newBannerData, subtitle: e.target.value})} className="bg-zinc-900 border border-white/5 p-4 rounded-xl text-xs font-bold text-zinc-500" placeholder="Subtítulo Gris" />
                            <div className="relative aspect-video bg-zinc-900 rounded-xl overflow-hidden border border-white/5">
                               {newBannerData.image ? <img src={newBannerData.image} className="w-full h-full object-cover" /> : <span className="text-[9px] font-black text-zinc-600 absolute inset-0 flex items-center justify-center">SUBIR IMAGEN</span>}
                               <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => { const f = e.target.files?.[0]; if(f){ const r = new FileReader(); r.onload = (ev) => setNewBannerData({...newBannerData, image: ev.target?.result as string}); r.readAsDataURL(f); }}} />
                            </div>
                         </div>
                         <div className="flex space-x-3">
                            <button onClick={handleSaveNewBanner} className="flex-1 bg-red-600 text-white py-4 rounded-xl font-black text-[10px] uppercase shadow-xl hover:bg-red-700">Guardar Banner</button>
                            <button onClick={() => setShowAddBannerForm({section: null})} className="px-6 bg-zinc-800 text-zinc-500 py-4 rounded-xl font-black text-[10px] uppercase hover:text-white">Cancelar</button>
                         </div>
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {list.map((item: any, idx) => (
                        <div key={idx} className="bg-black/60 p-5 rounded-3xl border border-white/5 group relative hover:border-red-600/40 transition-all">
                          <button onClick={() => { if(confirm('¿Borrar?')) { if(section === 'Calzado') onDeleteTennisBrand(item.name); else if(section === 'Medias') onDeleteSocksBrand(item.name); else onDeleteCategory(item.name); } }} className="absolute top-4 right-4 p-2 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all z-10"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2.5"/></svg></button>
                          <div className="aspect-video rounded-2xl overflow-hidden border border-white/5 mb-4">
                            <img src={item.marqueeImage || item.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
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
                    {logo ? <img src={logo} className="w-full h-full object-contain p-6" alt="Logo" /> : <div className="text-red-600 font-black text-5xl italic">SP</div>}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"> <span className="text-[9px] font-black uppercase tracking-widest text-white border border-white/20 px-3 py-1 rounded-full">Cambiar</span> </div>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                </div>
                <div className="space-y-6">
                  <label className="text-[11px] font-[1000] text-zinc-500 uppercase tracking-[0.3em] block">Soporte WhatsApp</label>
                  <textarea value={whatsappTemplate} onChange={(e) => onUpdateWhatsAppTemplate(e.target.value)} className="w-full bg-black border border-white/10 p-6 rounded-3xl text-xs font-bold h-44 resize-none text-zinc-300 focus:border-red-600 transition-all shadow-inner" />
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
                       <button onClick={() => onToggleStock(p.id)} className={`px-4 py-3 rounded-xl text-[9px] font-black uppercase transition-all ${p.isSoldOut ? 'bg-zinc-800 text-zinc-600' : 'bg-green-600/10 text-green-500 border border-green-500/20 shadow-lg shadow-green-900/10'}`}>{p.isSoldOut ? 'SOLD OUT' : 'READY'}</button>
                       <button onClick={() => onDeleteProduct(p.id)} className="p-3 text-zinc-700 hover:text-red-600 transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
                     </div>
                   </div>
                 ))}
                 {products.length === 0 && <p className="text-zinc-500 font-black uppercase text-[10px] text-center col-span-2 py-20 italic tracking-widest">No hay stock disponible en el sistema</p>}
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeveloperMode;