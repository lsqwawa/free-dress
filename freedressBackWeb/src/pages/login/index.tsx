import { type FormEvent, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Phone } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';

export function LoginPage() {
  const { isAuthenticated, login, isLoggingIn, loginError } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!phone || !password) return;
    login({ phone: phone.trim(), password });
  };

  return (
    <div className="relative">
      {/* Brand mark */}
      <div className="mb-10 text-center">
        <p className="text-[11px] uppercase tracking-[0.42em] text-gold/80">
          The Editorial House
        </p>
        <h1 className="mt-3 font-display text-5xl leading-none tracking-tight">
          <span className="text-gradient-gold">FREEDRESS</span>
        </h1>
        <p className="mt-3 font-display text-sm italic tracking-wide text-ash">
          Admin Console — Curated with intent.
        </p>
      </div>

      {/* Card */}
      <div className="glass-panel rounded-2xl border border-gold/15 px-8 py-9 shadow-glass">
        <div className="mb-6">
          <h2 className="font-display text-xl tracking-tight text-ivory">登录后台</h2>
          <p className="mt-1 text-xs text-ash">
            使用管理员手机号与密码进入控制台。
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <Input
            label="手机号"
            name="phone"
            type="tel"
            autoComplete="username"
            placeholder="13800000000"
            leftIcon={<Phone className="h-4 w-4" />}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />

          <Input
            label="密码"
            name="password"
            type={showPwd ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••"
            leftIcon={<Lock className="h-4 w-4" />}
            rightIcon={
              <button
                type="button"
                aria-label={showPwd ? '隐藏密码' : '显示密码'}
                onClick={() => setShowPwd((v) => !v)}
                className="text-ash transition-colors hover:text-ivory"
              >
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {loginError && (
            <div className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
              {(loginError as Error).message}
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full uppercase tracking-[0.24em]"
            loading={isLoggingIn}
          >
            进入后台
          </Button>
        </form>

        <div className="mt-6 flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-ash">
          <span>v 0.1 · Editorial Noir</span>
          <span className="text-gold/70">© FREEDRESS</span>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
