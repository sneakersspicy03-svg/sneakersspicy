
import React, { useState, useRef, useEffect } from 'react';
import { getTennisAdvice } from '../services/geminiService';
import { ChatMessage } from '../types';

interface AIConsultantProps {
  isOpen: boolean;
  onClose: () => void;
}

const AIConsultant: React.FC<AIConsultantProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: "¡Bienvenido al Spicy Vault! 👟 Soy tu experto en sneakers. ¿Buscas ayuda con tallas, lanzamientos o cómo combinar tus próximas piezas? Estoy aquí para eso.",
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const response = await getTennisAdvice(input, messages);
    
    const botMsg: ChatMessage = { 
      role: 'model', 
      text: response.text, 
      links: response.links,
      timestamp: Date.now() 
    };
    
    setMessages(prev => [...prev, botMsg]);
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-zinc-950 h-full shadow-2xl flex flex-col border-l border-white/10">
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 flex items-center justify-center">
               <div className="text-red-600 font-black text-2xl italic tracking-tighter">
                 SP
               </div>
            </div>
            <div>
              <h3 className="font-black uppercase tracking-tighter">Sneaker Spicy AI</h3>
              <p className="text-[10px] text-red-500 uppercase tracking-widest font-bold">Expertise Engine</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-500 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-black to-zinc-950">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-4 rounded-2xl shadow-lg ${
                m.role === 'user' ? 'bg-zinc-800 text-white rounded-br-none' : 'bg-white text-black rounded-bl-none'
              }`}>
                <p className="text-sm leading-relaxed">{m.text}</p>
                {m.links && m.links.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-black/5">
                    <p className="text-[9px] font-black uppercase text-zinc-500 mb-2 tracking-widest">Fuentes Expertas:</p>
                    <div className="flex flex-col gap-2">
                      {m.links.map((link, i) => (
                        <a 
                          key={i} 
                          href={link.uri} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-[10px] bg-black/5 hover:bg-black/10 p-2 rounded border border-black/5 flex items-center justify-between group transition-colors"
                        >
                          <span className="font-bold truncate pr-4">{link.title}</span>
                          <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-zinc-800 p-4 rounded-2xl animate-pulse flex space-x-2">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-white/10 bg-black">
          <div className="relative flex items-center">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Pregunta sobre tallas o lanzamientos..."
              className="w-full bg-zinc-900 border border-white/5 rounded-2xl py-5 pl-6 pr-16 text-sm focus:outline-none focus:border-red-500/50 transition-all placeholder:text-zinc-600"
            />
            <button 
              onClick={handleSend}
              className="absolute right-3 p-3 bg-red-600 rounded-xl text-white hover:bg-red-500 transition-colors shadow-lg shadow-red-900/20"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIConsultant;
