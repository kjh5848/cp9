import React from 'react';

/**
 * 버튼 컴포넌트의 props 타입
 */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children: React.ReactNode;
}

/**
 * 재사용 가능한 버튼 컴포넌트
 * 다양한 스타일과 크기를 지원
 * 
 * @param props - 버튼 props
 * @returns 버튼 컴포넌트
 * @example
 * <Button variant="default" size="lg" onClick={handleClick}>
 *   클릭하세요
 * </Button>
 */
export function Button({ 
  className = '', 
  variant = 'default', 
  size = 'default', 
  children, 
  ...props 
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background';
  
  const variantClasses = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
    outline: 'border border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white',
    secondary: 'bg-gray-700 text-white hover:bg-gray-600',
    ghost: 'text-gray-300 hover:bg-gray-800 hover:text-white',
    link: 'underline-offset-4 hover:underline text-blue-400 hover:text-blue-300'
  };
  
  const sizeClasses = {
    default: 'h-10 py-2 px-4',
    sm: 'h-9 px-3 rounded-md',
    lg: 'h-11 px-8 rounded-md',
    icon: 'h-10 w-10'
  };
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
  
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
} 