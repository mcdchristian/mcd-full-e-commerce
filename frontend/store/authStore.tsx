"use client";
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import api, {
  UNAUTHORIZED_EVENT,
  clearAuthToken,
  getAuthToken,
  setAuthToken,
} from '../lib/api';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'customer';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  /** True until the stored token has been exchanged for a profile. */
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    clearAuthToken();
    setUser(null);
  }, []);

  // The token survives a reload but the React tree does not, so exchange it for
  // the profile on mount instead of rendering a signed-out UI to a signed-in user.
  useEffect(() => {
    let cancelled = false;

    const restoreSession = async (): Promise<User | null> => {
      if (!getAuthToken()) return null;

      try {
        const res = await api.get<User>('/auth/me');
        return res.data;
      } catch {
        clearAuthToken();
        return null;
      }
    };

    // Settling through the promise keeps both updates out of the effect body:
    // the no-token case would otherwise call setState synchronously on mount
    // and force a second render pass before the first has painted.
    restoreSession().then((profile) => {
      if (cancelled) return;

      if (profile) setUser(profile);
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // A token rejected mid-session must clear the UI too, not just storage.
  useEffect(() => {
    const handleUnauthorized = () => setUser(null);
    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post<User & { token: string }>('/auth/login', { email, password });
    const { token, ...profile } = res.data;

    setAuthToken(token);
    setUser(profile);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isLoading }}>
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
