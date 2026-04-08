
import React, { useState } from 'react';

interface TermsAndConditionsProps {
  logo?: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSecretTrigger: () => void;
}

const TermsAndConditions: React.FC<TermsAndConditionsProps> = ({ logo, isOpen, onClose, onSecretTrigger }) => {
  const [secretClicks, setSecretClicks] = useState(0);

  if (!isOpen) return null;

  const handleSecretClick = () => {
    const newCount = secretClicks + 1;
    if (newCount >= 3) {
      setSecretClicks(0);
      onSecretTrigger();
    } else {
      setSecretClicks(newCount);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-zinc-950 h-full shadow-2xl flex flex-col border-l border-white/10 animate-fade-in">
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black">
          <div className="flex items-center space-x-3 h-10">
            {logo ? (
              <img src={logo} alt="Logo" className="h-full object-contain" />
            ) : (
              <div className="text-red-600 font-[1000] text-2xl italic tracking-tighter">SP</div>
            )}
            <div>
              <h3 className="font-black uppercase tracking-tighter">Términos y Condiciones</h3>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Políticas de la Tienda</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-500 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-gradient-to-b from-black to-zinc-950 custom-scrollbar">
          <div className="space-y-4">
            <h4 
              onClick={handleSecretClick}
              className="text-red-600 font-black uppercase text-[10px] tracking-[0.3em] cursor-default select-none active:opacity-70 transition-opacity"
            >
              1. Autenticidad
            </h4>
            <p className="text-sm text-zinc-400 leading-relaxed font-medium italic">
              "Todos nuestros productos son 100% auténticos. Garantizamos la legitimidad de cada par de sneakers y prenda de sportwear que sale de nuestro almacén."
            </p>
          </div>

          <div className="space-y-4 border-t border-white/5 pt-8">
            <h4 className="text-red-600 font-black uppercase text-[10px] tracking-[0.3em]">2. Envíos y Entregas</h4>
            <p className="text-sm text-zinc-400 leading-relaxed font-medium italic">
              "Realizamos envíos a todo el país. El tiempo estimado de entrega es de 24 a 48 horas laborables una vez confirmado el pedido."
            </p>
          </div>

          <div className="space-y-4 border-t border-white/5 pt-8">
            <h4 className="text-red-600 font-black uppercase text-[10px] tracking-[0.3em]">3. Cambios y Devoluciones</h4>
            <p className="text-sm text-zinc-400 leading-relaxed font-medium italic">
              "Aceptamos cambios de talla dentro de los primeros 3 días de la compra, siempre que el producto esté en perfecto estado y con sus etiquetas originales. No se aceptan devoluciones de dinero."
            </p>
          </div>

          <div className="space-y-4 border-t border-white/5 pt-8">
            <h4 className="text-red-600 font-black uppercase text-[10px] tracking-[0.3em]">4. Métodos de Pago</h4>
            <p className="text-sm text-zinc-400 leading-relaxed font-medium italic">
              "Aceptamos transferencias bancarias, efectivo contra entrega y pagos con tarjeta de crédito mediante enlace de pago seguro."
            </p>
          </div>

          <div className="space-y-4 border-t border-white/5 pt-8">
            <h4 className="text-red-600 font-black uppercase text-[10px] tracking-[0.3em]">5. Privacidad</h4>
            <p className="text-sm text-zinc-400 leading-relaxed font-medium italic">
              "Tus datos están protegidos y solo se utilizan para procesar tus pedidos y mejorar tu experiencia en nuestra tienda."
            </p>
          </div>

          <div className="pt-10 flex flex-col items-center space-y-2 opacity-30">
            {logo ? (
              <img src={logo} alt="Logo" className="h-12 object-contain grayscale" />
            ) : (
              <div className="text-zinc-600 font-[1000] text-3xl italic tracking-tighter">SP</div>
            )}
            <p className="text-[8px] font-black uppercase tracking-[0.4em] text-center">Sneakers Spicy © 2025 | Elite Footwear Boutique</p>
          </div>
        </div>

        <div className="p-6 border-t border-white/10 bg-black">
          <button 
            onClick={onClose}
            className="w-full bg-white text-black py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-xl active:scale-95"
          >
            Aceptar y Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
