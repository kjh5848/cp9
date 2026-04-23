"use client";

import React, { useEffect } from "react";
import { cn } from "@/shared/lib/utils";
import { X } from "lucide-react";

interface SheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export const Sheet = ({ open, onOpenChange, children }: SheetProps) => {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* 바깥 영역 클릭 시 닫힘 */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200" 
        onClick={() => onOpenChange?.(false)} 
      />
      {/* 모달 이너 콘텐트 래퍼 */}
      <div className="relative z-[100] h-[100dvh] w-full sm:w-[400px] shadow-2xl animate-in slide-in-from-right duration-300">
        {React.Children.map(children, child => {
          if (React.isValidElement(child)) {
            // @ts-ignore
            return React.cloneElement(child, { onClose: () => onOpenChange?.(false) });
          }
          return child;
        })}
      </div>
    </div>
  );
};

export const SheetContent = ({ 
  children, 
  className,
  onClose
}: { 
  children: React.ReactNode, 
  className?: string,
  onClose?: () => void
}) => {
  return (
    <div className={cn("h-full max-h-[100dvh] w-full border-l border-slate-800 bg-slate-950 flex flex-col shadow-2xl overflow-hidden", className)}>
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-slate-950 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-800 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-slate-800"
        >
          <X className="h-5 w-5 text-slate-400" />
          <span className="sr-only">Close</span>
        </button>
      )}
      {children}
    </div>
  );
};

export const SheetHeader = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("flex flex-col space-y-1.5 p-5 border-b border-white/10 shrink-0", className)}>
    {children}
  </div>
);

export const SheetTitle = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <h2 className={cn("text-xl font-semibold text-slate-100 tracking-tight", className)}>
    {children}
  </h2>
);

export const SheetDescription = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <p className={cn("text-sm text-slate-400", className)}>
    {children}
  </p>
);

export const SheetFooter = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("flex flex-col-reverse justify-between sm:flex-row sm:space-x-2 pt-6 shrink-0 border-t border-slate-800/60 mt-auto", className)}>
    {children}
  </div>
);
