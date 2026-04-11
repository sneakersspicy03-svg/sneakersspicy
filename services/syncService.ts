
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, collection, deleteDoc, getDocs, updateDoc } from "firebase/firestore";
import { getStorage, ref, getDownloadURL, uploadBytes } from "firebase/storage";
import { Product, SportwearCategory, BrandStock } from '../types';

const firebaseConfig = { 
  apiKey: "AIzaSyCVAqfHuvTVBxz2njeWKj5Sri1ETURP14I", 
  authDomain: "sneakers-spicy-db.firebaseapp.com", 
  projectId: "sneakers-spicy-db", 
  storageBucket: "sneakers-spicy-db.firebasestorage.app", 
  messagingSenderId: "362351464666", 
  appId: "1:362351464666:web:09df3f0104784a2764d5e3", 
  measurementId: "G-D14B0HS8HC" 
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

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
  // SUBIDA ATÓMICA DE IMÁGENES
  uploadImage: async (base64Data: string, fileName: string): Promise<string> => {
    if (!base64Data || !base64Data.startsWith('data:image/')) return base64Data;
    
    // Sin catch interno: dejamos que el error suba al componente
    const storageRef = ref(storage, `products/${fileName}`);
    const response = await fetch(base64Data);
    const blob = await response.blob();
    const metadata = { contentType: 'image/jpeg' }; 

    const snapshot = await uploadBytes(storageRef, blob, metadata);
    return await getDownloadURL(snapshot.ref);
  },

  // PERSISTENCIA TOTAL: Retorna confirmación o lanza error
  saveProduct: async (product: Product): Promise<Product> => {
    console.log(`📡 SRE: Iniciando persistencia atómica para: ${product.name}`);
    let mainImageUrl = product.image;
    
    // 1. Storage: Imagen Principal
    if (mainImageUrl.startsWith('data:image/')) {
      mainImageUrl = await syncService.uploadImage(mainImageUrl, `${product.id}_main_${Date.now()}`);
    }
    
    // 2. Storage: Galería
    const updatedImages: any = {};
    if (product.images) {
      for (const [key, val] of Object.entries(product.images)) {
        if (typeof val === 'string' && val.startsWith('data:image/')) {
          updatedImages[key] = await syncService.uploadImage(val, `${product.id}_${key}_${Date.now()}`);
        } else {
          updatedImages[key] = val;
        }
      }
    }

    const finalProduct = { 
      ...product, 
      image: mainImageUrl, 
      images: updatedImages,
      lastUpdated: Date.now() 
    };

    // 3. Firestore: Confirmación de Escritura
    const docRef = doc(db, "productos", product.id);
    await setDoc(docRef, finalProduct);
    
    console.log(`✅ SRE: Confirmación real recibida de Firebase para ${product.id}`);
    return finalProduct;
  },

  uploadBannerImage: async (base64Data: string, bannerName: string): Promise<string> => {
    if (!base64Data || !base64Data.startsWith('data:image/')) return base64Data;
    const storageRef = ref(storage, `banners/${bannerName.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}`);
    const response = await fetch(base64Data);
    const blob = await response.blob();
    const metadata = { contentType: 'image/jpeg' };
    
    const snapshot = await uploadBytes(storageRef, blob, metadata);
    return await getDownloadURL(snapshot.ref);
  },

  toggleStock: async (id: string, isSoldOut: boolean): Promise<void> => {
    const docRef = doc(db, "productos", id);
    await updateDoc(docRef, { isSoldOut });
  },

  deleteProduct: async (id: string): Promise<void> => {
    await deleteDoc(doc(db, "productos", id));
  },

  fetchState: async (): Promise<GlobalState | null> => {
    try {
      const configRef = doc(db, "config", "global_state");
      const configSnap = await getDoc(configRef);
      const productsSnap = await getDocs(collection(db, "productos"));
      const productsList: Product[] = [];
      productsSnap.forEach(doc => productsList.push(doc.data() as Product));

      if (configSnap.exists()) {
        const configData = configSnap.data();
        return {
          ...configData,
          products: productsList,
          lastUpdated: configData.lastUpdated || Date.now()
        } as GlobalState;
      }
      return productsList.length > 0 ? { products: productsList, categories: [], tennisBrands: [], socksBrands: [], logo: null, lastUpdated: Date.now() } : null;
    } catch (error) {
      console.error('Firebase Fetch Error:', error);
      return null;
    }
  },

  pushState: async (state: GlobalState): Promise<boolean> => {
    try {
      const docRef = doc(db, "config", "global_state");
      const { products, ...restOfState } = state;
      await setDoc(docRef, { ...restOfState, lastUpdated: Date.now() });
      return true;
    } catch (error) {
      console.error('Firebase Push Error:', error);
      return false;
    }
  }
};
