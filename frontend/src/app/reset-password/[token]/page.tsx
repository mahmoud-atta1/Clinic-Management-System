"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/api';
import { KeyRound, ArrowLeft, Lock, Loader2 } from 'lucide-react';
import MainNavbar from '@/components/MainNavbar';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const router = useRouter();
  const toast = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const res = await api.post(`/auth/verifyResetToken/${token}`);
        if (res.data.success) {
          setIsValidToken(true);
          setEmail(res.data.email);
        }
      } catch (err: any) {
        toast.error('الرابط غير صحيح أو انتهت صلاحيته');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (token) verifyToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast.error('كلمتا المرور غير متطابقتين');
    }
    
    setIsSubmitting(true);
    try {
      const res = await api.put('/auth/resetPassword', { email, newPassword });
      
      if (res.data.success) {
        toast.success('تم تعيين كلمة المرور بنجاح');
        router.push('/login');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'فشل تغيير كلمة المرور');
    } finally {
      setIsSubmitting(false);
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
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">تعيين كلمة مرور جديدة</h1>
              <p className="text-slate-500 font-medium">قم بإدخال كلمة المرور الجديدة لحسابك</p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-200">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <Loader2 size={40} className="text-primary animate-spin" />
                <p className="text-slate-500 font-bold">جاري التحقق من الرابط...</p>
              </div>
            ) : !isValidToken ? (
              <div className="text-center space-y-4 py-4">
                <p className="text-red-500 font-bold text-lg">الرابط غير صالح أو انتهت صلاحيته</p>
                <Link href="/forgot-password">
                  <Button variant="outline" className="w-full">طلب رابط جديد</Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  label="البريد الإلكتروني"
                  placeholder="name@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  readOnly
                  className="text-right bg-slate-50 opacity-70 cursor-not-allowed"
                  dir="ltr"
                />

                <Input
                  label="كلمة المرور الجديدة"
                  placeholder="••••••••"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="text-right"
                  dir="ltr"
                />

                <Input
                  label="تأكيد كلمة المرور الجديدة"
                  placeholder="••••••••"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="text-right"
                  dir="ltr"
                />

                <Button type="submit" className="w-full h-14 text-lg font-bold rounded-2xl" isLoading={isSubmitting}>
                  حفظ كلمة المرور والدخول
                </Button>
              </form>
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
