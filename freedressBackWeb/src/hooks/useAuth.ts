import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';
import type { LoginPayload } from '@/types';

export function useAuth() {
  const navigate = useNavigate();
  const { token, user, isAuthenticated, login, logout, setUser } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: (data) => {
      login(data.token, data.user);
      navigate('/dashboard', { replace: true });
    },
  });

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login', { replace: true });
  }, [logout, navigate]);

  return {
    token,
    user,
    isAuthenticated,
    setUser,
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    logout: handleLogout,
  };
}
