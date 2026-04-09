
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, collection, deleteDoc, getDocs, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";
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
  uploadImage: async (base64Data: string, fileName: string): Promise<string> => {
    if (!base64Data || !base64Data.startsWith('data:image/')) return base64Data;
    try {
      const storageRef = ref(storage, `products/${fileName}`);
      await uploadString(storageRef, base64Data, 'data_url');
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error('Storage Upload Error:', error);
      return base64Data;
    }
  },

  uploadBannerImage: async (base64Data: string, bannerName: string): Promise<string> => {
    if (!base64Data || !base64Data.startsWith('data:image/')) return base64Data;
    try {
      const storageRef = ref(storage, `banners/${bannerName.replace(/\s+/g, '_').toLowerCase()}`);
      await uploadString(storageRef, base64Data, 'data_url');
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error('Banner Storage Error:', error);
      return base64Data;
    }
  },

  saveProduct: async (product: Product): Promise<Product> => {
    try {
      // Proceso de Erradicación de Base64: Forzar URLs de Storage
      let mainImageUrl = product.image;
      if (mainImageUrl.startsWith('data:image/')) {
        mainImageUrl = await syncService.uploadImage(mainImageUrl, `${product.id}_main`);
      }
      
      const updatedImages: any = {};
      if (product.images) {
        for (const [key, val] of Object.entries(product.images)) {
          if (typeof val === 'string' && val.startsWith('data:image/')) {
            updatedImages[key] = await syncService.uploadImage(val, `${product.id}_${key}`);
          } else {
            updatedImages[key] = val;
          }
        }
      }

      const finalProduct = { ...product, image: mainImageUrl, images: updatedImages };
      const docRef = doc(db, "productos", product.id);
      await setDoc(docRef, finalProduct);
      return finalProduct;
    } catch (error) {
      console.error('Save Product Error:', error);
      throw error;
    }
  },

  toggleStock: async (id: string, isSoldOut: boolean): Promise<void> => {
    try {
      // ACTUALIZACIÓN ATÓMICA: Únicamente el campo isSoldOut
      const docRef = doc(db, "productos", id);
      await updateDoc(docRef, { isSoldOut });
    } catch (error) {
      console.error('Toggle Stock Error:', error);
      throw error;
    }
  },

  deleteProduct: async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, "productos", id));
    } catch (error) {
      console.error('Delete Product Error:', error);
    }
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
