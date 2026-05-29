import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';
import { Button } from '@/components/ui';

/**
 * 404 NotFound —— Editorial Noir 风格 + 浮动几何装饰。
 * 作为路由 catch-all 页面使用。
 */
export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden px-6 py-16 text-center">
      {/* 网格底纹 */}
      <div aria-hidden className="pointer-events-none absolute inset-0 grid-bg opacity-40" />

      {/* 浮动光晕 */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-[18%] top-[18%] h-72 w-72 rounded-full bg-gold/10 blur-3xl animate-float-slow"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-[14%] bottom-[12%] h-80 w-80 rounded-full bg-gold-500/10 blur-3xl animate-float-slower"
      />

      {/* 漂浮几何 —— 旋转的方框、菱形 */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-[12%] top-[30%] h-20 w-20 rotate-12 border border-gold/20 animate-spin-slow"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-[18%] top-[24%] h-12 w-12 rotate-45 border border-gold/30 animate-float-slow"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-[30%] bottom-[18%] h-3 w-3 rounded-full bg-gold/60 animate-float-slower"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-[28%] top-[60%] h-2 w-2 rounded-full bg-gold/40 animate-float-slow"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-[40%] top-[14%] h-1.5 w-1.5 rounded-full bg-ivory/40 animate-float-slower"
      />

      {/* 主体内容 */}
      <div className="relative z-10 flex flex-col items-center">
        <p className="text-[11px] uppercase tracking-[0.32em] text-gold/80">
          Editorial Noir · Lost in Style
        </p>

        <h1 className="mt-6 select-none font-display text-[180px] leading-none tracking-tight text-gradient-gold sm:text-[220px]">
          404
        </h1>

        <p className="mt-2 font-display text-3xl tracking-tight text-ivory">
          页面未找到
        </p>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-ash">
          你寻找的页面已迁徙到另一个时尚季。请回到主舞台继续浏览，或检查链接是否正确。
        </p>

        <div className="mt-8 flex items-center gap-3">
          <Button
            variant="secondary"
            size="md"
            leftIcon={<ArrowLeft className="h-4 w-4" />}
            onClick={() => navigate(-1)}
          >
            返回上一页
          </Button>
          <Button
            size="md"
            leftIcon={<Compass className="h-4 w-4" />}
            onClick={() => navigate('/dashboard')}
          >
            返回仪表盘
          </Button>
        </div>
      </div>
    </div>
  );
}
