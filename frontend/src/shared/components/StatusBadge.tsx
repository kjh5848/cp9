'use client';

import { Truck, Gift, Loader2, CheckCircle, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  type: 'rocket' | 'freeShipping' | 'processing' | 'completed' | 'failed' | 'custom';
  text?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * 다양한 상태를 표시하는 배지 컴포넌트
 * 
 * @param type - 배지 타입
 * @param text - 커스텀 텍스트 (custom 타입일 때 필수)
 * @param className - 추가 CSS 클래스
 * @param size - 배지 크기
 */
export default function StatusBadge({ 
  type, 
  text, 
  className = '', 
  size = 'md' 
}: StatusBadgeProps) {
  const getConfig = () => {
    const sizeClasses = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-1 text-sm',
      lg: 'px-4 py-2 text-base'
    };

    const iconSizes = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4', 
      lg: 'w-5 h-5'
    };

    switch (type) {
      case 'rocket':
        return {
          bgColor: 'bg-orange-600/90',
          textColor: 'text-white',
          icon: <Truck className={iconSizes[size]} />,
          text: '로켓배송'
        };
      case 'freeShipping':
        return {
          bgColor: 'bg-green-600/90',
          textColor: 'text-white',
          icon: <Gift className={iconSizes[size]} />,
          text: '무료배송'
        };
      case 'processing':
        return {
          bgColor: 'bg-blue-600/90',
          textColor: 'text-white',
          icon: <Loader2 className={`${iconSizes[size]} animate-spin`} />,
          text: text || '분석 중'
        };
      case 'completed':
        return {
          bgColor: 'bg-green-600/90',
          textColor: 'text-white',
          icon: <CheckCircle className={iconSizes[size]} />,
          text: text || '완료'
        };
      case 'failed':
        return {
          bgColor: 'bg-red-600/90',
          textColor: 'text-white',
          icon: <XCircle className={iconSizes[size]} />,
          text: text || '실패'
        };
      case 'custom':
        return {
          bgColor: 'bg-gray-600/90',
          textColor: 'text-white',
          icon: null,
          text: text || ''
        };
      default:
        return {
          bgColor: 'bg-gray-600/90',
          textColor: 'text-white',
          icon: null,
          text: text || ''
        };
    }
  };

  const config = getConfig();
  const sizeClass = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  }[size];

  return (
    <span 
      className={`
        inline-flex items-center gap-1 rounded-full backdrop-blur-sm
        ${config.bgColor} ${config.textColor} ${sizeClass}
        ${className}
      `}
    >
      {config.icon}
      <span className="font-medium">{config.text}</span>
    </span>
  );
}