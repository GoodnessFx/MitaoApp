import { Router } from 'express';
import { z } from 'zod';
import { ProductService } from '../services/product.service';

export const productRoutes = Router();

const listSchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 20),
  category: z.string().optional(),
  search: z.string().optional(),
});

productRoutes.get('/', async (req, res, next) => {
  try {
    const query = listSchema.parse(req.query);
    const result = await ProductService.listProducts(query);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

productRoutes.get('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
       return res.status(400).json({ error: 'Invalid product ID' });
    }
    const product = await ProductService.getProductById(id);
    res.json(product);
  } catch (error) {
    if (error instanceof Error && error.message === 'Product not found') {
      res.status(404).json({ error: error.message });
    } else {
      next(error);
    }
  }
});
