'use client';

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

/**
 * 클립보드 조작 전용 훅
 */

export interface ClipboardState {
  isSupported: boolean;
  lastCopied: string | null;
  lastCopiedAt: Date | null;
}

export function useClipboard() {
  const [clipboardState, setClipboardState] = useState<ClipboardState>({
    isSupported: typeof navigator !== 'undefined' && !!navigator.clipboard,
    lastCopied: null,
    lastCopiedAt: null,
  });

  /**
   * 텍스트를 클립보드에 복사
   */
  const copyToClipboard = useCallback(async (
    text: string, 
    successMessage?: string,
    showToast: boolean = true
  ): Promise<boolean> => {
    if (!clipboardState.isSupported) {
      if (showToast) {
        toast.error('클립보드가 지원되지 않는 브라우저입니다');
      }
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
      
      setClipboardState(prev => ({
        ...prev,
        lastCopied: text,
        lastCopiedAt: new Date(),
      }));

      if (showToast) {
        toast.success(successMessage || '클립보드에 복사되었습니다');
      }
      
      return true;
    } catch (error) {
      console.error('[useClipboard] 복사 실패:', error);
      
      if (showToast) {
        const errorMessage = error instanceof Error ? error.message : '복사에 실패했습니다';
        toast.error(errorMessage);
      }
      
      return false;
    }
  }, [clipboardState.isSupported]);

  /**
   * 클립보드에서 텍스트 읽기
   */
  const readFromClipboard = useCallback(async (): Promise<string | null> => {
    if (!clipboardState.isSupported) {
      toast.error('클립보드가 지원되지 않는 브라우저입니다');
      return null;
    }

    try {
      const text = await navigator.clipboard.readText();
      return text;
    } catch (error) {
      console.error('[useClipboard] 읽기 실패:', error);
      toast.error('클립보드 읽기에 실패했습니다');
      return null;
    }
  }, [clipboardState.isSupported]);

  /**
   * 여러 텍스트를 줄바꿈으로 구분하여 복사
   */
  const copyMultipleTexts = useCallback(async (
    texts: string[], 
    separator: string = '\n',
    successMessage?: string
  ): Promise<boolean> => {
    const combinedText = texts.filter(Boolean).join(separator);
    return copyToClipboard(combinedText, successMessage);
  }, [copyToClipboard]);

  /**
   * 객체나 배열을 JSON 형태로 복사
   */
  const copyAsJSON = useCallback(async (
    data: any, 
    pretty: boolean = true,
    successMessage?: string
  ): Promise<boolean> => {
    try {
      const jsonString = pretty 
        ? JSON.stringify(data, null, 2)
        : JSON.stringify(data);
      
      return copyToClipboard(jsonString, successMessage || 'JSON이 클립보드에 복사되었습니다');
    } catch (error) {
      toast.error('JSON 변환에 실패했습니다');
      return false;
    }
  }, [copyToClipboard]);

  /**
   * URL 목록을 복사 (상품 링크 등)
   */
  const copyURLs = useCallback(async (
    urls: Array<{ name?: string; url: string; }>,
    includeNames: boolean = true
  ): Promise<boolean> => {
    const formattedUrls = urls.map(item => 
      includeNames && item.name 
        ? `${item.name}: ${item.url}`
        : item.url
    );
    
    return copyMultipleTexts(
      formattedUrls, 
      '\n', 
      `${urls.length}개 링크가 클립보드에 복사되었습니다`
    );
  }, [copyMultipleTexts]);

  return {
    // 상태
    isSupported: clipboardState.isSupported,
    lastCopied: clipboardState.lastCopied,
    lastCopiedAt: clipboardState.lastCopiedAt,
    
    // 기본 메서드
    copyToClipboard,
    readFromClipboard,
    
    // 편의 메서드
    copyMultipleTexts,
    copyAsJSON,
    copyURLs,
  };
}