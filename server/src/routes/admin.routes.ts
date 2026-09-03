import { Router } from 'express';
import { requireAdminAuth } from '../middleware/adminAuth';
import { PrismaClient } from '@prisma/client';
import { CatalogSyncJob } from '../sourcing/catalog-sync.job';
import { ProcurementService } from '../sourcing/procurement.service';

const prisma = new PrismaClient();
const catalogSyncJob = new CatalogSyncJob();
export const adminRoutes = Router();

// Protect all admin routes
adminRoutes.use(requireAdminAuth);

adminRoutes.get('/stats', async (req, res, next) => {
  try {
    const [userCount, orderCount, totalRevenueAgg] = await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { not: 'Cancelled' } }
      })
    ]);

    res.json({
      users: userCount,
      orders: orderCount,
      revenue: totalRevenueAgg._sum.total || 0,
    });
  } catch (error) {
    next(error);
  }
});

adminRoutes.post('/sync-catalog', async (req, res, next) => {
  try {
    // Trigger sync manually without waiting for cron
    // Background execution
    catalogSyncJob.runSync().catch(console.error);
    res.json({ message: 'Catalog sync triggered' });
  } catch (error) {
    next(error);
  }
});

adminRoutes.post('/poll-orders', async (req, res, next) => {
  try {
    // Trigger polling manually
    ProcurementService.pollOrderStatuses().catch(console.error);
    res.json({ message: 'Order polling triggered' });
  } catch (error) {
    next(error);
  }
});

adminRoutes.get('/users', async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, status: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(users);
  } catch (error) {
    next(error);
  }
});

adminRoutes.get('/orders', async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      include: { items: true, procurementOrders: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(orders);
  } catch (error) {
    next(error);
  }
});
