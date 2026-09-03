import { SourcingProvider } from './sourcing-provider.interface';

export class DsFulfillSandboxProvider implements SourcingProvider {
  readonly key = 'dsfulfill_sandbox';

  async connect(): Promise<boolean> {
    console.log('[DSFulfill Sandbox] Connecting...');
    await new Promise(resolve => setTimeout(resolve, 500));
    return true;
  }

  async fetchCatalog(lastSyncedAt?: Date) {
    console.log('[DSFulfill Sandbox] Fetching catalog...');
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate fetching a catalog
    return {
      added: [],
      updated: [],
      removed: []
    };
  }

  async getProductDetail(providerProductId: string) {
    return {
      providerProductId,
      rawTitle: 'Sandbox Product',
      rawCurrency: 'CNY',
      rawWholesalePrice: 150.00,
      moq: 1,
    };
  }

  async placeOrder(orderId: string, items: any[], shippingAddress: any) {
    console.log(`[DSFulfill Sandbox] Placing order for ${orderId}...`);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      providerOrderId: `DSF-${Math.floor(Math.random() * 1000000)}`,
      costPaid: 12.50,
      estimatedDeliveryWindow: '7-12 business days'
    };
  }

  async getOrderStatus(providerOrderId: string) {
    return {
      providerStatus: 'warehouse_received',
      providerTrackingId: `TRK-${Math.floor(Math.random() * 1000000)}`,
    };
  }
}
