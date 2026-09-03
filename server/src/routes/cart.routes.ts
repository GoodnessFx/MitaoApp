import { Router } from 'express';
import { requireAuth } from '../middleware/auth';

export const cartRoutes = Router();

cartRoutes.use(requireAuth);

// These are stubs for Phase 2. They will interface with a CartService.
cartRoutes.get('/', (req, res) => {
  res.json({ items: [], subtotal: 0 });
});

cartRoutes.post('/', (req, res) => {
  res.status(201).json({ message: 'Added to cart' });
});

cartRoutes.put('/:id', (req, res) => {
  res.json({ message: 'Cart updated' });
});

cartRoutes.delete('/:id', (req, res) => {
  res.json({ message: 'Item removed' });
});
