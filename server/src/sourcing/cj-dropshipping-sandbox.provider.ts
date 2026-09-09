import { Prisma } from '@prisma/client';
import { SourcingProvider } from './sourcing-provider.interface';

const SANDBOX_PRODUCTS = [
  {
    providerProductId: 'CJ-PROD-999123',
    supplierId: 'CJ-SUPP-1',
    supplierName: 'Guangzhou Fast Fashion Co.',
    rawTitle: 'Korean Style High Waist Wide Leg Pants',
    rawWholesalePrice: 35,
    moq: 1,
    imageSet: [
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?w=800&h=800&fit=crop',
    ],
    categoryHint: "Women's Fashion",
    variants: [
      { vid: 'CJ-VID-999123-S-BLK', sku: 'CJ-PROD-999123-S-BLK', size: 'S', color: 'Black', stock: 999, priceCny: 35 },
      { vid: 'CJ-VID-999123-M-BLK', sku: 'CJ-PROD-999123-M-BLK', size: 'M', color: 'Black', stock: 999, priceCny: 35 },
    ],
  },
  {
    providerProductId: 'CJ-PROD-999124',
    supplierId: 'CJ-SUPP-2',
    supplierName: 'Shenzhen Tech Factory',
    rawTitle: 'TWS Wireless Earbuds Bluetooth 5.3',
    rawWholesalePrice: 42,
    moq: 2,
    imageSet: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&h=800&fit=crop',
    ],
    categoryHint: 'Electronics',
    variants: [
      { vid: 'CJ-VID-999124-WHT', sku: 'CJ-PROD-999124-WHT', color: 'White', stock: 500, priceCny: 42 },
      { vid: 'CJ-VID-999124-BLK', sku: 'CJ-PROD-999124-BLK', color: 'Black', stock: 500, priceCny: 42 },
    ],
  },
];

function toDecimal(value: number) {
  return new Prisma.Decimal(value.toFixed(2));
}

export class CJDropshippingSandboxProvider implements SourcingProvider {
  readonly key = 'cj_dropshipping_sandbox';

  async connect(): Promise<boolean> {
    console.log('[CJDropshipping Sandbox] Connecting...');
    return true;
  }

  async fetchCatalog() {
    console.log('[CJDropshipping Sandbox] Fetching catalog...');
    return {
      added: SANDBOX_PRODUCTS.map((product) => ({
        providerProductId: product.providerProductId,
        supplierId: product.supplierId,
        supplierName: product.supplierName,
        rawTitle: product.rawTitle,
        rawCurrency: 'CNY',
        rawWholesalePrice: toDecimal(product.rawWholesalePrice),
        moq: product.moq,
        imageSet: product.imageSet,
        categoryHint: product.categoryHint,
        sourceUrl: `https://cjdropshipping.com/product/${product.providerProductId}.html`,
        rawAttributes: {
          summary: product,
          variants: product.variants,
        },
      })),
      updated: [],
      removed: [],
    };
  }

  async getProductDetail(providerProductId: string) {
    const product = SANDBOX_PRODUCTS.find((entry) => entry.providerProductId === providerProductId) ?? SANDBOX_PRODUCTS[0];
    console.log(`[CJDropshipping Sandbox] Fetching details for ${providerProductId}`);
    return {
      providerProductId,
      supplierId: product.supplierId,
      supplierName: product.supplierName,
      rawTitle: product.rawTitle,
      rawCurrency: 'CNY',
      rawWholesalePrice: toDecimal(product.rawWholesalePrice),
      moq: product.moq,
      imageSet: product.imageSet,
      categoryHint: product.categoryHint,
      sourceUrl: `https://cjdropshipping.com/product/${providerProductId}.html`,
      rawAttributes: {
        summary: product,
        description: 'Sandbox product used for local sourcing tests.',
        variants: product.variants,
        stockByVariant: Object.fromEntries(product.variants.map((variant) => [variant.vid, variant.stock])),
      },
    };
  }

  async placeOrder(orderId: string, items: any[]) {
    console.log(`[CJDropshipping Sandbox] Placing order for ${orderId}`);
    return {
      providerOrderId: `CJ-SANDBOX-${Date.now()}`,
      costPaid: items.reduce((sum, item) => sum + Number(item.unitPrice || 0) * Number(item.quantity || 1), 0),
      estimatedDeliveryWindow: '7-12 business days',
    };
  }

  async getOrderStatus(providerOrderId: string) {
    console.log(`[CJDropshipping Sandbox] Checking status for ${providerOrderId}`);
    return {
      providerStatus: 'warehouse_received',
      providerTrackingId: `CJ-TRK-${Date.now().toString().slice(-6)}`,
      shipmentLabel: 'CJ Sandbox Shipment',
    };
  }
}
