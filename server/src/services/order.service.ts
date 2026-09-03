import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export class OrderService {
  static async createOrder(userId: string, data: {
    items: Array<{ productId: number; variantId?: string; quantity: number }>;
    shippingAddress: any;
    paymentMethodLabel: string;
  }) {
    // 1. Fetch products to calculate totals securely
    const productIds = data.items.map(i => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { variants: true }
    });

    if (products.length !== data.items.length) {
      throw new Error('One or more products not found');
    }

    let subtotal = 0;
    const orderItems = data.items.map(item => {
      const product = products.find(p => p.id === item.productId)!;
      let unitPrice = Number(product.basePriceUsd);
      let title = product.title;
      let image = Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : null;

      if (item.variantId) {
        const variant = product.variants.find(v => v.id === item.variantId);
        if (!variant) throw new Error(`Variant not found for product ${product.id}`);
        if (variant.priceOverride) {
          unitPrice = Number(variant.priceOverride);
        }
        title = `${product.title} - ${variant.color || ''} ${variant.size || ''}`.trim();
        if (variant.images && Array.isArray(variant.images) && variant.images.length > 0) {
          image = variant.images[0];
        }
      }

      subtotal += unitPrice * item.quantity;

      return {
        productId: product.id,
        variantId: item.variantId,
        title,
        image: image as string,
        unitPrice,
        quantity: item.quantity,
      };
    });

    const shippingCost = 0.00; // Free shipping
    const tax = subtotal * 0.00; // Assuming 0% for now
    const total = subtotal + shippingCost + tax;

    // 2. Create the order
    const orderNumber = `MT-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

    const order = await prisma.order.create({
      data: {
        userId,
        orderNumber,
        status: 'Processing',
        subtotal,
        shippingCost,
        tax,
        total,
        currency: 'USD',
        paymentMethodLabel: data.paymentMethodLabel,
        shippingAddress: data.shippingAddress,
        items: {
          create: orderItems,
        }
      },
      include: { items: true }
    });

    // TODO: Trigger procurement job asynchronously here

    return order;
  }

  static async getOrders(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async getOrderById(userId: string, orderId: string) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
      include: { items: true, procurementOrders: true, payments: true }
    });

    if (!order) {
      throw new Error('Order not found');
    }

    return order;
  }
}
