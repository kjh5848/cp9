import React from 'react';

/**
 * Input 컴포넌트의 props 타입
 */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  children?: React.ReactNode;
}

/**
 * 재사용 가능한 입력 컴포넌트
 * 다양한 입력 타입을 지원
 * 
 * @param props - 입력 props
 * @returns 입력 컴포넌트
 * @example
 * <Input 
 *   type="text" 
 *   placeholder="이름을 입력하세요" 
 *   onChange={handleChange}
 * />
 */
export function Input({ className = '', ...props }: InputProps) {
  return (
    <input
      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  );
} 