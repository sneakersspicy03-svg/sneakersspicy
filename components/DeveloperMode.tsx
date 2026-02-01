
import React, { useState, useEffect } from 'react';
import { Product, ProductImages, SportwearCategory, ProductCondition, BrandStock } from '../types';

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
  onAddProduct: (p: Product) => void;
  onUpdateProduct: (p: Product) => void;
  onDeleteProduct: (id: string) => void;
  onToggleStock: (id: string, s?: number | string) => void;
  
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

  const [newProduct, setNewProduct] = useState({
    name: '',
    brand: '',
    price: 0,
    description: '',
    category: 'Shoes',
    condition: 'nuevo' as ProductCondition,
    images: { front: '', back: '', left: '', right: '', top: '', bottom: '' }
  });

  useEffect(() => {
    if (isOpen) {
      if (initialBrand || initialType) {
        const type = initialType || 'shoes';
        setAddType(type);
        setNewProduct(prev => ({ 
          ...prev, 
          brand: initialBrand || '',
          category: type === 'shoes' ? 'Shoes' : (type === 'socks' ? 'Medias' : 'Sportwear')
        }));
        setActiveTab('add');
        setSizesText('');
        setSelectedSportwearSizes([]);
      }
    }
  }, [isOpen, initialBrand, initialType]);

  const handleLogin = () => {
    const inputEmail = email.trim().toLowerCase();
    const inputPass = password.trim();
    if (inputEmail === 'admin@spicy.com' && inputPass === 'spicy2025') {
      onLoginSuccess();
    } else {
      alert('⚠️ Error: Credenciales incorrectas.');
    }
  };

  const handleToggleSportwearSize = (size: string) => {
    setSelectedSportwearSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, key: keyof ProductImages) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setNewProduct(prev => ({
          ...prev,
          images: { ...prev.images, [key]: ev.target?.result as string }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        onUpdateLogo(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProduct = () => {
    let finalSizes: (string | number)[] = [];
    if (addType === 'shoes') {
      finalSizes = sizesText.split(',').map(s => s.trim()).filter(s => s !== '');
    } else if (addType === 'sportwear') {
      finalSizes = selectedSportwearSizes;
    } else {
      finalSizes = ['Talla Única'];
    }

    if (!newProduct.name || !newProduct.brand || !newProduct.price || !newProduct.images.front) {
      alert("⚠️ Faltan datos críticos (Nombre, Marca, Precio o Foto Frontal).");
      return;
    }
    if (finalSizes.length === 0) {
      alert("⚠️ Debes asignar las tallas.");
      return;
    }

    const product: Product = {
      id: `spicy-${Date.now()}`,
      name: newProduct.name,
      brand: newProduct.brand,
      price: newProduct.price,
      description: newProduct.description,
      category: addType === 'shoes' ? 'Shoes' : (addType === 'socks' ? 'Medias' : 'Sportwear'),
      availableSizes: finalSizes,
      image: newProduct.images.front,
      images: { ...newProduct.images }
    };

    onAddProduct(product);
    alert("✅ Producto subido satisfactoriamente.");
    setActiveTab('inventory');
    setNewProduct({ name: '', brand: '', price: 0, description: '', category: 'Shoes', condition: 'nuevo', images: { front: '', back: '', left: '', right: '', top: '', bottom: '' }});
    setSizesText('');
    setSelectedSportwearSizes([]);
  };

  const shoesInv = products.filter(p => p.category === 'Shoes');
  const clothesInv = products.filter(p => p.category === 'Sportwear' || p.category.includes('Bermuda') || p.category.includes('Licra'));
  const socksInv = products.filter(p => p.category === 'Medias');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-0 md:p-10">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative w-full h-full md:max-w-6xl md:h-[90vh] bg-zinc-950 md:rounded-[3rem] border border-white/10 flex flex-col overflow-hidden shadow-2xl text-white">
        
        <div className="px-6 md:px-10 py-5 border-b border-white/5 bg-zinc-900/40 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-6 md:space-x-10">
            <h3 className="text-red-600 font-black italic text-xl md:text-2xl tracking-tighter">ADMIN_SPICY</h3>
            {isAuthorized && (
              <div className="flex bg-black p-1 rounded-xl border border-white/5 overflow-x-auto no-scrollbar">
                <button onClick={() => setActiveTab('inventory')} className={`px-3 md:px-4 py-2 rounded-lg text-[8px] md:text-[9px] font-black uppercase transition-all whitespace-nowrap ${activeTab === 'inventory' ? 'bg-red-600 text-white' : 'text-zinc-500 hover:text-white'}`}>📦 Inventario</button>
                <button onClick={() => setActiveTab('add')} className={`px-3 md:px-4 py-2 rounded-lg text-[8px] md:text-[9px] font-black uppercase transition-all whitespace-nowrap ${activeTab === 'add' ? 'bg-red-600 text-white' : 'text-zinc-500 hover:text-white'}`}>➕ Añadir</button>
                <button onClick={() => setActiveTab('banners')} className={`px-3 md:px-4 py-2 rounded-lg text-[8px] md:text-[9px] font-black uppercase transition-all whitespace-nowrap ${activeTab === 'banners' ? 'bg-red-600 text-white' : 'text-zinc-500 hover:text-white'}`}>🖼️ Banners</button>
                <button onClick={() => setActiveTab('config')} className={`px-3 md:px-4 py-2 rounded-lg text-[8px] md:text-[9px] font-black uppercase transition-all whitespace-nowrap ${activeTab === 'config' ? 'bg-red-600 text-white' : 'text-zinc-500 hover:text-white'}`}>⚙️ Ajustes</button>
              </div>
            )}
          </div>
          <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white transition-colors"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
          {!isAuthorized ? (
            <div className="max-w-sm mx-auto py-24 space-y-6 text-center">
               <div className="text-red-600 font-black text-6xl italic mb-10">SP</div>
               <div className="space-y-4">
                  <input type="text" placeholder="USUARIO" className="w-full bg-zinc-900 border border-white/10 p-5 rounded-2xl text-xs font-bold uppercase tracking-widest text-white transition-all focus:border-red-600" onChange={e => setEmail(e.target.value)} value={email} />
                  <input type="password" placeholder="CONTRASEÑA" className="w-full bg-zinc-900 border border-white/10 p-5 rounded-2xl text-xs font-bold uppercase tracking-widest text-white transition-all focus:border-red-600" onChange={e => setPassword(e.target.value)} value={password} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
               </div>
               <button onClick={handleLogin} className="w-full bg-red-600 py-5 rounded-2xl font-black text-xs uppercase tracking-widest mt-6 active:scale-95 transition-all shadow-lg">ENTRAR AL SISTEMA</button>
            </div>
          ) : activeTab === 'add' ? (
            <div className="max-w-6xl mx-auto space-y-12 pb-20">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
                <h4 className="text-2xl font-black italic uppercase">Nueva Rúbrica de Producto</h4>
                <div className="flex space-x-2 bg-black p-1 rounded-2xl border border-white/5">
                  <button onClick={() => { setAddType('shoes'); setNewProduct(prev => ({...prev, category: 'Shoes'})); }} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${addType === 'shoes' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}>👟 Calzado</button>
                  <button onClick={() => { setAddType('sportwear'); setNewProduct(prev => ({...prev, category: 'Sportwear'})); }} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${addType === 'sportwear' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}>🎽 Sportwear</button>
                  <button onClick={() => { setAddType('socks'); setNewProduct(prev => ({...prev, category: 'Medias'})); }} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${addType === 'socks' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}>🧦 Medias</button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 animate-fade-in">
                <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Nombre del Modelo</label>
                      <input value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full bg-zinc-900 border border-white/10 p-4 rounded-xl text-xs font-bold" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Marca</label>
                      <input value={newProduct.brand} onChange={e => setNewProduct({...newProduct, brand: e.target.value})} className="w-full bg-zinc-900 border border-white/10 p-4 rounded-xl text-xs font-bold" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Descripción / Reseña Técnica</label>
                    <textarea value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="w-full bg-zinc-900 border border-white/10 p-4 rounded-xl text-xs font-bold h-32 resize-none" placeholder="Describe la pieza (materiales, tecnología, etc)..." />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[9px] font-black text-zinc-500 uppercase block italic tracking-widest">Tallas Disponibles</label>
                    {addType === 'shoes' ? (
                      <div className="space-y-2">
                         <input placeholder="TALLAS US (EJ: 7, 8.5, 9, 10, 11)" className="w-full bg-zinc-900 border border-white/10 p-4 rounded-xl text-xs font-black text-red-500 uppercase" value={sizesText} onChange={e => setSizesText(e.target.value)} />
                         <p className="text-[8px] text-zinc-600 font-bold italic uppercase tracking-widest">Escritura libre. Separa con comas.</p>
                      </div>
                    ) : addType === 'sportwear' ? (
                      <div className="flex flex-wrap gap-2">
                        {CLOTHING_SIZES.map(s => (
                          <button key={s} onClick={() => handleToggleSportwearSize(s)} className={`w-12 h-12 rounded-xl text-[10px] font-black border-2 transition-all ${selectedSportwearSizes.includes(s) ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-900/40' : 'bg-zinc-900 border-white/5 text-zinc-500'}`}>{s}</button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-5 bg-red-600/10 border border-red-600/20 rounded-2xl text-center">
                        <p className="text-[10px] font-black uppercase text-red-600 italic tracking-widest">Talla Única (Asignación Automática)</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Precio RD$</label>
                    <input type="number" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})} className="w-full bg-zinc-900 border border-white/10 p-4 rounded-xl text-xs font-black text-red-500" />
                  </div>

                  <button onClick={handleSaveProduct} className="w-full bg-white text-black py-5 rounded-2xl font-[1000] text-[11px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-xl">Publicar Globalmente</button>
                </div>

                <div className="space-y-6">
                  <h4 className="text-[10px] font-black uppercase text-red-600 italic tracking-widest border-l-2 border-red-600 pl-4">Fotos de la Pieza</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {(addType === 'shoes' ? ['front', 'back', 'left', 'right', 'top', 'bottom'] : ['front', 'back']).map((slot) => (
                      <div key={slot} className="space-y-1">
                        <label className="text-[8px] font-black text-zinc-600 uppercase block text-center italic">{slot === 'front' ? 'ALANTE' : slot === 'back' ? 'ATRÁS' : slot.toUpperCase()}</label>
                        <div className="aspect-square bg-zinc-900 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-red-600/40 transition-all">
                          {newProduct.images[slot as keyof ProductImages] ? (
                            <img src={newProduct.images[slot as keyof ProductImages]} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center opacity-20"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth="2" strokeLinecap="round"/></svg></div>
                          )}
                          <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, slot as keyof ProductImages)} className="absolute inset-0 opacity-0 cursor-pointer" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'banners' ? (
            <div className="space-y-24 pb-20 max-w-6xl mx-auto">
              {['Calzado', 'Sportwear', 'Medias'].map((section) => {
                const list = section === 'Calzado' ? tennisBrands : section === 'Medias' ? socksBrands : categories;
                return (
                  <div key={section} className="space-y-10">
                    <h3 className="text-3xl font-black italic uppercase text-white border-l-4 border-red-600 pl-6">Banners {section}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      {list.map((item: any, idx) => (
                        <div key={idx} className="bg-zinc-900/40 p-8 rounded-[2.5rem] border border-white/5 group shadow-2xl">
                          <div className="space-y-4 mb-8">
                             <div className="space-y-1">
                               <label className="text-[8px] font-black text-white uppercase italic tracking-widest">Título (Letras Blancas)</label>
                               <input value={item.bannerTitle || ''} onChange={(e) => { const val = e.target.value; if(section === 'Calzado') onUpdateTennisBrand({...item, bannerTitle: val}); else if(section === 'Medias') onUpdateSocksBrand({...item, bannerTitle: val}); else onUpdateCategory({...item, bannerTitle: val}); }} className="w-full bg-black border border-white/10 p-4 rounded-xl text-xs font-black text-white uppercase tracking-tighter" />
                             </div>
                             <div className="space-y-1">
                               <label className="text-[8px] font-black text-zinc-500 uppercase italic tracking-widest">Subtítulo (Letras Grises)</label>
                               <input value={item.bannerSubtitle || ''} onChange={(e) => { const val = e.target.value; if(section === 'Calzado') onUpdateTennisBrand({...item, bannerSubtitle: val}); else if(section === 'Medias') onUpdateSocksBrand({...item, bannerSubtitle: val}); else onUpdateCategory({...item, bannerSubtitle: val}); }} className="w-full bg-black border border-white/10 p-4 rounded-xl text-xs font-black text-zinc-500 uppercase tracking-tighter" />
                             </div>
                          </div>
                          <div className="aspect-video bg-black rounded-3xl overflow-hidden relative border border-white/5">
                            <img src={item.marqueeImage || item.image} className="w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-110" alt="" />
                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => { const file = e.target.files?.[0]; if(file) { const r = new FileReader(); r.onload = (ev) => { const url = ev.target?.result as string; if(section === 'Calzado') onUpdateTennisBrand({...item, marqueeImage: url}); else if(section === 'Medias') onUpdateSocksBrand({...item, marqueeImage: url}); else onUpdateCategory({...item, image: url}); }; r.readAsDataURL(file); } }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : activeTab === 'config' ? (
            <div className="max-w-4xl mx-auto space-y-16 pb-20">
               <div className="space-y-8">
                 <h4 className="text-3xl font-black italic uppercase text-white border-l-4 border-red-600 pl-6">Configuración General</h4>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                   <div className="space-y-6">
                     <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">Logo de la Tienda (SP)</label>
                     <div className="aspect-square w-48 bg-zinc-900 rounded-[2.5rem] border border-white/10 flex items-center justify-center relative overflow-hidden group shadow-2xl">
                        {logo ? <img src={logo} className="w-full h-full object-contain p-6" alt="Store Logo" /> : <div className="text-red-600 font-black text-5xl italic">SP</div>}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-[9px] font-black uppercase tracking-widest">Cambiar Logo</span>
                        </div>
                        <input type="file" accept="image/*" onChange={handleLogoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                     </div>
                     <button onClick={() => onUpdateLogo(null)} className="text-[8px] font-black text-red-600 uppercase tracking-[0.3em] hover:text-white transition-colors">Restablecer a SP Original</button>
                   </div>

                   <div className="space-y-6">
                     <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block italic">Plantilla de WhatsApp</label>
                     <textarea 
                        value={whatsappTemplate} 
                        onChange={(e) => onUpdateWhatsAppTemplate(e.target.value)}
                        className="w-full bg-zinc-900 border border-white/10 p-6 rounded-3xl text-xs font-bold h-48 resize-none text-zinc-300 focus:border-red-600 transition-all shadow-inner"
                        placeholder="[DETALLES] será reemplazado por los productos y [TOTAL] por el precio total."
                     />
                     <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                       <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest italic leading-relaxed">
                         Variables soportadas:<br/>
                         <span className="text-red-600">[DETALLES]</span> - Lista de productos y tallas.<br/>
                         <span className="text-red-600">[TOTAL]</span> - Precio final calculado.
                       </p>
                     </div>
                   </div>
                 </div>
               </div>
            </div>
          ) : (
            <div className="space-y-20 max-w-5xl mx-auto pb-20">
               <div className="space-y-6">
                 <h2 className="text-3xl font-black italic uppercase tracking-tighter border-l-4 border-red-600 pl-4">Inventario Calzado</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {shoesInv.map(p => (
                     <div key={p.id} className="bg-zinc-900/50 p-4 rounded-2xl flex items-center justify-between border border-white/5">
                       <div className="flex items-center space-x-4">
                         <img src={p.image} className="w-14 h-14 object-cover rounded-xl border border-white/10" alt="" />
                         <div>
                           <p className="text-[10px] font-black uppercase text-white leading-tight">{p.name}</p>
                           <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">{p.brand} ● RD${p.price}</p>
                         </div>
                       </div>
                       <div className="flex items-center space-x-2">
                         <button onClick={() => onToggleStock(p.id)} className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase transition-all ${p.isSoldOut ? 'bg-zinc-800 text-zinc-600' : 'bg-green-600/10 text-green-500 border border-green-500/20'}`}>{p.isSoldOut ? 'Agotado' : 'Disponible'}</button>
                         <button onClick={() => onDeleteProduct(p.id)} className="p-2 text-zinc-700 hover:text-red-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>

               <div className="space-y-6">
                 <h2 className="text-3xl font-black italic uppercase tracking-tighter border-l-4 border-white/20 pl-4">Inventario Sportwear</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {clothesInv.map(p => (
                     <div key={p.id} className="bg-zinc-900/50 p-4 rounded-2xl flex items-center justify-between border border-white/5">
                       <div className="flex items-center space-x-4">
                         <img src={p.image} className="w-14 h-14 object-cover rounded-xl border border-white/10" alt="" />
                         <div>
                           <p className="text-[10px] font-black uppercase text-white leading-tight">{p.name}</p>
                           <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">{p.brand} ● RD${p.price}</p>
                         </div>
                       </div>
                       <div className="flex items-center space-x-2">
                         <button onClick={() => onToggleStock(p.id)} className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase transition-all ${p.isSoldOut ? 'bg-zinc-800 text-zinc-600' : 'bg-green-600/10 text-green-500 border border-green-500/20'}`}>{p.isSoldOut ? 'Agotado' : 'Disponible'}</button>
                         <button onClick={() => onDeleteProduct(p.id)} className="p-2 text-zinc-700 hover:text-red-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>

               <div className="space-y-6">
                 <h2 className="text-3xl font-black italic uppercase tracking-tighter border-l-4 border-white/20 pl-4">Inventario Medias</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {socksInv.map(p => (
                     <div key={p.id} className="bg-zinc-900/50 p-4 rounded-2xl flex items-center justify-between border border-white/5">
                       <div className="flex items-center space-x-4">
                         <img src={p.image} className="w-14 h-14 object-cover rounded-xl border border-white/10" alt="" />
                         <div>
                           <p className="text-[10px] font-black uppercase text-white leading-tight">{p.name}</p>
                           <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">{p.brand} ● RD${p.price}</p>
                         </div>
                       </div>
                       <div className="flex items-center space-x-2">
                         <button onClick={() => onToggleStock(p.id)} className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase transition-all ${p.isSoldOut ? 'bg-zinc-800 text-zinc-600' : 'bg-green-600/10 text-green-500 border border-green-500/20'}`}>{p.isSoldOut ? 'Agotado' : 'Disponible'}</button>
                         <button onClick={() => onDeleteProduct(p.id)} className="p-2 text-zinc-700 hover:text-red-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeveloperMode;
