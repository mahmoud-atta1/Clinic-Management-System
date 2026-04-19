"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Activity } from 'lucide-react';
import MainNavbar from '@/components/MainNavbar';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    passwordConfirm: '',
    phone: '',
    gender: 'male',
    dateOfBirth: '',
    role: 'patient',
  });
  const [loading, setLoading] = useState(false);
  
  const { signup } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.passwordConfirm) {
      return alert("كلمتا المرور غير متطابقتين");
    }
    
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      return alert("كلمة المرور ضعيفة! يجب أن تحتوي على: \n- 8 أحرف على الأقل\n- حرف كبير واحد على الأقل\n- رقم واحد على الأقل\n- رمز خاص واحد على الأقل (@$!%*?&)");
    }

    const phoneRegex = /^01[0125][0-9]{8}$/;
    if (!phoneRegex.test(formData.phone)) {
      return alert("يرجى إدخال رقم هاتف مصري صحيح يبدأ بـ 01 (11 رقم)");
    }

    if (!formData.dateOfBirth) {
       return alert("يرجى إدخال تاريخ الميلاد");
    }
    const birthDate = new Date(formData.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    if (birthDate > today || age < 0) {
      return alert("تاريخ الميلاد غير منطقي");
    }

    setLoading(true);
    try {
      await signup(formData);
      router.push('/dashboard');
    } catch (err: any) {
      alert(err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || 'حدث خطأ أثناء إنشاء الحساب');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <>
      <MainNavbar />
      <div className="h-screen flex items-center justify-center p-6 bg-slate-50 text-right overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -mr-64 -mt-64" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[100px] -ml-64 -mb-64" />
        <div className="w-full max-w-md space-y-6 relative z-10 animate-in fade-in zoom-in duration-700 max-h-[90vh] overflow-y-auto scrollbar-hide p-2">
        
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto text-white shadow-lg shadow-primary/20">
            <Activity size={32} strokeWidth={2.5} />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">إنشاء حساب جديد</h1>
            <p className="text-xs text-slate-500 font-medium">قم بملء البيانات لتسجيل حسابك</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input
              label="الاسم الكامل"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="مثال: أحمد محمد"
              required
              className="text-right"
            />

            <Input
              label="البريد الإلكتروني"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com"
              required
              className="text-right"
              dir="ltr"
            />

            <Input
              label="رقم الهاتف"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="01xxxxxxxxx"
              required
              className="text-right"
              dir="ltr"
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700 ml-1 mb-1.5 tracking-tight">النوع</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 px-5 py-4 outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm font-medium transition-all shadow-sm"
                >
                  <option value="male">ذكر</option>
                  <option value="female">أنثى</option>
                </select>
              </div>

              <Input
                label="تاريخ الميلاد"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
                className="text-right"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="كلمة المرور"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="text-right"
              />

              <Input
                label="تأكيد الكلمة"
                name="passwordConfirm"
                type="password"
                value={formData.passwordConfirm}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="text-right"
              />
            </div>

            <div className="space-y-2 hidden">
              <label className="block text-sm font-bold text-slate-700 ml-1 mb-1.5 tracking-tight">نوع الحساب</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 px-5 py-4 outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm font-medium transition-all shadow-sm"
              >
                <option value="patient">مريض</option>
                <option value="doctor">طبيب</option>
                <option value="receptionist">موظف استقبال</option>
              </select>
            </div>

            <Button
              type="submit"
              className="w-full h-14 text-lg font-bold rounded-2xl mt-4"
              isLoading={loading}
            >
              إنشاء حساب
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-500 font-medium text-sm">
              لديك حساب بالفعل؟{' '}
              <Link href="/login" className="text-primary font-bold hover:underline">
                تسجيل الدخول
              </Link>
            </p>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}
