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

// Exact Authorized Demo Accounts & Passwords
const AUTHORIZED_DEMO_ACCOUNTS: Record<
  string, 
  { password: string; redirect: string; user: User }
> = {
  'student@schoolportal.test': {
    password: 'Portal2025!',
    redirect: '/student/dashboard',
    user: {
      id: 3,
      name: 'Roldan Jr. Delarmente',
      email: 'student@schoolportal.test',
      role: 'student',
      is_active: true,
      created_at: '2026-08-01T00:00:00.000Z'
    }
  },
  'teacher@schoolportal.test': {
    password: 'Portal2025!',
    redirect: '/teacher/dashboard',
    user: {
      id: 2,
      name: 'Prof. Justin Beiber',
      email: 'teacher@schoolportal.test',
      role: 'teacher',
      is_active: true,
      created_at: '2026-08-01T00:00:00.000Z'
    }
  },
  'admin@schoolportal.test': {
    password: 'Portal2025!',
    redirect: '/admin/dashboard',
    user: {
      id: 1,
      name: 'Registrar Administrator',
      email: 'admin@schoolportal.test',
      role: 'admin',
      is_active: true,
      created_at: '2026-08-01T00:00:00.000Z'
    }
  }
};

const GENERIC_INVALID_AUTH_MESSAGE = "Invalid email or password. Please check your credentials and try again.";

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

    try {
      // 1. Try real backend API authentication if live server is reachable
      const response = await api.post<AuthResponse>('/login', { email, password });
      
      if (response && response.token && response.user) {
        setToken(response.token);
        setUser(response.user);
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        if (response.user.role === 'student') router.push('/student/dashboard');
        else if (response.user.role === 'teacher') router.push('/teacher/dashboard');
        else if (response.user.role === 'admin') router.push('/admin/dashboard');
        return;
      }
      throw new Error(GENERIC_INVALID_AUTH_MESSAGE);
    } catch (apiError: any) {
      // 2. Strict Demo Credential Validation (Fallback when backend API is offline/standalone)
      const matchedAccount = AUTHORIZED_DEMO_ACCOUNTS[email];

      // Validate exact email match and exact password match
      if (!matchedAccount || matchedAccount.password !== password) {
        throw new Error(GENERIC_INVALID_AUTH_MESSAGE);
      }

      // Successful demo authentication
      const demoToken = `demo-auth-session-${Date.now()}`;
      const authenticatedUser = matchedAccount.user;

      setToken(demoToken);
      setUser(authenticatedUser);
      localStorage.setItem('token', demoToken);
      localStorage.setItem('user', JSON.stringify(authenticatedUser));

      router.push(matchedAccount.redirect);
    }
  };

  const logout = () => {
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
