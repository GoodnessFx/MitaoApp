import cron from 'cron';
import { Prisma, PrismaClient } from '@prisma/client';
import { activeProvider } from './index';
import { CostCalculator } from './cost-calculator';

const prisma = new PrismaClient();
const provider = activeProvider;

type CatalogVariant = {
  providerVariantId?: string;
  sku?: string;
  size?: string;
  color?: string;
  colorHex?: string;
  priceCny?: number;
  stock?: number;
  images?: string[];
  attributes?: Record<string, string>;
};

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function toDecimal(value: number) {
  return new Prisma.Decimal(value.toFixed(2));
}

function toNumber(value: unknown, fallback = 0) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value.replace(/[^\d.-]/g, ''));
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function firstImage(imageSet: unknown) {
  if (!Array.isArray(imageSet)) return null;
  const image = imageSet.find((value) => typeof value === 'string' && value.trim());
  return typeof image === 'string' ? image : null;
}

function extractVariants(rawAttributes: any): CatalogVariant[] {
  if (Array.isArray(rawAttributes?.variants)) return rawAttributes.variants;
  if (Array.isArray(rawAttributes?.detail?.variants)) return rawAttributes.detail.variants;
  return [];
}

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

      const providerRecord = await prisma.sourcingProvider.upsert({
        where: { key: provider.key },
        update: {
          name: provider.key === 'cj_dropshipping' ? 'CJ Dropshipping' : provider.key,
          isActive: true,
        },
        create: {
          key: provider.key,
          name: provider.key === 'cj_dropshipping' ? 'CJ Dropshipping' : provider.key,
          isActive: true,
        },
      });

      const upsertEntries = [...catalogData.added, ...catalogData.updated];

      for (const entry of upsertEntries) {
        const providerProductId = entry.providerProductId;
        if (!providerProductId) continue;

        const variantRows = extractVariants(entry.rawAttributes);
        const variantPriceFloor = variantRows.length
          ? Math.min(...variantRows.map((variant) => toNumber(variant.priceCny, 0)).filter((value) => value > 0))
          : 0;
        const sourcePrice = Math.max(
          toNumber((entry.rawWholesalePrice as any)?.toString?.() ?? entry.rawWholesalePrice, 0),
          variantPriceFloor,
        );
        const pricing = CostCalculator.calculatePricing(sourcePrice || 0);
        const imageSet = Array.isArray(entry.imageSet) ? entry.imageSet : [];
        const title = entry.rawTitle || providerProductId;
        const category = entry.categoryHint || 'Global Sourcing';
        const productSlug = `${slugify(title || providerProductId)}-${providerProductId.toLowerCase()}`.slice(0, 110);

        await prisma.$transaction(async (tx) => {
          const existingSupplier = await tx.supplierProduct.findUnique({
            where: { providerProductId },
            include: { publicProduct: true },
          });

          const productData = {
            title,
            slug: existingSupplier?.publicProduct?.slug || productSlug,
            description:
              (entry.rawAttributes as any)?.detail?.description ||
              (entry.rawAttributes as any)?.detail?.productDescription ||
              `${title} sourced via ${providerRecord.name}.`,
            basePriceUsd: toDecimal(pricing.retailPriceUsd),
            originalPrice: toDecimal(pricing.originalPriceUsd),
            category,
            subcategory: category.includes('/') ? category.split('/').slice(-1)[0]?.trim() : null,
            brand: entry.supplierName || providerRecord.name,
            images: imageSet,
            specs: (entry.rawAttributes as any)?.detail?.specs || (entry.rawAttributes as any)?.summary || {},
            badge: (entry.rawAttributes as any)?.summary?.isFreeShipping ? 'Free Shipping' : null,
            stock: variantRows.reduce((sum, variant) => sum + Math.max(0, Math.round(toNumber(variant.stock, 0))), 0),
            rating: new Prisma.Decimal('0'),
            reviewCount: 0,
            soldCount: null,
            sellerId: 'mitao',
            sourceType: 'global-sourcing',
            supplierProductId: providerProductId,
            isActive: true,
          };

          let publicProductId = existingSupplier?.publicProductId ?? existingSupplier?.publicProduct?.id;

          if (publicProductId) {
            await tx.product.update({
              where: { id: publicProductId },
              data: productData,
            });
          } else {
            const createdProduct = await tx.product.create({
              data: productData,
            });
            publicProductId = createdProduct.id;
          }

          await tx.supplierProduct.upsert({
            where: { providerProductId },
            update: {
              sourcingProviderId: providerRecord.id,
              supplierId: entry.supplierId || 'CJ',
              supplierName: entry.supplierName || providerRecord.name,
              rawTitle: title,
              rawCurrency: entry.rawCurrency || 'CNY',
              rawWholesalePrice: entry.rawWholesalePrice ?? toDecimal(sourcePrice),
              moq: entry.moq ?? 1,
              tierPricing: entry.tierPricing ?? null,
              rawAttributes: entry.rawAttributes ?? null,
              imageSet,
              sourceUrl: entry.sourceUrl ?? null,
              categoryHint: entry.categoryHint ?? null,
              landedCost: entry.landedCost ?? toDecimal(pricing.landedCostUsd),
              markupAmount: entry.markupAmount ?? toDecimal(pricing.mitaoProfitUsd),
              publicProductId,
              lastSyncedAt: new Date(),
            },
            create: {
              sourcingProviderId: providerRecord.id,
              providerProductId,
              supplierId: entry.supplierId || 'CJ',
              supplierName: entry.supplierName || providerRecord.name,
              rawTitle: title,
              rawCurrency: entry.rawCurrency || 'CNY',
              rawWholesalePrice: entry.rawWholesalePrice ?? toDecimal(sourcePrice),
              moq: entry.moq ?? 1,
              tierPricing: entry.tierPricing ?? null,
              rawAttributes: entry.rawAttributes ?? null,
              imageSet,
              sourceUrl: entry.sourceUrl ?? null,
              categoryHint: entry.categoryHint ?? null,
              landedCost: entry.landedCost ?? toDecimal(pricing.landedCostUsd),
              markupAmount: entry.markupAmount ?? toDecimal(pricing.mitaoProfitUsd),
              publicProductId,
              lastSyncedAt: new Date(),
            },
          });

          if (publicProductId) {
            await tx.productVariant.deleteMany({
              where: { productId: publicProductId },
            });

            if (variantRows.length) {
              await tx.productVariant.createMany({
                data: variantRows.map((variant, index) => ({
                  productId: publicProductId!,
                  sku: variant.sku || `${providerProductId}-${index + 1}`,
                  size: variant.size || variant.attributes?.Size || null,
                  color: variant.color || variant.attributes?.Color || null,
                  colorHex: variant.colorHex || null,
                  priceOverride: toDecimal(
                    CostCalculator.calculatePricing(toNumber(variant.priceCny, sourcePrice || 0)).retailPriceUsd,
                  ),
                  stock: Math.max(0, Math.round(toNumber(variant.stock, 0))),
                  images: Array.isArray(variant.images) && variant.images.length ? variant.images : imageSet,
                })),
              });
            } else {
              await tx.productVariant.create({
                data: {
                  productId: publicProductId,
                  sku: `${providerProductId}-default`,
                  priceOverride: toDecimal(pricing.retailPriceUsd),
                  stock: productData.stock,
                  images: imageSet,
                },
              });
            }
          }
        });
      }

      for (const providerProductId of catalogData.removed) {
        const supplierProduct = await prisma.supplierProduct.findUnique({
          where: { providerProductId },
          include: { publicProduct: true },
        });

        if (!supplierProduct?.publicProductId) continue;

        await prisma.product.update({
          where: { id: supplierProduct.publicProductId },
          data: {
            isActive: false,
            stock: 0,
            badge: 'Unavailable',
          },
        });
      }

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
