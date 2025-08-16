'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { DeepLinkResponse } from '../../types';

interface UseDeeplinkConversionReturn {
  links: string;
  setLinks: (value: string) => void;
  linkResults: DeepLinkResponse[];
  deeplinkResult: any[];
  handleLinkSubmit: (linksValue?: string) => Promise<void>;
  handleDeeplinkConvert: (selected: string[]) => void;
  loading: boolean;
}

/**
 * 딥링크 변환 기능을 관리하는 커스텀 훅
 * 
 * @returns 딥링크 변환 관련 상태와 함수들
 */
export function useDeeplinkConversion(): UseDeeplinkConversionReturn {
  const [links, setLinks] = useState('');
  const [linkResults, setLinkResults] = useState<DeepLinkResponse[]>([]);
  const [deeplinkResult, setDeeplinkResult] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleLinkSubmit = async (linksValue?: string) => {
    // 외부에서 전달된 값이 있으면 우선 사용, 없으면 내부 상태 사용
    const searchLinks = linksValue !== undefined ? linksValue : links;
    
    // 입력 검증
    if (!searchLinks.trim()) {
      toast.error('최소 1개 이상의 링크를 입력해주세요');
      return;
    }

    setLoading(true);
    try {
      const urls = searchLinks
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean)
        .slice(0, 20);
      
      if (urls.length === 0) {
        toast.error('유효한 링크를 입력해주세요');
        setLoading(false);
        return;
      }

      const res = await fetch('/api/products/deeplink', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls }),
      });
      const items = await res.json();
      setLinkResults(Array.isArray(items) ? items : []);
      
      if (Array.isArray(items) && items.length > 0) {
        toast.success(`${items.length}개의 딥링크가 생성되었습니다`);
      }
    } catch (e) {
      toast.error('딥링크 변환 실패: ' + (e instanceof Error ? e.message : ''));
    } finally {
      setLoading(false);
    }
  };

  const handleDeeplinkConvert = (selected: string[]) => {
    setLoading(true);
    setTimeout(() => {
      setDeeplinkResult(
        deeplinkResult.map((item) =>
          selected.includes(item.productId || item.url)
            ? {
                ...item,
                deepLink: (item.url || item.originalUrl) + "?deeplink=1",
              }
            : item
        )
      );
      setLoading(false);
    }, 500);
  };

  return {
    links,
    setLinks,
    linkResults,
    deeplinkResult,
    handleLinkSubmit,
    handleDeeplinkConvert,
    loading,
  };
}