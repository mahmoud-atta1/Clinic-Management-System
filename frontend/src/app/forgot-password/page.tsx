"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/api';
import { KeyRound, ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';
import MainNavbar from '@/components/MainNavbar';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error('يرجى إدخال البريد الإلكتروني');
    
    setIsLoading(true);
    try {
      const res = await api.post('/auth/forgotPassword', { email });
      
      if (res.data.success) {
        setIsSent(true);
        toast.success('تم إرسال رابط استعادة كلمة المرور إلى بريدك');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'فشل إرسال الطلب');
    } finally {
      setIsLoading(false);
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
            <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto text-primary">
              <KeyRound size={40} strokeWidth={2.5} />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">استعادة كلمة المرور</h1>
              <p className="text-slate-500 font-medium">أدخل بريدك الإلكتروني المسجل لدينا لإرسال رابط الاستعادة</p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-200">
            {!isSent ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative group/input">
                  <Input
                    label="البريد الإلكتروني"
                    placeholder="name@example.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="text-right"
                    dir="ltr"
                  />
                </div>

                <Button type="submit" className="w-full h-14 text-lg font-bold rounded-2xl" isLoading={isLoading}>
                  إرسال رابط الاستعادة
                </Button>
              </form>
            ) : (
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-sm">
                  <CheckCircle2 size={32} />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-emerald-900 text-lg">تم الإرسال بنجاح</h3>
                  <p className="text-sm text-emerald-700 font-medium leading-relaxed">
                    تم إرسال رابط آمن لاستعادة كلمة المرور إلى:<br/>
                    <span className="text-emerald-900 font-bold" dir="ltr">{email}</span>
                  </p>
                </div>
                <p className="text-xs text-emerald-600 font-bold pt-4">الرابط صالح لمدة 10 دقائق فقط</p>
              </div>
            )}

            <div className="mt-8 text-center border-t border-slate-100 pt-6">
              <Link href="/login" className="flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-primary transition-all font-bold group/back">
                العودة لتسجيل الدخول <ArrowLeft size={16} className="group-hover/back:-translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
