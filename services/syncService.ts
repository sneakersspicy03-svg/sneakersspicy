
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, writeBatch } from "firebase/firestore";
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
      const docRef = doc(db, "config", "global_state");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as GlobalState;
      }
      return null;
    } catch (error) {
      console.error('Firebase Fetch Error:', error);
      return null;
    }
  },

  pushState: async (state: GlobalState): Promise<boolean> => {
    try {
      const docRef = doc(db, "config", "global_state");
      await setDoc(docRef, state);
      return true;
    } catch (error) {
      console.error('Firebase Push Error:', error);
      return false;
    }
  },

  massLoadProducts: async (products: Product[]): Promise<boolean> => {
    try {
      const batch = writeBatch(db);
      products.forEach((p) => {
        const docRef = doc(collection(db, "productos"), p.id);
        batch.set(docRef, p);
      });
      await batch.commit();
      return true;
    } catch (error) {
      console.error('Mass Load Error:', error);
      return false;
    }
  }
};
