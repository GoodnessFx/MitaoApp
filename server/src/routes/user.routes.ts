import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const userRoutes = Router();

userRoutes.use(requireAuth);

userRoutes.get('/profile', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        preferredCurrency: true,
        walletBalance: true,
        createdAt: true,
      }
    });
    res.json(user);
  } catch (error) {
    next(error);
  }
});
