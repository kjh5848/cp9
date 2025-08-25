'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Package } from 'lucide-react';

interface ProductImageProps {
  src: string;
  alt: string;
  fallback?: string;
  className?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  onError?: () => void;
}

/**
 * 404 오류를 자동으로 처리하는 제품 이미지 컴포넌트
 * 
 * @param src - 이미지 URL
 * @param alt - 대체 텍스트
 * @param fallback - 대체 이미지 URL (기본: placeholder)
 * @param onError - 에러 발생 시 콜백
 */
export default function ProductImage({
  src,
  alt,
  fallback,
  className = '',
  width,
  height,
  fill = false,
  sizes,
  onError
}: ProductImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  
  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      if (fallback) {
        setImgSrc(fallback);
      } else {
        // 기본 fallback은 placeholder div
        setImgSrc('');
      }
      onError?.();
    }
  };

  // 이미지 로딩 실패 시 placeholder 표시
  if (hasError && !fallback) {
    return (
      <div className={`bg-gray-700 flex items-center justify-center ${className}`}>
        <Package className="w-8 h-8 text-gray-400" />
      </div>
    );
  }

  const commonProps = {
    alt,
    className: `object-cover ${className}`,
    onError: handleError,
  };

  if (fill) {
    return (
      <Image
        src={imgSrc}
        fill
        sizes={sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
        {...commonProps}
      />
    );
  }

  return (
    <Image
      src={imgSrc}
      width={width || 300}
      height={height || 300}
      {...commonProps}
    />
  );
}