import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * 全局错误边界 —— 捕获子树渲染错误，展示 Editorial Noir 风格降级页。
 * React Error Boundary 必须使用 class 组件实现。
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // 仅在开发模式打印详细堆栈，生产环境可接入 Sentry 等
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary]', error, info.componentStack);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleGoHome = () => {
    this.handleReset();
    if (typeof window !== 'undefined') {
      window.location.href = '/dashboard';
    }
  };

  handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    if (this.props.fallback) {
      return this.props.fallback;
    }

    const message = this.state.error?.message ?? '未知错误';

    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-noir-gradient px-6">
        {/* 装饰背景 */}
        <div aria-hidden className="pointer-events-none absolute inset-0 grid-bg opacity-40" />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-gold/10 blur-3xl"
        />

        <div className="glass-panel relative z-10 w-full max-w-xl rounded-2xl px-10 py-12 text-center shadow-glass">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-danger/40 bg-danger/10 text-danger">
            <AlertTriangle className="h-8 w-8" strokeWidth={1.4} />
          </div>

          <p className="mt-6 text-[11px] uppercase tracking-[0.32em] text-gold/80">
            Application Error
          </p>
          <h1 className="mt-3 font-display text-3xl tracking-tight text-ivory">
            出错了，但优雅依旧
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-ash">
            页面在渲染时遇到了意外问题。你可以尝试刷新或返回首页继续。
          </p>

          <div className="mt-6 rounded-lg border border-gold/10 bg-white/[0.02] px-4 py-3 text-left">
            <p className="text-[10px] uppercase tracking-[0.28em] text-ash/80">
              Detail
            </p>
            <p className="mt-1 break-all font-mono text-xs text-danger/90">
              {message}
            </p>
          </div>

          <div className="mt-8 flex items-center justify-center gap-3">
            <Button
              variant="secondary"
              size="md"
              leftIcon={<Home className="h-4 w-4" />}
              onClick={this.handleGoHome}
            >
              返回首页
            </Button>
            <Button
              size="md"
              leftIcon={<RefreshCw className="h-4 w-4" />}
              onClick={this.handleReload}
            >
              刷新页面
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
