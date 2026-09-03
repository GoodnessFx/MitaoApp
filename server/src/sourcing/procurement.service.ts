import { PrismaClient } from '@prisma/client';
import { sourcingProviderRegistry } from './index';

const prisma = new PrismaClient();

export class ProcurementService {
  /**
   * Triggered asynchronously after a customer places an order.
   * Groups items by supplier and places procurement orders with the ERP/Agent.
   */
  static async processCustomerOrder(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true }
    });

    if (!order) throw new Error('Order not found');

    // In a real system, you'd group order.items by sourcing provider.
    // For this implementation, we assume all come from our primary provider
    const provider = sourcingProviderRegistry['dsfulfill_sandbox'];
    
    if (!provider) {
       console.error('Sourcing provider not configured');
       return;
    }

    try {
      // Create internal procurement order record
      const procurementOrder = await prisma.procurementOrder.create({
        data: {
          orderId: order.id,
          providerKey: provider.key,
          status: 'pending',
          costPaid: 0, // Will update after placement
        }
      });

      // Call the external provider
      const providerResponse = await provider.placeOrder(
        procurementOrder.id,
        order.items,
        order.shippingAddress
      );

      // Update local record with provider response
      await prisma.procurementOrder.update({
        where: { id: procurementOrder.id },
        data: {
          providerOrderId: providerResponse.providerOrderId,
          status: 'placed',
          costPaid: providerResponse.costPaid,
          estimatedDelivery: providerResponse.estimatedDeliveryWindow
        }
      });

      console.log(`✅ Procurement Order Placed: ${providerResponse.providerOrderId}`);
    } catch (error) {
      console.error(`❌ Failed to place procurement order for ${orderId}`, error);
      // In production, trigger an alert to Ops team here
    }
  }

  /**
   * Polling job to check status of active procurement orders
   */
  static async pollOrderStatuses() {
    console.log('🔄 Polling for procurement order updates...');
    const activeOrders = await prisma.procurementOrder.findMany({
      where: {
        status: { notIn: ['delivered', 'cancelled'] },
        providerOrderId: { not: null }
      }
    });

    for (const po of activeOrders) {
      const provider = sourcingProviderRegistry[po.providerKey];
      if (!provider || !po.providerOrderId) continue;

      try {
        const update = await provider.getOrderStatus(po.providerOrderId);
        
        if (update.providerStatus !== po.status) {
           await prisma.procurementOrder.update({
             where: { id: po.id },
             data: {
               status: update.providerStatus,
               trackingNumber: update.providerTrackingId || po.trackingNumber
             }
           });
           
           // TODO: Implement status mapper to update Customer Order status
           // e.g. if providerStatus is 'shipped', update Customer Order to 'In Transit'
           console.log(`📦 Status updated for ${po.id}: ${update.providerStatus}`);
        }
      } catch (error) {
         console.error(`❌ Failed to poll status for ${po.id}`, error);
      }
    }
  }
}
