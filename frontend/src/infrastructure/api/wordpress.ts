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
  duplicateCheck: boolean;
}

/**
 * WordPress API 클라이언트
 */
export class WordPressAPI {
  private config: WordPressConfig;
  private authHeader: string;

  constructor(config: WordPressConfig) {
    this.config = config;
    this.authHeader = `Basic ${Buffer.from(`${config.username}:${config.password}`).toString('base64')}`;
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
        `${this.config.apiUrl}/wp/v2/posts?search=${encodeURIComponent(title)}&per_page=10`,
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
      throw new Error(`포스트 검색 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  /**
   * 메타데이터로 포스트 검색
   */
  async searchPostByMeta(metaKey: string, metaValue: string): Promise<WordPressResponse[]> {
    try {
      const response = await fetch(
        `${this.config.apiUrl}/wp/v2/posts?meta_key=${metaKey}&meta_value=${encodeURIComponent(metaValue)}`,
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
      throw new Error(`메타 검색 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  /**
   * 중복 포스트 체크
   */
  async checkDuplicatePost(productId: string, title: string): Promise<WordPressResponse | null> {
    try {
      // 1. 메타데이터로 productId 검색
      const metaResults = await this.searchPostByMeta('product_id', productId);
      if (metaResults.length > 0) {
        return metaResults[0];
      }

      // 2. 제목으로 검색 (유사도 체크)
      const titleResults = await this.searchPostByTitle(title);
      const similarPost = titleResults.find(post => 
        this.calculateSimilarity(post.title.rendered, title) > 0.8
      );

      return similarPost || null;
    } catch (error) {
      console.error('중복 포스트 체크 실패:', error);
      return null;
    }
  }

  /**
   * 제목 유사도 계산 (간단한 Jaccard 유사도)
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

      const media = await response.json();
      return media.id;
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
      const response = await fetch(`${this.config.apiUrl}/wp/v2/categories?per_page=100`, {
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
      const response = await fetch(`${this.config.apiUrl}/wp/v2/tags?per_page=100`, {
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
 * WordPress API 클라이언트 인스턴스 생성
 */
export function createWordPressClient(config: WordPressConfig): WordPressAPI {
  return new WordPressAPI(config);
} 