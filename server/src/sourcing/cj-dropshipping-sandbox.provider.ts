import { SourcingProvider, ProductSummary, ProductDetail, ProcurementOrder, ProcurementStatus } from './sourcing-provider.interface';

/**
 * Sandbox implementation for CJDropshipping.
 * 
 * Provides mock data formatted exactly as CJDropshipping's API returns it,
 * allowing Mitao to test the entire sourcing flow without requiring real 
 * CJ API keys or making real purchases.
 */
export class CJDropshippingSandboxProvider implements SourcingProvider {
  name = 'CJDropshipping Sandbox';
  key = 'cjdropshipping';

  async searchCatalog(query: string): Promise<ProductSummary[]> {
    console.log(`[CJDropshipping Sandbox] Searching catalog for "${query}"`);
    return [
      {
        providerProductId: 'CJ-PROD-999123',
        supplierId: 'CJ-SUPP-1',
        supplierName: 'Guangzhou Fast Fashion Co.',
        title: 'Korean Style High Waist Wide Leg Pants',
        wholesalePriceCny: 35.0, // ~ $4.90 USD
        imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=500&h=500&fit=crop',
        moq: 1,
        category: 'Women\'s Fashion'
      },
      {
        providerProductId: 'CJ-PROD-999124',
        supplierId: 'CJ-SUPP-2',
        supplierName: 'Shenzhen Tech Factory',
        title: 'TWS Wireless Earbuds Bluetooth 5.3',
        wholesalePriceCny: 42.0, // ~ $5.80 USD
        imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&h=500&fit=crop',
        moq: 2,
        category: 'Electronics'
      }
    ];
  }

  async getProductDetail(providerId: string): Promise<ProductDetail> {
    console.log(`[CJDropshipping Sandbox] Fetching details for ${providerId}`);
    return {
      providerProductId: providerId,
      supplierId: 'CJ-SUPP-1',
      supplierName: 'Guangzhou Fast Fashion Co.',
      title: 'Korean Style High Waist Wide Leg Pants',
      description: 'High quality wide leg pants for summer. Lightweight and breathable.',
      wholesalePriceCny: 35.0,
      moq: 1,
      images: [
        'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?w=800&h=800&fit=crop'
      ],
      variants: [
        { sku: `${providerId}-S-BLK`, priceCny: 35.0, attributes: { Size: 'S', Color: 'Black' }, stock: 999 },
        { sku: `${providerId}-M-BLK`, priceCny: 35.0, attributes: { Size: 'M', Color: 'Black' }, stock: 999 }
      ]
    };
  }

  async placeOrder(cartItems: any[], shippingAddress: any): Promise<ProcurementOrder> {
    console.log(`[CJDropshipping Sandbox] Placing order for ${cartItems.length} items`);
    return {
      providerOrderId: `CJ-ORD-${Date.now()}`,
      providerStatus: 'Pending',
      totalCostCny: cartItems.length * 35.0,
      estimatedDeliveryDays: '7-12'
    };
  }

  async getOrderStatus(providerOrderId: string): Promise<ProcurementStatus> {
    console.log(`[CJDropshipping Sandbox] Checking status for ${providerOrderId}`);
    return {
      providerOrderId,
      status: 'Shipped', // Mapping: Processing -> Shipped -> Delivered
      trackingNumber: `CJ-TRK-${Date.now().toString().slice(-6)}`,
      trackingUrl: 'https://cjdropshipping.com/tracking'
    };
  }
}
