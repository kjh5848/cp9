'use client';

import Image from 'next/image';
import { Button } from '@/shared/ui/button';
import { ProductItem, DeepLinkResponse } from '../types';
import { isProductItem, isDeepLinkResponse } from '../utils/product-helpers';

interface SelectedItemDetailProps {
  item: ProductItem | DeepLinkResponse | null;
  onActionButtonClick: () => void;
  selectedCount: number;
  mode?: 'product' | 'deeplink';
}

/**
 * 선택된 아이템의 상세 정보를 표시하는 컴포넌트
 */
export default function SelectedItemDetail({
  item,
  onActionButtonClick,
  selectedCount,
  mode = 'product'
}: SelectedItemDetailProps) {
  // 복사 아이콘 SVG 컴포넌트
  const CopyIcon = () => (
    <svg 
      className="w-4 h-4 text-gray-500 hover:text-gray-700 cursor-pointer" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );

  const handleCopyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // TODO: 토스트 알림 추가
      console.log(`${label} 복사됨:`, text);
    } catch (err) {
      console.error('복사 실패:', err);
    }
  };

  // 더미 데이터 - 아이템이 선택되지 않았을 때 표시
  const dummyItem = {
    productId: 9999,
    productName: "무선 블루투스 이어폰 프리미엄 에디션",
    productPrice: 89000,
    productImage: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
    productUrl: "https://www.coupang.com/vp/products/9999",
    isRocket: true,
    isFreeShipping: true,
    categoryName: "전자기기 > 이어폰/헤드폰"
  };

  // 아이템이 없으면 더미 데이터 사용, selectedCount는 1로 설정
  const displayItem = item || dummyItem;
  const displayCount = item ? selectedCount : 1;

  return (
    <div className="h-full max-h-[calc(100vh-8rem)] flex flex-col space-y-4">
      {/* 액션 버튼 */}
      <div className="p-4 flex-shrink-0 ">
        <Button 
          onClick={onActionButtonClick}
          className="w-full flex items-center justify-center gap-2  hover:bg-white hover:bg-opacity-90 transition-colors bg-[#ededed] text-[#171717] "
          size="lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          선택된 상품 액션 ({displayCount}개)
        </Button>
      </div>

      {/* 선택된 아이템 정보 */}
      <div className="p-6 border rounded-lg bg-white flex-1 overflow-y-auto">
        <h3 className="text-lg font-bold mb-4 text-gray-900">선택된 아이템 정보</h3>
        
        {/* 상품 이미지 (Product 모드만) */}
        {mode !== 'deeplink' && isProductItem(displayItem) && displayItem.productImage && (
          <div className="relative mx-auto mb-4 h-32 w-32 bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src={displayItem.productImage}
              alt={displayItem.productName || '상품 이미지'}
              fill
              className="object-cover"
              sizes="128px"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* 상품명/제목 */}
        <div className="mb-4">
          <h4 className="font-semibold text-gray-900 mb-2">
            {mode === 'deeplink' ? '딥링크 정보' : '상품명'}
          </h4>
          <p className="text-gray-700 leading-relaxed">
            {isProductItem(displayItem) 
              ? displayItem.productName 
              : isDeepLinkResponse(displayItem)
              ? '딥링크 변환 결과'
              : '알 수 없는 아이템'
            }
          </p>
        </div>

        {/* 상품 정보 (Product 모드만) */}
        {mode !== 'deeplink' && isProductItem(displayItem) && (
          <>
            {/* 가격 정보 */}
            <div className="mb-4">
              <h4 className="font-semibold text-gray-900 mb-2">가격</h4>
              <p className="text-2xl font-bold text-blue-600">
                {displayItem.productPrice.toLocaleString()}원
              </p>
            </div>

            {/* 로켓배송 정보 */}
            {displayItem.isRocket && (
              <div className="mb-4">
                <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                  🚀 로켓배송
                </span>
              </div>
            )}

            {/* 카테고리 정보 */}
            <div className="mb-4">
              <h4 className="font-semibold text-gray-900 mb-2">카테고리</h4>
              <p className="text-gray-600">{displayItem.categoryName}</p>
              </div>
          </>
        )}

        {/* 링크 정보 */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">링크 정보</h4>
          
          {isProductItem(displayItem) ? (
            // 상품 링크
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1 min-w-0">
                <div className="text-xs text-blue-600 font-medium mb-1">상품 URL:</div>
                <a    
                  href={displayItem.productUrl}
                  className="text-sm text-blue-600 hover:underline block truncate"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {displayItem.productUrl}
                </a>
              </div>
              <button
                onClick={() => handleCopyToClipboard(displayItem.productUrl, '상품 URL')}
                className="ml-2 p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <CopyIcon />
              </button>
            </div>
          ) : isDeepLinkResponse(displayItem) && (
            // 딥링크 정보
            <div className="space-y-3">
              {/* 원본 URL */}
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-blue-600 font-medium mb-1">원본 URL:</div>
                  <a
                    href={displayItem.originalUrl}
                    className="text-sm text-blue-600 hover:underline block truncate"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {displayItem.originalUrl}
                  </a>
                </div>
                <button
                  onClick={() => handleCopyToClipboard(displayItem.originalUrl || '', '원본 URL')}
                  className="ml-2 p-2 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <CopyIcon />
                </button>
              </div>

              {/* 단축 URL */}
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-green-600 font-medium mb-1">단축 URL:</div>
                  <a
                    href={displayItem.shortenUrl}
                    className="text-sm text-green-600 hover:underline block truncate"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {displayItem.shortenUrl}
                  </a>
                </div>
                <button
                  onClick={() => handleCopyToClipboard(displayItem.shortenUrl || '', '단축 URL')}
                  className="ml-2 p-2 hover:bg-green-100 rounded-lg transition-colors"
                >
                  <CopyIcon />
                </button>
              </div>

              {/* 랜딩 URL */}
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-purple-600 font-medium mb-1">랜딩 URL:</div>
                  <a
                    href={displayItem.landingUrl}
                    className="text-sm text-purple-600 hover:underline block truncate"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {displayItem.landingUrl}
                  </a>
                </div>
                <button
                  onClick={() => handleCopyToClipboard(displayItem.landingUrl || '', '랜딩 URL')}
                  className="ml-2 p-2 hover:bg-purple-100 rounded-lg transition-colors"
                >
                  <CopyIcon />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}