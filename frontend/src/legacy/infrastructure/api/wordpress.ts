/**
 * WordPress REST API 클라이언트
 * 포스트 생성, 수정, 중복 체크 기능
 */

import { WordPressPost, WordPressResponse } from '@/features/langgraph/types';

/**
 * WordPress API 설정
 */
export interface WordPressConfig {
  apiUrl: string;
  username: string;
  password: string;
  defaultStatus: 'draft' | 'publish';
  categories: number[];
  tags: string[];
  duplicateCheck?: boolean;
}

/**
 * WordPress API 클라이언트
 */
export class WordPressAPI {
  private config: WordPressConfig;
  private authHeader: string;

  constructor(config: WordPressConfig) {
    this.config = config;
    // 브라우저 환경에서 base64 인코딩
    this.authHeader = `Basic ${btoa(`${config.username}:${config.password}`)}`;
  }

  /**
   * 포스트 생성
   */
  async createPost(post: WordPressPost): Promise<WordPressResponse> {
    try {
      const response = await fetch(`${this.config.apiUrl}/wp/v2/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.authHeader,
        },
        body: JSON.stringify({
          title: post.title,
          content: post.content,
          excerpt: post.excerpt,
          status: post.status || this.config.defaultStatus,
          categories: post.categories || this.config.categories,
          tags: post.tags || this.config.tags,
          featured_media: post.featured_media,
          meta: post.meta,
        }),
      });

      if (!response.ok) {
        throw new Error(`WordPress API 오류: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('WordPress 포스트 생성 실패:', error);
      throw new Error(`포스트 생성 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  /**
   * 포스트 수정
   */
  async updatePost(postId: number, post: Partial<WordPressPost>): Promise<WordPressResponse> {
    try {
      const response = await fetch(`${this.config.apiUrl}/wp/v2/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.authHeader,
        },
        body: JSON.stringify(post),
      });

      if (!response.ok) {
        throw new Error(`WordPress API 오류: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('WordPress 포스트 수정 실패:', error);
      throw new Error(`포스트 수정 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  /**
   * 포스트 조회
   */
  async getPost(postId: number): Promise<WordPressResponse> {
    try {
      const response = await fetch(`${this.config.apiUrl}/wp/v2/posts/${postId}`, {
        headers: {
          'Authorization': this.authHeader,
        },
      });

      if (!response.ok) {
        throw new Error(`WordPress API 오류: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('WordPress 포스트 조회 실패:', error);
      throw new Error(`포스트 조회 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  /**
   * 제목으로 포스트 검색
   */
  async searchPostByTitle(title: string): Promise<WordPressResponse[]> {
    try {
      const response = await fetch(
        `${this.config.apiUrl}/wp/v2/posts?search=${encodeURIComponent(title)}`,
        {
          headers: {
            'Authorization': this.authHeader,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`WordPress API 오류: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('WordPress 포스트 검색 실패:', error);
      return [];
    }
  }

  /**
   * 메타데이터로 포스트 검색
   */
  async searchPostByMeta(metaKey: string, metaValue: string): Promise<WordPressResponse[]> {
    try {
      const response = await fetch(
        `${this.config.apiUrl}/wp/v2/posts?meta_key=${metaKey}&meta_value=${metaValue}`,
        {
          headers: {
            'Authorization': this.authHeader,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`WordPress API 오류: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('WordPress 메타 검색 실패:', error);
      return [];
    }
  }

  /**
   * 중복 포스트 체크
   */
  async checkDuplicatePost(productId: string, title: string): Promise<WordPressResponse | null> {
    try {
      // 1. product_id 메타 키로 중복 체크
      const metaResults = await this.searchPostByMeta('product_id', productId);
      if (metaResults.length > 0) {
        return metaResults[0];
      }

      // 2. 제목 유사도로 중복 체크
      const titleResults = await this.searchPostByTitle(title);
      if (titleResults.length > 0) {
        // 유사도 계산하여 가장 유사한 포스트 반환
        const mostSimilar = titleResults.reduce((prev, current) => {
          const prevSimilarity = this.calculateSimilarity(title, prev.title.rendered);
          const currentSimilarity = this.calculateSimilarity(title, current.title.rendered);
          return currentSimilarity > prevSimilarity ? current : prev;
        });

        const similarity = this.calculateSimilarity(title, mostSimilar.title.rendered);
        if (similarity > 0.8) { // 80% 이상 유사하면 중복으로 간주
          return mostSimilar;
        }
      }

      return null;
    } catch (error) {
      console.error('중복 포스트 체크 실패:', error);
      return null;
    }
  }

  /**
   * 제목 유사도 계산 (Jaccard 인덱스)
   */
  private calculateSimilarity(title1: string, title2: string): number {
    const words1 = new Set(title1.toLowerCase().split(/\s+/));
    const words2 = new Set(title2.toLowerCase().split(/\s+/));

    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
  }

  /**
   * 미디어 업로드
   */
  async uploadMedia(file: File, altText?: string): Promise<number> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (altText) {
        formData.append('alt_text', altText);
      }

      const response = await fetch(`${this.config.apiUrl}/wp/v2/media`, {
        method: 'POST',
        headers: {
          'Authorization': this.authHeader,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`WordPress API 오류: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result.id;
    } catch (error) {
      console.error('WordPress 미디어 업로드 실패:', error);
      throw new Error(`미디어 업로드 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  /**
   * 카테고리 목록 조회
   */
  async getCategories(): Promise<Array<{ id: number; name: string; slug: string }>> {
    try {
      const response = await fetch(`${this.config.apiUrl}/wp/v2/categories`, {
        headers: {
          'Authorization': this.authHeader,
        },
      });

      if (!response.ok) {
        throw new Error(`WordPress API 오류: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('WordPress 카테고리 조회 실패:', error);
      return [];
    }
  }

  /**
   * 태그 목록 조회
   */
  async getTags(): Promise<Array<{ id: number; name: string; slug: string }>> {
    try {
      const response = await fetch(`${this.config.apiUrl}/wp/v2/tags`, {
        headers: {
          'Authorization': this.authHeader,
        },
      });

      if (!response.ok) {
        throw new Error(`WordPress API 오류: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('WordPress 태그 조회 실패:', error);
      return [];
    }
  }
}

/**
 * WordPress 클라이언트 생성 함수
 */
export function createWordPressClient(config: WordPressConfig): WordPressAPI {
  return new WordPressAPI(config);
} 