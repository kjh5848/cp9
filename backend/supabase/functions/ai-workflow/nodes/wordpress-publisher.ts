/**
 * WordPress 발행 노드
 * @module WordPressPublisherNode
 */

import { log } from '../lib/logger.ts';
import type { EnvironmentConfig } from '../lib/environment.ts';
import type { SEOContent, WordPressResult } from '../types/index.ts';

/**
 * WordPress 발행 노드 실행
 */
export async function executeWordPressPublisher(
  seoContent: SEOContent,
  config?: EnvironmentConfig
): Promise<WordPressResult> {
  log('info', 'wordpressPublisher 노드 시작', { title: seoContent.title });
  
  if (!config?.WORDPRESS_URL || !config?.WORDPRESS_USERNAME || !config?.WORDPRESS_PASSWORD) {
    log('warn', 'WordPress 환경 변수가 설정되지 않음, 시뮬레이션 모드');
    return {
      postId: Math.floor(Math.random() * 1000).toString(),
      postUrl: `${config?.WORDPRESS_URL || 'https://example.com'}/wp/2024/01/ai-workflow-post`,
      status: 'published'
    };
  }

  try {
    const response = await fetch(`${config.WORDPRESS_URL}/wp-json/wp/v2/posts`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${config.WORDPRESS_USERNAME}:${config.WORDPRESS_PASSWORD}`)}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: seoContent.title,
        content: seoContent.content,
        status: 'draft',
        meta: {
          seo_keywords: seoContent.keywords.join(', '),
          seo_summary: seoContent.summary
        }
      })
    });

    if (!response.ok) {
      throw new Error(`WordPress API 오류: ${response.status}`);
    }

    const post = await response.json();
    
    log('info', 'wordpressPublisher 노드 완료', { 
      postId: post.id, 
      postUrl: post.link,
      status: post.status
    });
    
    return {
      postId: post.id.toString(),
      postUrl: post.link,
      status: post.status
    };
  } catch (error) {
    log('error', 'WordPress 발행 실패', { error: String(error) });
    return {
      postId: 'error',
      postUrl: '',
      status: 'failed'
    };
  }
}