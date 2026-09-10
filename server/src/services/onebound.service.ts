// server/src/services/onebound.service.ts
import axios from 'axios';
import { env } from '../config/env';

const BASE_URL = 'https://api-gw.onebound.cn/1688';

function buildUrl(endpoint: string, params: Record<string, any> = {}): string {
  const url = new URL(`${BASE_URL}/${endpoint}/`);
  url.searchParams.append('key', env.ONEBOUND_API_KEY ?? '');
  url.searchParams.append('secret', env.ONEBOUND_API_SECRET ?? '');
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.append(k, String(v));
  });
  return url.toString();
}

export const oneboundService = {
  async itemSearch(query: string, page = 1, pageSize = 20) {
    const url = buildUrl('item_search', { q: query, page, page_size: pageSize });
    const resp = await axios.get(url);
    return resp.data;
  },
  async getItem(offerId: string) {
    const url = buildUrl('item_get', { num_iid: offerId, cache: 'no' });
    const resp = await axios.get(url);
    return resp.data;
  },
  async sellerInfo(sellerId: string) {
    const url = buildUrl('seller_info', { seller_id: sellerId });
    const resp = await axios.get(url);
    return resp.data;
  },
  async imageSearch(imageUrl: string) {
    // Assuming Onebound accepts an image URL directly
    const url = buildUrl('image_search', { image_url: imageUrl });
    const resp = await axios.get(url);
    return resp.data;
  },
};
