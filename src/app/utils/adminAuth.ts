// Admin authentication utility

import { AdminUser } from '../data/adminData';
import { api } from '../../lib/api';

const ADMIN_STORAGE_KEY = 'hoanguy_admin';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

export const adminAuthUtils = {
  // Check if admin is logged in
  isAdminAuthenticated(): boolean {
    return localStorage.getItem(ADMIN_STORAGE_KEY) !== null;
  },

  // Get current admin
  getCurrentAdmin(): AdminUser | null {
    const adminData = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (!adminData) return null;
    return JSON.parse(adminData);
  },

  // Sync admin from main auth user
  syncAdminFromUser(user: UserProfile): void {
    if (user.role === 'admin' || user.role === 'super_admin') {
      localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify({
        id: user.id,
        email: user.email,
        name: user.full_name,
        role: user.role
      }));
    }
  },

  // Admin login - use real API
  async adminLogin(email: string, password: string): Promise<AdminUser | null> {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.success && response.data) {
        const user = response.data.user;
        if (user.role === 'admin' || user.role === 'super_admin') {
          localStorage.setItem('auth_token', response.data.token);
          localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify({
            id: user.id,
            email: user.email,
            name: user.full_name,
            role: user.role
          }));
          return {
            id: user.id,
            email: user.email,
            name: user.full_name,
            role: user.role
          };
        }
      }
      return null;
    } catch (error) {
      console.error('Admin login error:', error);
      return null;
    }
  },

  // Admin logout
  adminLogout(): void {
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    localStorage.removeItem('auth_token');
  }
};
