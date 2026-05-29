import { forwardRef } from 'react';
import type { SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: { label: string; value: string | number }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, children, id, ...props }, ref) => {
    const selectId = id ?? props.name;
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="mb-1.5 block text-xs uppercase tracking-[0.18em] text-ash"
          >
            {label}
          </label>
        )}
        <div
          className={cn(
            'relative flex items-center rounded-md border border-gold/15 bg-white/[0.02] px-3.5',
            'focus-within:border-gold/60 focus-within:bg-white/[0.04]',
            'transition-all duration-200',
            error && 'border-danger/60',
          )}
        >
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'h-11 w-full appearance-none bg-transparent pr-8 text-sm text-ivory',
              'focus:outline-none disabled:cursor-not-allowed disabled:opacity-60',
              className,
            )}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-noir text-ivory">
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-ash" />
        </div>
        {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
      </div>
    );
  },
);
Select.displayName = 'Select';
