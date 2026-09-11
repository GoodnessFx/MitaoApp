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

router.get('/live', async (req, res) => {
  try {
    const token = await getAccessToken();
    const pageSize = Number(req.query.limit || 20);
    const resp = await fetch(`https://developers.cjdropshipping.com/api2.0/v1/product/list?pageNum=1&pageSize=${pageSize}`, {
      headers: { 'CJ-Access-Token': token },
    });
    const json: any = await resp.json();
    const list: any[] = json?.data?.list || json?.data?.content || json?.data || [];
    const products = list.slice(0, pageSize).map((p: any, i: number) => toMitaoProduct(p, i));
    res.json({ data: products, source: 'cj-live', count: list.length });
  } catch (e: any) {
    console.error('[CJ live]', e);
    res.status(500).json({ error: e.message || 'CJ live fetch failed' });
  }
});

export default router;
