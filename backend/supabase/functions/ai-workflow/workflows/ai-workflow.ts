/**
 * AI 워크플로우 실행기
 * @module AIWorkflow
 */

// @ts-ignore: Supabase 모듈 import
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { log } from '../lib/logger.ts';
import { validateEnvironment, getCoupangConfig } from '../lib/environment.ts';
import {
  executeCoupangProductSearch,
  executeExtractIds,
  executeAIProductResearch,
  executeSEOAgent,
  executeWordPressPublisher
} from '../nodes/index.ts';

import type {
  AIWorkflowRequest,
  AIWorkflowResponse,
  EnvironmentConfig
} from '../types/index.ts';

/**
 * Supabase 클라이언트 초기화
 */
function getSupabaseClient(config: EnvironmentConfig) {
  return createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
}

/**
 * AI 워크플로우 실행 - 새로운 랜덤 선택 방식
 */
export async function executeAIWorkflow(request: AIWorkflowRequest): Promise<AIWorkflowResponse> {
  const startTime = Date.now();
  const threadId = request.threadId || `ai-workflow-${Date.now()}`;
  
  try {
    log('info', 'AI 워크플로우 시작', { 
      threadId, 
      action: request.action,
      keyword: request.keyword,
      urlCount: request.urls?.length || 0,
      productIdCount: request.productIds?.length || 0,
      config: {
        enablePerplexity: request.config?.enablePerplexity,
        enableWordPress: request.config?.enableWordPress,
        maxProducts: request.config?.maxProducts
      },
      timestamp: new Date().toISOString()
    });

    // 환경 변수 검증
    const config = validateEnvironment();
    const coupangConfig = getCoupangConfig();

    let enrichedData: any[] = [];
    let coupangSearchResult: any = null;
    let extractIdsResult: any = null;

    // 키워드가 있는 경우: 0단계 쿠팡 상품 검색 → 랜덤 선택
    if (request.keyword && request.keyword.trim()) {
      coupangSearchResult = await executeCoupangProductSearch(
        request.keyword,
        request.config?.maxProducts || 5,
        coupangConfig
      );

      // 선택된 상품들을 AI 조사용 형식으로 변환
      const productIds = coupangSearchResult.selectedProducts.map((p: any) => 
        p.productId || extractProductIdFromUrl(p.productUrl) || `generated-${Date.now()}-${Math.random()}`
      );

      // 2단계: AI 상품 조사 (선택된 상품들로)
      const aiResearch = await executeAIProductResearch(
        productIds,
        request.keyword,
        config
      );
      enrichedData = aiResearch.enrichedData;

      // 쿠팡 검색 결과를 AI 조사 결과와 결합
      enrichedData = enrichedData.map((aiProduct: any, index: number) => {
        const coupangProduct = coupangSearchResult.selectedProducts[index];
        return {
          ...aiProduct,
          // 쿠팡 실제 데이터로 보강
          productName: coupangProduct?.productName || aiProduct.productName,
          productPrice: coupangProduct?.productPrice || aiProduct.productPrice,
          productImage: coupangProduct?.productImage || aiProduct.productImage,
          productUrl: coupangProduct?.productUrl || aiProduct.productUrl,
          rating: coupangProduct?.rating || aiProduct.rating,
          reviewCount: coupangProduct?.reviewCount || aiProduct.reviewCount,
          isRocket: coupangProduct?.isRocket ?? aiProduct.isRocket,
          vendorName: coupangProduct?.vendorName || aiProduct.vendorName || 'Unknown',
          originalPrice: coupangProduct?.originalPrice || aiProduct.productPrice,
          discountRate: coupangProduct?.discountRate || 0
        };
      });

    } else if (request.urls && request.urls.length > 0) {
      // URL이 있는 경우: 기존 방식 (1단계 extractIds → 2단계 AI 조사)
      extractIdsResult = await executeExtractIds(request.urls);
      
      const aiResearch = await executeAIProductResearch(
        request.productIds || extractIdsResult.productIds, 
        request.keyword,
        config
      );
      enrichedData = aiResearch.enrichedData;

    } else {
      // 키워드도 URL도 없는 경우: 기본 키워드로 검색
      log('warn', '키워드와 URL 모두 없음, 기본 키워드 사용', { threadId });
      
      coupangSearchResult = await executeCoupangProductSearch(
        '인기 상품',
        5,
        coupangConfig
      );

      const productIds = coupangSearchResult.selectedProducts.map((p: any) => 
        p.productId || `generated-${Date.now()}-${Math.random()}`
      );

      const aiResearch = await executeAIProductResearch(productIds, '인기 상품', config);
      enrichedData = aiResearch.enrichedData;
    }
    
    // 3단계: seoAgent - SEO 최적화 블로그 글 생성
    const seoContent = await executeSEOAgent(enrichedData, request.keyword || '상품 추천', config);
    
    // 4단계: wordpressPublisher - WordPress 자동 발행
    const wordpressResult = await executeWordPressPublisher(seoContent, config);
    
    const executionTime = Date.now() - startTime;
    
    // 완료된 노드 결정
    const completedNodes: string[]= [];
    if (coupangSearchResult) {
      completedNodes.push('coupangProductSearch');
    }
    if (extractIdsResult) {
      completedNodes.push('extractIds');
    }
    completedNodes.push('aiProductResearch', 'seoAgent', 'wordpressPublisher');

    const result: AIWorkflowResponse = {
      success: true,
      data: {
        threadId,
        workflow: {
          // 새로운 노드 결과 포함
          coupangProductSearch: coupangSearchResult ? {
            keyword: coupangSearchResult.keyword,
            totalFound: coupangSearchResult.searchResults.length,
            selectedProducts: coupangSearchResult.selectedProducts,
            selectionMethod: 'random'
          } : undefined,
          extractIds: extractIdsResult || { productIds: [], urls: [] },
          aiProductResearch: { 
            enrichedData, 
            researchSummary: {
              totalProducts: enrichedData.length,
              keyword: request.keyword || '상품 추천',
              avgPrice: enrichedData.length > 0 
                ? enrichedData.reduce((sum: number, p: any) => sum + (p.productPrice || 0), 0) / enrichedData.length 
                : 0,
              avgRating: enrichedData.length > 0 
                ? enrichedData.reduce((sum: number, p: any) => sum + (p.rating || 0), 0) / enrichedData.length 
                : 0,
              rocketDeliveryRate: enrichedData.length > 0 
                ? (enrichedData.filter((p: any) => p.isRocket).length / enrichedData.length) * 100 
                : 0,
              researchMethod: coupangSearchResult 
                ? 'Coupang Search + AI Analysis + Random Selection'
                : 'AI Analysis (Fallback Mode)'
            }
          },
          seoAgent: seoContent,
          wordpressPublisher: wordpressResult
        },
        metadata: {
          createdAt: startTime,
          updatedAt: Date.now(),
          currentNode: 'wordpressPublisher',
          completedNodes,
          executionTime,
          workflow: {
            type: coupangSearchResult ? 'keyword-to-blog' : 'url-to-blog',
            inputType: request.keyword ? 'keyword' : (request.urls?.length ? 'urls' : 'default'),
            productSelectionMethod: 'random'
          }
        }
      },
      message: `AI 워크플로우가 성공적으로 완료되었습니다. ${enrichedData.length}개 상품을 분석하여 블로그 글을 생성했습니다.`
    };

    log('info', 'AI 워크플로우 완료', { 
      threadId, 
      executionTime, 
      productCount: enrichedData.length,
      wordpressStatus: wordpressResult.status
    });

    return result;
  } catch (error) {
    log('error', 'AI 워크플로우 실패', { 
      threadId, 
      error: error instanceof Error ? error.message : String(error)
    });
    
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
      message: 'AI 워크플로우 실행 중 오류가 발생했습니다.'
    };
  }
}

/**
 * URL에서 쿠팡 상품 ID 추출 (유틸리티 함수)
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