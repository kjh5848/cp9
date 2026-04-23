import React from 'react';

/**
 * 기본 제공되는 Skeleton UI 입니다. FSD shared 계층 디자인을 따릅니다.
 */
export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => {
  return (
    <div 
      className={`animate-pulse bg-slate-800/50 rounded-md ${className || ''}`}
      {...props} 
    />
  );
};
