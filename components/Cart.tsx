
import React from 'react';
import { CartItem } from '../types';

interface CartProps {
  logo?: string | null;
  whatsappTemplate?: string;
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemove: (id: string, size: number | string) => void;
  onUpdateQuantity: (id: string, size: number | string, delta: number) => void;
  onClearCart: () => void;
}

const Cart: React.FC<CartProps> = ({ logo, whatsappTemplate, isOpen, onClose, items, onRemove, onUpdateQuantity, onClearCart }) => {
  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const SELLER_PHONE = "18299745066"; 

  const handleCheckout = () => {
    if (items.length === 0) return;

    let detailsStr = "";
    items.forEach((item, index) => {
      detailsStr += `\n📦 PIEZA #${index + 1}:\n`;
      detailsStr += `• Nombre: ${item.name}\n`;
      detailsStr += `• Marca: ${item.brand}\n`;
      detailsStr += `• Talla: ${item.selectedSize}\n`;
      detailsStr += `• Cantidad: ${item.quantity}\n`;
      detailsStr += `• Subtotal: RD$${item.price * item.quantity}\n`;
    });

    const defaultTemplate = "¡Hola! Quiero confirmar el siguiente pedido:\n\n[DETALLES]\n\n• TOTAL FINAL: [TOTAL]\n\n¿Tienen disponibilidad para entrega hoy?";
    const template = whatsappTemplate || defaultTemplate;
    
    const finalMessage = template
      .replace("[DETALLES]", detailsStr)
      .replace("[TOTAL]", `RD$${total}`);

    const encodedMessage = encodeURIComponent(finalMessage);
    window.open(`https://wa.me/${SELLER_PHONE}?text=${encodedMessage}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-[#050505] h-full shadow-2xl flex flex-col border-l border-white/10">
        
        <div className="p-6 md:p-8 border-b border-white/10 flex items-center justify-between bg-black/50 backdrop-blur-xl">
          <div className="flex items-center space-x-3 h-10">
            {logo ? (
              <img src={logo} alt="Logo" className="h-full object-contain" />
            ) : (
              <div className="text-red-600 font-[1000] text-3xl italic tracking-tighter">SP</div>
            )}
            <h3 className="text-xl font-black uppercase tracking-tighter italic">Bolsa <span className="text-zinc-600 ml-2">[{items.length}]</span></h3>
          </div>
          <div className="flex items-center space-x-2">
            {items.length > 0 && (
              <button 
                onClick={onClearCart} 
                className="text-[9px] font-black uppercase text-zinc-600 hover:text-red-500 transition-colors mr-4 tracking-widest"
              >
                Vaciar
              </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-500 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-24 h-24 bg-zinc-900/50 rounded-3xl flex items-center justify-center border border-white/5">
                <svg className="w-10 h-10 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              </div>
              <div className="space-y-2">
                <p className="font-black uppercase tracking-[0.3em] text-sm">Bolsa vacía</p>
                <p className="text-zinc-600 text-[9px] font-bold uppercase tracking-widest">Añade piezas épicas al inventario.</p>
              </div>
            </div>
          ) : (
            items.map((item) => (
              <div key={`${item.id}-${item.selectedSize}`} className="flex space-x-5 group animate-fade-in duration-300">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-zinc-900 rounded-2xl overflow-hidden flex-shrink-0 border border-white/5 relative">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                </div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-[11px] leading-tight uppercase tracking-tight text-white mb-1">{item.name}</h4>
                      <p className="text-[9px] font-black uppercase text-zinc-500 tracking-widest">Talla: <span className="text-red-500">{item.selectedSize}</span></p>
                    </div>
                    <button onClick={() => onRemove(item.id, item.selectedSize)} className="text-zinc-700 hover:text-red-600 transition-colors p-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 bg-zinc-900 rounded-lg p-1 border border-white/5">
                      <button 
                        onClick={() => onUpdateQuantity(item.id, item.selectedSize, -1)}
                        className="w-7 h-7 flex items-center justify-center hover:bg-white/5 rounded-md text-zinc-400 transition-colors font-bold"
                      >
                        -
                      </button>
                      <span className="text-xs font-black text-white w-5 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => onUpdateQuantity(item.id, item.selectedSize, 1)}
                        className="w-7 h-7 flex items-center justify-center hover:bg-white/5 rounded-md text-zinc-400 transition-colors font-bold"
                      >
                        +
                      </button>
                    </div>
                    <p className="font-black text-sm italic text-white">RD${item.price * item.quantity}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-8 bg-black space-y-6 border-t border-white/10 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="uppercase tracking-[0.4em] text-[9px] font-black text-zinc-600">Resumen de Orden Consolidada</span>
              </div>
              <div className="flex justify-between items-end py-2">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 mb-1">Total Bolsa</span>
                <span className="text-4xl italic font-[1000] text-white tracking-tighter">RD${total}</span>
              </div>
            </div>

            <button 
              onClick={handleCheckout}
              className="w-full bg-[#25D366] text-white font-black uppercase py-5 text-[11px] tracking-[0.3em] hover:brightness-110 transition-all rounded-2xl shadow-[0_15px_40px_rgba(37,211,102,0.25)] flex items-center justify-center space-x-3 active:scale-[0.98]"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
              <span>Pedir vía WhatsApp</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
