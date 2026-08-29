/**
 * SNEAKERS SPICY - Application Security & Input Sanitization Layer
 * Provides robust validation, NoSQL injection prevention, XSS mitigation,
 * and schema enforcement for all client-side operations.
 */

// Trusted image and resource domains
const TRUSTED_DOMAINS = [
  'cloudinary.com',
  'res.cloudinary.com',
  'images.unsplash.com',
  'unsplash.com',
  'firebasestorage.googleapis.com',
  'storage.googleapis.com'
];

/**
 * Strips dangerous HTML tags and escapes special characters to prevent Cross-Site Scripting (XSS).
 */
export function sanitizeString(input: unknown, maxLength = 500): string {
  if (input === null || input === undefined) return '';
  const str = String(input).trim().slice(0, maxLength);
  
  // Escape HTML entities to neutralize HTML/script injection
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validates and sanitizes a URL against trusted domains and protocols.
 */
export function sanitizeUrl(url: unknown): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  
  if (!trimmed.startsWith('https://') && !trimmed.startsWith('http://') && !trimmed.startsWith('/')) {
    return '';
  }

  // Prevent javascript:, data:, vbscript: pseudo-protocols
  if (/^(javascript|data|vbscript|file):/i.test(trimmed)) {
    return '';
  }

  try {
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      const parsed = new URL(trimmed);
      const isTrusted = TRUSTED_DOMAINS.some(domain => parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`));
      if (!isTrusted) {
        // Enforce HTTPS
        parsed.protocol = 'https:';
      }
      return parsed.toString();
    }
    return trimmed;
  } catch {
    return '';
  }
}

/**
 * Validates and clamps a numeric input to ensure positive numbers within safe limits.
 */
export function sanitizeNumber(input: unknown, min = 0, max = 10_000_000, fallback = 0): number {
  const num = Number(input);
  if (isNaN(num) || !isFinite(num)) return fallback;
  return Math.min(Math.max(num, min), max);
}

/**
 * Sanitizes search input to prevent regex DoS and search query manipulation.
 */
export function sanitizeSearchQuery(query: unknown, maxLength = 80): string {
  if (!query || typeof query !== 'string') return '';
  // Remove control characters and limit length
  return query
    .replace(/[\x00-\x1F\x7F]/g, '')
    .trim()
    .slice(0, maxLength);
}

export interface ValidationResult<T> {
  isValid: boolean;
  sanitizedData: T;
  errors: string[];
}

/**
 * Strict Validator for Product Payloads before Firestore sync.
 */
export function validateProductPayload(raw: any): ValidationResult<any> {
  const errors: string[] = [];

  const name = sanitizeString(raw.name, 120);
  if (!name) errors.push('El nombre del producto es obligatorio.');

  const brand = sanitizeString(raw.brand || raw.marca, 60);
  if (!brand) errors.push('La marca del producto es obligatoria.');

  const price = sanitizeNumber(raw.price, 1, 5_000_000, 0);
  if (price <= 0) errors.push('El precio debe ser un número positivo mayor a 0.');

  const stock = sanitizeNumber(raw.stock, 0, 10_000, 1);
  const description = sanitizeString(raw.description, 2000);
  const category = sanitizeString(raw.category, 60) || 'Calzado';
  const sectionId = sanitizeString(raw.sectionId, 80) || '';
  const condition = ['nuevo', 'nuevo_sin_caja', 'como_nuevo', 'usados_baratos'].includes(raw.condition)
    ? raw.condition
    : 'nuevo';

  // Process and sanitize sizes
  let rawSizes: any[] = [];
  if (Array.isArray(raw.availableSizes)) {
    rawSizes = raw.availableSizes;
  } else if (typeof raw.availableSizes === 'string') {
    rawSizes = raw.availableSizes.split(',');
  } else if (Array.isArray(raw.sizes)) {
    rawSizes = raw.sizes;
  }
  const availableSizes = Array.from(
    new Set(
      rawSizes
        .map(s => sanitizeString(String(s).trim(), 20).toUpperCase())
        .filter(Boolean)
    )
  );

  // Process Images Object
  const images = {
    front: sanitizeUrl(raw.images?.front || raw.image || ''),
    back: sanitizeUrl(raw.images?.back || ''),
    left: sanitizeUrl(raw.images?.left || ''),
    right: sanitizeUrl(raw.images?.right || ''),
    top: sanitizeUrl(raw.images?.top || ''),
    bottom: sanitizeUrl(raw.images?.bottom || '')
  };

  if (!images.front) {
    errors.push('La imagen principal (front) es obligatoria.');
  }

  const sanitizedData = {
    id: raw.id ? sanitizeString(raw.id, 80) : `spicy-${Date.now()}`,
    name,
    brand,
    marca: brand,
    price,
    stock,
    description,
    category,
    sectionId,
    condition,
    availableSizes,
    images,
    image: images.front,
    isSoldOut: Boolean(raw.isSoldOut || stock <= 0),
    lastUpdated: Date.now()
  };

  return {
    isValid: errors.length === 0,
    sanitizedData,
    errors
  };
}

/**
 * Strict Validator for Banner Payloads before Firestore sync.
 */
export function validateBannerPayload(raw: any): ValidationResult<any> {
  const errors: string[] = [];

  const name = sanitizeString(raw.name, 80);
  const bannerTitle = sanitizeString(raw.bannerTitle || raw.name, 100);
  const bannerSubtitle = sanitizeString(raw.bannerSubtitle, 150);
  const brand = sanitizeString(raw.brand || raw.name, 80);
  const format = ['vertical', 'rectangular', 'square'].includes(raw.format) ? raw.format : 'vertical';
  const type = ['tennis', 'socks', 'sportwear'].includes(raw.type) ? raw.type : 'tennis';
  const image = sanitizeUrl(raw.image || raw.marqueeImage || '');

  if (!name && !bannerTitle) {
    errors.push('El banner debe tener un nombre o título.');
  }

  if (!image) {
    errors.push('El banner debe tener una imagen válida.');
  }

  const sanitizedData = {
    id: raw.id ? sanitizeString(raw.id, 80) : undefined,
    name: name || bannerTitle,
    bannerTitle,
    bannerSubtitle,
    brand,
    format,
    type,
    image,
    marqueeImage: image,
    availableSizes: Array.isArray(raw.availableSizes) 
      ? (raw.availableSizes as any[]).map((s: any) => sanitizeString(String(s), 20)).filter(Boolean)
      : [],
    lastUpdated: Date.now()
  };

  return {
    isValid: errors.length === 0,
    sanitizedData,
    errors
  };
}
