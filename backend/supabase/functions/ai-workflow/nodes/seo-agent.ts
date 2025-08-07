/**
 * SEO 에이전트 노드 - Perplexity API로 최적화된 블로그 글 생성
 * @module SEOAgentNode
 */

import { log } from '../lib/logger.ts';
import type { EnvironmentConfig } from '../lib/environment.ts';
import type { ProductInfo, SEOContent } from '../types/index.ts';


/**
 * SEO 에이전트 노드 실행
 */
export async function executeSEOAgent(
  enrichedData: ProductInfo[], 
  keyword?: string,
  config?: EnvironmentConfig
): Promise<SEOContent> {
  const startTime = Date.now();
  log('info', 'seoAgent 노드 시작', { 
    productCount: enrichedData.length, 
    keyword,
    hasPerplexityKey: !!config?.PERPLEXITY_API_KEY,
    timestamp: new Date().toISOString()
  });
  
  // Perplexity API 키가 없으면 오류 발생
  if (!config?.PERPLEXITY_API_KEY) {
    const error = 'Perplexity API 키가 설정되지 않았습니다. 환경 변수 PERPLEXITY_API_KEY를 확인해주세요.';
    log('error', error, {
      availableKeys: {
        openai: !!config?.OPENAI_API_KEY,
        perplexity: false,
        wordpress: !!config?.WORDPRESS_URL
      }
    });
    throw new Error(error);
  }

  try {
    // 요청 데이터 준비 및 로깅
    const requestData = {
      model: 'sonar-pro',
      messages: [
        {
          role: 'system',
          content: `당신은 한국의 전문 상품 리뷰어이자 SEO 전문가입니다. 
쿠팡 파트너스 수익 극대화를 위한 SEO 최적화 블로그 포스트를 작성하는 것이 목표입니다.

작성 가이드라인:
1. 한국어로 자연스럽게 작성
2. SEO 친화적 구조 (H2, H3 태그 활용)
3. 실제 사용 후기 스타일로 신뢰감 조성
4. 구매 결정에 도움이 되는 구체적 정보 제공
5. 워드프레스 마크다운 형식으로 구조화
6. 상품명은 간결하게 표시하고, 핵심 정보만 포함
7. 각 상품별로 명확한 장단점 분석
8. 가격대비 성능, 배송 조건 등을 종합적으로 평가

응답 형식:
- 제목: SEO 최적화된 60자 이내 제목
- 본문: 마크다운 형식의 구조화된 콘텐츠
- 키워드: 관련 키워드 5개 이상
- 요약: 155자 이내 메타 설명

주의사항:
- 상품명이 너무 길면 핵심 브랜드명과 제품명만 사용
- 반복적인 정보는 제거하고 핵심만 포함
- 실제 구매 결정에 도움이 되는 정보 위주로 작성`
        },
        {
          role: 'user',
          content: `다음 상품들에 대한 SEO 최적화 블로그 포스트를 작성해주세요:

**검색 키워드**: "${keyword || '추천 상품'}"

**분석 대상 상품 목록**:
${enrichedData.map((product, index) => {
            // 상품명 간소화 (첫 50자만 사용)
            const simplifiedName = product.productName.length > 50 
              ? product.productName.substring(0, 50) + '...' 
              : product.productName;
            
            return `\n${index + 1}번 상품: ${simplifiedName}
- 판매가: ${product.productPrice.toLocaleString()}원
- 고객평점: ${product.rating}/5.0점 (${product.reviewCount}개 리뷰)
- 배송옵션: ${product.isRocket ? '🚀로켓배송' : '일반배송'} / ${product.isFreeShipping ? '무료배송' : '유료배송'}
- 상품설명: ${product.description?.substring(0, 100) || 'N/A'}${product.description && product.description.length > 100 ? '...' : ''}
- 주요특징: ${product.enrichedFeatures?.slice(0, 3).join(', ') || 'N/A'}
- 추천대상: ${product.enrichedTargetAudience?.substring(0, 50) || '일반 사용자'}
- 쿠팡링크: ${product.productUrl}`;
          }).join('\n')}

**종합 분석 데이터**:
- 총 비교상품: ${enrichedData.length}개
- 평균 판매가: ${Math.round(enrichedData.reduce((sum, p) => sum + p.productPrice, 0) / enrichedData.length).toLocaleString()}원
- 평균 만족도: ${(enrichedData.reduce((sum, p) => sum + p.rating, 0) / enrichedData.length).toFixed(1)}/5.0점
- 로켓배송 비율: ${Math.round((enrichedData.filter(p => p.isRocket).length / enrichedData.length) * 100)}%

위 정보를 바탕으로 "${keyword}" 키워드에 최적화된 상품 비교 리뷰 블로그 포스트를 작성해주세요.`
        }
      ],
      max_tokens: 4000,
      temperature: 0.7,
      stream: false
    };

    log('info', 'Perplexity API 요청 시작', {
      model: requestData.model,
      messagesCount: requestData.messages.length,
      maxTokens: requestData.max_tokens,
      temperature: requestData.temperature,
      inputDataSize: JSON.stringify(requestData).length
    });

    // 타임아웃 설정 (60초)
    const timeoutMs = 60000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
        'User-Agent': 'CP9-AI-Workflow/1.0'
      },
      body: JSON.stringify(requestData),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    // 응답 상태 로깅
    log('info', 'Perplexity API 응답 수신', {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'content-type': response.headers.get('content-type'),
        'x-ratelimit-remaining': response.headers.get('x-ratelimit-remaining'),
        'x-ratelimit-reset': response.headers.get('x-ratelimit-reset')
      },
      responseTime: Date.now() - startTime
    });

    if (!response.ok) {
      const errorBody = await response.text();
      log('error', 'Perplexity API 오류 응답', {
        status: response.status,
        statusText: response.statusText,
        errorBody: errorBody.substring(0, 500),
        headers: Object.fromEntries(response.headers.entries())
      });
      throw new Error(`Perplexity API 오류 [${response.status}]: ${response.statusText}`);
    }

    const result = await response.json();
    log('info', 'Perplexity API 응답 파싱 완료', {
      hasChoices: !!result.choices,
      choicesLength: result.choices?.length || 0,
      usage: result.usage,
      model: result.model
    });

    const generatedContent = result.choices?.[0]?.message?.content;

    if (!generatedContent) {
      log('error', 'Perplexity API 응답에 콘텐츠 없음', {
        result: JSON.stringify(result).substring(0, 300),
        choices: result.choices
      });
      throw new Error('Perplexity API 응답에서 콘텐츠를 찾을 수 없습니다.');
    }

    // 응답 내용 분석 및 파싱
    log('info', 'SEO 콘텐츠 생성 완료', {
      contentLength: generatedContent.length,
      contentPreview: generatedContent.substring(0, 200) + '...',
      executionTime: Date.now() - startTime
    });

    // 제목 추출 (마크다운 H1 또는 첫 줄)
    const titleMatch = generatedContent.match(/^#\s*(.+)$/m) || generatedContent.match(/^([^\n]+)/);
    const extractedTitle = titleMatch ? titleMatch[1].trim() : `${keyword || '상품'} 추천 가이드`;
    
    // 키워드 생성
    const seoKeywords = [
      keyword || '상품',
      '추천',
      '구매가이드',
      '비교',
      '리뷰',
      '쿠팡',
      '2024'
    ].filter(Boolean);
    
    // 요약 생성 (본문 첫 문단 기반)
    const summaryMatch = generatedContent.match(/(?:^|\n)([^\n#]{50,200}[.!?])/);
    const autoSummary = summaryMatch 
      ? summaryMatch[1].trim()
      : `${keyword || '상품'} 추천 상품 ${enrichedData.length}개를 전문가가 분석하여 완벽한 구매 가이드를 제공합니다.`;

    const finalContent = {
      title: extractedTitle,
      content: generatedContent,
      keywords: seoKeywords,
      summary: autoSummary
    };

    log('info', 'seoAgent 노드 완료 (Perplexity 생성)', {
      title: finalContent.title,
      keywordCount: finalContent.keywords.length,
      contentLength: finalContent.content.length,
      summaryLength: finalContent.summary.length,
      totalExecutionTime: Date.now() - startTime
    });

    return finalContent;

  } catch (error) {
    const errorInfo = {
      errorType: error instanceof Error ? error.constructor.name : 'Unknown',
      errorMessage: error instanceof Error ? error.message : String(error),
      executionTime: Date.now() - startTime,
      timestamp: new Date().toISOString()
    };
    
    if (error.name === 'AbortError') {
      log('error', 'Perplexity API 요청 타임아웃 (60초)', errorInfo);
      throw new Error('SEO 콘텐츠 생성 요청이 타임아웃되었습니다. 네트워크 상태를 확인하고 다시 시도해주세요.');
    } else {
      log('error', 'Perplexity API SEO 글 생성 실패', errorInfo);
      throw new Error(`SEO 콘텐츠 생성에 실패했습니다: ${errorInfo.errorMessage}`);
    }
  }
}