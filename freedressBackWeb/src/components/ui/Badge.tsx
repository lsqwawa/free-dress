import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils';

type Tone = 'gold' | 'success' | 'danger' | 'warning' | 'info' | 'neutral';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  children: ReactNode;
}

const toneStyles: Record<Tone, string> = {
  gold: 'bg-gold/10 text-gold border-gold/30',
  success: 'bg-success/10 text-success border-success/30',
  danger: 'bg-danger/10 text-danger border-danger/30',
  warning: 'bg-warning/10 text-warning border-warning/30',
  info: 'bg-info/10 text-info border-info/30',
  neutral: 'bg-white/5 text-ash border-white/10',
};

export function Badge({ tone = 'gold', className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5',
        'text-[11px] font-medium uppercase tracking-[0.12em]',
        toneStyles[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
