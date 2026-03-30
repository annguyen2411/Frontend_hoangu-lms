import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../../lib/api';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: string;
  level: number;
  xp: number;
  total_xp: number;
  xp_to_next_level: number;
  coins: number;
  streak: number;
  completed_quests: number;
  language: string;
  theme: string;
  notification_enabled: boolean;
  created_at: string;
}

interface AuthContextType {
  user: UserProfile | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ error: Error | null }>;
  register: (name: string, email: string, password: string) => Promise<{ error: Error | null }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
  showError: (message: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const showError = (message: string) => {
    setGlobalError(message);
    setTimeout(() => setGlobalError(null), 5000);
  };

  const fetchProfile = async (): Promise<UserProfile | null> => {
    try {
      const response = await api.auth.getMe();
      if (response.success && response.data) {
        return response.data as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  const createDefaultProfile = (email: string): UserProfile => ({
    id: '',
    email,
    full_name: 'Học viên',
    avatar_url: null,
    role: 'student',
    level: 1,
    xp: 0,
    total_xp: 0,
    xp_to_next_level: 100,
    coins: 50,
    streak: 0,
    completed_quests: 0,
    language: 'vi',
    theme: 'light',
    notification_enabled: true,
    created_at: new Date().toISOString(),
  });

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = api.getToken();
        if (token) {
          const userProfile = await fetchProfile();
          if (userProfile) {
            setUser(userProfile);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{ error: Error | null; role?: string }> => {
    try {
      setIsLoading(true);
      const response = await api.auth.login(email, password);

      if (!response.success) {
        return { error: new Error(response.error || 'Đăng nhập thất bại') };
      }

      if (response.data) {
        api.setToken(response.data.token);
        setUser(response.data.user);
        localStorage.setItem('user_data', JSON.stringify(response.data.user));
        return { error: null, role: response.data.user?.role };
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<{ error: Error | null }> => {
    try {
      setIsLoading(true);
      const response = await api.auth.register(email, password, name);

      if (!response.success) {
        return { error: new Error(response.error || 'Đăng ký thất bại') };
      }

      if (response.data) {
        api.setToken(response.data.token);
        setUser(response.data.user);
        localStorage.setItem('user_data', JSON.stringify(response.data.user));
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      api.setToken(null);
      setUser(null);
      localStorage.removeItem('user_data');
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<{ error: Error | null }> => {
    if (!user) {
      return { error: new Error('Người dùng chưa đăng nhập') };
    }

    try {
      const response = await api.auth.updateProfile(updates);

      if (!response.success) {
        return { error: new Error(response.error || 'Cập nhật thất bại') };
      }

      if (response.data) {
        setUser(prev => prev ? { ...prev, ...response.data } : null);
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const refreshProfile = async (): Promise<void> => {
    const userProfile = await fetchProfile();
    if (userProfile) {
      setUser(userProfile);
    }
  };

  const value: AuthContextType = {
    user,
    profile: user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
    refreshProfile,
    showError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
