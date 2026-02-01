
import { Product, SportwearCategory, BrandStock } from '../types';

/**
 * SERVICIO DE SINCRONIZACIÓN UNIVERSAL
 * Se utiliza un timestamp para romper el caché del navegador.
 */

const API_URL = `https://api.jsonbin.io/v3/b/67bf5b00e41b4d34e49ae9e0`;
const ACCESS_KEY = '$2a$10$7Z2v7.S/Hh/lB8M.vHw4v.Qk6.p3P7D6Y5D6Y5D6Y5D6Y5D6Y5D6'; 

export interface GlobalState {
  products: Product[];
  categories: SportwearCategory[];
  tennisBrands: BrandStock[];
  socksBrands: BrandStock[];
  logo: string | null;
  whatsappTemplate?: string;
  lastUpdated: number;
}

export const syncService = {
  fetchState: async (): Promise<GlobalState | null> => {
    try {
      // El parámetro ?t= asegura que el navegador no use una respuesta cacheada
      const response = await fetch(`${API_URL}/latest?t=${Date.now()}`, {
        method: 'GET',
        headers: {
          'X-Bin-Meta': 'false',
          'Content-Type': 'application/json',
          'X-Master-Key': ACCESS_KEY
        }
      });
      
      if (!response.ok) return null;
      const data = await response.json();
      return data as GlobalState;
    } catch (error) {
      console.error('Cloud Sync Error:', error);
      return null;
    }
  },

  pushState: async (state: GlobalState): Promise<boolean> => {
    try {
      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': ACCESS_KEY,
          'X-Bin-Versioning': 'false'
        },
        body: JSON.stringify(state)
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }
};
