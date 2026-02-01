
import { Product, BrandStock, SportwearCategory } from './types';

export const PRODUCTS: Product[] = [
  {
    id: 's1',
    name: 'Air Jordan 1 Retro High OG',
    brand: 'Nike',
    price: 11500,
    image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&q=80&w=800',
    description: 'El calzado que lo inició todo. Cuero de primera calidad y una silueta icónica que define la cultura sneaker.',
    category: 'Shoes',
    availableSizes: [7, 8, 9, 10, 11, 12],
    condition: 'nuevo'
  },
  {
    id: 's2',
    name: 'Adidas Ultraboost Light',
    brand: 'Adidas',
    price: 9800,
    image: 'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?auto=format&fit=crop&q=80&w=800',
    description: 'Experimenta una energía épica con las Ultraboost más ligeras jamás fabricadas. Amortiguación técnica superior.',
    category: 'Shoes',
    availableSizes: [8, 9, 10, 11, 12],
    condition: 'nuevo'
  },
  {
    id: 'sw1',
    name: 'Nike Pro Elite Bermuda Dri-FIT',
    brand: 'Nike',
    price: 3200,
    image: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&q=80&w=800',
    description: 'Bermuda técnica Nike con tecnología Dri-FIT para absorber el sudor. Corte de alto rendimiento diseñado para movilidad total y frescura extrema.',
    category: 'Nike Dri-FIT Bermuda',
    availableSizes: ['L', 'XL', 'XXL'],
    condition: 'nuevo'
  },
  {
    id: 'sw2',
    name: 'Nike Pro Single Leg Tight',
    brand: 'Nike',
    price: 2400,
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800',
    description: 'La icónica licra de una sola pierna. Proporciona soporte muscular asimétrico y una estética de nivel profesional.',
    category: 'Licra de una sola pierna',
    availableSizes: ['L', 'XL', 'XXL'],
    condition: 'nuevo'
  },
  {
    id: 'm1',
    name: 'Nike Everyday Cushion Crew',
    brand: 'Nike',
    price: 850,
    image: 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?auto=format&fit=crop&q=80&w=800',
    description: 'Medias Nike Everyday con amortiguación en la planta para mayor comodidad durante tus entrenamientos o el día a día.',
    category: 'Medias',
    availableSizes: ['M', 'L', 'XL'],
    condition: 'nuevo'
  },
  {
    id: 'm2',
    name: 'Jordan Jumpman Flight Socks',
    brand: 'Jordan',
    price: 1200,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800',
    description: 'Medias Jordan premium con soporte en el arco y tecnología de absorción de humedad.',
    category: 'Medias',
    availableSizes: ['M', 'L'],
    condition: 'nuevo'
  }
];

export const TENNIS_BRANDS: BrandStock[] = [
  { 
    name: 'Nike', 
    logo: 'N', 
    availableSizes: [7, 8, 9, 10, 11, 12, 13],
    marqueeImage: 'https://images.unsplash.com/photo-1605348532760-6753d2c43329?auto=format&fit=crop&q=80&w=1200'
  },
  { 
    name: 'Jordan', 
    logo: 'J', 
    availableSizes: [7, 8, 9, 10, 11, 12, 13, 14],
    marqueeImage: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&q=80&w=1200'
  },
  { 
    name: 'Adidas', 
    logo: 'A', 
    availableSizes: [6, 7, 8, 9, 10, 11, 12],
    marqueeImage: 'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?auto=format&fit=crop&q=80&w=1200'
  },
  { 
    name: 'Converse', 
    logo: 'C', 
    availableSizes: [4, 5, 6, 7, 8, 9, 10, 11, 12],
    marqueeImage: 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&q=80&w=1200'
  }
];

export const SOCKS_BRANDS: BrandStock[] = [
  { 
    name: 'Nike', 
    logo: 'N', 
    availableSizes: [7, 8, 9, 10], 
    marqueeImage: 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?auto=format&fit=crop&q=80&w=1200'
  },
  { 
    name: 'Jordan', 
    logo: 'J', 
    availableSizes: [8, 9, 10],
    marqueeImage: 'https://images.unsplash.com/photo-1619445101676-cc0842940608?auto=format&fit=crop&q=80&w=1200'
  },
  { 
    name: 'Adidas', 
    logo: 'A', 
    availableSizes: [7, 8, 9],
    marqueeImage: 'https://images.unsplash.com/photo-1521093470119-a3ac9fbb6ca2?auto=format&fit=crop&q=80&w=1200'
  },
  { 
    name: 'Supreme', 
    logo: 'S', 
    availableSizes: [8, 9, 10, 11],
    marqueeImage: 'https://images.unsplash.com/photo-1544252395-5381d636f32e?auto=format&fit=crop&q=80&w=1200'
  }
];

export const SPORTWEAR_CATEGORIES: SportwearCategory[] = [
  {
    name: 'Nike Dri-FIT Bermuda',
    brand: 'Nike',
    image: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&q=80&w=800'
  },
  {
    name: 'Licra de una sola pierna',
    brand: 'Nike',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800'
  },
  {
    name: 'Licra de compresión',
    brand: 'Nike',
    image: 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&q=80&w=800'
  },
  {
    name: 'Body Nike Compresión',
    brand: 'Nike',
    image: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&q=80&w=800'
  },
  {
    name: 'Licra corta nike',
    brand: 'Nike',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800'
  },
  {
    name: 'Franela nike de compresion',
    brand: 'Nike',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800'
  }
];
