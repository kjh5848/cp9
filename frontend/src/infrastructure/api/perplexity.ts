/**
 * Perplexity API 클라이언트
 * 상품 정보 요약 및 SEO 콘텐츠 생성
 */

import { SEOInfo, PerplexityConfig } from '@/shared/types/enrichment';

/**
 * Perplexity API 응답 타입
 */
interface PerplexityResponse {
  id: string;
  model: string;
  object: string;
  created: number;
  choices: Array<{
    index: number;
    delta: {
      content?: string;
    };
    finish_reason: string | null;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Perplexity API 클라이언트
 */
export class PerplexityAPI {
  private apiKey: string;
  private config: PerplexityConfig;
  private baseUrl = 'https://api.perplexity.ai/chat/completions';

  constructor(apiKey: string, config: Partial<PerplexityConfig> = {}) {
    this.apiKey = apiKey;
    this.config = {
      model: 'gpt-4o',
      maxTokens: 2000,
      temperature: 0.7,
      retryCount: 3,
      ...config,
    };
  }

  /**
   * 상품 정보를 기반으로 SEO 콘텐츠 생성
   */
  async generateSEOContent(productTitle: string, productDescription?: string): Promise<SEOInfo> {
    const prompt = this.buildSEOPrompt(productTitle, productDescription);
    
    try {
      const response = await this.makeRequest(prompt);
      return this.parseSEOResponse(response);
    } catch (error) {
      console.error('Perplexity API 요청 실패:', error);
      throw new Error(`SEO 콘텐츠 생성 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  /**
   * 상품 리뷰 요약 생성
   */
  async generateReviewSummary(productTitle: string): Promise<string[]> {
    const prompt = `"${productTitle}" 상품의 주요 리뷰 포인트 5개를 간단히 요약해주세요. 각 포인트는 20자 이내로 작성해주세요.`;

    try {
      const response = await this.makeRequest(prompt);
      return this.parseReviewResponse(response);
    } catch (error) {
      console.error('리뷰 요약 생성 실패:', error);
      return [];
    }
  }

  /**
   * 관련 상품 검색
   */
  async findRelatedProducts(productTitle: string): Promise<string[]> {
    const prompt = `"${productTitle}"와 유사한 상품 3개를 추천해주세요. 각 상품명만 간단히 나열해주세요.`;

    try {
      const response = await this.makeRequest(prompt);
      return this.parseRelatedProductsResponse(response);
    } catch (error) {
      console.error('관련 상품 검색 실패:', error);
      return [];
    }
  }

  /**
   * SEO 프롬프트 생성
   */
  private buildSEOPrompt(productTitle: string, productDescription?: string): string {
    const basePrompt = `"${productTitle}" 상품에 대한 SEO 최적화 콘텐츠를 생성해주세요.`;

    const descriptionPart = productDescription 
      ? `\n\n상품 설명: ${productDescription}`
      : '';

    const requirements = `
다음 형식으로 JSON 응답을 생성해주세요:

{
  "description": "상품에 대한 상세한 설명 (200자 내외)",
  "pros": ["장점1", "장점2", "장점3"],
  "cons": ["단점1", "단점2"],
  "keywords": ["키워드1", "키워드2", "키워드3", "키워드4", "키워드5"],
  "faq": [
    {"question": "자주 묻는 질문1", "answer": "답변1"},
    {"question": "자주 묻는 질문2", "answer": "답변2"},
    {"question": "자주 묻는 질문3", "answer": "답변3"}
  ]
}

주의사항:
- JSON 형식을 정확히 지켜주세요
- 장단점은 구체적이고 실용적인 내용으로 작성해주세요
- 키워드는 검색에 유용한 단어들로 구성해주세요
- FAQ는 실제 구매 시 궁금할 만한 내용으로 작성해주세요`;

    return basePrompt + descriptionPart + requirements;
  }

  /**
   * Perplexity API 요청
   */
  private async makeRequest(prompt: string): Promise<string> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.config.retryCount; attempt++) {
      try {
        const response = await fetch(this.baseUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: this.config.model,
            messages: [
              {
                role: 'user',
                content: prompt,
              },
            ],
            max_tokens: this.config.maxTokens,
            temperature: this.config.temperature,
            stream: false,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`API 요청 실패: ${response.status} ${errorData.error?.message || response.statusText}`);
        }

        const data: PerplexityResponse = await response.json();
        return data.choices[0]?.delta?.content || data.choices[0]?.content || '';

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('알 수 없는 오류');
        
        // Rate limit 에러인 경우 재시도
        if (error instanceof Error && error.message.includes('rate limit')) {
          const delay = Math.pow(2, attempt) * 1000; // 지수 백오프
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        // 마지막 시도가 아니면 재시도
        if (attempt < this.config.retryCount) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
      }
    }

    throw lastError || new Error('모든 재시도가 실패했습니다.');
  }

  /**
   * SEO 응답 파싱
   */
  private parseSEOResponse(response: string): SEOInfo {
    try {
      // JSON 블록 추출
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('JSON 응답을 찾을 수 없습니다.');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        description: parsed.description || '',
        pros: Array.isArray(parsed.pros) ? parsed.pros : [],
        cons: Array.isArray(parsed.cons) ? parsed.cons : [],
        keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
        faq: Array.isArray(parsed.faq) ? parsed.faq : [],
      };
    } catch (error) {
      console.error('SEO 응답 파싱 실패:', error);
      
      // 기본값 반환
      return {
        description: '상품 정보를 확인해주세요.',
        pros: [],
        cons: [],
        keywords: [],
        faq: [],
      };
    }
  }

  /**
   * 리뷰 응답 파싱
   */
  private parseReviewResponse(response: string): string[] {
    try {
      // 번호가 있는 리스트 형태로 파싱
      const lines = response.split('\n')
        .map(line => line.trim())
        .filter(line => line.match(/^\d+\./))
        .map(line => line.replace(/^\d+\.\s*/, ''));

      return lines.length > 0 ? lines : [response];
    } catch (error) {
      console.error('리뷰 응답 파싱 실패:', error);
      return [response];
    }
  }

  /**
   * 관련 상품 응답 파싱
   */
  private parseRelatedProductsResponse(response: string): string[] {
    try {
      // 줄바꿈이나 쉼표로 구분된 상품명 파싱
      const products = response.split(/[\n,]/)
        .map(product => product.trim())
        .filter(product => product.length > 0);

      return products;
    } catch (error) {
      console.error('관련 상품 응답 파싱 실패:', error);
      return [];
    }
  }
}

/**
 * 기본 Perplexity API 인스턴스
 */
export const perplexityAPI = new PerplexityAPI(
  process.env.PERPLEXITY_API_KEY || '',
  {
    model: 'gpt-4o',
    maxTokens: 2000,
    temperature: 0.7,
    retryCount: 3,
  }
); 