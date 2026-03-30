import { api } from '../../lib/api';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  enrolledCourses: string[];
  progress: Record<string, number>;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: any | null;
  error: Error | null;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.auth.login(credentials.email, credentials.password);
      if (!response.success) {
        return { user: null, error: new Error(response.error || 'Login failed') };
      }
      return { user: response.data?.user || null, error: null };
    } catch (error) {
      return { user: null, error: error as Error };
    }
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await api.auth.register(data.email, data.password, data.name);
      if (!response.success) {
        return { user: null, error: new Error(response.error || 'Registration failed') };
      }
      return { user: response.data?.user || null, error: null };
    } catch (error) {
      return { user: null, error: error as Error };
    }
  }

  async logout(): Promise<{ error: Error | null }> {
    try {
      api.setToken(null);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  async getCurrentUser(): Promise<any | null> {
    try {
      const response = await api.auth.getMe();
      if (response.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  async resetPassword(email: string): Promise<{ error: Error | null }> {
    return { error: new Error('Not implemented') };
  }

  async updatePassword(currentPassword: string, newPassword: string): Promise<{ error: Error | null }> {
    if (!currentPassword) {
      return { error: new Error('Vui lòng nhập mật khẩu hiện tại') };
    }
    if (!newPassword || newPassword.length < 6) {
      return { error: new Error('Mật khẩu mới phải có ít nhất 6 ký tự') };
    }
    try {
      const response = await api.auth.changePassword(currentPassword, newPassword);
      if (!response.success) {
        return { error: new Error(response.error || 'Password update failed') };
      }
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  async updateProfile(updates: { full_name?: string; avatar_url?: string }): Promise<{ error: Error | null }> {
    try {
      const response = await api.auth.updateProfile(updates);
      if (!response.success) {
        return { error: new Error(response.error || 'Profile update failed') };
      }
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }
}

export const authService = new AuthService();

export const authUtils = {
  isAuthenticated(): boolean {
    return !!api.getToken();
  },

  getCurrentUser(): AuthUser | null {
    const token = api.getToken();
    if (!token) return null;
    
    // Check for user_data in localStorage (from old system)
    const userStr = localStorage.getItem('user_data');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return {
          id: user.id || '',
          name: user.full_name || 'User',
          email: user.email || '',
          avatar: user.avatar_url || '',
          enrolledCourses: [],
          progress: {},
        };
      } catch {
        return null;
      }
    }
    return null;
  },

  async login(email: string, password: string): Promise<AuthUser> {
    const response = await api.auth.login(email, password);
    if (!response.success) {
      throw new Error(response.error || 'Login failed');
    }
    const user = response.data?.user;
    localStorage.setItem('user_data', JSON.stringify(user));
    return {
      id: user?.id || '',
      name: user?.full_name || 'User',
      email: user?.email || '',
      avatar: user?.avatar_url || '',
      role: user?.role || 'student',
      enrolledCourses: [],
      progress: {},
    };
  },

  async register(name: string, email: string, password: string): Promise<AuthUser> {
    const response = await api.auth.register(email, password, name);
    if (!response.success) {
      throw new Error(response.error || 'Registration failed');
    }
    const user = response.data?.user;
    localStorage.setItem('user_data', JSON.stringify(user));
    return {
      id: user?.id || '',
      name,
      email,
      avatar: '',
      enrolledCourses: [],
      progress: {},
    };
  },

  async logout(): Promise<void> {
    api.setToken(null);
    localStorage.removeItem('user_data');
  },

  updateProgress(courseId: string, percentage: number): void {
    console.warn('authUtils.updateProgress is deprecated. Use useAuth() hook instead.');
  },

  enrollCourse(courseId: string): void {
    console.warn('authUtils.enrollCourse is deprecated. Use payment service instead.');
  }
};
