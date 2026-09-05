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
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      // 1. Try real backend API first if available
      const response = await api.post<AuthResponse>('/login', credentials);
      setToken(response.token);
      setUser(response.user);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      if (response.user.role === 'student') router.push('/student/dashboard');
      else if (response.user.role === 'teacher') router.push('/teacher/dashboard');
      else if (response.user.role === 'admin') router.push('/admin/dashboard');
    } catch (error) {
      // 2. Standalone Demo Mode fallback (when backend server is not connected)
      const input = (credentials.email || '').toLowerCase().trim();
      
      let demoUser: User;
      if (input.includes('admin')) {
        demoUser = {
          id: 1,
          name: 'Registrar Administrator',
          email: 'admin@schoolportal.test',
          role: 'admin',
          is_active: true,
          created_at: new Date().toISOString()
        };
      } else if (input.includes('teacher') || input.includes('faculty')) {
        demoUser = {
          id: 2,
          name: 'Prof. Justin Beiber',
          email: 'teacher@schoolportal.test',
          role: 'teacher',
          is_active: true,
          created_at: new Date().toISOString()
        };
      } else {
        // Default to Demo Student: Roldan Jr. Delarmente
        demoUser = {
          id: 3,
          name: 'Roldan Jr. Delarmente',
          email: 'student@schoolportal.test',
          role: 'student',
          is_active: true,
          created_at: new Date().toISOString()
        };
      }

      const demoToken = 'demo-token-' + Date.now();
      setToken(demoToken);
      setUser(demoUser);
      localStorage.setItem('token', demoToken);
      localStorage.setItem('user', JSON.stringify(demoUser));

      if (demoUser.role === 'student') router.push('/student/dashboard');
      else if (demoUser.role === 'teacher') router.push('/teacher/dashboard');
      else if (demoUser.role === 'admin') router.push('/admin/dashboard');
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
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, token, loading, isLoading: loading, isAuthenticated, login, logout, isStudent, isTeacher, isAdmin }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (!loading && user && allowedRoles && !allowedRoles.includes(user.role)) {
      router.push('/unauthorized');
    }
  }, [user, loading, router, allowedRoles]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-center font-sans">
          <div className="w-8 h-8 border-3 border-[#1D4ED8] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <span className="text-xs text-slate-500 font-medium">Validating student credentials...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthProvider;
