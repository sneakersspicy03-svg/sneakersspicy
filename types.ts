
export interface ProductImages {
  front: string;
  back: string;
  left: string;
  right: string;
  top: string;
  bottom: string;
}

export type ProductCondition = 'nuevo' | 'nuevo_sin_caja' | 'como_nuevo' | 'usados_baratos';

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string; 
  images?: ProductImages; 
  asset3d?: string; 
  description: string;
  category: string;
  condition?: ProductCondition;
  availableSizes: (number | string)[];
  isSoldOut?: boolean;
  soldOutSizes?: (number | string)[];
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize: number | string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  links?: { title: string; uri: string }[];
}
export interface BrandStock {
  id?: string;
  name: string;
  logo: string;
  availableSizes: (number | string)[];
  marqueeImage: string;
  brand?: string;
  bannerTitle?: string;    // Texto en blanco
  bannerSubtitle?: string; // Texto en gris/badge
  type?: 'tennis' | 'socks' | 'sportwear';
}


export interface SportwearCategory {
  id?: string;
  name: string;
  image: string;
  brand: string;
  bannerTitle?: string;    // Texto en blanco
  bannerSubtitle?: string; // Texto en gris/badge
  type?: 'tennis' | 'socks' | 'sportwear';
}

export interface FilterState {
  brand: string | null;
  size: number | string | null;
  category?: string | null;
}
