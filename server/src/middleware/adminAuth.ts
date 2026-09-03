import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AdminRequest extends Request {
  adminUser?: {
    id: string;
    email: string;
    role: string;
  };
}

export async function requireAdminAuth(req: AdminRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Admin authentication required' });
    }

    const token = authHeader.split(' ')[1];
    
    const decoded = jwt.verify(token, env.ADMIN_JWT_ACCESS_SECRET) as { 
      adminId: string; 
      email: string;
      role: string;
      is2faVerified: boolean;
    };
    
    // Enforce 2FA verification from the token
    if (!decoded.is2faVerified) {
       return res.status(403).json({ error: '2FA verification required', code: '2FA_REQUIRED' });
    }
    
    // Check if admin exists and is active
    const admin = await prisma.adminUser.findUnique({
      where: { id: decoded.adminId },
      select: { id: true, email: true, status: true, role: true }
    });

    if (!admin) {
      return res.status(401).json({ error: 'Admin user not found' });
    }

    if (admin.status !== 'active') {
      return res.status(403).json({ error: 'Admin account is disabled' });
    }

    req.adminUser = { id: admin.id, email: admin.email, role: admin.role };
    next();
  } catch (error) {
    next(error);
  }
}

// Role-based authorization middleware
export function requireRole(allowedRoles: string[]) {
  return (req: AdminRequest, res: Response, next: NextFunction) => {
    if (!req.adminUser) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (req.adminUser.role !== 'super_admin' && !allowedRoles.includes(req.adminUser.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
}
