import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/shared/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-cyan-500 text-black shadow hover:bg-cyan-400 font-semibold tracking-wide border-t border-white/20",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-white/10 bg-transparent shadow-sm hover:border-cyan-400 hover:text-cyan-400 text-slate-200",
        secondary:
          "bg-slate-800 text-slate-200 shadow-sm hover:bg-slate-700 border border-white/5",
        ghost: "hover:bg-white/5 hover:text-white text-slate-300",
        link: "text-cyan-400 underline-offset-4 hover:underline",
        tech: "bg-gradient-to-br from-cyan-400 to-indigo-500 text-[#020617] shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_4px_15px_rgba(34,211,238,0.2),0_10px_30px_rgba(99,102,241,0.2)] hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.6),0_6px_20px_rgba(34,211,238,0.3),0_15px_40px_rgba(99,102,241,0.3)] hover:-translate-y-[1px] active:scale-[0.98] font-bold tracking-wider transition-all duration-300",
        glass: "bg-white/[0.03] backdrop-blur-xl border border-white/10 text-slate-100 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_4px_15px_rgba(0,0,0,0.5)] hover:bg-white/10 hover:border-cyan-400/50 hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_4px_20px_rgba(34,211,238,0.2)] hover:-translate-y-[1px] active:scale-[0.98] transition-all duration-300",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }