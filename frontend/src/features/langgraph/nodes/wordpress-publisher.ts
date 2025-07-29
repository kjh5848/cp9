'use server';

import { LangGraphState, LangGraphNode } from '../types';
import { createWordPressClient } from '@/infrastructure/api/wordpress';

/**
 * WordPress REST API를 사용한 포스트 발행 노드
 * SEO 콘텐츠를 WordPress에 발행하고 중복 게시를 방지
 * 
 * @param state - LangGraph 상태 객체
 * @returns 업데이트된 상태 객체
 */
export async function wordpressPublisherNode(state: LangGraphState): Promise<Partial<LangGraphState>> {
  try {
    const { seoContent } = state;
    const { productIds } = state.input;
    
    if (!seoContent.title || !seoContent.content) {
      throw new Error('SEO 콘텐츠가 없습니다');
    }

    console.log('[wordpressPublisher] WordPress 포스트 발행 시작');

    // WordPress 클라이언트 생성
    const wordpressClient = createWordPressClient({
      apiUrl: process.env.WORDPRESS_API_URL || '',
      username: process.env.WORDPRESS_USERNAME || '',
      password: process.env.WORDPRESS_PASSWORD || '',
      defaultStatus: (process.env.WORDPRESS_DEFAULT_STATUS as 'draft' | 'publish') || 'draft',
      categories: process.env.WORDPRESS_CATEGORIES?.split(',').map(Number) || [],
      tags: process.env.WORDPRESS_TAGS?.split(',') || []
    });

    // 중복 게시 방지 체크
    const duplicatePost = await checkDuplicatePost(wordpressClient, productIds, seoContent.title);
    
    let postResult;
    if (duplicatePost) {
      // 기존 포스트 업데이트
      console.log('[wordpressPublisher] 기존 포스트 업데이트:', duplicatePost.id);
      postResult = await updateExistingPost(wordpressClient, duplicatePost.id, seoContent, productIds);
    } else {
      // 새 포스트 생성
      console.log('[wordpressPublisher] 새 포스트 생성');
      postResult = await createNewPost(wordpressClient, seoContent, productIds);
    }

    console.log('[wordpressPublisher] WordPress 포스트 발행 완료');

    return {
      wordpressPost: {
        postId: postResult.id?.toString(),
        postUrl: postResult.link,
        status: 'publish',
        error: undefined
      },
      metadata: {
        ...state.metadata,
        currentNode: 'wordpressPublisher',
        completedNodes: [...state.metadata.completedNodes, 'wordpressPublisher'],
        updatedAt: Date.now()
      }
    };
  } catch (error) {
    console.error('[wordpressPublisher] 오류:', error);
    
    return {
      wordpressPost: {
        status: 'failed',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      metadata: {
        ...state.metadata,
        currentNode: 'wordpressPublisher',
        completedNodes: [...state.metadata.completedNodes, 'wordpressPublisher'],
        updatedAt: Date.now()
      }
    };
  }
}

/**
 * 중복 게시 방지를 위한 체크 함수
 * 
 * @param wordpressClient - WordPress 클라이언트
 * @param productIds - 상품 ID 배열
 * @param title - 포스트 제목
 * @returns 중복 포스트 또는 null
 */
async function checkDuplicatePost(
  wordpressClient: any, 
  productIds: string[], 
  title: string
): Promise<any | null> {
  try {
    // 1. product_id 메타 키로 중복 체크
    for (const productId of productIds) {
      const duplicate = await wordpressClient.checkDuplicatePost(productId, title);
      if (duplicate) {
        console.log(`[checkDuplicatePost] 상품 ID ${productId}로 중복 포스트 발견:`, duplicate.id);
        return duplicate;
      }
    }

    // 2. 제목 유사도로 중복 체크
    const similarPosts = await wordpressClient.searchPostByTitle(title);
    if (similarPosts && similarPosts.length > 0) {
      // 유사도가 높은 포스트가 있으면 중복으로 간주
      const mostSimilar = similarPosts[0];
      console.log(`[checkDuplicatePost] 제목 유사도로 중복 포스트 발견:`, mostSimilar.id);
      return mostSimilar;
    }

    return null;
  } catch (error) {
    console.error('[checkDuplicatePost] 중복 체크 실패:', error);
    return null;
  }
}

/**
 * 기존 포스트 업데이트
 * 
 * @param wordpressClient - WordPress 클라이언트
 * @param postId - 포스트 ID
 * @param seoContent - SEO 콘텐츠
 * @param productIds - 상품 ID 배열
 * @returns 업데이트된 포스트 정보
 */
async function updateExistingPost(
  wordpressClient: any,
  postId: number,
  seoContent: any,
  productIds: string[]
): Promise<any> {
  try {
    // 기존 포스트 내용에 새로운 상품 정보 추가
    const existingPost = await wordpressClient.getPost(postId);
    const updatedContent = mergeContent(existingPost.content.rendered, seoContent.content);
    
    const updateData = {
      title: seoContent.title,
      content: updatedContent,
      excerpt: seoContent.summary,
      meta: {
        product_ids: productIds.join(','),
        last_updated: new Date().toISOString()
      }
    };

    const result = await wordpressClient.updatePost(postId, updateData);
    console.log(`[updateExistingPost] 포스트 ${postId} 업데이트 완료`);
    
    return result;
  } catch (error) {
    console.error(`[updateExistingPost] 포스트 ${postId} 업데이트 실패:`, error);
    throw error;
  }
}

/**
 * 새 포스트 생성
 * 
 * @param wordpressClient - WordPress 클라이언트
 * @param seoContent - SEO 콘텐츠
 * @param productIds - 상품 ID 배열
 * @returns 생성된 포스트 정보
 */
async function createNewPost(
  wordpressClient: any,
  seoContent: any,
  productIds: string[]
): Promise<any> {
  try {
    const postData = {
      title: seoContent.title,
      content: seoContent.content,
      excerpt: seoContent.summary,
      status: 'draft', // 기본적으로 초안으로 생성
      categories: process.env.WORDPRESS_CATEGORIES?.split(',').map(Number) || [],
      tags: [...seoContent.keywords, ...(process.env.WORDPRESS_TAGS?.split(',') || [])],
      meta: {
        product_ids: productIds.join(','),
        created_at: new Date().toISOString(),
        keyword: seoContent.keywords.join(',')
      }
    };

    const result = await wordpressClient.createPost(postData);
    console.log('[createNewPost] 새 포스트 생성 완료:', result.id);
    
    return result;
  } catch (error) {
    console.error('[createNewPost] 새 포스트 생성 실패:', error);
    throw error;
  }
}

/**
 * 기존 콘텐츠와 새 콘텐츠를 병합하는 함수
 * 
 * @param existingContent - 기존 콘텐츠
 * @param newContent - 새 콘텐츠
 * @returns 병합된 콘텐츠
 */
function mergeContent(existingContent: string, newContent: string): string {
  try {
    // 기존 콘텐츠에서 상품 리뷰 섹션 찾기
    const reviewSectionRegex = /## 🛍️ 추천 상품 리뷰[\s\S]*?(?=## |$)/;
    const hasReviewSection = reviewSectionRegex.test(existingContent);
    
    if (hasReviewSection) {
      // 기존 상품 리뷰 섹션을 새 콘텐츠로 교체
      return existingContent.replace(reviewSectionRegex, 
        newContent.match(reviewSectionRegex)?.[0] || '');
    } else {
      // 기존 콘텐츠 끝에 새 콘텐츠 추가
      return existingContent + '\n\n' + newContent;
    }
  } catch (error) {
    console.error('[mergeContent] 콘텐츠 병합 실패:', error);
    // 병합 실패 시 새 콘텐츠로 교체
    return newContent;
  }
}

/**
 * 포스트 발행 후 처리 (선택사항)
 * 
 * @param postId - 포스트 ID
 * @param seoContent - SEO 콘텐츠
 */
async function postPublishActions(postId: number, seoContent: any): Promise<void> {
  try {
    // 1. 소셜 미디어 공유 (선택사항)
    await shareToSocialMedia(postId, seoContent);
    
    // 2. SEO 메타데이터 업데이트 (선택사항)
    await updateSEOMetadata(postId, seoContent);
    
    // 3. 분석 데이터 기록 (선택사항)
    await recordAnalytics(postId, seoContent);
    
  } catch (error) {
    console.error('[postPublishActions] 발행 후 처리 실패:', error);
    // 발행 후 처리 실패는 전체 프로세스를 중단하지 않음
  }
}

/**
 * 소셜 미디어 공유 (구현 예정)
 */
async function shareToSocialMedia(postId: number, seoContent: any): Promise<void> {
  // TODO: 소셜 미디어 API 연동 구현
  console.log(`[shareToSocialMedia] 포스트 ${postId} 소셜 미디어 공유 준비`);
}

/**
 * SEO 메타데이터 업데이트 (구현 예정)
 */
async function updateSEOMetadata(postId: number, seoContent: any): Promise<void> {
  // TODO: SEO 플러그인 API 연동 구현
  console.log(`[updateSEOMetadata] 포스트 ${postId} SEO 메타데이터 업데이트`);
}

/**
 * 분석 데이터 기록 (구현 예정)
 */
async function recordAnalytics(postId: number, seoContent: any): Promise<void> {
  // TODO: 분석 서비스 연동 구현
  console.log(`[recordAnalytics] 포스트 ${postId} 분석 데이터 기록`);
}

/**
 * wordpressPublisher 노드의 조건부 실행 함수
 * 
 * @param state - LangGraph 상태 객체
 * @returns 다음 노드 이름 또는 END
 */
export function wordpressPublisherCondition(state: LangGraphState): string {
  const { status, error } = state.wordpressPost;
  
  // 포스트 발행이 성공했으면 종료
  if (status === 'publish') {
    console.log('[wordpressPublisher] 포스트 발행 성공, 프로세스 완료');
    return 'END';
  }
  
  // 포스트 발행이 실패했으면 종료
  if (status === 'failed') {
    console.log('[wordpressPublisher] 포스트 발행 실패, 프로세스 종료');
    return 'END';
  }
  
  // 아직 처리 중이면 대기
  return 'wordpressPublisher';
}

/**
 * wordpressPublisher 노드 테스트 함수
 */
export async function testWordPressPublisherNode() {
  const mockSEOContent = {
    title: '2024년 노트북 추천 TOP 3 - 완벽 구매 가이드',
    content: '# 2024년 노트북 추천 TOP 3\n\n노트북 추천 상품들을 소개합니다.',
    keywords: ['노트북', '추천', '구매가이드'],
    summary: '2024년 최고의 노트북 추천 상품들을 소개합니다.'
  };

  const initialState: LangGraphState = {
    input: {
      urls: [],
      productIds: ['123456', '789012'],
      keyword: '노트북'
    },
    scrapedData: { 
      productInfo: [], 
      enrichedData: [] 
    },
    seoContent: mockSEOContent,
    wordpressPost: { status: 'draft' },
    metadata: {
      threadId: 'test-thread-123',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      currentNode: 'wordpressPublisher',
      completedNodes: ['extractIds', 'staticCrawler', 'seoAgent']
    }
  };

  try {
    const result = await wordpressPublisherNode(initialState);
    console.log('테스트 결과:', result);
    return result;
  } catch (error) {
    console.error('테스트 실패:', error);
    throw error;
  }
}

/**
 * WordPress 설정 검증 함수
 */
export function validateWordPressConfig(): boolean {
  const requiredEnvVars = [
    'WORDPRESS_API_URL',
    'WORDPRESS_USERNAME',
    'WORDPRESS_PASSWORD'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('[validateWordPressConfig] 누락된 환경변수:', missingVars);
    return false;
  }

  console.log('[validateWordPressConfig] WordPress 설정 검증 완료');
  return true;
} 