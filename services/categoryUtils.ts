/**
 * Utilidades para clasificación y filtrado de banners y productos por categoría/sección.
 */

export const isBannerForCategory = (banner: any, categoryName: string | null | undefined): boolean => {
  if (!banner || !categoryName) return false;

  const cat = String(categoryName).toLowerCase().trim();
  const bType = String(banner.type || '').toLowerCase().trim();
  const bSection = String(banner.section || banner.sectionName || '').toLowerCase().trim();
  const bSectionId = String(banner.sectionId || '').toLowerCase().trim();
  const bCategory = String(banner.category || '').toLowerCase().trim();

  // 1. Rama: Calzado / Tenis / Sneakers / Shoes
  if (cat.includes('calzado') || cat.includes('tenis') || cat.includes('sneaker') || cat.includes('shoe')) {
    if (bType === 'tennis' || bType === 'shoes' || bType === 'calzado' || bType === 'sneakers' || bType === 'tenis') return true;
    if (bSection.includes('calzado') || bSection.includes('tenis') || bSection.includes('sneaker') || bSection.includes('shoe')) return true;
    if (bSectionId.includes('calzado') || bSectionId.includes('shoes') || bSectionId.includes('tennis')) return true;
    if (bCategory.includes('calzado') || bCategory.includes('tenis') || bCategory.includes('shoe') || bCategory.includes('sneaker')) return true;
    return false;
  }

  // 2. Rama: Sportwear / Ropa / Apparel / Prendas
  if (cat.includes('sportwear') || cat.includes('sportware') || cat.includes('ropa') || cat.includes('apparel') || cat.includes('prenda')) {
    if (bType === 'sportwear' || bType === 'sportware' || bType === 'ropa' || bType === 'apparel') return true;
    if (bSection.includes('sportwear') || bSection.includes('sportware') || bSection.includes('ropa') || bSection.includes('apparel')) return true;
    if (bSectionId.includes('sportwear') || bSectionId.includes('sportware') || bSectionId.includes('ropa')) return true;
    if (bCategory.includes('sportwear') || bCategory.includes('sportware') || bCategory.includes('ropa') || bCategory.includes('apparel')) return true;
    return false;
  }

  // 3. Rama: Medias / Socks / Calcetines
  if (cat.includes('media') || cat.includes('sock') || cat.includes('calcetin')) {
    if (bType === 'socks' || bType === 'medias' || bType === 'calcetines') return true;
    if (bSection.includes('media') || bSection.includes('sock')) return true;
    if (bSectionId.includes('media') || bSectionId.includes('sock')) return true;
    if (bCategory.includes('media') || bCategory.includes('sock')) return true;
    return false;
  }

  // 4. Rama: Categorías dinámicas o personalizadas
  if (bSection && bSection === cat) return true;
  if (bSectionId && (bSectionId === cat || bSectionId.includes(cat) || cat.includes(bSectionId))) return true;
  if (bCategory && (bCategory === cat || bCategory.includes(cat) || cat.includes(bCategory))) return true;
  if (bType && (bType === cat || bType.includes(cat) || cat.includes(bType))) return true;

  return false;
};
