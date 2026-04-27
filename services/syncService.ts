
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, collection, deleteDoc, getDocs, updateDoc, addDoc } from "firebase/firestore";
import { Product, SportwearCategory, BrandStock, Section } from '../types';

const firebaseConfig = { 
  apiKey: (import.meta as any).env?.VITE_GEMINI_API_KEY || "AIzaSyCVAqfHuvTVBxz2njeWKj5Sri1ETURP14I", 
  authDomain: "sneakers-spicy-db.firebaseapp.com", 
  projectId: "sneakers-spicy-db", 
  storageBucket: "sneakers-spicy-db.firebasestorage.app", 
  messagingSenderId: "362351464666", 
  appId: "1:362351464666:web:09df3f0104784a2764d5e3", 
  measurementId: "G-D14B0HS8HC" 
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// CLOUDINARY CONFIG
const CLOUD_NAME = (import.meta as any).env?.VITE_CLOUDINARY_CLOUD_NAME;
const API_KEY = (import.meta as any).env?.VITE_CLOUDINARY_API_KEY;
const API_SECRET = (import.meta as any).env?.VITE_CLOUDINARY_API_SECRET;

// Helper robusto para extraer public_id de la URL de Cloudinary
const extractPublicId = (url: string): string | null => {
  try {
    if (!url || !url.includes('cloudinary.com')) return null;
    
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) return null;

    // Saltamos 'upload/' y posibles transformaciones
    const afterUpload = parts.slice(uploadIndex + 1);
    
    // Filtramos transformaciones (ej: w_500) y versiones (ej: v1234567)
    const publicIdParts = afterUpload.filter(part => {
      const isTransformation = part.includes('_') && part.length < 20;
      const isVersion = /^v\d+$/.test(part);
      return !isTransformation && !isVersion;
    });

    return publicIdParts.join('/').split('.')[0];
  } catch (e) {
    return null;
  }
};

export interface GlobalState {
  products: Product[];
  categories: SportwearCategory[];
  sections: Section[];
  tennisBrands: BrandStock[];
  socksBrands: BrandStock[];
  logo: string | null;
  whatsappTemplate?: string;
  lastUpdated: number;
}

export const syncService = {
  // SUBIDA A CLOUDINARY (REEMPLAZA FIREBASE STORAGE)
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'ml_default'); 
    formData.append('cloud_name', CLOUD_NAME);

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (data.secure_url) {
        return data.secure_url;
      } else {
        throw new Error(data.error?.message || 'Error desconocido en Cloudinary');
      }
    } catch (error) {
      console.error('❌ Cloudinary Upload Error:', error);
      throw error;
    }
  },

  // BORRADO DE CLOUDINARY
  deleteFromCloudinary: async (urls: string | string[]): Promise<void> => {
    if (!API_SECRET) {
      throw new Error("❌ Error: API Secret no cargada. Contacta al administrador.");
    }

    const urlList = Array.isArray(urls) ? urls : [urls];
    const validUrls = urlList.filter(u => u && u.includes('cloudinary.com'));

    if (validUrls.length === 0) return;

    for (const url of validUrls) {
      const publicId = extractPublicId(url);
      if (!publicId) continue;

      try {
        const timestamp = Math.round(new Date().getTime() / 1000);
        const formData = new FormData();
        formData.append('public_id', publicId);
        formData.append('api_key', API_KEY);
        formData.append('timestamp', timestamp.toString());
        
        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/destroy`, {
          method: 'POST',
          body: formData
        });

        const result = await response.json();

        if (result.result !== 'ok' && result.result !== 'not found') {
          throw new Error(`Cloudinary API Error: ${result.result || 'Desconocido'}`);
        }
      } catch (error: any) {
        console.error(`❌ Error borrando recurso ${publicId}:`, error);
        throw error;
      }
    }
  },

  // PERSISTENCIA EN FIRESTORE
  saveProduct: async (product: Product): Promise<Product> => {
    const finalProduct = { 
      ...product, 
      lastUpdated: Date.now() 
    };

    const docRef = doc(db, "productos", product.id);
    await setDoc(docRef, finalProduct);
    return finalProduct;
  },

  toggleStock: async (id: string, isSoldOut: boolean): Promise<void> => {
    const docRef = doc(db, "productos", id);
    await updateDoc(docRef, { isSoldOut });
  },

  deleteProduct: async (id: string): Promise<void> => {
    await deleteDoc(doc(db, "productos", id));
  },

  // BANNERS CRUD
  saveBanner: async (banner: any): Promise<string> => {
    const docRef = await addDoc(collection(db, "banners"), {
      ...banner,
      lastUpdated: Date.now()
    });
    return docRef.id;
  },

  updateBanner: async (id: string, banner: any): Promise<void> => {
    const docRef = doc(db, "banners", id);
    await updateDoc(docRef, { ...banner, lastUpdated: Date.now() });
  },

  deleteBanner: async (id: string): Promise<void> => {
    await deleteDoc(doc(db, "banners", id));
  },

  // SECTIONS CRUD
  saveSection: async (section: Omit<Section, 'id'>): Promise<string> => {
    const docRef = await addDoc(collection(db, "sections"), {
      ...section,
      lastUpdated: Date.now()
    });
    return docRef.id;
  },

  updateSection: async (id: string, section: Partial<Section>): Promise<void> => {
    const docRef = doc(db, "sections", id);
    await updateDoc(docRef, { ...section, lastUpdated: Date.now() });
  },

  deleteSection: async (id: string): Promise<void> => {
    await deleteDoc(doc(db, "sections", id));
  },

  getSections: async (): Promise<Section[]> => {
    try {
      const snap = await getDocs(collection(db, "sections"));
      const sections: Section[] = [];
      snap.forEach(doc => sections.push({ id: doc.id, ...doc.data() } as Section));
      return sections.sort((a, b) => a.orderIndex - b.orderIndex);
    } catch (e) {
      console.error("Error fetching sections:", e);
      return [];
    }
  },

  getBanners: async (): Promise<any[]> => {
    try {
      const snap = await getDocs(collection(db, "banners"));
      const banners: any[] = [];
      snap.forEach(doc => banners.push({ id: doc.id, ...doc.data() }));
      return banners;
    } catch (e) {
      console.error("Error fetching banners:", e);
      return [];
    }
  },

  fetchState: async (): Promise<GlobalState | null> => {
    try {
      const configRef = doc(db, "config", "global_state");
      const configSnap = await getDoc(configRef);
      const productsSnap = await getDocs(collection(db, "productos"));
      const productsList: Product[] = [];
      productsSnap.forEach(doc => {
        const data = doc.data();
        productsList.push({ 
          ...data, 
          id: doc.id,
          stock: data.stock !== undefined ? data.stock : 1 
        } as Product);
      });

      // Fetch banners
      const bannersList = await syncService.getBanners();
      const sectionsList = await syncService.getSections();

      if (configSnap.exists()) {
        const configData = configSnap.data();
        return {
          ...configData,
          products: productsList,
          sections: sectionsList,
          tennisBrands: bannersList.filter(b => b.type === 'tennis'),
          socksBrands: bannersList.filter(b => b.type === 'socks'),
          categories: bannersList.filter(b => b.type === 'sportwear'),
          lastUpdated: configData.lastUpdated || Date.now()
        } as GlobalState;
      }
      return { 
        products: productsList, 
        sections: sectionsList,
        categories: bannersList.filter(b => b.type === 'sportwear'), 
        tennisBrands: bannersList.filter(b => b.type === 'tennis'), 
        socksBrands: bannersList.filter(b => b.type === 'socks'), 
        logo: null, 
        lastUpdated: Date.now() 
      };
    } catch (error) {
      return null;
    }
  },

  pushState: async (state: GlobalState): Promise<boolean> => {
    try {
      const docRef = doc(db, "config", "global_state");
      const { products, categories, sections, tennisBrands, socksBrands, ...restOfState } = state;
      await setDoc(docRef, { ...restOfState, lastUpdated: Date.now() });
      return true;
    } catch (error) {
      return false;
    }
  }
};
