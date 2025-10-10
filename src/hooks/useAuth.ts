import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function useAuth() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, error, login, signup, logout, clearError } =
    useAuthStore();

  useEffect(() => {
    // Load user from localStorage on mount
    useAuthStore.getState().loadUser();
  }, []);

  const handleLogin = async (email: string, password: string) => {
    await login({ email, password });
    router.push('/chat');
  };

  const handleSignup = async (email: string, password: string, fullName: string) => {
    await signup({ email, password, full_name: fullName });
    router.push('/chat');
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login: handleLogin,
    signup: handleSignup,
    logout: handleLogout,
    clearError,
  };
}

export function useRequireAuth() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  return { isAuthenticated, isLoading };
}


