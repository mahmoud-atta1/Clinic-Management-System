"use client";

import React, { useState, useEffect } from 'react';
import { useToast } from '@/context/ToastContext';
import { usersAPI, User as UserInterface } from '@/lib/services';
import { 
  Search, Plus, Mail, Shield, CheckCircle2, Trash2, User as UserIcon, X
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function UsersPage() {
  const [users, setUsers] = useState<UserInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', role: 'patient' });
  const [isCreating, setIsCreating] = useState(false);

  const toast = useToast();

  const load = async () => {
    try {
      const res = await usersAPI.getAll();
      setUsers(res.data.data || []);
    } catch { toast.error('فشل تحميل قائمة المستخدمين'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم نهائياً؟')) return;
    setActionLoading(id);
    try {
      await usersAPI.delete(id);
      toast.success('تم حذف المستخدم بنجاح');
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'فشل حذف المستخدم');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      await usersAPI.create({
        ...form,
        role: form.role as 'admin' | 'doctor' | 'receptionist' | 'patient'
      });
      toast.success('تم إنشاء المستخدم بنجاح');
      setIsAdding(false);
      setForm({ fullName: '', email: '', phone: '', password: '', role: 'patient' });
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'فشل إنشاء المستخدم');
    } finally {
      setIsCreating(false);
    }
  };

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [field]: e.target.value });

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-indigo-100 text-indigo-600',
      doctor: 'bg-blue-100 text-blue-600',
      receptionist: 'bg-teal-100 text-teal-600',
      patient: 'bg-slate-100 text-slate-600'
    };
    return colors[role] || 'bg-slate-100 text-slate-600';
  };

  const roleLabels: Record<string, string> = {
    admin: 'مدير النظام',
    doctor: 'طبيب',
    receptionist: 'موظف استقبال',
    patient: 'مريض',
  };

  const filtered = users.filter((u: UserInterface) => {
    const matchSearch = u.fullName?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === 'all' || u.role === filterRole;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black">
            إدارة <span className="gradient-text">المستخدمين</span>
          </h1>
          <p className="text-slate-500 font-bold">إدارة الحسابات والصلاحيات في النظام</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            className="rounded-2xl flex items-center gap-2 h-12 px-6 shadow-xl shadow-primary/20" 
            onClick={() => setIsAdding(true)}
          >
            <Plus size={20} />
            إضافة مستخدم
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="relative md:col-span-3 group">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث بالاسم، البريد الإلكتروني، أو رقم الهاتف..." 
            className="w-full bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pr-12 pl-6 text-sm font-medium focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-right"
          />
        </div>
        <div className="relative">
          <select 
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="w-full h-full bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl py-4 px-6 text-sm font-extrabold outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all appearance-none cursor-pointer text-right"
          >
            <option value="all">كل المستخدمين</option>
            <option value="admin">المدراء</option>
            <option value="doctor">الأطباء</option>
            <option value="receptionist">موظفي الاستقبال</option>
            <option value="patient">المرضى</option>
          </select>
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
             <Shield size={16} />
          </div>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-24">
             <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-4 border-primary/10" />
                <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-24 text-center space-y-4">
             <UserIcon size={48} className="mx-auto text-slate-200" />
             <p className="text-slate-400 font-extrabold text-sm">لا يوجد مستخدمون مطابقون للبحث</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-right">
              <thead>
                <tr className="text-slate-400 dark:text-slate-500 border-b border-white/5">
                  <th className="px-8 py-5 font-black text-sm">المستخدم</th>
                  <th className="px-8 py-5 font-black text-sm">الدور</th>
                  <th className="px-8 py-5 font-black text-sm">الحالة</th>
                  <th className="px-8 py-5 font-black text-sm">تاريخ التسجيل</th>
                  <th className="px-8 py-5 font-black text-sm text-left">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                {filtered.map((u: any) => (
                  <tr key={u._id} className="group hover:bg-slate-50/50 dark:hover:bg-white/5 transition-all">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center text-primary font-extrabold text-lg border border-primary/5 shadow-inner group-hover:scale-110 transition-transform">
                          {u.fullName?.charAt(0) || <UserIcon size={20} />}
                        </div>
                        <div className="space-y-1 text-right">
                          <p className="font-extrabold text-sm tracking-tight">{u.fullName}</p>
                          <p className="text-[10px] text-slate-500 font-bold flex items-center gap-2">
                             <Mail size={12} className="opacity-70" /> {u.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex px-3 py-1 rounded-xl text-xs font-bold border ${getRoleColor(u.role)}`}>
                        {roleLabels[u.role] || u.role}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-emerald-500 font-extrabold text-xs">
                        <div className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </div>
                        نشط
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm text-slate-500 font-bold">
                      {new Date(u.createdAt).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-8 py-6 text-left">
                      <div className="flex justify-end">
                        <button 
                          onClick={() => handleDelete(u._id)}
                          disabled={actionLoading === u._id}
                          className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-100 dark:hover:border-rose-900/30"
                        >
                          {actionLoading === u._id ? (
                            <div className="w-4 h-4 border-2 border-rose-300 border-t-rose-500 rounded-full animate-spin" />
                          ) : (
                            <Trash2 size={18} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsAdding(false)} />
          <div className="glass-card bg-white/90 dark:bg-slate-900/90 w-full max-w-xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-300 relative z-10 shadow-2xl">
            <div className="p-8 border-b border-white/10 flex justify-between items-center bg-gradient-to-l from-primary/5 to-transparent">
              <div className="space-y-1">
                <h2 className="text-2xl font-black tracking-tight">إضافة <span className="text-primary">حساب جديد</span></h2>
                <p className="text-slate-400 text-xs font-bold opacity-70">إدارة الصلاحيات والهوية</p>
              </div>
              <button 
                onClick={() => setIsAdding(false)} 
                className="w-10 h-10 flex items-center justify-center rounded-2xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCreateUser} className="p-8 space-y-6 text-right">
              <Input label="الاسم الكامل" placeholder="د. سارة محمد" value={form.fullName} onChange={update('fullName')} required />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="البريد الإلكتروني" type="email" placeholder="sarah@??????.com" value={form.email} onChange={update('email')} required />
                <Input label="رقم الهاتف" type="tel" placeholder="01000000000" value={form.phone} onChange={update('phone')} required />
              </div>
              
              <Input label="كلمة المرور" type="password" placeholder="••••••••••••" value={form.password} onChange={update('password')} required />
              
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 mb-1.5 tracking-tight">الدور الوظيفي</label>
                <div className="relative group">
                  <select 
                    value={form.role} onChange={update('role')}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 px-5 py-4 pr-12 outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm font-medium transition-all shadow-sm appearance-none cursor-pointer"
                  >
                    <option value="patient">مريض</option>
                    <option value="doctor">طبيب</option>
                    <option value="receptionist">موظف استقبال</option>
                    <option value="admin">مدير النظام</option>
                  </select>
                  <Shield size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors pointer-events-none" />
                </div>
              </div>

              <div className="pt-6 flex gap-4">
                <Button type="button" variant="ghost" className="flex-1 rounded-2xl h-14 font-black" onClick={() => setIsAdding(false)}>إلغاء</Button>
                <Button type="submit" isLoading={isCreating} className="flex-1 rounded-2xl h-14 font-black shadow-xl shadow-primary/20">تأكيد وإنشاء</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
