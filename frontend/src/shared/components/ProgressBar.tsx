'use client';

interface ProgressBarProps {
  value: number; // 0-100
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'purple' | 'orange';
  className?: string;
  animated?: boolean;
}

/**
 * 프로그레스 바 컴포넌트
 * 
 * @param value - 진행률 (0-100)
 * @param showPercentage - 퍼센트 표시 여부
 * @param size - 바 크기
 * @param color - 색상 테마
 * @param className - 추가 CSS 클래스
 * @param animated - 애니메이션 효과
 */
export default function ProgressBar({
  value,
  showPercentage = false,
  size = 'md',
  color = 'blue',
  className = '',
  animated = true
}: ProgressBarProps) {
  // value를 0-100 범위로 제한
  const normalizedValue = Math.min(Math.max(value, 0), 100);
  
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    purple: 'bg-purple-600',
    orange: 'bg-orange-600'
  };

  const backgroundColorClasses = {
    blue: 'bg-blue-900/30',
    green: 'bg-green-900/30',
    purple: 'bg-purple-900/30',
    orange: 'bg-orange-900/30'
  };

  return (
    <div className={`w-full ${className}`}>
      {showPercentage && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-gray-300">진행률</span>
          <span className="text-sm font-medium text-white">
            {Math.round(normalizedValue)}%
          </span>
        </div>
      )}
      
      <div 
        className={`
          w-full rounded-full overflow-hidden
          ${sizeClasses[size]} ${backgroundColorClasses[color]}
        `}
      >
        <div
          className={`
            h-full rounded-full transition-all duration-500 ease-out
            ${colorClasses[color]}
            ${animated ? 'transition-all duration-500' : ''}
          `}
          style={{ width: `${normalizedValue}%` }}
        />
      </div>
      
      {/* 글로우 효과 (애니메이션이 활성화된 경우) */}
      {animated && normalizedValue > 0 && (
        <div
          className={`
            h-full rounded-full blur-sm opacity-50 -mt-${sizeClasses[size].split('-')[1]} pointer-events-none
            ${colorClasses[color]}
          `}
          style={{ width: `${normalizedValue}%` }}
        />
      )}
    </div>
  );
}