import { UserProfile, UserRole } from '@/types';
import { api, setToken, getToken } from './api';

const AUTH_STORAGE_KEY = 'heptley_auth_session';

export interface AuthSession {
  role: UserRole;
  user: UserProfile;
  token?: string;
}

export const authService = {
  login: async (email: string, password?: string): Promise<AuthSession> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    try {
      const res = await api.post<{
        success: boolean;
        token: string;
        user: {
          id: string;
          name: string;
          email: string;
          role: UserRole;
          salesMemberId: string | null;
          phone?: string;
          status: string;
        };
      }>(
        '/auth/login',
        { email: cleanEmail, password: cleanPassword },
        { requiresAuth: false }
      );

      if (res.token) {
        setToken(res.token);
      }

      const userProfile: UserProfile = {
        id: res.user.id,
        name: res.user.name,
        email: res.user.email,
        role: res.user.role,
        salesMemberId: res.user.salesMemberId || undefined,
        memberId: res.user.salesMemberId || undefined,
        phone: res.user.phone || '',
      };

      const session: AuthSession = {
        role: res.user.role,
        user: userProfile,
        token: res.token,
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
      }

      return session;
    } catch (err: any) {
      console.error('[authService.login] API error:', err.message);
      throw new Error(err.message || 'Login failed. Please check your credentials.');
    }
  },

  getCurrentSession: (): AuthSession | null => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },

  fetchCurrentUser: async (): Promise<UserProfile | null> => {
    const token = getToken();
    if (!token) return null;

    try {
      const res = await api.get<{
        success: boolean;
        user: {
          id: string;
          name: string;
          email: string;
          role: UserRole;
          salesMemberId: string | null;
          phone?: string;
          status: string;
        };
      }>('/auth/me');

      const profile: UserProfile = {
        id: res.user.id,
        name: res.user.name,
        email: res.user.email,
        role: res.user.role,
        salesMemberId: res.user.salesMemberId || undefined,
        memberId: res.user.salesMemberId || undefined,
        phone: res.user.phone || '',
      };

      const session: AuthSession = {
        role: res.user.role,
        user: profile,
        token,
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
      }

      return profile;
    } catch (err) {
      console.warn('[authService.fetchCurrentUser] Session validation failed:', err);
      setToken(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
      return null;
    }
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Ignore network errors on logout
    } finally {
      setToken(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
  },
};
