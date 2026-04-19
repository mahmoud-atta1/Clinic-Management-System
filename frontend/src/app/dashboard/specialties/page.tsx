"use client";

import React, { useState, useEffect } from 'react';
import { useToast } from '@/context/ToastContext';
import { specializationsAPI } from '@/lib/services';
import {
  ClipboardList, Plus, Search, Trash2, Tag,
  Settings2, Activity, X, Edit2, Check
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface Specialty {
  _id: string;
  name: string;
}

export default function SpecialtiesPage() {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const toast = useToast();

  const load = async () => {
    try {
      const res = await specializationsAPI.getAll();
      setSpecialties(res.data.data || []);
    } catch {
      toast.error('فشل تحميل التخصصات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newTitle.trim();
    if (!name) return toast.error('الرجاء إدخال اسم التخصص');
    setIsCreating(true);
    try {
      await specializationsAPI.create({ name });
      toast.success('تم إضافة التخصص بنجاح');
      setNewTitle('');
      setIsAdding(false);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'فشل إضافة التخصص');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdate = async (id: string) => {
    const name = editTitle.trim();
    if (!name) return toast.error('الرجاء إدخال اسم التخصص');
    setIsUpdating(true);
    try {
      await specializationsAPI.update(id, { name });
      toast.success('تم تحديث التخصص بنجاح');
      setEditingId(null);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'فشل التحديث');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا التخصص؟')) return;
    setDeletingId(id);
    try {
      await specializationsAPI.delete(id);
      toast.success('تم حذف التخصص بنجاح');
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'فشل الحذف');
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = specialties.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight font-outfit">
            التخصصات <span className="gradient-text">الطبية</span>
          </h1>
          <p className="text-slate-500 font-bold tracking-tight">إدارة الأقسام والتخصصات الطبية</p>
        </div>
        <Button
          className="rounded-2xl flex items-center gap-2 h-12 shadow-xl shadow-primary/20"
          onClick={() => { setIsAdding(true); setNewTitle(''); }}
        >
          <Plus size={20} />
          إضافة تخصص
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        <div className="lg:col-span-2 space-y-6">
          
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث في التخصصات..."
              className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-6 text-sm font-medium focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all shadow-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {loading ? (
              [1, 2, 3, 4].map(i => <div key={i} className="glass-card h-20 animate-pulse" />)
            ) : filtered.length === 0 ? (
              <div className="sm:col-span-2 glass-card p-20 text-center space-y-4 opacity-50">
                <ClipboardList size={40} className="mx-auto text-slate-300" />
                <p className="text-slate-400 font-extrabold uppercase tracking-widest text-[10px]">لا توجد تخصصات</p>
              </div>
            ) : filtered.map((s) => (
              <div key={s._id} className="glass-card p-5 flex items-center justify-between group hover:translate-y-[-4px] transition-all duration-300 bg-white">
                {editingId === s._id ? (
                  
                  <div className="flex items-center gap-3 w-full">
                    <input
                      autoFocus
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleUpdate(s._id); if (e.key === 'Escape') setEditingId(null); }}
                      className="flex-1 border border-primary/40 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10"
                    />
                    <button
                      onClick={() => handleUpdate(s._id)}
                      disabled={isUpdating}
                      className="w-9 h-9 flex items-center justify-center rounded-xl bg-primary text-white hover:bg-primary/80 transition-all shadow-lg shadow-primary/20"
                    >
                      {isUpdating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={16} />}
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 text-slate-400 hover:bg-slate-200 transition-all"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  
                  <>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/5 text-primary flex items-center justify-center border border-primary/10 shadow-inner group-hover:bg-primary group-hover:text-white transition-all duration-500">
                        <Tag size={20} />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm tracking-tight font-outfit">{s.name}</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ID: {s._id.slice(-6).toUpperCase()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={() => { setEditingId(s._id); setEditTitle(s.name); }}
                        className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-primary hover:bg-primary/10 transition-all"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(s._id)}
                        disabled={deletingId === s._id}
                        className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all"
                      >
                        {deletingId === s._id
                          ? <div className="w-4 h-4 border-2 border-rose-300 border-t-rose-500 rounded-full animate-spin" />
                          : <Trash2 size={16} />
                        }
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          
          <div className="glass-card p-8 bg-gradient-to-br from-primary/5 to-transparent border-primary/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
            <div className="relative z-10 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white border border-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/5">
                <Settings2 size={24} />
              </div>
              <h3 className="text-lg font-extrabold tracking-tight font-outfit">معلومات</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                التخصصات تحدد هيكل العيادة. يجب تعيين كل طبيب لتخصص نشط لتمكين حجز المرضى.
              </p>
              <div className="flex items-center gap-2 text-primary font-extrabold text-[10px] uppercase tracking-widest">
                <Activity size={14} /> الإجمالي: {specialties.length} تخصص
              </div>
            </div>
          </div>

          {isAdding ? (
            <div className="glass-card p-8 border-primary/30 animate-in zoom-in-95 duration-300 bg-white">
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold uppercase tracking-widest text-primary">تخصص جديد</h3>
                  <button type="button" onClick={() => setIsAdding(false)} className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-300 hover:text-slate-500 hover:bg-slate-100 transition-all">
                    <X size={16} />
                  </button>
                </div>
                <Input
                  placeholder="مثال: طب القلب"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  autoFocus
                />
                <div className="flex gap-3">
                  <Button type="button" variant="ghost" className="flex-1 h-11 rounded-xl text-xs font-bold" onClick={() => setIsAdding(false)}>
                    إلغاء
                  </Button>
                  <Button type="submit" isLoading={isCreating} className="flex-1 h-11 rounded-xl text-xs font-extrabold shadow-lg shadow-primary/20">
                    إضافة
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <button
              onClick={() => { setIsAdding(true); setNewTitle(''); }}
              className="w-full glass-card p-6 flex items-center gap-4 text-slate-400 hover:text-primary hover:border-primary/30 transition-all duration-300 group"
            >
              <div className="w-10 h-10 rounded-xl border-2 border-dashed border-slate-200 group-hover:border-primary flex items-center justify-center transition-all">
                <Plus size={18} />
              </div>
              <span className="text-sm font-bold">إضافة تخصص جديد</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
