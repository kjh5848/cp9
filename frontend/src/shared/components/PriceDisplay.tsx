'use client';

interface PriceDisplayProps {
  price: number;
  currency?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCurrency?: boolean;
  className?: string;
  color?: 'default' | 'blue' | 'green' | 'red';
}

/**
 * 가격을 일관되게 표시하는 컴포넌트
 * 
 * @param price - 가격 (숫자)
 * @param currency - 통화 단위 (기본: KRW)
 * @param size - 텍스트 크기
 * @param showCurrency - 통화 기호 표시 여부
 * @param className - 추가 CSS 클래스
 * @param color - 색상 테마
 */
export default function PriceDisplay({
  price,
  currency = 'KRW',
  size = 'md',
  showCurrency = true,
  className = '',
  color = 'default'
}: PriceDisplayProps) {
  const formatPrice = (price: number, currency: string): string => {
    if (currency === 'KRW') {
      return price.toLocaleString('ko-KR');
    }
    return price.toLocaleString();
  };

  const getCurrencySymbol = (currency: string): string => {
    switch (currency) {
      case 'KRW':
        return '₩';
      case 'USD':
        return '$';
      case 'EUR':
        return '€';
      case 'JPY':
        return '¥';
      default:
        return '₩';
    }
  };

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-2xl'
  };

  const colorClasses = {
    default: 'text-white',
    blue: 'text-blue-400',
    green: 'text-green-400',
    red: 'text-red-400'
  };

  const formattedPrice = formatPrice(price, currency);
  const currencySymbol = getCurrencySymbol(currency);

  return (
    <span 
      className={`
        font-bold ${sizeClasses[size]} ${colorClasses[color]} ${className}
      `}
    >
      {showCurrency && (
        <span className="mr-0.5">{currencySymbol}</span>
      )}
      {formattedPrice}
    </span>
  );
}