'use client';

import { useCallback } from 'react';

/**
 * SEO 관련 API 호출 전용 훅
 */

export interface SEOGenerationParams {
  products: Array<{
    name: string;
    price: number;
    category: string;
    url: string;
    image?: string;
  }>;
  query?: string;
  type?: 'product_review' | 'comparison' | 'guide';
}

export interface SEOAPIResponse {
  content: string;
  metadata: {
    type: string;
    products: any[];
    generatedAt: string;
    wordCount: number;
    keywords: string[];
  };
}

export function useSEOAPI() {
  /**
   * 레거시 SEO API 호출 (기존 코드와의 호환성)
   */
  const generateSEOContent = useCallback(async (
    params: SEOGenerationParams
  ): Promise<SEOAPIResponse> => {
    const response = await fetch('/api/langgraph/seo-generation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    return data;
  }, []);

  /**
   * 새로운 워크플로우 기반 SEO 생성
   */
  const generateSEOViaWorkflow = useCallback(async (
    keyword: string,
    urls: string[]
  ): Promise<{ title: string; content: string; keywords: string[]; summary: string; }> => {
    const response = await fetch('/api/workflow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'execute',
        keyword,
        urls,
        config: {
          enablePerplexity: true,
          enableWordPress: false, // SEO 생성만
          maxProducts: 5
        }
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || data.message || 'SEO 생성 실패');
    }

    const seoAgent = data.data?.workflow?.seoAgent;
    if (!seoAgent) {
      throw new Error('SEO 콘텐츠가 생성되지 않았습니다');
    }

    return seoAgent;
  }, []);

  return {
    generateSEOContent,
    generateSEOViaWorkflow,
  };
}