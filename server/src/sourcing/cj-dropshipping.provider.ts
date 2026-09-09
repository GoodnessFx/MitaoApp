import { Prisma, PrismaClient, type SupplierProduct } from '@prisma/client';
import { env } from '../config/env';
import { decrypt, encrypt } from '../utils/encryption';
import { CostCalculator } from './cost-calculator';
import { SourcingProvider } from './sourcing-provider.interface';

const prisma = new PrismaClient();

const CJ_BASE_URL = 'https://developers.cjdropshipping.com';
const CJ_PROVIDER_NAME = 'CJ Dropshipping';
const RATE_LIMIT_DELAY_MS = 1100;

type CjCredentialBundle = {
  apiKey?: string;
  accessToken?: string;
  refreshToken?: string;
  accessTokenUpdatedAt?: string;
  refreshTokenUpdatedAt?: string;
};

type NormalizedVariant = {
  providerVariantId: string;
  sku: string;
  size?: string;
  color?: string;
  colorHex?: string;
  priceCny: number;
  stock: number;
  images: string[];
  attributes: Record<string, string>;
};

type FreightQuote = {
  logisticName: string;
  logisticPrice: number;
  logisticAging?: string;
  raw: unknown;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toDecimal(value: number) {
  return new Prisma.Decimal(value.toFixed(2));
}

function toNumber(value: unknown, fallback = 0) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const normalized = Number.parseFloat(value.replace(/[^\d.-]/g, ''));
    if (Number.isFinite(normalized)) return normalized;
  }
  return fallback;
}

function firstString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return undefined;
}

function arrayOfStrings(...candidates: unknown[]) {
  for (const candidate of candidates) {
    if (!Array.isArray(candidate)) continue;
    const values = candidate
      .flatMap((value) => {
        if (typeof value === 'string') return [value];
        if (value && typeof value === 'object') {
          const image = firstString(
            (value as any).image,
            (value as any).imageUrl,
            (value as any).variantImage,
            (value as any).bigImage,
            (value as any).url,
          );
          return image ? [image] : [];
        }
        return [];
      })
      .filter(Boolean);
    if (values.length) return [...new Set(values)];
  }
  return [];
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function countryToCode(country?: string) {
  const normalized = (country || '').trim();
  if (!normalized) return 'US';
  if (normalized.length === 2) return normalized.toUpperCase();

  const map: Record<string, string> = {
    nigeria: 'NG',
    'united states': 'US',
    usa: 'US',
    us: 'US',
    canada: 'CA',
    'united kingdom': 'GB',
    uk: 'GB',
    china: 'CN',
    germany: 'DE',
    france: 'FR',
    spain: 'ES',
    italy: 'IT',
    netherlands: 'NL',
    ghana: 'GH',
    kenya: 'KE',
    'south africa': 'ZA',
  };

  return map[normalized.toLowerCase()] || normalized.slice(0, 2).toUpperCase();
}

function normalizeShippingAddress(shippingAddress: any) {
  const fullName =
    firstString(
      shippingAddress?.name,
      [shippingAddress?.firstName, shippingAddress?.lastName].filter(Boolean).join(' '),
      shippingAddress?.shippingCustomerName,
    ) || 'Mitao Customer';

  return {
    fullName,
    email: firstString(shippingAddress?.email) || 'noreply@mitao.com',
    phone: firstString(shippingAddress?.phone, shippingAddress?.phoneNumber) || '0000000000',
    address: firstString(shippingAddress?.address, shippingAddress?.street, shippingAddress?.shippingAddress) || 'Address pending',
    city: firstString(shippingAddress?.city) || 'City',
    state: firstString(shippingAddress?.state, shippingAddress?.province, shippingAddress?.region) || 'State',
    zip: firstString(shippingAddress?.zip, shippingAddress?.postalCode, shippingAddress?.postcode) || '000000',
    country: firstString(shippingAddress?.country) || 'United States',
    countryCode: countryToCode(firstString(shippingAddress?.countryCode, shippingAddress?.country)),
    houseNumber: firstString(shippingAddress?.houseNumber) || undefined,
  };
}

function extractData(payload: any) {
  if (payload == null) return payload;
  if (Array.isArray(payload)) return payload;
  if (payload.data !== undefined) return payload.data;
  if (payload.content !== undefined) return payload.content;
  if (payload.result !== undefined && typeof payload.result !== 'boolean') return payload.result;
  return payload;
}

function extractList(payload: any) {
  const data = extractData(payload);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.list)) return data.list;
  if (Array.isArray(data?.records)) return data.records;
  if (Array.isArray(data?.content)) return data.content;
  return [];
}

function normalizeProcurementStatus(rawStatus?: string) {
  const normalized = (rawStatus || '').toLowerCase();

  if (normalized.includes('deliver')) return 'delivered';
  if (normalized.includes('out for delivery')) return 'out_for_delivery';
  if (normalized.includes('local hub')) return 'local_hub';
  if (normalized.includes('custom')) return 'customs_clearance';
  if (normalized.includes('transit') || normalized.includes('flight') || normalized.includes('depart')) return 'international_transit';
  if (normalized.includes('warehouse') || normalized.includes('pack')) return 'warehouse_received';
  if (normalized.includes('paid') || normalized.includes('purchas')) return 'purchased';
  return 'submitted';
}

export class CJDropshippingProvider implements SourcingProvider {
  readonly key = 'cj_dropshipping';

  private categoryCache: any[] | null = null;
  private lastRequestAt = 0;

  private async throttle() {
    const delta = Date.now() - this.lastRequestAt;
    if (delta < RATE_LIMIT_DELAY_MS) {
      await sleep(RATE_LIMIT_DELAY_MS - delta);
    }
    this.lastRequestAt = Date.now();
  }

  private async ensureProviderRecord() {
    return prisma.sourcingProvider.upsert({
      where: { key: this.key },
      update: {
        name: CJ_PROVIDER_NAME,
        baseUrl: CJ_BASE_URL,
        isActive: true,
      },
      create: {
        key: this.key,
        name: CJ_PROVIDER_NAME,
        baseUrl: CJ_BASE_URL,
        isActive: true,
      },
    });
  }

  private async loadCredentials(): Promise<CjCredentialBundle> {
    const provider = await this.ensureProviderRecord();
    let persisted: CjCredentialBundle = {};

    if (provider.apiCredentialsEncrypted) {
      try {
        persisted = JSON.parse(decrypt(provider.apiCredentialsEncrypted));
      } catch (error) {
        console.warn('[CJ] Failed to decrypt persisted credentials, falling back to env values');
      }
    }

    return {
      apiKey: persisted.apiKey || env.CJ_API_KEY,
      accessToken: persisted.accessToken || env.CJ_ACCESS_TOKEN,
      refreshToken: persisted.refreshToken || env.CJ_REFRESH_TOKEN,
      accessTokenUpdatedAt: persisted.accessTokenUpdatedAt,
      refreshTokenUpdatedAt: persisted.refreshTokenUpdatedAt,
    };
  }

  private async persistCredentials(bundle: CjCredentialBundle) {
    await prisma.sourcingProvider.update({
      where: { key: this.key },
      data: {
        apiCredentialsEncrypted: encrypt(JSON.stringify(bundle)),
      },
    });
  }

  private async request<T = any>(
    method: 'GET' | 'POST',
    path: string,
    options?: {
      query?: Record<string, string | number | undefined>;
      body?: unknown;
      accessToken?: string;
    },
  ): Promise<T> {
    await this.throttle();

    const url = new URL(path, CJ_BASE_URL);
    if (options?.query) {
      for (const [key, value] of Object.entries(options.query)) {
        if (value === undefined || value === null || value === '') continue;
        url.searchParams.set(key, String(value));
      }
    }

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.accessToken ? { 'CJ-Access-Token': options.accessToken } : {}),
      },
      body: method === 'POST' ? JSON.stringify(options?.body ?? {}) : undefined,
    });

    const text = await response.text();
    const payload = text ? JSON.parse(text) : {};

    if (!response.ok) {
      throw new Error(`[CJ] ${method} ${path} failed: ${response.status} ${JSON.stringify(payload)}`);
    }

    if (payload?.result === false || payload?.success === false) {
      throw new Error(`[CJ] ${method} ${path} rejected: ${payload?.message || payload?.msg || 'Unknown error'}`);
    }

    return payload as T;
  }

  private async authenticateWithApiKey(apiKey: string) {
    const payload = await this.request<any>('POST', '/api2.0/v1/authentication/getAccessToken', {
      body: { apiKey },
    });
    const data = extractData(payload);
    const accessToken = firstString(data?.accessToken, payload?.accessToken);
    const refreshToken = firstString(data?.refreshToken, payload?.refreshToken);

    if (!accessToken || !refreshToken) {
      throw new Error('[CJ] Authentication succeeded but no access/refresh token was returned');
    }

    const nextBundle: CjCredentialBundle = {
      apiKey,
      accessToken,
      refreshToken,
      accessTokenUpdatedAt: new Date().toISOString(),
      refreshTokenUpdatedAt: new Date().toISOString(),
    };
    await this.persistCredentials(nextBundle);
    return nextBundle;
  }

  async refreshAccessToken() {
    const credentials = await this.loadCredentials();
    if (!credentials.refreshToken) {
      throw new Error('[CJ] Missing refresh token. Run connect() first.');
    }

    const payload = await this.request<any>('POST', '/api2.0/v1/authentication/refreshAccessToken', {
      body: { refreshToken: credentials.refreshToken },
    });
    const data = extractData(payload);
    const accessToken = firstString(data?.accessToken, payload?.accessToken);
    const refreshToken = firstString(data?.refreshToken, payload?.refreshToken, credentials.refreshToken);

    if (!accessToken) {
      throw new Error('[CJ] Refresh token call did not return an access token');
    }

    const nextBundle: CjCredentialBundle = {
      ...credentials,
      accessToken,
      refreshToken,
      accessTokenUpdatedAt: new Date().toISOString(),
      refreshTokenUpdatedAt: refreshToken !== credentials.refreshToken ? new Date().toISOString() : credentials.refreshTokenUpdatedAt,
    };
    await this.persistCredentials(nextBundle);
    return nextBundle;
  }

  private async getAccessToken() {
    const credentials = await this.loadCredentials();

    if (credentials.accessToken) {
      return credentials.accessToken;
    }

    if (credentials.refreshToken) {
      return (await this.refreshAccessToken()).accessToken!;
    }

    if (!credentials.apiKey) {
      throw new Error('[CJ] Missing CJ_API_KEY. Add it to server/.env before using the live provider.');
    }

    return (await this.authenticateWithApiKey(credentials.apiKey)).accessToken!;
  }

  async connect(): Promise<boolean> {
    try {
      await this.getAccessToken();
      return true;
    } catch (error) {
      console.error('[CJ] Failed to connect', error);
      return false;
    }
  }

  private async getCategories(accessToken: string): Promise<any[]> {
    if (this.categoryCache) return this.categoryCache;

    const payload = await this.request<any>('GET', '/api2.0/v1/product/getCategory', {
      accessToken,
    });
    this.categoryCache = extractList(payload) as any[];
    return this.categoryCache;
  }

  private flattenCategories(categories: any[] | null | undefined) {
    const flat = new Map<string, string>();

    const walk = (nodes: any[] | null | undefined, ancestors: string[] = []) => {
      for (const node of nodes || []) {
        const nodeId = firstString(node?.categoryId, node?.id);
        const nodeLabel = firstString(
          node?.categoryName,
          node?.categorySecondName,
          node?.categoryFirstName,
          node?.name,
        );
        const nextAncestors = nodeLabel ? [...ancestors, nodeLabel] : ancestors;
        if (nodeId && nextAncestors.length) {
          flat.set(nodeId, nextAncestors.join(' / '));
        }
        walk(node?.children || node?.categoryList || node?.categorySecondList || node?.childCategoryList || [], nextAncestors);
      }
    };

    walk(categories);
    return flat;
  }

  private async getVariantPayload(providerProductId: string, accessToken: string) {
    return this.request<any>('GET', '/api2.0/v1/product/variant/query', {
      accessToken,
      query: {
        pid: providerProductId,
      },
    });
  }

  private normalizeVariants(variantPayload: any, fallbackPriceCny: number, imageFallback: string[] = []): NormalizedVariant[] {
    const items = extractList(variantPayload) as Record<string, any>[];

    return items.map((variant: Record<string, any>, index: number): NormalizedVariant => {
      const providerVariantId = firstString(variant?.vid, variant?.variantId, variant?.id, variant?.productVid) || `CJ-VID-${index}`;
      const sku = firstString(variant?.sku, variant?.productSku, variant?.variantSku) || providerVariantId;
      const size = firstString(variant?.size, variant?.variantSize, variant?.propertySize);
      const color = firstString(variant?.color, variant?.variantColor, variant?.propertyColor);
      const colorHex = firstString(variant?.colorHex);
      const priceCny = toNumber(
        variant?.variantSellPrice ?? variant?.sellPrice ?? variant?.variantPrice ?? variant?.price,
        fallbackPriceCny,
      );
      const stock = Math.max(
        0,
        Math.round(
          toNumber(
            variant?.stockNum ?? variant?.variantStock ?? variant?.inventoryNum ?? variant?.inventory,
            0,
          ),
        ),
      );
      const images = arrayOfStrings(
        variant?.variantImage,
        variant?.variantImages,
        variant?.images,
        variant?.image,
        imageFallback,
      );
      const attributes: Record<string, string> = Object.fromEntries(
        Object.entries({
          Size: size,
          Color: color,
        }).filter(([, value]) => typeof value === 'string' && value.trim().length > 0),
      ) as Record<string, string>;

      return {
        providerVariantId,
        sku,
        size,
        color,
        colorHex,
        priceCny,
        stock,
        images,
        attributes,
      };
    });
  }

  private async mapCatalogProduct(product: Record<string, any>, categoriesById: Map<string, string>, accessToken: string): Promise<Partial<SupplierProduct>> {
    const providerProductId = firstString(product?.pid, product?.productId, product?.id);
    if (!providerProductId) {
      throw new Error('[CJ] Product list item missing pid/productId');
    }

    const rawTitle = firstString(product?.productNameEn, product?.productName, product?.name) || providerProductId;
    const categoryHint =
      firstString(
        categoriesById.get(firstString(product?.categoryId, product?.categoryIdLv3) || ''),
        product?.categoryName,
        product?.categorySecondName,
        product?.categoryFirstName,
      ) || 'CJ Catalog';

    const imageSet = arrayOfStrings(product?.productImage, product?.bigImage, product?.images);
    const rawWholesalePriceNumber = toNumber(
      product?.sellPrice ?? product?.sourcePrice ?? product?.price ?? product?.productPrice,
      0,
    );

    const variantPayload = await this.getVariantPayload(providerProductId, accessToken);
    const variants = this.normalizeVariants(variantPayload, rawWholesalePriceNumber, imageSet);
    const normalizedPriceCny = variants.length
      ? Math.min(...variants.map((variant: NormalizedVariant) => variant.priceCny).filter((value: number) => value > 0))
      : rawWholesalePriceNumber;

    const pricing = CostCalculator.calculatePricing(normalizedPriceCny || rawWholesalePriceNumber || 0);
    const variantImageList: string[] = variants.flatMap((variant: NormalizedVariant) => variant.images ?? []);

    return {
      providerProductId,
      supplierId: firstString(product?.supplierId, product?.shopId) || 'CJ',
      supplierName: firstString(product?.supplierName) || CJ_PROVIDER_NAME,
      rawTitle,
      rawCurrency: firstString(product?.currency, product?.currencyType) || 'CNY',
      rawWholesalePrice: toDecimal(normalizedPriceCny || rawWholesalePriceNumber || 0),
      moq: Math.max(1, Math.round(toNumber(product?.minimumOrderQuantity ?? product?.moq, 1))),
      tierPricing: variants.map((variant: NormalizedVariant) => ({
        sku: variant.sku,
        vid: variant.providerVariantId,
        priceCny: variant.priceCny,
      })),
      rawAttributes: {
        summary: product as any,
        variants: variants as any,
        cjCategoryId: firstString(product?.categoryId, product?.categoryIdLv3),
      } as any,
      imageSet: variantImageList.length ? [...new Set(variantImageList)] : imageSet,
      sourceUrl: `${CJ_BASE_URL}/product/${providerProductId}.html`,
      categoryHint,
      landedCost: toDecimal(pricing.landedCostUsd),
      markupAmount: toDecimal(pricing.mitaoProfitUsd),
      lastSyncedAt: new Date(),
    };
  }

  async fetchCatalog() {
    const accessToken = await this.getAccessToken();
    const providerRecord = await this.ensureProviderRecord();
    const categories = await this.getCategories(accessToken);
    const categoriesById = this.flattenCategories(categories);
    const existingProducts = await prisma.supplierProduct.findMany({
      where: { sourcingProviderId: providerRecord.id },
      select: {
        providerProductId: true,
        rawTitle: true,
        rawWholesalePrice: true,
        moq: true,
        imageSet: true,
        categoryHint: true,
        rawAttributes: true,
      },
    });

    const existingById = new Map(existingProducts.map((product) => [product.providerProductId, product]));
    const seenIds = new Set<string>();
    const added: Array<Partial<SupplierProduct>> = [];
    const updated: Array<Partial<SupplierProduct>> = [];

    let pageNum = 1;
    const pageSize = 20;

    while (true) {
      const payload = await this.request<any>('GET', '/api2.0/v1/product/list', {
        accessToken,
        query: {
          pageNum,
          pageSize,
        },
      });
      const products = extractList(payload);
      if (!products.length) break;

      for (const product of products) {
        const mapped = await this.mapCatalogProduct(product, categoriesById, accessToken);
        const providerProductId = mapped.providerProductId!;
        seenIds.add(providerProductId);

        const existing = existingById.get(providerProductId);
        if (!existing) {
          added.push(mapped);
          continue;
        }

        const existingFingerprint = JSON.stringify({
          rawTitle: existing.rawTitle,
          rawWholesalePrice: existing.rawWholesalePrice.toString(),
          moq: existing.moq,
          imageSet: existing.imageSet,
          categoryHint: existing.categoryHint,
          rawAttributes: existing.rawAttributes,
        });
        const nextFingerprint = JSON.stringify({
          rawTitle: mapped.rawTitle,
          rawWholesalePrice: mapped.rawWholesalePrice instanceof Prisma.Decimal
            ? mapped.rawWholesalePrice.toString()
            : String(mapped.rawWholesalePrice),
          moq: mapped.moq,
          imageSet: mapped.imageSet,
          categoryHint: mapped.categoryHint,
          rawAttributes: mapped.rawAttributes,
        });

        if (existingFingerprint !== nextFingerprint) {
          updated.push(mapped);
        }
      }

      if (products.length < pageSize) break;
      pageNum += 1;
    }

    const removed = existingProducts
      .filter((product) => !seenIds.has(product.providerProductId))
      .map((product) => product.providerProductId);

    return { added, updated, removed };
  }

  async getProductDetail(providerProductId: string) {
    const accessToken = await this.getAccessToken();
    const detailPayload = await this.request<any>('GET', '/api2.0/v1/product/query', {
      accessToken,
      query: { pid: providerProductId },
    });
    const detail = extractData(detailPayload);
    const imageSet = arrayOfStrings(detail?.productImage, detail?.bigImage, detail?.images);
    const rawWholesalePriceNumber = toNumber(
      detail?.sellPrice ?? detail?.sourcePrice ?? detail?.price,
      0,
    );
    const variantPayload = await this.getVariantPayload(providerProductId, accessToken);
    const variants = this.normalizeVariants(variantPayload, rawWholesalePriceNumber, imageSet);

    const stockByVariant: Record<string, number> = {};
    for (const variant of variants) {
      stockByVariant[variant.providerVariantId] = await this.getStockForVid(variant.providerVariantId);
    }

    const normalizedPriceCny = variants.length
      ? Math.min(...variants.map((variant: NormalizedVariant) => variant.priceCny).filter((value: number) => value > 0))
      : rawWholesalePriceNumber;
    const pricing = CostCalculator.calculatePricing(normalizedPriceCny || rawWholesalePriceNumber || 0);

    return {
      providerProductId,
      supplierId: firstString(detail?.supplierId, detail?.shopId) || 'CJ',
      supplierName: firstString(detail?.supplierName) || CJ_PROVIDER_NAME,
      rawTitle: firstString(detail?.productNameEn, detail?.productName, detail?.name) || providerProductId,
      rawCurrency: firstString(detail?.currency, detail?.currencyType) || 'CNY',
      rawWholesalePrice: toDecimal(normalizedPriceCny || rawWholesalePriceNumber || 0),
      moq: Math.max(1, Math.round(toNumber(detail?.minimumOrderQuantity ?? detail?.moq, 1))),
      imageSet,
      sourceUrl: `${CJ_BASE_URL}/product/${providerProductId}.html`,
      categoryHint: firstString(detail?.categoryName, detail?.categorySecondName, detail?.categoryFirstName) || 'CJ Catalog',
      landedCost: toDecimal(pricing.landedCostUsd),
      markupAmount: toDecimal(pricing.mitaoProfitUsd),
      rawAttributes: {
        detail: detail as any,
        variants: variants as any,
        stockByVariant: stockByVariant as any,
      } as any,
      lastSyncedAt: new Date(),
    };
  }

  async resolveVariantForItem(providerProductId: string, sku?: string, fallbackVariantId?: string) {
    const accessToken = await this.getAccessToken();
    const payload = await this.getVariantPayload(providerProductId, accessToken);
    const detail = extractData(payload);
    const variants = this.normalizeVariants(payload, 0);

    const matched = variants.find((variant: NormalizedVariant) => {
      return (sku && variant.sku === sku) || (fallbackVariantId && variant.providerVariantId === fallbackVariantId);
    }) || variants[0];

    if (!matched) {
      throw new Error(`[CJ] No variants found for provider product ${providerProductId}`);
    }

    return {
      ...matched,
      raw: detail,
    };
  }

  async getStockForVid(vid: string) {
    const accessToken = await this.getAccessToken();
    const payload = await this.request<any>('GET', '/api2.0/v1/product/stock/queryByVid', {
      accessToken,
      query: { vid },
    });
    const data = extractData(payload);

    return Math.max(
      0,
      Math.round(
        toNumber(
          data?.stockNum ?? data?.quantity ?? data?.inventoryNum ?? data?.stock,
          0,
        ),
      ),
    );
  }

  async calculateFreightQuote(
    items: Array<{ vid: string; quantity: number }>,
    shippingAddress: any,
  ): Promise<FreightQuote | null> {
    if (!items.length) return null;
    const accessToken = await this.getAccessToken();
    const normalizedAddress = normalizeShippingAddress(shippingAddress);

    const payload = await this.request<any>('POST', '/api2.0/v1/logistic/freightCalculate', {
      accessToken,
      body: {
        startCountryCode: 'CN',
        endCountryCode: normalizedAddress.countryCode,
        zip: normalizedAddress.zip,
        products: items.map((item) => ({
          vid: item.vid,
          quantity: item.quantity,
        })),
      },
    });

    const options = extractList(payload).map((option: Record<string, any>) => ({
      logisticName: firstString(option?.logisticName, option?.name) || 'CJ Logistics',
      logisticPrice: toNumber(option?.logisticPrice ?? option?.price, 0),
      logisticAging: firstString(option?.logisticAging, option?.aging, option?.deliveryTime),
      raw: option,
    } as FreightQuote));

    if (!options.length) return null;
    options.sort((left: FreightQuote, right: FreightQuote) => left.logisticPrice - right.logisticPrice);
    return options[0];
  }

  async placeOrder(orderId: string, items: any[], shippingAddress: any) {
    const accessToken = await this.getAccessToken();
    const normalizedAddress = normalizeShippingAddress(shippingAddress);

    const orderItems = [];
    for (const item of items) {
      const providerProductId = firstString(
        item?.product?.supplierProductId,
        item?.supplierProductId,
      );

      if (!providerProductId) {
        throw new Error('[CJ] Cannot place supplier order because one or more order items are missing supplierProductId');
      }

      const resolvedVariant = await this.resolveVariantForItem(
        providerProductId,
        firstString(item?.variant?.sku, item?.sku),
      );
      orderItems.push({
        vid: resolvedVariant.providerVariantId,
        quantity: Number(item?.quantity || 1),
      });
    }

    const freight = await this.calculateFreightQuote(orderItems, shippingAddress);

    const payload = await this.request<any>('POST', '/api2.0/v1/shopping/order/createOrderV2', {
      accessToken,
      body: {
        orderNumber: orderId,
        shippingZip: normalizedAddress.zip,
        shippingCountryCode: normalizedAddress.countryCode,
        shippingCountry: normalizedAddress.country,
        shippingProvince: normalizedAddress.state,
        shippingCity: normalizedAddress.city,
        shippingAddress: normalizedAddress.address,
        shippingCustomerName: normalizedAddress.fullName,
        shippingPhone: normalizedAddress.phone,
        email: normalizedAddress.email,
        remark: 'Created by Mitao',
        fromCountryCode: 'CN',
        logisticName: freight?.logisticName,
        houseNumber: normalizedAddress.houseNumber,
        payType: 3,
        products: orderItems,
      },
    });

    const data = extractData(payload);
    const providerOrderId =
      firstString(data?.orderId, data?.orderNumber, data?.cjOrderId, payload?.orderId) || orderId;

    return {
      providerOrderId,
      costPaid: freight?.logisticPrice || 0,
      estimatedDeliveryWindow: freight?.logisticAging || 'Pending CJ confirmation',
    };
  }

  async getOrderStatus(providerOrderId: string) {
    const accessToken = await this.getAccessToken();
    const [orderPayload, trackingPayload] = await Promise.all([
      this.request<any>('GET', '/api2.0/v1/shopping/order/getOrderDetail', {
        accessToken,
        query: { orderId: providerOrderId },
      }),
      this.request<any>('GET', '/api2.0/v1/logistic/trackInfo', {
        accessToken,
        query: { orderId: providerOrderId },
      }).catch(() => null),
    ]);

    const orderDetail = extractData(orderPayload);
    const trackInfo = trackingPayload ? extractData(trackingPayload) : null;
    const trackingNumber = firstString(
      trackInfo?.trackingNumber,
      trackInfo?.trackNo,
      orderDetail?.trackingNumber,
    );
    const rawStatus = firstString(
      trackInfo?.status,
      orderDetail?.orderStatus,
      orderDetail?.status,
    );

    return {
      providerStatus: normalizeProcurementStatus(rawStatus),
      providerTrackingId: trackingNumber,
      shipmentLabel: firstString(trackInfo?.logisticName, orderDetail?.logisticName) || 'CJ Shipment',
    };
  }
}
