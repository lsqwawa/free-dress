import type { HTMLAttributes } from 'react';
import { cn } from '@/utils';

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-white/[0.04] border border-gold/5',
        className,
      )}
      {...props}
    />
  );
}
