import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchCoupangBestCategory } from '@/lib/coupang-best-category';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { categoryId, limit, imageSize } = req.body;
  if (!categoryId) {
    return res.status(400).json({ error: 'categoryId required' });
  }
  try {
    const products = await fetchCoupangBestCategory({ categoryId, limit, imageSize });
    res.status(200).json(products);
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Coupang API error' });
  }
} 