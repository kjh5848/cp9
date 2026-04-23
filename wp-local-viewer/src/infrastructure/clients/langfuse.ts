import { Langfuse } from 'langfuse';

/**
 * Langfuse 클라이언트 (싱글턴)
 * 
 * 환경변수:
 * - LANGFUSE_PUBLIC_KEY: Langfuse 프로젝트 Public Key
 * - LANGFUSE_SECRET_KEY: Langfuse 프로젝트 Secret Key
 * - LANGFUSE_BASE_URL: Self-hosted 시 커스텀 URL (기본: https://cloud.langfuse.com)
 * 
 * 환경변수가 없으면 null을 반환합니다 (기능 비활성화).
 */
let langfuseInstance: Langfuse | null = null;

export function getLangfuse(): Langfuse | null {
  if (!process.env.LANGFUSE_PUBLIC_KEY || !process.env.LANGFUSE_SECRET_KEY) {
    return null;
  }

  if (!langfuseInstance) {
    langfuseInstance = new Langfuse({
      publicKey: process.env.LANGFUSE_PUBLIC_KEY,
      secretKey: process.env.LANGFUSE_SECRET_KEY,
      baseUrl: process.env.LANGFUSE_BASE_URL || 'https://cloud.langfuse.com',
    });
  }

  return langfuseInstance;
}
