import { Skeleton } from '@/components/ui';
import { cn } from '@/utils';

type Variant = 'dashboard' | 'table' | 'grid';

interface PageSkeletonProps {
  variant?: Variant;
  className?: string;
}

/**
 * 通用页面级 Loading Skeleton。
 * - dashboard：4 张统计卡 + 一张大图表 + 表格
 * - table：工具栏 + 长表格
 * - grid：响应式卡片网格
 */
export function PageSkeleton({ variant = 'table', className }: PageSkeletonProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* 标题行 */}
      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-64" />
      </div>

      {variant === 'dashboard' && <DashboardSkeleton />}
      {variant === 'table' && <TableSkeleton />}
      {variant === 'grid' && <GridSkeleton />}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <>
      {/* KPI 卡片 */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="glass-panel rounded-xl p-5 space-y-3"
          >
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-2 w-16" />
          </div>
        ))}
      </div>

      {/* 图表 */}
      <div className="glass-panel rounded-xl p-6 space-y-4">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-64 w-full" />
      </div>

      {/* 表格 */}
      <TableSkeleton rows={5} />
    </>
  );
}

function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <>
      {/* 工具栏 */}
      <div className="glass-panel rounded-xl p-4">
        <div className="flex flex-wrap items-end gap-3">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-36" />
          <Skeleton className="h-10 w-36" />
          <Skeleton className="ml-auto h-9 w-24" />
        </div>
      </div>

      {/* 表格 */}
      <div className="glass-panel rounded-xl p-6 space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    </>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="glass-panel rounded-xl p-4 space-y-3">
          <Skeleton className="aspect-[3/4] w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export default PageSkeleton;
