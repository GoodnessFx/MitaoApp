import { PrismaClient } from '@prisma/client';
import { sourcingProviderRegistry } from './index';
import { mapProcurementStatusToCustomerStatus } from '../utils/status-mapper';

const prisma = new PrismaClient();

export class ProcurementService {
  /**
   * Triggered asynchronously after a customer places an order.
   * Groups items by supplier and places procurement orders with the ERP/Agent.
   */
  static async processCustomerOrder(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) throw new Error('Order not found');

    const products = await prisma.product.findMany({
      where: { id: { in: order.items.map((item) => item.productId) } },
      include: {
        supplierProduct: true,
        variants: true,
      },
    });

    const enrichedItems = order.items.map((item) => ({
      ...item,
      product: products.find((product) => product.id === item.productId),
      variant: products
        .find((product) => product.id === item.productId)
        ?.variants.find((variant) => variant.id === item.variantId),
    }));

    // In a real system, you'd group order.items by sourcing provider.
    // For this implementation, we assume all come from our primary provider
    const provider = sourcingProviderRegistry['cj_dropshipping'];
    
    if (!provider) {
       console.error('Sourcing provider not configured');
       return;
    }

    try {
      const providerResponse = await provider.placeOrder(
        order.orderNumber,
        enrichedItems,
        order.shippingAddress
      );

      const firstSupplier = enrichedItems.find((item) => item.product?.supplierProduct)?.product?.supplierProduct;
      const normalizedProviderStatus = 'submitted';

      await prisma.procurementOrder.create({
        data: {
          orderId: order.id,
          sourcingProviderKey: provider.key,
          providerOrderId: providerResponse.providerOrderId,
          providerTrackingId: null,
          publicTrackingRef: null,
          supplierId: firstSupplier?.supplierId || 'CJ',
          supplierName: firstSupplier?.supplierName || 'CJ Dropshipping',
          shipmentLabel: 'CJ Manual Payment Order',
          providerStatus: normalizedProviderStatus,
          customerStatus: mapProcurementStatusToCustomerStatus(normalizedProviderStatus as any),
          costPaid: providerResponse.costPaid,
          estimatedDeliveryWindow: providerResponse.estimatedDeliveryWindow,
          itemProductIds: order.items.map((item) => item.productId),
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
        customerStatus: { notIn: ['Delivered', 'Cancelled'] },
      },
      include: {
        order: true,
      },
    });

    for (const po of activeOrders) {
      const provider = sourcingProviderRegistry[po.sourcingProviderKey];
      if (!provider || !po.providerOrderId) continue;

      try {
        const update = await provider.getOrderStatus(po.providerOrderId);

        if (
          update.providerStatus !== po.providerStatus ||
          update.providerTrackingId !== po.providerTrackingId ||
          update.shipmentLabel !== po.shipmentLabel
        ) {
          const nextCustomerStatus = mapProcurementStatusToCustomerStatus(update.providerStatus as any);

          await prisma.procurementOrder.update({
            where: { id: po.id },
            data: {
              providerStatus: update.providerStatus,
              providerTrackingId: update.providerTrackingId || po.providerTrackingId,
              shipmentLabel: update.shipmentLabel || po.shipmentLabel,
              customerStatus: nextCustomerStatus,
            }
          });

          await prisma.order.update({
            where: { id: po.orderId },
            data: {
              status: nextCustomerStatus,
            },
          });

          console.log(`📦 Status updated for ${po.id}: ${update.providerStatus}`);
        }
      } catch (error) {
         console.error(`❌ Failed to poll status for ${po.id}`, error);
      }
    }
  }
}
