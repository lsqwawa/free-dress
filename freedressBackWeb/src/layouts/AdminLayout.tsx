import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  Crown,
  LayoutDashboard,
  LogOut,
  Palette,
  Settings,
  Shirt,
  Sparkles,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/utils';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/users', label: '用户管理', icon: Users },
  { to: '/clothes', label: '衣物管理', icon: Shirt },
  { to: '/outfits', label: '搭配管理', icon: Palette },
  { to: '/tryon', label: 'AI 试穿', icon: Sparkles },
  { to: '/membership', label: '会员管理', icon: Crown },
  { to: '/system', label: '系统设置', icon: Settings },
];

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/users': '用户管理',
  '/clothes': '衣物管理',
  '/outfits': '搭配管理',
  '/tryon': 'AI 试穿',
  '/membership': '会员管理',
  '/system': '系统设置',
};

export function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const matchedKey =
    Object.keys(PAGE_TITLES).find((k) => location.pathname.startsWith(k)) ?? '/dashboard';
  const pageTitle = PAGE_TITLES[matchedKey];

  return (
    <div className="flex h-screen overflow-hidden bg-noir-gradient">
      {/* Sidebar */}
      <aside className="relative flex w-[260px] flex-shrink-0 flex-col border-r border-gold/10 bg-white/[0.015] backdrop-blur-md">
        {/* Brand */}
        <div className="flex h-20 items-center gap-3 border-b border-gold/10 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gold-gradient text-noir font-display text-lg font-bold shadow-gold">
            F
          </div>
          <div>
            <p className="font-display text-base tracking-[0.18em] text-ivory">
              FREEDRESS
            </p>
            <p className="text-[10px] uppercase tracking-[0.32em] text-gold/80">
              Admin
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-6">
          <p className="mb-3 px-3 text-[10px] uppercase tracking-[0.28em] text-ash/70">
            Navigation
          </p>
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        'group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-all',
                        isActive
                          ? 'bg-gold/10 text-gold'
                          : 'text-ivory/70 hover:bg-white/[0.04] hover:text-ivory',
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <span
                            aria-hidden
                            className="absolute left-0 top-1/2 h-6 w-[2px] -translate-y-1/2 rounded-r bg-gold"
                          />
                        )}
                        <Icon className="h-4 w-4" strokeWidth={1.6} />
                        <span className="tracking-wide">{item.label}</span>
                      </>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-gold/10 px-6 py-4">
          <p className="font-display text-[11px] tracking-[0.28em] text-ash">
            Editorial Noir · v0.1
          </p>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-20 flex-shrink-0 items-center justify-between border-b border-gold/10 bg-white/[0.015] px-8 backdrop-blur-md">
          <div>
            <p className="text-[10px] uppercase tracking-[0.32em] text-ash">
              Section
            </p>
            <h1 className="font-display text-2xl tracking-tight text-ivory">
              {pageTitle}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-ivory">{user?.nickname ?? '管理员'}</p>
              <p className="text-[11px] uppercase tracking-[0.18em] text-gold/80">
                {user?.role ?? 'ADMIN'}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/30 bg-noir-100 text-sm font-medium text-gold">
              {(user?.nickname ?? 'A').slice(0, 1).toUpperCase()}
            </div>
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-1.5 rounded-md border border-gold/15 px-3 py-2 text-xs uppercase tracking-[0.18em] text-ash transition-colors hover:border-gold/40 hover:text-ivory"
            >
              <LogOut className="h-3.5 w-3.5" />
              退出
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
