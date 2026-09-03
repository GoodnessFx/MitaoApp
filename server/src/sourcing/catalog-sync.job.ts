import cron from 'cron';
import { PrismaClient } from '@prisma/client';
import { DsFulfillSandboxProvider } from './dsfulfill-sandbox.provider';

const prisma = new PrismaClient();
const provider = new DsFulfillSandboxProvider();

export class CatalogSyncJob {
  private job: cron.CronJob;

  constructor() {
    // Run every 4 hours: 0 */4 * * *
    this.job = new cron.CronJob('0 */4 * * *', async () => {
      await this.runSync();
    });
  }

  start() {
    console.log('🔄 Starting Catalog Sync Job Schedule (runs every 4 hours)');
    this.job.start();
  }

  async runSync() {
    console.log('🔄 Running Catalog Sync...');
    const syncJob = await prisma.catalogSyncJob.create({
      data: {
        sourcingProviderKey: provider.key,
        status: 'running',
      }
    });

    try {
      // 1. Fetch from provider
      const catalogData = await provider.fetchCatalog();
      
      // 2. Map and Upsert into database
      // Here we would apply the landed cost calculations and markup
      // For now, it's a stub implementation
      
      await prisma.catalogSyncJob.update({
        where: { id: syncJob.id },
        data: {
          status: 'success',
          endedAt: new Date(),
          productsAdded: catalogData.added.length,
          productsUpdated: catalogData.updated.length,
          productsRemoved: catalogData.removed.length,
        }
      });
      
      console.log('✅ Catalog Sync completed successfully');
    } catch (error: any) {
      console.error('❌ Catalog Sync failed', error);
      await prisma.catalogSyncJob.update({
        where: { id: syncJob.id },
        data: {
          status: 'failed',
          endedAt: new Date(),
          errors: [error.message],
        }
      });
    }
  }
}
