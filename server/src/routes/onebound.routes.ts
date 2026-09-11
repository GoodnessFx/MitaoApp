import { Router } from 'express';
import { oneboundService } from '../services/onebound.service';
import { env } from '../config/env';

const router = Router();

const demoImageProducts = [
  { id: 9001, title: 'Matched by image — similar factory-direct premium casualwear', titleZh: '以图搜图匹配 — 工厂直供精品休闲套装', price: 29.9, originalPrice: 59.9, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop', images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop'], rating: 4.8, reviews: 1204, badge: 'Matched by image', badgeZh: '以图搜图', sold: '2.1k+ sold', soldZh: '已售 2.1k+', merit: 'Matched by image', meritZh: '以图搜图匹配', brand: 'Mitao Global', starSeller: true, tag: 'Cross-border fulfillment by Mitao', category: "Women's Clothing", description: 'Demo image search result — similar product matched by image on 1688.', descriptionZh: '以图搜图演示结果 — 在1688上匹配的相似商品。', specs: { Fulfillment: 'Managed by Mitao Global' }, seller: { name: 'Mitao Global Sourcing', rating: 4.9, sales: '88k sourced', responseTime: '< 1 hour', avatar: 'MG', location: 'Guangzhou, China', verified: true }, shipping: 'Mitao global shipping', shippingZh: 'Mitao 跨境物流', stock: 120, sourceType: 'global-sourcing', demo: true },
  { id: 9002, title: 'Matched by image — lightweight sneaker similar style', titleZh: '以图搜图匹配 — 相似款轻便运动鞋', price: 42.0, originalPrice: 88.0, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop', images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop'], rating: 4.7, reviews: 890, badge: 'Matched by image', badgeZh: '以图搜图', sold: '1.4k+ sold', soldZh: '已售 1.4k+', merit: 'Matched by image', meritZh: '以图搜图匹配', brand: 'Mitao Global', starSeller: true, tag: 'Cross-border fulfillment by Mitao', category: 'Sports & Outdoors', description: 'Demo image search result.', descriptionZh: '以图搜图演示结果。', specs: { Fulfillment: 'Managed by Mitao Global' }, seller: { name: 'Shenzhen Peak Supply', rating: 4.8, sales: '56k sourced', responseTime: '< 1 hour', avatar: 'SP', location: 'Shenzhen, China', verified: true }, shipping: 'Mitao global shipping', shippingZh: 'Mitao 跨境物流', stock: 80, sourceType: 'global-sourcing', demo: true },
];

router.get('/item-get', async (req, res) => {
  try {
    const { url } = req.query as { url?: string };
    if (!url) return res.status(400).json({ error: 'Missing url parameter' });
    if (env.DEMO_1688_MODE === 'true') {
      return res.json({ data: demoImageProducts[0], demo: true, message: 'Demo 1688 data — not real listing' });
    }
    const match = url.match(/detail.1688\.com\/[^/]+\/([0-9]+)\.html/) || url.match(/\/([0-9]{8,})/);
    const productId = match ? match[1] : url;
    const data = await oneboundService.getItem(productId);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

router.post('/image-search', async (req, res) => {
  try {
    const { imageBase64, image_url, imageUrl } = req.body as { imageBase64?: string; image_url?: string; imageUrl?: string };
    const payload = imageBase64 || image_url || imageUrl;
    if (!payload) return res.status(400).json({ error: 'Missing imageBase64' });
    if (env.DEMO_1688_MODE === 'true') {
      const items = payload.includes('empty-test') ? [] : demoImageProducts;
      return res.json({ data: items, demo: true, message: items.length ? 'Demo image search results' : 'No matches found' });
    }
    const data = await oneboundService.imageSearch(payload);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Image search failed' });
  }
});

router.get('/search', async (req, res) => {
  try {
    const { q, page } = req.query as { q?: string; page?: string };
    if (!q) return res.status(400).json({ error: 'Missing q parameter' });
    if (env.DEMO_1688_MODE === 'true') {
      return res.json({ data: demoImageProducts, demo: true });
    }
    const data = await oneboundService.itemSearch(q, Number(page) || 1);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Search failed' });
  }
});

export default router;
