import { Router } from 'express';
import { z } from 'zod';
import { OrderService } from '../services/order.service';
import { requireAuth } from '../middleware/auth';

export const orderRoutes = Router();

// Require auth for all order routes
orderRoutes.use(requireAuth);

const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.number(),
    variantId: z.string().optional(),
    quantity: z.number().min(1),
  })).min(1),
  shippingAddress: z.any(), // Add stricter validation based on address form
  paymentMethodLabel: z.string(),
});

orderRoutes.post('/', async (req, res, next) => {
  try {
    const data = createOrderSchema.parse(req.body);
    // requireAuth ensures req.user is set
    const order = await OrderService.createOrder(req.user!.id, data);
    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
});

orderRoutes.get('/', async (req, res, next) => {
  try {
    const orders = await OrderService.getOrders(req.user!.id);
    res.json(orders);
  } catch (error) {
    next(error);
  }
});

orderRoutes.get('/:id', async (req, res, next) => {
  try {
    const order = await OrderService.getOrderById(req.user!.id, req.params.id);
    res.json(order);
  } catch (error) {
    if (error instanceof Error && error.message === 'Order not found') {
      res.status(404).json({ error: error.message });
    } else {
      next(error);
    }
  }
});
