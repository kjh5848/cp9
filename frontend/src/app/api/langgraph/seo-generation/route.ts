/**
 * @deprecated 이 API는 새로운 워크플로우 API(/api/workflow)로 이전되었습니다.
 * 하위 호환성을 위해 워크플로우 API로 리다이렉트합니다.
 */

import { NextRequest, NextResponse } from 'next/server';

interface ProductData {
  name: string;
  price: number;
  category: string;
  url: string;
  image?: string;
}

interface SeoGenerationRequest {
  products: ProductData[];
  type: 'product_review' | 'comparison' | 'guide';
  query?: string;
}

/**
 * @deprecated SEO 생성 API - 새로운 워크플로우 API로 리다이렉트
 * 
 * @param request - SEO 글 생성 요청
 * @returns 새로운 워크플로우 API로 리다이렉트된 결과
 *     type: 'product_review'
 *   })
 * });
 * ```
 */
export async function POST(request: NextRequest) {
  try {
    const body: SeoGenerationRequest = await request.json();
    const { products, type, query } = body;

    if (!products || products.length === 0) {
      return NextResponse.json(
        { error: '상품 정보가 필요합니다.' },
        { status: 400 }
      );
    }

    console.log('[seo-generation] 기존 API 호출 - 새로운 워크플로우 API로 리다이렉트');

    // 상품 URL에서 ID 추출
    const urls = products.map(p => p.url).filter(Boolean);
    const productIds = products.map(p => extractProductId(p.url)).filter(Boolean);

    // 새로운 워크플로우 API 호출
    const workflowResponse = await fetch(`${request.nextUrl.origin}/api/workflow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({
        action: 'execute',
        urls,
        productIds,
        keyword: query || products.map(p => p.name).join(' '),
        config: {
          enablePerplexity: true,
          enableWordPress: false, // SEO 글만 생성
          maxProducts: products.length
        }
      }),
    });

    if (!workflowResponse.ok) {
      const errorText = await workflowResponse.text();
      throw new Error(`워크플로우 API 오류: ${workflowResponse.status} - ${errorText}`);
    }

    const result = await workflowResponse.json();

    if (!result.success || !result.data?.workflow?.seoAgent) {
      throw new Error('SEO 콘텐츠 생성 실패');
    }

    // 기존 API 형식으로 응답 변환 (하위 호환성)
    return NextResponse.json({
      success: true,
      content: result.data.workflow.seoAgent.content,
      metadata: {
        type: type,
        products: products,
        generatedAt: new Date().toISOString(),
        wordCount: result.data.workflow.seoAgent.content.length,
        keywords: result.data.workflow.seoAgent.keywords
      }
    });

  } catch (error) {
    console.error('[seo-generation] API 오류:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'SEO 글 생성에 실패했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}

/**
 * 상품 URL에서 ID 추출 유틸리티 함수
 */
function extractProductId(url?: string): string | null {
  if (!url) return null;
  
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
}

/**
 * SEO 최적화된 HTML 콘텐츠 생성
 */
// async function generateSeoContent(products: ProductData[], aiContent: string, type: string): string {
//   const productNames = products.map(p => p.name).join(', ');
//   const totalPrice = products.reduce((sum, p) => sum + p.price, 0);
//   const categories = [...new Set(products.map(p => p.category))];

//   const seoTitle = type === 'product_review'  
//     ? `${productNames} - 상품 리뷰 및 구매 가이드`
//     : type === 'comparison'
//     ? `${productNames} - 상품 비교 분석`
//     : `${productNames} - 구매 가이드`;

//   const seoDescription = `${productNames}에 대한 상세한 분석과 리뷰를 제공합니다. 가격: ${totalPrice.toLocaleString()}원, 카테고리: ${categories.join(', ')}`;

//   return `
// # ${seoTitle}

// ## 📋 개요
// ${seoDescription}

// ## 🛍️ 분석된 상품 정보
// ${products.map((product, index) => `
// ### ${index + 1}. ${product.name}
// - **가격**: ${product.price.toLocaleString()}원
// - **카테고리**: ${product.category}
// - **상품 링크**: [구매하기](${product.url})
// `).join('\n')}

// ## 📝 AI 분석 결과

// ${aiContent}

// ## 🎯 SEO 최적화 포인트
// - **키워드**: ${productNames}, ${categories.join(', ')}
// - **가격대**: ${totalPrice.toLocaleString()}원
// - **상품 수**: ${products.length}개
// - **분석 유형**: ${type === 'product_review' ? '상품 리뷰' : type === 'comparison' ? '상품 비교' : '구매 가이드'}

// ## 💡 구매 팁
// ${products.length > 1 ? `
// 1. **가격 비교**: ${products.map(p => `${p.name}(${p.price.toLocaleString()}원)`).join(' vs ')}
// 2. **카테고리별 분석**: ${categories.join(', ')} 카테고리에서 최적의 선택
// 3. **종합 평가**: 각 상품의 장단점을 고려한 구매 결정
// ` : `
// 1. **상품 검토**: ${products[0].name}의 상세한 분석 결과
// 2. **구매 시기**: 현재 가격 ${products[0].price.toLocaleString()}원의 적정성
// 3. **대안 검토**: 유사 상품과의 비교 분석
// `}

// ---
// *이 글은 AI 분석을 통해 생성되었으며, 실제 구매 시에는 추가적인 검토를 권장합니다.*
//   `.trim();
// } 