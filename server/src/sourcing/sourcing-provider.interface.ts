import { Product, SupplierProduct, ProcurementOrder } from '@prisma/client';

export interface SourcingProvider {
  /**
   * Unique identifier for this provider (e.g., 'dsfulfill')
   */
  readonly key: string;

  /**
   * Initialize or test the connection to the provider
   */
  connect(): Promise<boolean>;

  /**
   * Fetch the latest catalog of products from the supplier
   */
  fetchCatalog(lastSyncedAt?: Date): Promise<{
    added: Array<Partial<SupplierProduct>>;
    updated: Array<Partial<SupplierProduct>>;
    removed: Array<string>; // Array of providerProductIds
  }>;

  /**
   * Get detailed information for a specific product
   */
  getProductDetail(providerProductId: string): Promise<Partial<SupplierProduct>>;

  /**
   * Place an order with the supplier
   */
  placeOrder(orderId: string, items: any[], shippingAddress: any): Promise<{
    providerOrderId: string;
    costPaid: number;
    estimatedDeliveryWindow: string;
  }>;

  /**
   * Check the fulfillment status of a procurement order
   */
  getOrderStatus(providerOrderId: string): Promise<{
    providerStatus: string;
    providerTrackingId?: string;
    shipmentLabel?: string;
  }>;
}
