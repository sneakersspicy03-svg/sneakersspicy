import React from 'react';
import { CartItem, Product } from '../types';

interface CartProps {
  logo?: string | null;
  whatsappTemplate?: string;
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  allProducts: Product[];
  onRemove: (id: string, size: number | string) => void;
  onUpdateQuantity: (id: string, size: number | string, delta: number) => void;
  onClearCart: () => void;
}

export const Cart: React.FC<CartProps> = ({ 
  logo, 
  whatsappTemplate, 
  isOpen, 
  onClose, 
  items, 
  allProducts, 
  onRemove, 
  onUpdateQuantity, 
  onClearCart 
}) => {
  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const SELLER_PHONE = "18299745066"; 

  const handleCheckout = () => {
    if (items.length === 0) return;

    // Live validation
    const invalidItems = items.filter(item => {
      const liveProduct = allProducts.find(p => p.id === item.id);
      if (!liveProduct) return true;
      return liveProduct.isSoldOut || (liveProduct.stock ?? 1) === 0;
    });

    if (invalidItems.length > 0) {
      alert(`⚠️ ¡ATENCIÓN! Tienes ${invalidItems.length} producto(s) no disponibles o agotados en tu bolsa.\n\nDebes eliminarlos para poder proceder con el pedido por WhatsApp.`);
      return;
    }

    let detailsStr = "";
    items.forEach((item, index) => {
      detailsStr += `\n📦 PIEZA #${index + 1}:\n`;
      detailsStr += `• Nombre: ${item.name}\n`;
      detailsStr += `• Marca: ${item.brand}\n`;
      detailsStr += `• Talla: ${item.selectedSize}\n`;
      detailsStr += `• Cantidad: ${item.quantity}\n`;
      detailsStr += `• Subtotal: RD$${Number(item.price * item.quantity).toLocaleString()}\n`;
    });

    const defaultTemplate = "¡Hola! Quiero confirmar el siguiente pedido:\n\n[DETALLES]\n\n• TOTAL FINAL: [TOTAL]\n\n¿Tienen disponibilidad para entrega hoy?";
    const template = whatsappTemplate || defaultTemplate;
    
    const finalMessage = template
      .replace("[DETALLES]", detailsStr)
      .replace("[TOTAL]", `RD$${Number(total).toLocaleString()}`);

    const encodedMessage = encodeURIComponent(finalMessage);
    window.open(`https://wa.me/${SELLER_PHONE}?text=${encodedMessage}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end animate-fade-in">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-[#08080A] h-[100dvh] shadow-2xl flex flex-col border-l border-white/10 z-10 text-white overflow-hidden">
        
        {/* Cart Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-black/80 backdrop-blur-md shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center font-black text-white italic text-sm shadow-md">
              SP
            </div>
            <h3 className="text-lg sm:text-xl font-[1000] italic uppercase tracking-tight text-white">
              Bolsa Spicy <span className="text-red-500 ml-1">[{items.length}]</span>
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            {items.length > 0 && (
              <button 
                onClick={onClearCart} 
                className="text-xs font-black uppercase tracking-wider text-zinc-500 hover:text-red-500 transition-colors mr-2"
              >
                Vaciar
              </button>
            )}
            <button 
              onClick={onClose} 
              aria-label="Cerrar bolsa"
              className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Item List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 custom-scrollbar">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
              <div className="w-20 h-20 bg-zinc-900/60 rounded-3xl flex items-center justify-center border border-white/5 text-zinc-600">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25c-.669 0-1.189-.578-1.119-1.243l1.263-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </div>
              <div className="space-y-1">
                <p className="font-[1000] italic uppercase tracking-wider text-white text-base">Bolsa vacía</p>
                <p className="text-zinc-500 text-xs font-semibold">Añade sneakers y prendas exclusivas.</p>
              </div>
            </div>
          ) : (
            items.map((item) => {
              const liveProduct = allProducts.find(p => p.id === item.id);
              const isActuallySoldOut = !liveProduct || liveProduct.isSoldOut || (liveProduct.stock ?? 1) === 0;
              const currentStock = liveProduct?.stock ?? 0;
              const isMaxStock = item.quantity >= (currentStock || 1);

              return (
                <div 
                  key={`${item.id}-${item.selectedSize}`} 
                  className="relative flex items-center space-x-3 p-3 rounded-2xl border border-white/10 bg-[#121216] hover:border-red-600/40 transition-all shadow-md overflow-hidden"
                >
                  {/* Fixed Dimension Thumbnail */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 min-w-[4rem] min-h-[4rem] bg-black/80 rounded-xl overflow-hidden shrink-0 p-1.5 flex items-center justify-center relative border border-white/5">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-contain filter drop-shadow-md" 
                    />
                    {isActuallySoldOut && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                        <span className="text-[9px] font-black text-red-500 uppercase tracking-wider">
                          Agotado
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 pr-6 space-y-1">
                    <h4 className="font-bold text-xs sm:text-sm text-white leading-tight line-clamp-1">
                      {item.name}
                    </h4>
                    <div className="flex items-center space-x-2 text-[11px] text-zinc-400">
                      <span>Talla: <strong className="text-red-500 font-bold">{item.selectedSize}</strong></span>
                      <span>•</span>
                      <span className="truncate">{item.brand}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1 gap-2">
                      {/* Quantity Selector */}
                      <div className="flex items-center space-x-1.5 bg-black/60 rounded-lg p-0.5 border border-white/5">
                        <button 
                          onClick={() => onUpdateQuantity(item.id, item.selectedSize, -1)}
                          disabled={isActuallySoldOut}
                          className="w-6 h-6 flex items-center justify-center hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors font-bold text-xs active:scale-95"
                        >
                          -
                        </button>
                        <span className="text-xs font-black text-white w-4 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => onUpdateQuantity(item.id, item.selectedSize, 1)}
                          disabled={isActuallySoldOut || isMaxStock}
                          className="w-6 h-6 flex items-center justify-center hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors font-bold text-xs active:scale-95 disabled:opacity-30"
                        >
                          +
                        </button>
                      </div>

                      <p className="font-black italic text-xs sm:text-sm text-red-500 shrink-0">
                        RD${Number(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button 
                    onClick={() => onRemove(item.id, item.selectedSize)} 
                    aria-label="Eliminar producto"
                    className="absolute top-2.5 right-2.5 text-zinc-500 hover:text-red-500 transition-colors p-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Summary & Checkout */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 bg-black/95 space-y-3 border-t border-white/10 shrink-0 pb-6 sm:pb-5">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-black uppercase tracking-widest text-zinc-500">Total Estimado</span>
              <span className="text-2xl sm:text-3xl font-[1000] italic text-white tracking-tight">
                RD${Number(total).toLocaleString()}
              </span>
            </div>

            <button 
              onClick={handleCheckout}
              className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white font-black uppercase py-3.5 sm:py-4 text-xs tracking-[0.15em] rounded-2xl transition-all flex items-center justify-center space-x-2 shadow-lg shadow-green-900/30 active:scale-[0.98]"
            >
              <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
              <span>Confirmar Pedido vía WhatsApp</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
