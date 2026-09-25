"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, LoginCredentials, AuthResponse } from '../types';
import { api } from './api';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isStudent: boolean;
  isTeacher: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const GENERIC_INVALID_AUTH_MESSAGE = "Invalid email or password.";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && parsedUser.role && parsedUser.email) {
          setToken(storedToken);
          setUser(parsedUser);
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const email = (credentials.email || '').toLowerCase().trim();
    const password = credentials.password || '';

    // Validate non-empty fields
    if (!email || !password) {
      throw new Error(GENERIC_INVALID_AUTH_MESSAGE);
    }

    // 1. Authenticate via secure Next.js server-side endpoint (which includes rate-limiting & HttpOnly cookies)
    try {
      const turnstileToken = credentials.turnstileToken || '';

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, turnstileToken }),
      });

      const data = await res.json();

      if (!res.ok || !data.user || !data.token) {
        throw new Error(data.message || GENERIC_INVALID_AUTH_MESSAGE);
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      if (data.redirect) {
        router.push(data.redirect);
      } else if (data.user.role === 'student') {
        router.push('/student/dashboard');
      } else if (data.user.role === 'teacher') {
        router.push('/teacher/dashboard');
      } else if (data.user.role === 'admin') {
        router.push('/admin/dashboard');
      }
    } catch (err: any) {
      throw new Error(err.message || GENERIC_INVALID_AUTH_MESSAGE);
    }
  };

  const logout = () => {
    // 1. Immediately clear client session & storage
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.clear();
    } catch {}

    setToken(null);
    setUser(null);

    // 2. Immediately expire cookies on client
    try {
      document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
      document.cookie = 'auth_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
      document.cookie = 'auth_token=; path=/; domain=.cebucecportal.site; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
      document.cookie = 'auth_role=; path=/; domain=.cebucecportal.site; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
    } catch {}

    // 3. Fire-and-forget server cookie clearing without blocking
    try {
      fetch('/api/auth/logout', { 
        method: 'POST',
        keepalive: true,
      }).catch(() => {});
    } catch {}

    // 4. Redirect immediately to /login and prevent back button re-entry
    if (typeof window !== 'undefined') {
      window.location.replace('/login');
    } else {
      router.replace('/login');
    }
  };

  const normalizedRole = (user?.role || '').toLowerCase().trim();
  const isStudent = normalizedRole === 'student';
  const isTeacher = normalizedRole === 'teacher' || normalizedRole === 'faculty';
  const isAdmin = normalizedRole === 'admin' || normalizedRole === 'administrator';
  const isAuthenticated = !!user && !!token;

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        token, 
        loading, 
        isLoading: loading, 
        isAuthenticated, 
        login, 
        logout, 
        isStudent, 
        isTeacher, 
        isAdmin 
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!isAuthenticated || !user)) {
      if (typeof window !== 'undefined') {
        window.location.replace('/login');
      } else {
        router.replace('/login');
      }
    } else if (!loading && user && allowedRoles) {
      const userRole = (user.role || '').toLowerCase().trim();
      const normalizedAllowed = allowedRoles.map(r => r.toLowerCase().trim());
      // Admins have universal authorization across all portal sections, or if user's role matches
      const hasAccess = userRole === 'admin' || userRole === 'administrator' || normalizedAllowed.includes(userRole);
      if (!hasAccess) {
        router.replace('/unauthorized');
      }
    }
  }, [user, isAuthenticated, loading, router, allowedRoles]);

  if (loading || !isAuthenticated || !user) {
    return null;
  }

  return <>{children}</>;
};

export default AuthProvider;
