import { create } from 'zustand';
import { User, LoginCredentials, SignupData } from '@/types/auth';
import api from '@/lib/api';
import { setTokens, clearTokens, setUser, getUser, clearUser } from '@/lib/auth';

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (credentials) => {
    try {
      set({ isLoading: true, error: null });

      const tokens = await api.login(credentials.email, credentials.password);
      setTokens(tokens);

      // Get user data
      const user = await api.getCurrentUser();
      setUser(user);

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'فشل تسجيل الدخول',
        isLoading: false,
      });
      throw error;
    }
  },

  signup: async (data) => {
    try {
      set({ isLoading: true, error: null });

      await api.signup(data.email, data.password, data.full_name);

      // Auto login after signup
      const tokens = await api.login(data.email, data.password);
      setTokens(tokens);

      const user = await api.getCurrentUser();
      setUser(user);

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'فشل التسجيل',
        isLoading: false,
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.logout();
    } finally {
      clearTokens();
      clearUser();
      set({
        user: null,
        isAuthenticated: false,
        error: null,
      });
    }
  },

  loadUser: () => {
    const user = getUser();
    if (user) {
      set({
        user,
        isAuthenticated: true,
      });
    }
  },

  clearError: () => set({ error: null }),
}));


