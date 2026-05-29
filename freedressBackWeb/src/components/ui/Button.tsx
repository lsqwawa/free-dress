import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-gold-gradient text-noir font-medium hover:brightness-110 active:brightness-95 shadow-gold disabled:opacity-50',
  secondary:
    'bg-white/5 text-ivory border border-gold/20 hover:bg-white/10 hover:border-gold/40 disabled:opacity-50',
  outline:
    'bg-transparent text-gold border border-gold/40 hover:bg-gold/10 disabled:opacity-50',
  ghost: 'bg-transparent text-ivory hover:bg-white/5 disabled:opacity-50',
  danger:
    'bg-danger/90 text-white hover:bg-danger active:bg-danger/80 disabled:opacity-50',
};

const sizeStyles: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-5 text-sm gap-2',
  lg: 'h-12 px-7 text-base gap-2',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading,
      disabled,
      leftIcon,
      rightIcon,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center rounded-md transition-all duration-200',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60',
          'disabled:cursor-not-allowed select-none',
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...props}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : leftIcon}
        {children}
        {!loading && rightIcon}
      </button>
    );
  },
);
Button.displayName = 'Button';
