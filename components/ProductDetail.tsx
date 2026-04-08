
import React, { useState } from 'react';
import { Product, ProductCondition } from '../types';

interface ProductDetailProps {
  logo?: string | null;
  whatsappTemplate?: string;
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, size: number | string) => void;
}

const CONDITION_LABELS: Record<ProductCondition, string> = {
  nuevo: 'Nuevo (DS) en Caja',
  nuevo_sin_caja: 'Nuevo sin Caja',
  como_nuevo: 'Como Nuevo (VNDS)',
  usados_baratos: 'Usado (Excelente Estado)'
};

const ProductDetail: React.FC<ProductDetailProps> = ({ logo, whatsappTemplate, product, onClose, onAddToCart }) => {
  const [activeImage, setActiveImage] = useState<string>(product.images?.front || product.image);
  const [selectedSize, setSelectedSize] = useState<number | string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const SELLER_PHONE = "18299745066"; 

  const galleryImages = product.images ? [
    { label: 'Frente', url: product.images.front },
    { label: 'Detrás', url: product.images.back },
    { label: 'Izquierda', url: product.images.left },
    { label: 'Derecha', url: product.images.right },
    { label: 'Arriba', url: product.images.top },
    { label: 'Abajo', url: product.images.bottom },
  ].filter(img => img.url) : [{ label: 'Frente', url: product.image }];

  const handleAddToCartAction = () => {
    if (!selectedSize) {
      alert("⚠️ Por favor, selecciona una talla antes de añadir a la bolsa.");
      return;
    }
    
    setIsAdding(true);
    setTimeout(() => {
      onAddToCart(product, selectedSize);
      setIsAdding(false);
      setIsAdded(true);
      
      setTimeout(() => {
        setIsAdded(false);
      }, 2000);
    }, 600);
  };

  const handleWhatsAppAction = () => {
    if (!selectedSize) {
      alert("⚠️ Por favor, selecciona una talla para confirmar disponibilidad por WhatsApp.");
      return;
    }

    const detailsStr = `ESTOY INTERESADO EN:\n` +
      `• ${product.name}\n` +
      `• Marca: ${product.brand}\n` +
      `• Talla: ${selectedSize}\n` +
      `• Precio: RD$${product.price}\n` +
      `• Referencia: ${product.image}`;

    const defaultTemplate = "¡Hola! Quiero confirmar el siguiente pedido:\n\n[DETALLES]\n\n• TOTAL FINAL: [TOTAL]\n\n¿Tienen disponibilidad para entrega hoy?";
    const template = whatsappTemplate || defaultTemplate;

    const finalMessage = template
      .replace("[DETALLES]", detailsStr)
      .replace("[TOTAL]", `RD$${product.price}`);

    const waUrl = `https://wa.me/${SELLER_PHONE}?text=${encodeURIComponent(finalMessage)}`;
    window.open(waUrl, '_blank');
  };

  const isSportwear = product.category.toLowerCase().includes('bermuda') || product.category.toLowerCase().includes('licra');

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-0 md:p-10 lg:p-16 animate-fade-in">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={onClose}></div>
      
      <div className="relative w-full h-full md:max-w-6xl md:h-auto lg:h-[85vh] bg-zinc-950 md:rounded-[3rem] border border-white/10 flex flex-col md:flex-row overflow-hidden shadow-[0_0_80px_rgba(220,38,38,0.2)]">
        
        <button onClick={onClose} className="absolute top-6 right-6 z-50 p-3 bg-black/60 hover:bg-red-600 text-white rounded-full transition-all border border-white/10 backdrop-blur-md group">
          <svg className="w-6 h-6 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="w-full md:w-1/2 h-[40vh] md:h-full bg-zinc-900/30 flex flex-col shrink-0 border-b md:border-b-0 md:border-r border-white/5">
          <div className="flex-1 p-8 flex items-center justify-center overflow-hidden">
            <img src={activeImage} className="max-w-full max-h-full object-contain transition-transform duration-700 hover:scale-110 drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)]" alt={product.name} />
          </div>
          <div className="h-24 p-4 bg-black/40 flex justify-center items-center space-x-3 overflow-x-auto no-scrollbar">
            {galleryImages.map((img, i) => (
              <button 
                key={i} 
                onClick={() => setActiveImage(img.url)} 
                className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${activeImage === img.url ? 'border-red-600 scale-110' : 'border-white/5 opacity-40 hover:opacity-100'}`}
              >
                <img src={img.url} className="w-full h-full object-cover" alt="" />
              </button>
            ))}
          </div>
        </div>

        <div className="w-full md:w-1/2 h-1/2 md:h-full overflow-y-auto p-8 md:p-14 lg:p-20 space-y-10 custom-scrollbar">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 bg-red-600 text-[10px] font-[1000] uppercase rounded italic tracking-widest">{product.brand}</span>
              <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest bg-zinc-900 px-3 py-1 rounded italic">ESTADO: {product.condition ? CONDITION_LABELS[product.condition].toUpperCase() : 'NUEVO'}</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black italic uppercase leading-[0.9] tracking-tighter text-white">{product.name}</h2>
            <p className="text-3xl font-black text-red-600 italic">RD${product.price}</p>
          </div>

          <div className="space-y-4 border-l-2 border-red-600/30 pl-6">
             <h4 className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.4em]">Reseña Técnica</h4>
             <p className="text-sm md:text-base text-zinc-400 leading-relaxed font-medium italic">"{product.description}"</p>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.4em]">Seleccionar Talla ({isSportwear ? 'Ropa' : 'US'})</h4>
            <div className="flex flex-wrap gap-3">
              {product.availableSizes.map(size => {
                const isSoldOut = product.isSoldOut || (product.soldOutSizes && product.soldOutSizes.map(String).includes(String(size)));
                return (
                  <button 
                    key={size}
                    disabled={isSoldOut}
                    onClick={() => { setSelectedSize(size); setIsAdded(false); }}
                    className={`min-w-[56px] h-14 px-4 flex items-center justify-center text-sm font-black border-2 rounded-2xl transition-all ${isSoldOut ? 'opacity-10 border-zinc-900 cursor-not-allowed line-through' : selectedSize === size ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-900/30 scale-105' : 'border-white/5 text-white hover:border-red-600 hover:text-red-500'}`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>

            <div className="pt-6 space-y-4">
              <button 
                onClick={handleAddToCartAction}
                disabled={isAdding || isAdded}
                className={`w-full py-6 rounded-2xl text-[12px] font-black uppercase tracking-[0.3em] shadow-xl active:scale-95 transition-all flex items-center justify-center space-x-3 ${isAdded ? 'bg-zinc-800 text-green-500 border border-green-500/30 opacity-80' : isAdding ? 'bg-zinc-900 text-zinc-500 cursor-wait' : 'bg-white text-black hover:bg-zinc-200'}`}
              >
                {isAdded ? (
                  <>
                    <svg className="w-5 h-5 animate-scale-in" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                    <span>Añadido</span>
                  </>
                ) : isAdding ? (
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                    <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  </div>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <span>Añadir a la Bolsa</span>
                  </>
                )}
              </button>

              <button 
                onClick={handleWhatsAppAction} 
                className="w-full bg-[#25D366] text-white py-6 rounded-2xl text-[12px] font-black uppercase tracking-[0.3em] active:scale-95 transition-all flex items-center justify-center space-x-3 shadow-lg shadow-green-900/20 hover:brightness-110"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
                <span>Pedir por WhatsApp</span>
              </button>
            </div>
          </div>

          <div className="pt-4 flex flex-col items-center space-y-1">
            <div className="h-6 mb-2">
              {logo ? (
                <img src={logo} alt="Logo Small" className="h-full object-contain grayscale opacity-30" />
              ) : (
                <p className="text-[9px] font-[1000] text-zinc-600 uppercase tracking-[0.4em]">🌶️ SNEAKERS SPICY | ELITE STORE</p>
              )}
            </div>
            <p className="text-[8px] font-bold text-red-500/50 uppercase tracking-[0.2em]">AUTENTICIDAD VERIFICADA</p>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes scale-in {
          0% { transform: scale(0); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in {
          animation: scale-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default ProductDetail;
