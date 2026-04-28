
export interface ProductImages {
  front: string;
  back: string;
  left: string;
  right: string;
  top: string;
  bottom: string;
}

export type ProductCondition = 'nuevo' | 'nuevo_sin_caja' | 'como_nuevo' | 'usados_baratos';
export type SizeInputType = 'numeric' | 'clothing_letters';
export type BannerFormat = 'vertical' | 'horizontal' | 'rectangular';

export interface Section {
  id: string;
  name: string;
  subtitle?: string;
  emoji: string;
  orderIndex: number;
  photoCount: number; // 1-6
  sizeInputType: SizeInputType;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  marca?: string;
  price: number;
  image: string; 
  images?: ProductImages; 
  asset3d?: string; 
  description: string;
  category: string; // Nombre de la sección para compatibilidad
  sectionId?: string; // ID de la nueva colección
  condition?: ProductCondition;
  availableSizes: (number | string)[];
  isSoldOut?: boolean;
  soldOutSizes?: (number | string)[];
  stock: number;
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
  format?: BannerFormat;
}


export interface SportwearCategory {
  id?: string;
  name: string;
  image: string;
  brand: string;
  bannerTitle?: string;    // Texto en blanco
  bannerSubtitle?: string; // Texto en gris/badge
  type?: 'tennis' | 'socks' | 'sportwear';
  format?: BannerFormat;
}

export interface FilterState {
  brand: string | null;
  size: number | string | null;
  category?: string | null;
}
