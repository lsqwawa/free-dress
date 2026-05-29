import { create } from 'zustand';
import { tokenStorage } from '@/api/axios';
import type { AdminUser } from '@/types';

const USER_KEY = 'freedress_admin_user';

function loadUser(): AdminUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AdminUser) : null;
  } catch {
    return null;
  }
}

interface AuthState {
  token: string | null;
  user: AdminUser | null;
  isAuthenticated: boolean;
  login: (token: string, user: AdminUser) => void;
  setUser: (user: AdminUser) => void;
  logout: () => void;
}

const initialToken = tokenStorage.get();
const initialUser = loadUser();

export const useAuthStore = create<AuthState>((set) => ({
  token: initialToken,
  user: initialUser,
  isAuthenticated: !!initialToken,
  login: (token, user) => {
    tokenStorage.set(token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
  },
  setUser: (user) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    set({ user });
  },
  logout: () => {
    tokenStorage.clear();
    localStorage.removeItem(USER_KEY);
    set({ token: null, user: null, isAuthenticated: false });
  },
}));
