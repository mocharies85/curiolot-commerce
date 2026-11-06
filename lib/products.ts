export interface Product {
  id: string;
  username?: string;
  title: string;
  slug: string;
  category: string;
  price: number;
  originalPrice?: number | null;
  badge?: string;
  coverUrl: string;
  paymentUrl: string;
  fileFormat: string;
  description: string;
  features: string[];
  downloads: number;
  isActive: boolean;
  createdAt?: string;
  fileName?: string | null;
  fileSize?: string | null;
}

declare global {
  var globalProducts: Product[] | undefined;
}

if (!globalThis.globalProducts) {
  globalThis.globalProducts = [];
}

export function getAllProducts(username: string): Product[] {
  const userKey = username.toLowerCase();
  return (globalThis.globalProducts || []).filter(
    (p) => (p.username || "aries").toLowerCase() === userKey
  );
}

export function getPublicProducts(username: string): Product[] {
  return getAllProducts(username).filter((p) => p.isActive);
}

export function getProductBySlug(username: string, slug: string): Product | undefined {
  const userKey = username.toLowerCase();
  const targetSlug = slug.toLowerCase();
  return (globalThis.globalProducts || []).find(
    (p) => (p.username || "aries").toLowerCase() === userKey && p.slug.toLowerCase() === targetSlug
  );
}

export function addProduct(username: string, data: Partial<Product>): Product {
  if (!globalThis.globalProducts) {
    globalThis.globalProducts = [];
  }

  const newProduct: Product = {
    id: data.id || `prod_${Date.now()}`,
    username: username.toLowerCase(),
    title: data.title || "Untitled Product",
    slug: data.slug || `product-${Date.now()}`,
    category: data.category || "E-Books & Guides",
    price: data.price !== undefined ? data.price : 0,
    originalPrice: data.originalPrice || null,
    badge: data.badge || "",
    coverUrl: data.coverUrl || "",
    paymentUrl: data.paymentUrl || "",
    fileFormat: data.fileFormat || "PDF",
    description: data.description || "",
    features: data.features || [],
    downloads: data.downloads || 0,
    isActive: data.isActive !== undefined ? data.isActive : true,
    createdAt: data.createdAt || new Date().toISOString(),
    fileName: data.fileName || null,
    fileSize: data.fileSize || null,
  };

  globalThis.globalProducts.unshift(newProduct);
  return newProduct;
}

export function updateProductStatus(id: string, isActive: boolean): Product | null {
  if (!globalThis.globalProducts) return null;
  const idx = globalThis.globalProducts.findIndex((p) => p.id === id);
  if (idx !== -1) {
    globalThis.globalProducts[idx].isActive = isActive;
    return globalThis.globalProducts[idx];
  }
  return null;
}

export function deleteProduct(id: string): boolean {
  if (!globalThis.globalProducts) return false;
  const prevLen = globalThis.globalProducts.length;
  globalThis.globalProducts = globalThis.globalProducts.filter((p) => p.id !== id);
  return globalThis.globalProducts.length < prevLen;
}