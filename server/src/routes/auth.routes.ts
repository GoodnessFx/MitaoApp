import { Router } from 'express';
import { z } from 'zod';
import { AuthService } from '../services/auth.service';
import { authLimiter } from '../middleware/rateLimiter';

export const authRoutes = Router();

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

authRoutes.post('/signup', authLimiter, async (req, res, next) => {
  try {
    const data = signupSchema.parse(req.body);
    const result = await AuthService.signup(data);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

authRoutes.post('/login', authLimiter, async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    const result = await AuthService.login(data);
    res.json(result);
  } catch (error) {
    // If it's our custom error for invalid credentials, send a 401
    if (error instanceof Error && error.message.includes('Invalid email')) {
      res.status(401).json({ error: error.message });
    } else {
      next(error);
    }
  }
});
