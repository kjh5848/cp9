/**
 * 쿠팡 상품 검색 노드
 * @module CoupangSearchNode
 */

import { log } from '../lib/logger.ts';

/**
 * 쿠팡 HMAC 서명 생성
 */
async function generateCoupangSignature(method: string, path: string, secretKey: string, accessKey: string): Promise<string> {
  const datetime = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  const message = datetime + method + path;
  
  // Deno에서 crypto API 사용
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secretKey);
  const messageData = encoder.encode(message);
  
  return crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  ).then(key => 
    crypto.subtle.sign('HMAC', key, messageData)
  ).then(signature => {
    const signatureArray = Array.from(new Uint8Array(signature));
    const signatureHex = signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return `CEA algorithm=HmacSHA256, access-key=${accessKey}, signed-date=${datetime}, signature=${signatureHex}`;
  }).catch(() => {
    // 폴백: 간단한 base64 인코딩 (프로덕션에서는 사용 안 함)
    return `CEA algorithm=HmacSHA256, access-key=${accessKey}, signed-date=${datetime}, signature=fallback`;
  });
}

/**
 * 쿠팡 상품 검색 노드 실행
 */
export async function executeCoupangProductSearch(
  keyword?: string, 
  maxProducts: number = 5,
  coupangConfig?: { accessKey?: string; secretKey?: string }
): Promise<{ selectedProducts: any[]; searchResults: any[]; keyword: string }> {
  const searchKeyword = keyword || '인기 상품';
  
  log('info', 'coupangProductSearch 노드 시작', { 
    keyword: searchKeyword, 
    maxProducts,
    hasConfig: !!coupangConfig?.accessKey 
  });

  try {
    // 쿠팡 API 설정 확인
    if (!coupangConfig?.accessKey || !coupangConfig?.secretKey) {
      log('warn', '쿠팡 API 키가 설정되지 않음, 더미 데이터 사용', { keyword: searchKeyword });
      
      // 더미 상품 데이터 생성
      const dummyProducts = Array.from({ length: Math.min(10, maxProducts * 2) }, (_, i) => ({
        productId: `dummy-${Date.now()}-${i}`,
        productName: `${searchKeyword} 관련 상품 ${i + 1}`,
        productPrice: Math.floor(Math.random() * 100000) + 10000,
        productImage: 'https://via.placeholder.com/300x300',
        productUrl: `https://www.coupang.com/vp/products/dummy-${i}`,
        vendorName: `판매자${i + 1}`,
        rating: (Math.random() * 2 + 3).toFixed(1), // 3.0-5.0
        reviewCount: Math.floor(Math.random() * 1000) + 10,
        isRocket: Math.random() > 0.5,
        originalPrice: Math.floor(Math.random() * 120000) + 15000,
        discountRate: Math.floor(Math.random() * 30) + 5
      }));

      // 랜덤 선택
      const shuffled = dummyProducts.sort(() => 0.5 - Math.random());
      const selectedProducts = shuffled.slice(0, maxProducts);

      log('info', 'coupangProductSearch 노드 완료 (더미 데이터)', {
        totalFound: dummyProducts.length,
        selectedCount: selectedProducts.length,
        keyword: searchKeyword
      });

      return { selectedProducts, searchResults: dummyProducts, keyword: searchKeyword };
    }

    // 실제 쿠팡 API 호출
    const method = 'GET';
    const limit = Math.max(maxProducts * 2, 20); // 선택의 여지를 위해 더 많이 검색
    const path = `/v2/providers/affiliate_open_api/apis/openapi/v1/products/search?keyword=${encodeURIComponent(searchKeyword)}&limit=${limit}`;
    const coupangApiUrl = `https://api-gateway.coupang.com${path}`;
    
    // HMAC 서명 생성 (비동기)
    const authorization = await generateCoupangSignature(method, path, coupangConfig.secretKey, coupangConfig.accessKey);
    
    const headers = {
      'Authorization': authorization,
      'X-EXTENDED-TIMEOUT': '60000',
    };

    const response = await fetch(coupangApiUrl, { method, headers });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`쿠팡 API 오류: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const searchResults = data.data?.productData || [];

    if (searchResults.length === 0) {
      log('warn', '쿠팡 검색 결과 없음, 더미 데이터 사용', { keyword: searchKeyword });
      // 더미 데이터로 폴백
      return await executeCoupangProductSearch(keyword, maxProducts);
    }

    // 검색 결과에서 랜덤 선택
    const shuffled = searchResults.sort(() => 0.5 - Math.random());
    const selectedProducts = shuffled.slice(0, maxProducts);

    log('info', 'coupangProductSearch 노드 완료', {
      totalFound: searchResults.length,
      selectedCount: selectedProducts.length,
      keyword: searchKeyword,
      avgPrice: selectedProducts.reduce((sum, p) => sum + (p.productPrice || 0), 0) / selectedProducts.length
    });

    return { selectedProducts, searchResults, keyword: searchKeyword };

  } catch (error) {
    log('error', 'coupangProductSearch 노드 실패, 더미 데이터 사용', { 
      error: error instanceof Error ? error.message : String(error), 
      keyword: searchKeyword 
    });
    
    // 에러 시 더미 데이터로 폴백
    return await executeCoupangProductSearch(keyword, maxProducts);
  }
}