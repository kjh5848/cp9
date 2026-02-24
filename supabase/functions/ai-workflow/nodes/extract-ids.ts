/**
 * URL에서 상품 ID 추출 노드
 * @module ExtractIdsNode
 */

import { log } from '../lib/logger.ts';

/**
 * URL에서 쿠팡 상품 ID 추출
 */
function extractProductIdFromUrl(url: string): string | null {
  try {
    const patterns = [
      /\/vp\/products\/(\d+)/,
      /pageKey=(\d+)/,
      /products\/(\d+)/,
      /itemId=(\d+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  } catch (error) {
    log('error', 'URL에서 상품 ID 추출 실패', { url, error: String(error) });
    return null;
  }
}

/**
 * extractIds 노드 실행
 */
export async function executeExtractIds(urls: string[]): Promise<{ productIds: string[]; urls: string[] }> {
  log('info', 'extractIds 노드 시작', { urlCount: urls.length });
  
  const productIds: string[] = [];

  for (const url of urls) {
    const productId = extractProductIdFromUrl(url);
    if (productId) {
      productIds.push(productId);
    }
  }

  log('info', 'extractIds 노드 완료', { 
    extractedCount: productIds.length, 
    productIds,
    successRate: urls.length > 0 ? (productIds.length / urls.length) * 100 : 0
  });
  
  return { productIds, urls };
}