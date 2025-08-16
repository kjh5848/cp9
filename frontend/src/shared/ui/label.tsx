import React from 'react';

/**
 * Label 컴포넌트의 props 타입
 */
interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
}

/**
 * 재사용 가능한 라벨 컴포넌트
 * 폼 요소와 연결되는 라벨
 * 
 * @param props - 라벨 props
 * @returns 라벨 컴포넌트
 * @example
 * <Label htmlFor="username">사용자명</Label>
 * <Input id="username" />
 */
export function Label({ className = '', children, ...props }: LabelProps) {
  return (
    <label
      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
      {...props}
    >
      {children}
    </label>
  );
}

export type { LabelProps };