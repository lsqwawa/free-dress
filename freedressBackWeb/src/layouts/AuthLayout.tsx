import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-noir">
      {/* Backdrop layers */}
      <div aria-hidden className="pointer-events-none absolute inset-0 grid-bg opacity-40" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 20% 0%, rgba(212,175,55,0.18), transparent 50%), radial-gradient(ellipse at 100% 100%, rgba(184,134,11,0.12), transparent 55%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-32 h-72 w-72 rounded-full bg-gold/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 bottom-24 h-72 w-72 rounded-full bg-gold-500/10 blur-3xl"
      />

      <div className="relative z-10 w-full max-w-md px-6">
        <Outlet />
      </div>

      {/* Footer mark */}
      <div className="absolute bottom-6 left-0 right-0 z-10 text-center">
        <p className="font-display text-[11px] tracking-[0.42em] text-ash/70">
          FREEDRESS · EDITORIAL NOIR
        </p>
      </div>
    </div>
  );
}

export default AuthLayout;
