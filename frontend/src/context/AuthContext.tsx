"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface User {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'admin' | 'receptionist' | 'doctor' | 'patient';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: { email?: string; phone?: string; password: string }) => Promise<void>;
  signup: (data: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const res = await api.get('/auth/profile');
        if (res.data.success) {
          setUser(res.data.data);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  const login = async (credentials: any) => {
    const res = await api.post('/auth/login', credentials);
    if (res.data.success) {
      setUser(res.data.data);
    }
  };

  const signup = async (data: any) => {
    const res = await api.post('/auth/signup', data);
    if (res.data.success) {
      setUser(res.data.data);
    }
  };

  const logout = async () => {
    try {
      await api.get('/auth/logout');
    } catch {

    } finally {
      setUser(null);
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
