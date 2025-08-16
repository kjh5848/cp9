import React from 'react';

/**
 * Card 컴포넌트의 props 타입
 */
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/**
 * Card 컴포넌트
 * 카드 컨테이너 역할
 * 
 * @param props - 카드 props
 * @returns 카드 컴포넌트
 */
export function Card({ className = '', children, ...props }: CardProps) {
  return (
    <div 
      className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * CardHeader 컴포넌트의 props 타입
 */
interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/**
 * CardHeader 컴포넌트
 * 카드의 헤더 영역
 * 
 * @param props - 카드 헤더 props
 * @returns 카드 헤더 컴포넌트
 */
export function CardHeader({ className = '', children, ...props }: CardHeaderProps) {
  return (
    <div 
      className={`flex flex-col space-y-1.5 p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * CardTitle 컴포넌트의 props 타입
 */
interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

/**
 * CardTitle 컴포넌트
 * 카드의 제목
 * 
 * @param props - 카드 제목 props
 * @returns 카드 제목 컴포넌트
 */
export function CardTitle({ className = '', children, ...props }: CardTitleProps) {
  return (
    <h3 
      className={`text-2xl font-semibold leading-none tracking-tight ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
}

/**
 * CardContent 컴포넌트의 props 타입
 */
interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/**
 * CardContent 컴포넌트
 * 카드의 내용 영역
 * 
 * @param props - 카드 내용 props
 * @returns 카드 내용 컴포넌트
 */
export function CardContent({ className = '', children, ...props }: CardContentProps) {
  return (
    <div 
      className={`p-6 pt-0 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export type { CardProps, CardHeaderProps, CardTitleProps, CardContentProps };