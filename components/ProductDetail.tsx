import React, { useState, useEffect } from 'react';
import { Product, ProductCondition } from '../types';

interface ProductDetailProps {
  logo?: string | null;
  whatsappTemplate?: string;
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, size: number | string) => void;
}

const CONDITION_LABELS: Record<ProductCondition, string> = {
  nuevo: 'Nuevo (DS) en Caja Original',
  nuevo_sin_caja: 'Nuevo sin Caja',
  como_nuevo: 'Como Nuevo (VNDS)',
  usados_baratos: 'Usado (Excelente Estado)'
};

export const ProductDetail: React.FC<ProductDetailProps> = ({
  logo,
  whatsappTemplate,
  product,
  onClose,
  onAddToCart
}) => {
  const getFrontImage = () => {
    if (product.images) {
      if (Array.isArray(product.images)) {
        const first = product.images.find(url => typeof url === 'string' && url.trim() !== '');
        if (first) return first;
      } else if (typeof product.images === 'object') {
        if (product.images.front) return product.images.front;
      }
    }
    return product.image;
  };

  const [activeImage, setActiveImage] = useState<string>(() => getFrontImage());
  const [selectedSize, setSelectedSize] = useState<number | string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    setActiveImage(getFrontImage());
    if (product.availableSizes && product.availableSizes.length === 1) {
      const singleSize = product.availableSizes[0];
      const isSoldOut = product.isSoldOut || (product.soldOutSizes && product.soldOutSizes.map(String).includes(String(singleSize)));
      if (!isSoldOut) {
        setSelectedSize(singleSize);
      }
    } else {
      setSelectedSize(null);
    }
  }, [product]);

  const SELLER_PHONE = "18299745066"; 

  let galleryImages: { label: string; url: string }[] = [];
  if (product.images) {
    if (Array.isArray(product.images)) {
      galleryImages = product.images
        .filter((url): url is string => typeof url === 'string' && url.trim() !== '')
        .map((url, idx) => ({
          label: `Ángulo ${idx + 1}`,
          url: url
        }));
    } else if (typeof product.images === 'object') {
      const slots = [
        { label: 'Frente', url: product.images.front },
        { label: 'Detrás', url: product.images.back },
        { label: 'Izquierda', url: product.images.left },
        { label: 'Derecha', url: product.images.right },
        { label: 'Arriba', url: product.images.top },
        { label: 'Abajo', url: product.images.bottom },
      ];
      galleryImages = slots.filter(img => typeof img.url === 'string' && img.url.trim() !== '') as { label: string; url: string }[];
    } else if (typeof product.images === 'string' && (product.images as string).trim() !== '') {
      galleryImages = [{ label: 'Frente', url: product.images }];
    }
  }

  if (galleryImages.length === 0 && product.image) {
    galleryImages = [{ label: 'Frente', url: product.image }];
  }

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
    }, 400);
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
      `• Precio: RD$${Number(product.price).toLocaleString()}\n` +
      `• Referencia: ${product.image}`;

    const defaultTemplate = "¡Hola! Quiero confirmar el siguiente pedido:\n\n[DETALLES]\n\n• TOTAL FINAL: [TOTAL]\n\n¿Tienen disponibilidad para entrega hoy?";
    const template = whatsappTemplate || defaultTemplate;

    const finalMessage = template
      .replace("[DETALLES]", detailsStr)
      .replace("[TOTAL]", `RD$${Number(product.price).toLocaleString()}`);

    const waUrl = `https://wa.me/${SELLER_PHONE}?text=${encodeURIComponent(finalMessage)}`;
    window.open(waUrl, '_blank');
  };

  const isSportwear = product.category?.toLowerCase().includes('bermuda') || 
                      product.category?.toLowerCase().includes('licra') || 
                      product.category?.toLowerCase().includes('sportwear') || 
                      product.category?.toLowerCase().includes('ropa');

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-4 md:p-8 animate-fade-in">
      {/* Dark backdrop */}
      <div 
        className="absolute inset-0 bg-black/85 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      />
      
      {/* Dark Luxury Modal Container */}
      <div className="relative w-full max-w-5xl bg-[#0C0C0E] rounded-2xl md:rounded-3xl border border-white/10 flex flex-col md:flex-row overflow-hidden shadow-[0_0_80px_rgba(239,68,68,0.2)] max-h-[92vh] z-10">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          aria-label="Cerrar modal"
          className="absolute top-4 right-4 z-20 p-2.5 bg-zinc-900/80 hover:bg-red-600 text-zinc-400 hover:text-white rounded-full transition-all active:scale-95 border border-white/10 backdrop-blur-md shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Left Column: Image Gallery */}
        <div className="w-full md:w-1/2 bg-black/80 flex flex-col shrink-0 border-b md:border-b-0 md:border-r border-white/10 p-4 sm:p-8 justify-between">
          <div className="flex-1 flex items-center justify-center min-h-[220px] sm:min-h-[300px] overflow-hidden py-4">
            <img 
              src={activeImage} 
              crossOrigin="anonymous"
              loading="eager"
              className="max-h-[280px] sm:max-h-[360px] max-w-full object-contain filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.9)] transition-transform duration-500 hover:scale-110" 
              alt={product.name} 
            />
          </div>

          {/* Thumbnails */}
          {galleryImages.length > 1 && (
            <div className="flex items-center justify-center space-x-2 pt-4 overflow-x-auto no-scrollbar">
              {galleryImages.map((img, i) => (
                <button 
                  key={i} 
                  onClick={() => setActiveImage(img.url)} 
                  className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all p-1 bg-zinc-900 shrink-0 ${
                    activeImage === img.url 
                      ? 'border-red-600 shadow-lg shadow-red-900/40 scale-105' 
                      : 'border-white/10 hover:border-white/30 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} crossOrigin="anonymous" className="w-full h-full object-contain" alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Details & Actions */}
        <div className="w-full md:w-1/2 overflow-y-auto p-6 sm:p-8 md:p-10 space-y-6">
          
          {/* Header Info */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-red-600 text-white text-[10px] font-black uppercase rounded italic tracking-widest shadow-md">
                {product.brand}
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-zinc-900 text-zinc-400 text-[10px] font-black uppercase rounded italic tracking-widest border border-white/5">
                <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Auténtico 100%</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-[1000] italic uppercase tracking-tighter text-white leading-none">
              {product.name}
            </h1>

            <div className="pt-2">
              <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest block">Lowest Ask</span>
              <div className="text-3xl sm:text-4xl font-black italic text-red-600 tracking-tight">
                RD${Number(product.price).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Condition Info */}
          <div className="p-3.5 bg-zinc-900/70 rounded-xl border border-white/5 flex items-center justify-between text-xs">
            <span className="font-bold uppercase tracking-wider text-zinc-500 text-[10px]">Condición:</span>
            <span className="font-black italic uppercase text-white">
              {product.condition ? CONDITION_LABELS[product.condition] : 'Nuevo en Caja Original'}
            </span>
          </div>

          {/* Size Matrix */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest text-zinc-400">
                Seleccionar Talla ({isSportwear ? 'Ropa' : 'US'})
              </span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {product.availableSizes.map(size => {
                const isSizeSoldOut = product.isSoldOut || (product.soldOutSizes && product.soldOutSizes.map(String).includes(String(size))) || (product.stock ?? 1) === 0;
                const isSelected = selectedSize === size;

                return (
                  <button 
                    key={size}
                    disabled={isSizeSoldOut}
                    onClick={() => { setSelectedSize(size); setIsAdded(false); }}
                    className={`py-3 px-2 rounded-xl text-xs sm:text-sm font-black italic border transition-all flex flex-col items-center justify-center ${
                      isSizeSoldOut 
                        ? 'opacity-20 bg-zinc-900 border-white/5 cursor-not-allowed line-through text-zinc-600' 
                        : isSelected 
                          ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-900/40 scale-105' 
                          : 'bg-zinc-900/80 border-white/10 text-white hover:border-red-600 hover:text-red-500'
                    }`}
                  >
                    <span>{size}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions: Add to Bag & WhatsApp Order */}
          <div className="space-y-3 pt-2">
            <button 
              onClick={handleAddToCartAction}
              disabled={isAdding || isAdded}
              className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center space-x-2 shadow-xl ${
                isAdded 
                  ? 'bg-emerald-600 text-white shadow-emerald-900/30' 
                  : isAdding 
                    ? 'bg-zinc-800 text-white cursor-wait' 
                    : 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/40 active:scale-[0.98]'
              }`}
            >
              {isAdded ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>¡Añadido a la Bolsa!</span>
                </>
              ) : isAdding ? (
                <span>Añadiendo...</span>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <span>Añadir a la Bolsa</span>
                </>
              )}
            </button>

            <button 
              onClick={handleWhatsAppAction} 
              className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white py-3.5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center space-x-2 shadow-lg shadow-green-900/30 active:scale-[0.98]"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
              <span>Consultar por WhatsApp</span>
            </button>
          </div>

          {/* Description */}
          {product.description && (
            <div className="pt-3 border-t border-white/10">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-1.5">
                Reseña Técnica
              </h4>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed italic">
                "{product.description}"
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
