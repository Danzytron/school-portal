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
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
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

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    } catch {
      // Ignore network errors on logout
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  const isStudent = user?.role === 'student';
  const isTeacher = user?.role === 'teacher';
  const isAdmin = user?.role === 'admin';
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
      router.push('/login');
    } else if (!loading && user && allowedRoles && !allowedRoles.includes(user.role)) {
      router.push('/unauthorized');
    }
  }, [user, isAuthenticated, loading, router, allowedRoles]);

  if (loading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-center font-sans">
          <div className="w-8 h-8 border-3 border-[#1D4ED8] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <span className="text-xs text-slate-500 font-medium">Verifying authorization...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthProvider;
