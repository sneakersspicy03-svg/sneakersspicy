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
  imageUrl?: string;
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
  bannerId?: string; // ID único del banner asignado
  condition?: ProductCondition;
  availableSizes: (number | string)[];
  sizes?: (number | string)[];
  size?: number | string;
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
  section?: string;
  sectionId?: string;
  category?: string;
}

export interface SportwearCategory {
  id?: string;
  name: string;
  image: string;
  marqueeImage?: string;
  brand: string;
  availableSizes?: (number | string)[];
  bannerTitle?: string;    // Texto en blanco
  bannerSubtitle?: string; // Texto en gris/badge
  type?: 'tennis' | 'socks' | 'sportwear';
  format?: BannerFormat;
  sectionId?: string;
  section?: string;
  category?: string;
}

export interface FilterState {
  brand: string | null;
  size: number | string | null;
  category?: string | null;
  bannerId?: string | null;
}

export function isProductInBanner(
  product: any, 
  banner: any, 
  siblingsInSameSection: any[] = []
): boolean {
  if (!product || !banner) return false;

  const isAvailable = !product.isSoldOut && (product.stock === undefined || product.stock > 0);
  if (!isAvailable) return false;

  // 1. Coincidencia por bannerId explícito:
  if (product.bannerId && banner.id) {
    return product.bannerId === banner.id;
  }
  if (product.bannerId && !banner.id) {
    return false;
  }

  // 2. Normalización de campos
  const pSection = String(product.section || product.sectionId || product.category || '').trim().toLowerCase();
  const bSection = String(banner.section || banner.sectionId || banner.category || banner.type || '').trim().toLowerCase();
  const pBrand = String(product.brand || product.marca || '').trim().toLowerCase();
  const bBrand = String(banner.brand || (banner as any).nombre || banner.name || '').trim().toLowerCase();
  const pTitle = String(product.title || product.name || '').trim().toLowerCase();
  const bTitle = String(banner.title || banner.name || banner.bannerTitle || '').trim().toLowerCase();
  const bSubtitle = String(banner.bannerSubtitle || '').trim().toLowerCase();

  // 3. Comprobación de marca
  const matchesBrand = bBrand ? (pBrand === bBrand || pBrand.includes(bBrand) || bBrand.includes(pBrand)) : true;
  if (!matchesBrand && bBrand) return false;

  // 4. Normalización y comprobación de sección
  const normalizeSec = (sec: string) => {
    if (sec.includes('sportwear') || sec.includes('sportware') || sec.includes('ropa') || sec.includes('apparel') || sec.includes('prenda')) return 'sportwear';
    if (sec.includes('calzado') || sec.includes('tenis') || sec.includes('shoe') || sec.includes('sneaker') || sec === 'shoes' || sec === 'tennis') return 'calzado';
    if (sec.includes('media') || sec.includes('sock') || sec.includes('calcetin')) return 'medias';
    return sec;
  };

  const normPSec = normalizeSec(pSection);
  const normBSec = normalizeSec(bSection);
  if (normPSec && normBSec && normPSec !== normBSec) {
    return false;
  }

  // 5. Aislamiento estricto de prendas/banners de la misma marca (ej: licras vs t-shirts de compresión vs bermudas)
  const isLicraBanner = bTitle.includes('licra') || bTitle.includes('tight') || bSubtitle.includes('licra') || bTitle.includes('pierna');
  const isShirtBanner = bTitle.includes('shirt') || bTitle.includes('camiseta') || bTitle.includes('compresion') || bSubtitle.includes('shirt') || bTitle.includes('remera') || bSubtitle.includes('compresion');
  const isBermudaBanner = bTitle.includes('bermuda') || bTitle.includes('short') || bSubtitle.includes('bermuda') || bSubtitle.includes('short');

  const isLicraProduct = pTitle.includes('licra') || pSection.includes('licra') || pTitle.includes('tight') || pTitle.includes('pierna');
  const isShirtProduct = pTitle.includes('shirt') || pTitle.includes('camiseta') || pTitle.includes('compresion') || pSection.includes('compresion') || pTitle.includes('remera');
  const isBermudaProduct = pTitle.includes('bermuda') || pSection.includes('bermuda') || pTitle.includes('short');

  if (isLicraBanner) return isLicraProduct;
  if (isShirtBanner) return isShirtProduct;
  if (isBermudaBanner) return isBermudaProduct;

  if (banner.title || banner.bannerTitle) {
    if (pTitle.includes(bTitle) || bTitle.includes(pTitle)) return true;
    const titleTokens = bTitle.split(/\s+/).filter((w: string) => w.length > 3 && w !== bBrand);
    if (titleTokens.length > 0) {
      return titleTokens.some((tok: string) => pTitle.includes(tok) || pSection.includes(tok));
    }
  }

  return true;
}

export const isProductMatchingBanner = isProductInBanner;
