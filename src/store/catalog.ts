import { PRODUCTS, type Product } from "../data/products";
import { DsFulfillSandboxProvider, type SupplierProduct, type SourcingProviderKey } from "./sourcingProvider";

type Listener = () => void;

export interface CatalogSyncJob {
  id: string;
  provider: SourcingProviderKey;
  startedAt: string;
  endedAt: string;
  status: "success" | "updated";
  productsAdded: number;
  productsUpdated: number;
  productsRemoved: number;
  errors: string[];
}

const IMPORTED_PRODUCTS_KEY = "mitao.catalog.importedProducts.v2";
const SUPPLIER_PRODUCTS_KEY = "mitao.catalog.supplierProducts.v2";
const SYNC_JOBS_KEY = "mitao.catalog.syncJobs.v2";

const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&h=900&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=900&h=900&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&h=900&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=900&h=900&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1582582494700-26c0a3ebf9e5?w=900&h=900&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=900&h=900&fit=crop&auto=format",
];

const RAW_TITLES = [
  "Factory-direct premium casualwear set",
  "Wholesale home storage organizer",
  "Lightweight running sneaker batch listing",
  "Beauty device multi-variant supplier listing",
  "Kitchen essential bundle with tier pricing",
  "Fashion accessory series with fast restock",
];

const CATEGORY_HINTS = [
  "Women's Clothing",
  "Home & Kitchen",
  "Sports & Outdoors",
  "Beauty & Personal Care",
  "Electronics",
  "Jewelry & Accessories",
];

const SUPPLIER_NAMES = [
  "Guangzhou Harmony Trading",
  "Yiwu Nova Source",
  "Shenzhen Peak Supply",
  "Hangzhou Velvet Home",
  "Quanzhou Motion Goods",
  "Ningbo Bright Factory",
];

function safeParse<T>(json: string | null, fallback: T): T {
  if (!json) return fallback;
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

function safeWrite(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage errors in private browsing or restricted environments.
  }
}

function nowId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

function pick<T>(items: T[], seed: number) {
  return items[Math.abs(seed) % items.length];
}

function seededNumber(seed: number, min: number, max: number) {
  return min + (Math.abs(seed) % (max - min + 1));
}

function normalizeUrl(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  return `https://${trimmed}`;
}

function buildRetailPrice(rawWholesalePrice: number, seed: number) {
  const usdRate = 0.14;
  const landedCost = rawWholesalePrice * usdRate + seededNumber(seed, 6, 12);
  const processingBuffer = landedCost * 0.045;
  const marginMultiplier = 1.42 + (seed % 9) * 0.015;
  return Number(((landedCost + processingBuffer) * marginMultiplier).toFixed(2));
}

function createImportRecords(url: string) {
  const seed = Array.from(url).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const publicProductId = nowId();
  const supplierName = pick(SUPPLIER_NAMES, seed);
  const supplierId = `supplier-${seededNumber(seed, 1000, 9999)}`;
  const providerProductId = `dsf-${seededNumber(seed, 100000, 999999)}`;
  const rawWholesalePrice = Number((seededNumber(seed, 18, 180) + (seed % 7) * 0.35).toFixed(2));
  const price = buildRetailPrice(rawWholesalePrice, seed);
  const originalPrice = Number((price * (1.38 + (seed % 5) * 0.07)).toFixed(2));
  const img1 = pick(PLACEHOLDER_IMAGES, seed);
  const img2 = pick(PLACEHOLDER_IMAGES, seed + 7);
  const img3 = pick(PLACEHOLDER_IMAGES, seed + 13);
  const category = pick(CATEGORY_HINTS, seed);

  const supplierProduct: SupplierProduct = {
    id: `supplier-product-${publicProductId}`,
    publicProductId,
    provider: "dsfulfill_sandbox",
    providerProductId,
    supplierId,
    supplierName,
    rawTitle: pick(RAW_TITLES, seed),
    rawCurrency: "CNY",
    rawWholesalePrice,
    moq: seededNumber(seed, 2, 12),
    tierPricing: [
      { minQty: 2, price: Number((rawWholesalePrice * 0.98).toFixed(2)) },
      { minQty: 5, price: Number((rawWholesalePrice * 0.94).toFixed(2)) },
      { minQty: 10, price: Number((rawWholesalePrice * 0.9).toFixed(2)) },
    ],
    attributes: {
      Sourcing: "Cross-border catalog sync",
      Inspection: "Optional quality check before export",
      Dispatch: "Supplier to consolidation warehouse",
    },
    imageSet: [img1, img2, img3],
    sourceUrl: url,
    categoryHint: category,
    lastSyncedAt: new Date().toISOString(),
  };

  const publicProduct: Product = {
    id: publicProductId,
    title: `${pick(["Premium", "Curated", "Popular", "Verified", "Fast-moving"], seed)} ${pick(["Global", "Warehouse", "Sourced", "Cross-border", "Wholesale"], seed + 1)} ${pick(["Find", "Listing", "Drop", "Selection", "Deal"], seed + 2)}`,
    price,
    originalPrice,
    sold: `${seededNumber(seed, 1, 9)}.${seed % 10}k+ sold`,
    rating: 4.5 + (seed % 5) * 0.1,
    reviews: seededNumber(seed, 240, 4200),
    image: img1,
    images: [img1, img2, img3],
    badge: "Global Source",
    colors: seededNumber(seed, 3, 8),
    colorOptions: ["#111111", "#FFFFFF", "#2563EB", "#F97316", "#10B981", "#8B5CF6"],
    merit: "Curated from Mitao's sourcing network",
    brand: "Mitao Global",
    starSeller: true,
    tag: "Cross-border fulfillment by Mitao",
    category,
    description:
      "This item is sourced through Mitao's cross-border procurement network. Mitao handles supplier coordination, quality checks, checkout, shipping updates, and customer support inside the app.",
    specs: {
      Fulfillment: "Managed by Mitao Global",
      Inspection: "Pre-shipment quality check available",
      Delivery: "Cross-border consolidated shipping",
      Support: "Mitao support handles supplier communication",
    },
    seller: {
      name: "Mitao Global Sourcing",
      rating: 4.9,
      sales: `${seededNumber(seed, 18, 88)}k sourced`,
      responseTime: "< 1 hour",
      avatar: "MG",
    },
    shipping: `Mitao global shipping · Est. delivery ${seededNumber(seed, 7, 10)}-${seededNumber(seed, 11, 16)} business days`,
    stock: seededNumber(seed, 40, 520),
    sourceType: "global-sourcing",
  };

  return { supplierProduct, publicProduct };
}

let importedProducts: Product[] = safeParse(
  typeof window !== "undefined" ? localStorage.getItem(IMPORTED_PRODUCTS_KEY) : null,
  []
);
let supplierProducts: SupplierProduct[] = safeParse(
  typeof window !== "undefined" ? localStorage.getItem(SUPPLIER_PRODUCTS_KEY) : null,
  []
);
let syncJobs: CatalogSyncJob[] = safeParse(
  typeof window !== "undefined" ? localStorage.getItem(SYNC_JOBS_KEY) : null,
  []
);

const listeners: Set<Listener> = new Set();

function notify() {
  listeners.forEach((listener) => listener());
}

function persist() {
  safeWrite(IMPORTED_PRODUCTS_KEY, importedProducts);
  safeWrite(SUPPLIER_PRODUCTS_KEY, supplierProducts);
  safeWrite(SYNC_JOBS_KEY, syncJobs);
}

export const sourcingProviderRegistry = {
  dsfulfill_sandbox: new DsFulfillSandboxProvider(() => supplierProducts),
};

export const catalogStore = {
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getAll() {
    return [...importedProducts, ...PRODUCTS];
  },
  getImported() {
    return importedProducts;
  },
  getById(id: number) {
    return importedProducts.find((product) => product.id === id) ?? PRODUCTS.find((product) => product.id === id);
  },
  getSupplierProductByPublicId(publicProductId: number) {
    return supplierProducts.find((product) => product.publicProductId === publicProductId);
  },
  getSyncJobs() {
    return syncJobs;
  },
  async importFromUrl(urlInput: string) {
    const url = normalizeUrl(urlInput);
    if (!url) {
      throw new Error("Paste a valid 1688 product link.");
    }

    const existing = supplierProducts.find((product) => product.sourceUrl === url);
    if (existing) {
      const existingProduct = importedProducts.find((product) => product.id === existing.publicProductId);
      if (!existingProduct) {
        throw new Error("This sourced item exists but its public catalog record is missing.");
      }

      syncJobs = [
        {
          id: `sync-${Date.now()}`,
          provider: "dsfulfill_sandbox",
          startedAt: new Date().toISOString(),
          endedAt: new Date().toISOString(),
          status: "updated",
          productsAdded: 0,
          productsUpdated: 1,
          productsRemoved: 0,
          errors: [],
        },
        ...syncJobs,
      ].slice(0, 24);
      persist();
      notify();
      return existingProduct;
    }

    await new Promise((resolve) => setTimeout(resolve, 850));
    const { supplierProduct, publicProduct } = createImportRecords(url);

    importedProducts = [publicProduct, ...importedProducts];
    supplierProducts = [supplierProduct, ...supplierProducts];
    syncJobs = [
      {
        id: `sync-${Date.now()}`,
        provider: "dsfulfill_sandbox",
        startedAt: new Date().toISOString(),
        endedAt: new Date().toISOString(),
        status: "success",
        productsAdded: 1,
        productsUpdated: 0,
        productsRemoved: 0,
        errors: [],
      },
      ...syncJobs,
    ].slice(0, 24);

    persist();
    notify();
    return publicProduct;
  },
  clearImports() {
    importedProducts = [];
    supplierProducts = [];
    syncJobs = [];
    persist();
    notify();
  },
};

export const import1688Store = {
  subscribe: catalogStore.subscribe,
  getAll: catalogStore.getImported,
  getById(id: number) {
    return catalogStore.getImported().find((product) => product.id === id);
  },
  clear: catalogStore.clearImports,
  importFromUrl: catalogStore.importFromUrl,
  getSyncJobs: catalogStore.getSyncJobs,
  getSupplierProductByPublicId: catalogStore.getSupplierProductByPublicId,
};
