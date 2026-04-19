"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Activity } from 'lucide-react';
import MainNavbar from '@/components/MainNavbar';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login({ email, password });
      router.push('/dashboard');
    } catch (err: any) {
      alert(err.response?.data?.message || 'بيانات الدخول غير صحيحة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <MainNavbar />
      <div className="h-screen flex items-center justify-center p-6 bg-slate-50 text-right overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -mr-64 -mt-64" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[100px] -ml-64 -mb-64" />
        <div className="w-full max-w-md space-y-8 relative z-10 animate-in fade-in zoom-in duration-700">
          
          <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto text-white">
            <Activity size={40} strokeWidth={2.5} />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">مرحباً بك</h1>
            <p className="text-slate-500 font-medium">قم بتسجيل الدخول للوصول إلى حسابك</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="البريد الإلكتروني"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              className="text-right"
              dir="ltr"
            />
            
            <Input
              label="كلمة المرور"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="text-right"
              dir="ltr"
            />

            <div className="flex justify-start">
              <Link href="/forgot-password" className="text-sm font-bold text-primary hover:underline transition-all">
                نسيت كلمة المرور؟
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full h-14 text-lg font-bold rounded-2xl"
              isLoading={loading}
            >
              دخول
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-500 font-medium text-sm">
              ليس لديك حساب؟{' '}
              <Link href="/register" className="text-primary font-bold hover:underline">
                إنشاء حساب جديد
              </Link>
            </p>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}
