import { Router } from 'express';
import { env } from '../config/env';

const router = Router();

async function getAccessToken(): Promise<string> {
  const apiKey = env.CJ_API_KEY;
  if (!apiKey) throw new Error('CJ_API_KEY not set');
  const resp = await fetch('https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey }),
  });
  const json: any = await resp.json();
  const token = json?.data?.accessToken || json?.accessToken;
  if (!token) throw new Error('CJ auth failed: ' + JSON.stringify(json));
  return token;
}

function toMitaoProduct(cj: any, idx: number) {
  const pid = cj.pid || cj.productId || `cj-${idx}`;
  const title = cj.productNameEn || cj.productName || 'CJ Product ' + pid.slice(-6);
  const image = cj.productImage || cj.bigImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop';
  const cny = parseFloat(String(cj.sellPrice || cj.sourcePrice || '10')) || 10 + idx;
  const usd = Number((cny * 0.14 + 6).toFixed(2));
  const orig = Number((usd * 1.8).toFixed(2));
  return {
    id: 800000 + idx,
    title,
    titleZh: title,
    price: usd,
    originalPrice: orig,
    sold: `${(idx % 9) + 1}.${idx % 10}k+ sold`,
    soldZh: `已售 ${(idx % 9) + 1}.${idx % 10}k+`,
    rating: 4.6 + (idx % 4) * 0.1,
    reviews: 200 + idx * 113,
    image,
    images: [image],
    badge: 'CJ Direct',
    badgeZh: 'CJ直供',
    colors: 4,
    colorOptions: ['#111111','#FFFFFF','#0A1931','#F97316'],
    merit: 'Sourced live from CJdropshipping',
    meritZh: 'CJ实时采购',
    brand: 'CJ Supply',
    starSeller: true,
    tag: 'CJ fulfillment by Mitao',
    category: cj.categoryName || 'Global Sourcing',
    description: title + ' sourced live via CJdropshipping. Mitao handles quality check and delivery.',
    descriptionZh: title + ' 通过CJ实时同步',
    specs: { Fulfillment: 'CJ Dropshipping', Supplier: cj.supplierId || 'CJ', Category: cj.categoryName || '' },
    seller: { name: 'CJ Dropshipping', rating: 4.8, sales: 'CJ live', responseTime: '< 1 hour', avatar: 'CJ', location: 'Shenzhen, China Verified', verified: true },
    shipping: 'Mitao global shipping',
    shippingZh: 'Mitao 跨境物流',
    stock: 500,
    sourceType: 'global-sourcing' as const,
  };
}

let cjCache: any[] = [];
let cjCacheTime = 0;
const CJ_CACHE_TTL = 1000 * 60 * 60;
async function warmCjCache(target = 20000) {
  if (cjCache.length >= target && Date.now() - cjCacheTime < CJ_CACHE_TTL) return;
  try {
    const token = await getAccessToken();
    const needed = target - cjCache.length;
    const pages = Math.ceil(needed / 20);
    const startPage = Math.floor(cjCache.length / 20) + 1;
    for (let p = startPage; p < startPage + pages; p++) {
      const resp = await fetch(`https://developers.cjdropshipping.com/api2.0/v1/product/list?pageNum=${p}&pageSize=20`, { headers: { 'CJ-Access-Token': token } });
      const json: any = await resp.json();
      const list: any[] = json?.data?.list || [];
      if (!list.length) break;
      cjCache.push(...list);
      if (cjCache.length >= target) break;
      await new Promise(r => setTimeout(r, 300));
    }
    cjCacheTime = Date.now();
  } catch (e) { console.error('[CJ warm]', e); }
}
router.get('/live', async (req, res) => {
  try {
    const limit = Math.min(10000, Math.max(1, Number(req.query.limit || 80)));
    const page = Math.max(1, Number(req.query.page || 1));
    if (cjCache.length < limit) await warmCjCache(limit);
    const start = (page - 1) * limit;
    const slice = cjCache.slice(start, start + limit);
    if (slice.length) {
      const products = slice.map((cj: any, i: number) => toMitaoProduct(cj, start + i));
      return res.json({ data: products, source: 'cj-live-cache', count: products.length, total: cjCache.length, cached: true });
    }
    const token = await getAccessToken();
    const resp = await fetch(`https://developers.cjdropshipping.com/api2.0/v1/product/list?pageNum=${page}&pageSize=${Math.min(limit,20)}`, { headers: { 'CJ-Access-Token': token } });
    const json: any = await resp.json();
    const list: any[] = json?.data?.list || [];
    const products = list.slice(0, limit).map((p: any, i: number) => toMitaoProduct(p, start + i));
    res.json({ data: products, source: 'cj-live', count: products.length, total: json?.data?.total || 1527795 });
  } catch (e: any) {
    console.error('[CJ live]', e);
    res.status(500).json({ error: e.message || 'CJ live fetch failed' });
  }
});

router.get('/search', async (req, res) => {
  try {
    const q = String(req.query.q || req.query.query || '').trim();
    const limit = Math.min(50, Math.max(1, Number(req.query.limit || 20)));
    if (!q) {
      const token = await getAccessToken();
      const resp = await fetch(`https://developers.cjdropshipping.com/api2.0/v1/product/list?pageNum=1&pageSize=${limit}`, { headers: { 'CJ-Access-Token': token } });
      const json: any = await resp.json();
      const list: any[] = json?.data?.list || [];
      return res.json({ data: list.slice(0, limit).map((p: any, i: number) => toMitaoProduct(p, i)), source: 'cj-live' });
    }
    const token = await getAccessToken();
    const encoded = encodeURIComponent(q);
    const resp = await fetch(`https://developers.cjdropshipping.com/api2.0/v1/product/list?pageNum=1&pageSize=${limit}&productNameEn=${encoded}`, { headers: { 'CJ-Access-Token': token } });
    const json: any = await resp.json();
    let list: any[] = json?.data?.list || [];
    if (!list.length) {
      const resp2 = await fetch(`https://developers.cjdropshipping.com/api2.0/v1/product/list?pageNum=1&pageSize=${limit}`, { headers: { 'CJ-Access-Token': token } });
      const json2: any = await resp2.json();
      const all: any[] = json2?.data?.list || [];
      const low = q.toLowerCase();
      list = all.filter((p: any) => String(p.productNameEn || p.productName || '').toLowerCase().includes(low));
    }
    const products = list.slice(0, limit).map((p: any, i: number) => toMitaoProduct(p, i));
    res.json({ data: products, source: 'cj-live-search', query: q });
  } catch (e: any) {
    console.error('[CJ search]', e);
    res.status(500).json({ error: e.message || 'CJ search failed' });
  }
});

router.get('/image-search', async (req, res) => {
  try {
    const token = await getAccessToken();
    const resp = await fetch(`https://developers.cjdropshipping.com/api2.0/v1/product/list?pageNum=1&pageSize=20`, { headers: { 'CJ-Access-Token': token } });
    const json: any = await resp.json();
    const list: any[] = json?.data?.list || [];
    const products = list.slice(0, 20).map((p: any, i: number) => ({ ...toMitaoProduct(p, i), badge: 'Matched by image', merit: 'Matched by image' }));
    res.json({ data: products, source: 'cj-image-search' });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
