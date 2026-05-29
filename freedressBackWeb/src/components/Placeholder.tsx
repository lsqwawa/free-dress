import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui';

interface PlaceholderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
}

export function Placeholder({ title, subtitle, icon: Icon }: PlaceholderProps) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] uppercase tracking-[0.32em] text-gold/80">
          Module
        </p>
        <h2 className="mt-2 font-display text-3xl tracking-tight text-ivory">
          {title}
        </h2>
        {subtitle && <p className="mt-2 text-sm text-ash">{subtitle}</p>}
      </div>

      <Card>
        <CardContent className="flex min-h-[320px] flex-col items-center justify-center gap-4 text-center">
          {Icon && (
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/30 bg-noir-100 text-gold">
              <Icon className="h-6 w-6" strokeWidth={1.4} />
            </div>
          )}
          <p className="font-display text-lg text-ivory">即将上线</p>
          <p className="max-w-md text-xs leading-relaxed text-ash">
            本模块的具体功能将在后续任务中完整实现。当前页面用于占位与导航演示。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
