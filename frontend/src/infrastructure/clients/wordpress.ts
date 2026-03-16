/**
 * WordPress REST API 클라이언트
 * Application Password 인증을 사용하여 포스트를 생성/관리합니다.
 */

import { config } from '@/shared/lib/config'

// ── 타입 정의 ──

/** WP REST API 포스트 생성 요청 */
export interface WPCreatePostParams {
  title: string
  content: string               // HTML 본문
  status?: 'publish' | 'draft'  // 기본: publish
  excerpt?: string              // 요약 (메타 디스크립션 용)
  categories?: number[]
  tags?: number[]
  featured_media?: number       // 썸네일 미디어 ID
  meta?: Record<string, string> // 커스텀 필드 (itemId 등)
}

/** WP REST API 포스트 응답 */
export interface WPPostResponse {
  id: number
  link: string
  status: string
  title: { rendered: string }
  date: string
}

/** WP 미디어 업로드 응답 */
export interface WPMediaResponse {
  id: number
  source_url: string
}

// ── 싱글톤 인스턴스 ──

let _wpClient: WordPressClient | null = null

/**
 * WordPress 클라이언트 인스턴스를 반환합니다.
 * 인자로 인증 정보를 전달하면 해당 정보로 새로운 인스턴스를 생성하여 반환하고,
 * 파라미터가 없으면 환경변수 기반의 싱글톤 인스턴스를 반환합니다.
 */
export function getWordPressClient(
  siteUrl?: string | null,
  username?: string | null,
  appPassword?: string | null
): WordPressClient | null {
  if (siteUrl && username && appPassword) {
    return new WordPressClient(siteUrl, username, appPassword)
  }

  if (_wpClient) return _wpClient

  const fallbackSiteUrl = config.WORDPRESS_SITE_URL
  const fallbackUsername = config.WORDPRESS_USERNAME
  const fallbackAppPassword = config.WORDPRESS_APP_PASSWORD

  if (!fallbackSiteUrl || !fallbackUsername || !fallbackAppPassword) {
    console.warn('⚠️ [WordPress] 환경변수가 설정되지 않았습니다 (WORDPRESS_SITE_URL, WORDPRESS_USERNAME, WORDPRESS_APP_PASSWORD)')
    return null
  }

  _wpClient = new WordPressClient(fallbackSiteUrl, fallbackUsername, fallbackAppPassword)
  return _wpClient
}

// ── WordPress 클라이언트 클래스 ──

export class WordPressClient {
  private baseUrl: string
  private authHeader: string

  constructor(siteUrl: string, username: string, appPassword: string) {
    // 후행 슬래시 제거
    this.baseUrl = siteUrl.replace(/\/+$/, '')
    // Basic Auth 헤더 생성
    this.authHeader = `Basic ${Buffer.from(`${username}:${appPassword}`).toString('base64')}`
  }

  /**
   * WP REST API 공통 fetch 래퍼
   */
  private async wpFetch<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseUrl}/wp-json/wp/v2${endpoint}`
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.authHeader,
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`WordPress API 오류 (${response.status}): ${errorText}`)
    }

    return response.json() as Promise<T>
  }

  /**
   * 포스트 생성
   * 동일 아이템도 여러 번 발행 가능 (중복 체크 없음)
   */
  async createPost(params: WPCreatePostParams): Promise<WPPostResponse> {
    console.log(`📝 [WordPress] 포스트 생성 중: "${params.title}"`)

    const result = await this.wpFetch<WPPostResponse>('/posts', {
      method: 'POST',
      body: JSON.stringify({
        title: params.title,
        content: params.content,
        status: params.status || 'publish',
        excerpt: params.excerpt || '',
        categories: params.categories || [],
        tags: params.tags || [],
        featured_media: params.featured_media || 0,
        meta: params.meta || {},
      }),
    })

    console.log(`✅ [WordPress] 포스트 발행 완료: ${result.link} (ID: ${result.id})`)
    return result
  }

  /**
   * URL로부터 이미지를 WP 미디어 라이브러리에 업로드합니다.
   * 썸네일 설정에 사용됩니다.
   */
  async uploadMediaFromUrl(imageUrl: string, filename: string, altText?: string): Promise<WPMediaResponse> {
    console.log(`🖼️ [WordPress] 미디어 업로드 중: ${filename}`)

    // 이미지 다운로드
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      throw new Error(`이미지 다운로드 실패: ${imageResponse.status}`)
    }
    const imageBuffer = await imageResponse.arrayBuffer()

    // Content-Type 추출
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg'
    const ext = contentType.includes('png') ? '.png' : contentType.includes('webp') ? '.webp' : '.jpg'
    const safeFilename = filename.replace(/[^a-zA-Z0-9가-힣_-]/g, '_') + ext

    // WP 미디어 업로드
    const url = `${this.baseUrl}/wp-json/wp/v2/media`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': this.authHeader,
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${safeFilename}"`,
      },
      body: imageBuffer,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`WordPress 미디어 업로드 오류 (${response.status}): ${errorText}`)
    }

    const media = await response.json() as WPMediaResponse

    // alt 텍스트 설정
    if (altText) {
      await this.wpFetch(`/media/${media.id}`, {
        method: 'POST',
        body: JSON.stringify({ alt_text: altText }),
      })
    }

    console.log(`✅ [WordPress] 미디어 업로드 완료: ${media.source_url} (ID: ${media.id})`)
    return media
  }

  /**
   * 카테고리 목록 조회
   */
  async getCategories(): Promise<Array<{ id: number; name: string; slug: string }>> {
    return this.wpFetch('/categories?per_page=100')
  }

  /**
   * 연결 테스트 — 카테고리 목록을 조회하여 인증 성공 여부를 확인합니다.
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const categories = await this.getCategories()
      return {
        success: true,
        message: `WordPress 연결 성공! (${categories.length}개 카테고리 확인)`,
      }
    } catch (error) {
      return {
        success: false,
        message: `WordPress 연결 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
      }
    }
  }
}
