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
}

/**
 * LangGraph를 통한 SEO 글 생성 API
 * 
 * @param request - SEO 글 생성 요청
 * @returns 생성된 SEO 글
 * 
 * @example
 * ```typescript
 * const response = await fetch('/api/langgraph/seo-generation', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     products: [
 *       { name: '상품명', price: 10000, category: '카테고리', url: '상품URL' }
 *     ],
 *     type: 'product_review'
 *   })
 * });
 * ```
 */
export async function POST(request: NextRequest) {
  try {
    const body: SeoGenerationRequest = await request.json();
    const { products, type } = body;

    if (!products || products.length === 0) {
      return NextResponse.json(
        { error: '상품 정보가 필요합니다.' },
        { status: 400 }
      );
    }

    // LangGraph Edge Function 호출
    const langgraphResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/langgraph-api`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'seo_generation',
          query: `다음 상품들을 분석하여 SEO 최적화된 ${type === 'product_review' ? '상품 리뷰' : type === 'comparison' ? '상품 비교' : '구매 가이드'} 글을 작성해주세요.`,
          products: products.map(product => ({
            name: product.name,
            price: product.price,
            category: product.category,
            url: product.url,
            image: product.image
          })),
          seo_type: type
        }),
      }
    );

    if (!langgraphResponse.ok) {
      throw new Error(`LangGraph API 오류: ${langgraphResponse.status}`);
    }

    const result = await langgraphResponse.json();

    // SEO 최적화된 HTML 구조 생성
    const seoContent = generateSeoContent(products, result.content || '', type);

    return NextResponse.json({
      success: true,
      content: seoContent,
      products: products,
      type: type
    });

  } catch (error) {
    console.error('SEO 글 생성 오류:', error);
    
    return NextResponse.json(
      { 
        error: 'SEO 글 생성에 실패했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}

/**
 * SEO 최적화된 HTML 콘텐츠 생성
 */
function generateSeoContent(products: ProductData[], aiContent: string, type: string): string {
  const productNames = products.map(p => p.name).join(', ');
  const totalPrice = products.reduce((sum, p) => sum + p.price, 0);
  const categories = [...new Set(products.map(p => p.category))];

  const seoTitle = type === 'product_review' 
    ? `${productNames} - 상품 리뷰 및 구매 가이드`
    : type === 'comparison'
    ? `${productNames} - 상품 비교 분석`
    : `${productNames} - 구매 가이드`;

  const seoDescription = `${productNames}에 대한 상세한 분석과 리뷰를 제공합니다. 가격: ${totalPrice.toLocaleString()}원, 카테고리: ${categories.join(', ')}`;

  return `
# ${seoTitle}

## 📋 개요
${seoDescription}

## 🛍️ 분석된 상품 정보
${products.map((product, index) => `
### ${index + 1}. ${product.name}
- **가격**: ${product.price.toLocaleString()}원
- **카테고리**: ${product.category}
- **상품 링크**: [구매하기](${product.url})
`).join('\n')}

## 📝 AI 분석 결과

${aiContent}

## 🎯 SEO 최적화 포인트
- **키워드**: ${productNames}, ${categories.join(', ')}
- **가격대**: ${totalPrice.toLocaleString()}원
- **상품 수**: ${products.length}개
- **분석 유형**: ${type === 'product_review' ? '상품 리뷰' : type === 'comparison' ? '상품 비교' : '구매 가이드'}

## 💡 구매 팁
${products.length > 1 ? `
1. **가격 비교**: ${products.map(p => `${p.name}(${p.price.toLocaleString()}원)`).join(' vs ')}
2. **카테고리별 분석**: ${categories.join(', ')} 카테고리에서 최적의 선택
3. **종합 평가**: 각 상품의 장단점을 고려한 구매 결정
` : `
1. **상품 검토**: ${products[0].name}의 상세한 분석 결과
2. **구매 시기**: 현재 가격 ${products[0].price.toLocaleString()}원의 적정성
3. **대안 검토**: 유사 상품과의 비교 분석
`}

---
*이 글은 AI 분석을 통해 생성되었으며, 실제 구매 시에는 추가적인 검토를 권장합니다.*
  `.trim();
} 