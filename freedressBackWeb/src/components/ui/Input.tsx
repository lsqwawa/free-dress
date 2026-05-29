import { forwardRef } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  error?: string;
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, leftIcon, rightIcon, error, label, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-xs uppercase tracking-[0.18em] text-ash"
          >
            {label}
          </label>
        )}
        <div
          className={cn(
            'group flex items-center gap-2 rounded-md border border-gold/15 bg-white/[0.02] px-3.5',
            'focus-within:border-gold/60 focus-within:bg-white/[0.04] focus-within:shadow-gold',
            'transition-all duration-200',
            error && 'border-danger/60 focus-within:border-danger',
          )}
        >
          {leftIcon && <span className="text-ash">{leftIcon}</span>}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'h-11 flex-1 bg-transparent text-sm text-ivory placeholder:text-ash/60',
              'focus:outline-none disabled:cursor-not-allowed disabled:opacity-60',
              className,
            )}
            {...props}
          />
          {rightIcon && <span className="text-ash">{rightIcon}</span>}
        </div>
        {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
      </div>
    );
  },
);
Input.displayName = 'Input';
