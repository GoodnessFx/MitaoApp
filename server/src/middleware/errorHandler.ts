import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(`[Error] ${req.method} ${req.path}`, err);

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.errors,
    });
  }

  // Handle JWT errors
  if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  
  if (err.name === 'TokenExpiredError') {
     return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
  }

  // Prisma errors (unique constraint violation etc.)
  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'A resource with that unique identifier already exists.' });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({ error: message });
}
