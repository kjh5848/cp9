import React from 'react';

interface SelectProps {
  children?: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
}

export const Select = ({ children, value, onValueChange, disabled }: SelectProps) => {
  return (
    <div className="relative w-full">
      <select 
        value={value} 
        onChange={(e) => onValueChange && onValueChange(e.target.value)} 
        disabled={disabled}
        className="w-full bg-black/40 border-white/10 text-white font-jakarta p-2 rounded-md appearance-none h-10 border disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {children}
      </select>
    </div>
  );
};

export const SelectTrigger = ({ children, className }: { children?: React.ReactNode, className?: string }) => {
  // HTML select 내부에서는 트리거 렌더링이 의미 없으므로 무시 (기본 UI 래핑에선 이처럼 우회)
  return <>{children}</>;
};

export const SelectValue = ({ placeholder }: { placeholder?: string }) => {
  return <option value="" disabled hidden>{placeholder}</option>;
};

export const SelectContent = ({ children, className }: { children?: React.ReactNode, className?: string }) => {
  return <>{children}</>;
};

export const SelectItem = ({ value, children, className, disabled }: { value: string, children?: React.ReactNode, className?: string, disabled?: boolean }) => {
  return <option value={value} className={`bg-slate-900 text-white ${className || ''}`} disabled={disabled}>{children}</option>;
};
