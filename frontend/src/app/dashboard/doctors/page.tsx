"use client";

import React, { useState, useEffect } from 'react';
import { useToast } from '@/context/ToastContext';
import { doctorsAPI, specializationsAPI, usersAPI, Doctor, User as UserInterface } from '@/lib/services';
import { 
  Search, Stethoscope, Clock, Calendar as CalendarIcon, UserPlus, Trash2, X, Edit2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const DAYS = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

const defaultForm = {
  userId: '',
  specializationId: '',
  consultationFee: 300,
  followUpFee: 150,
  startTime: '09:00',
  endTime: '17:00',
  slotDuration: 30,
  availableDays: ['الإثنين', 'الأربعاء'] as string[],
};

const to24Hour = (time12: string) => {
  if (!time12) return '';
  const match = time12.match(/^(0[1-9]|1[0-2]):([0-5][0-9]) (AM|PM)$/);
  if (!match) return time12;
  let h = parseInt(match[1], 10);
  const m = match[2];
  const modifier = match[3];
  if (h === 12) h = 0;
  if (modifier === 'PM') h += 12;
  return `${h.toString().padStart(2, '0')}:${m}`;
};

const to12Hour = (time24: string) => {
  if (!time24) return '';
  const [h, m] = time24.split(':');
  if (!h || !m) return time24;
  let hours = parseInt(h, 10);
  const modifier = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours.toString().padStart(2, '0')}:${m} ${modifier}`;
};

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specs, setSpecs] = useState<{ _id: string; name: string }[]>([]);
  const [eligibleUsers, setEligibleUsers] = useState<UserInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [isAdding, setIsAdding] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [addForm, setAddForm] = useState({ ...defaultForm });

  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editForm, setEditForm] = useState({
    specializationId: '',
    consultationFee: 300,
    followUpFee: 150,
    startTime: '09:00',
    endTime: '17:00',
    slotDuration: 30,
    availableDays: [] as string[],
  });

  const toast = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const [docRes, specRes, useRes] = await Promise.all([
        doctorsAPI.getAll().catch(() => ({ data: { data: [] as Doctor[] } })),
        specializationsAPI.getAll().catch(() => ({ data: { data: [] as { _id: string; name: string }[] } })),
        usersAPI.getAll().catch(() => ({ data: { data: [] as UserInterface[] } })),
      ]);
      const loadedDocs = (docRes.data?.data || []) as Doctor[];
      setDoctors(loadedDocs);
      setSpecs(specRes.data?.data || []);

      const activeIds = loadedDocs.map((d: Doctor) => d.userId?._id?.toString());
      setEligibleUsers(
        ((useRes.data?.data || []) as UserInterface[]).filter(
          (u: UserInterface) => u.role === 'doctor' && !activeIds.includes(u._id)
        )
      );
    } catch {
      toast.error('فشل تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الطبيب؟')) return;
    setActionLoading(id);
    try {
      await doctorsAPI.delete(id);
      toast.success('تم حذف الطبيب بنجاح');
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'فشل الحذف');
    } finally {
      setActionLoading(null);
    }
  };

  const handleHire = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.userId || !addForm.specializationId) {
      return toast.error('الرجاء اختيار المستخدم والتخصص');
    }
    if (addForm.availableDays.length === 0) {
      return toast.error('الرجاء اختيار يوم عمل واحد على الأقل');
    }
    setIsCreating(true);
    try {
      await doctorsAPI.create({
        userId: addForm.userId,
        specializationId: addForm.specializationId,
        consultationFee: addForm.consultationFee,
        followUpFee: addForm.followUpFee,
        startTime: to12Hour(addForm.startTime),
        endTime: to12Hour(addForm.endTime),
        slotDuration: addForm.slotDuration,
        availableDays: addForm.availableDays,
      } as any);
      toast.success('تم إضافة الطبيب بنجاح');
      setIsAdding(false);
      setAddForm({ ...defaultForm });
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'فشل إضافة الطبيب');
    } finally {
      setIsCreating(false);
    }
  };

  const toggleAddDay = (day: string) => {
    setAddForm(prev => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day],
    }));
  };

  const openEdit = (doc: Doctor) => {
    setEditingDoctor(doc);
    setEditForm({
      specializationId: doc.specializationId?._id || '',
      consultationFee: doc.consultationFee,
      followUpFee: doc.followUpFee,
      startTime: to24Hour(doc.startTime),
      endTime: to24Hour(doc.endTime),
      slotDuration: doc.slotDuration,
      availableDays: doc.availableDays || [],
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoctor) return;
    if (editForm.availableDays.length === 0) {
      return toast.error('الرجاء اختيار يوم عمل واحد على الأقل');
    }
    setIsUpdating(true);
    try {
      await doctorsAPI.update(editingDoctor._id, {
        specializationId: editForm.specializationId,
        consultationFee: editForm.consultationFee,
        followUpFee: editForm.followUpFee,
        startTime: to12Hour(editForm.startTime),
        endTime: to12Hour(editForm.endTime),
        slotDuration: editForm.slotDuration,
        availableDays: editForm.availableDays,
      } as any);
      toast.success('تم تحديث بيانات الطبيب بنجاح');
      setEditingDoctor(null);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'فشل التحديث');
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleEditDay = (day: string) => {
    setEditForm(prev => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day],
    }));
  };

  const filtered = doctors.filter((doc: Doctor) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const name = doc?.userId?.fullName?.toLowerCase() || '';
    const spec = doc?.specializationId?.name?.toLowerCase() || '';
    return name.includes(q) || spec.includes(q);
  });

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black">
            إدارة <span className="gradient-text">الأطباء</span>
          </h1>
          <p className="text-slate-500 font-medium">إدارة وتنظيم فريقك الطبي</p>
        </div>
        <Button
          className="rounded-2xl flex items-center gap-2 shadow-xl shadow-primary/20 h-14 px-8 font-black"
          onClick={() => setIsAdding(true)}
        >
          <UserPlus size={22} />
          إضافة طبيب جديد
        </Button>
      </div>

      <div className="relative max-w-xl group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
        <input
          type="text"
          placeholder="ابحث باسم الطبيب أو التخصص..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-2xl py-4 pr-12 pl-6 text-sm font-medium focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all shadow-sm text-right"
        />
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-primary/10" />
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="premium-card p-20 text-center space-y-4">
          <Stethoscope size={48} className="mx-auto text-slate-300" />
          <p className="text-slate-500 font-medium">لا يوجد أطباء مطابقون لبحثك</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filtered.map((doc: Doctor) => (
            <div key={doc._id} className="premium-card flex flex-col group hover:translate-y-[-12px] transition-all duration-700 rounded-[2.5rem] bg-white border-slate-100/50 shadow-2xl shadow-slate-200/50">
              <div className="p-10 space-y-8 flex-1 relative z-10">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xl shadow-primary/30 relative z-10 group-hover:rotate-6 group-hover:scale-110 transition-transform duration-700">
                      <Stethoscope size={36} strokeWidth={2.5} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-2xl font-black text-slate-900 group-hover:text-primary transition-colors duration-500">
                      {doc.userId?.fullName || 'طبيب غير معروف'}
                    </h3>
                    <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] border border-primary/20">
                      {doc.specializationId?.name || 'عام'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 relative overflow-hidden p-6 rounded-[2rem] bg-slate-50/50 border border-slate-100">
                  <div className="space-y-1">
                    <span className="text-slate-400 text-[9px] font-black uppercase tracking-[0.3em] block">كشف</span>
                    <div className="flex items-baseline gap-1">
                      <p className="text-2xl font-black text-slate-900">{doc.consultationFee}</p>
                      <span className="text-[10px] font-black text-primary uppercase">ج.م</span>
                    </div>
                  </div>
                  <div className="space-y-1 border-l border-slate-200/60 pl-6">
                    <span className="text-slate-400 text-[9px] font-black uppercase tracking-[0.3em] block">إعادة</span>
                    <div className="flex items-baseline gap-1">
                      <p className="text-2xl font-black text-emerald-600">{doc.followUpFee}</p>
                      <span className="text-[10px] font-black text-emerald-500 uppercase">ج.م</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-sm text-slate-600 font-black bg-white border border-slate-100/50 p-4 rounded-2xl shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                      <CalendarIcon size={18} />
                    </div>
                    <span className="truncate tracking-tight">{doc.availableDays?.join('، ') || 'غير محدد'}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-600 font-black bg-white border border-slate-100/50 p-4 rounded-2xl shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-secondary/5 flex items-center justify-center text-secondary">
                      <Clock size={18} />
                    </div>
                    <span className="tracking-tight">{doc.startTime} - {doc.endTime}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0 flex gap-4 relative z-10">
                <Button
                  className="flex-1 rounded-2xl text-[11px] font-black uppercase tracking-widest gap-2 bg-slate-900 hover:bg-primary transition-all duration-500 h-14 shadow-2xl shadow-slate-900/10"
                  onClick={() => openEdit(doc)}
                >
                  <Edit2 size={16} /> تعديل
                </Button>
                <Button
                  variant="outline"
                  isLoading={actionLoading === doc._id}
                  onClick={() => handleDelete(doc._id)}
                  className="w-14 rounded-2xl text-rose-500 border-rose-100 hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all cursor-pointer h-14"
                >
                  {!actionLoading && <Trash2 size={20} />}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isAdding && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-500" onClick={() => setIsAdding(false)} />
          <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 w-full max-w-xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 relative z-[101] max-h-[90vh] overflow-y-auto">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-primary/[0.03] to-secondary/[0.03] sticky top-0 z-10">
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-slate-900">إضافة <span className="gradient-text">طبيب جديد</span></h2>
                <p className="text-xs text-slate-400 font-bold">إعداد بيانات وجدول الطبيب</p>
              </div>
              <button type="button" onClick={() => setIsAdding(false)} className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-red-500 hover:rotate-90 transition-all duration-500 shadow-sm">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleHire} className="p-8 space-y-6 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 mb-1.5 tracking-tight">اختر حساب الطبيب</label>
                  <select
                    value={addForm.userId}
                    onChange={(e) => setAddForm({ ...addForm, userId: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 px-5 py-4 outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm font-medium transition-all shadow-sm appearance-none cursor-pointer"
                    required
                  >
                    <option value="">-- اختر مستخدم --</option>
                    {eligibleUsers.map(u => <option key={u._id} value={u._id}>{u.fullName}</option>)}
                  </select>
                  {eligibleUsers.length === 0 && (
                    <p className="text-xs text-amber-500 font-bold ml-1">لا يوجد مستخدمون بدور "doctor" غير مسجلين. أنشئ مستخدماً بدور doctor أولاً.</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 mb-1.5 tracking-tight">التخصص</label>
                  <select
                    value={addForm.specializationId}
                    onChange={(e) => setAddForm({ ...addForm, specializationId: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 px-5 py-4 outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm font-medium transition-all shadow-sm appearance-none cursor-pointer"
                    required
                  >
                    <option value="">-- اختر التخصص --</option>
                    {specs.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                  {specs.length === 0 && (
                    <p className="text-xs text-amber-500 font-bold ml-1">لا توجد تخصصات. أضف تخصصاً من صفحة التخصصات أولاً.</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <Input label="رسوم الكشف (EGP)" type="number" min="0" value={addForm.consultationFee} onChange={(e) => setAddForm({ ...addForm, consultationFee: Number(e.target.value) })} required />
                <Input label="رسوم الإعادة (EGP)" type="number" min="0" value={addForm.followUpFee} onChange={(e) => setAddForm({ ...addForm, followUpFee: Number(e.target.value) })} required />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Input label="وقت البداية" type="time" dir="ltr" value={addForm.startTime} onChange={(e) => setAddForm({ ...addForm, startTime: e.target.value })} required />
                <Input label="وقت النهاية" type="time" dir="ltr" value={addForm.endTime} onChange={(e) => setAddForm({ ...addForm, endTime: e.target.value })} required />
                <Input label="مدة الجلسة (دقيقة)" type="number" min="5" max="120" value={addForm.slotDuration} onChange={(e) => setAddForm({ ...addForm, slotDuration: Number(e.target.value) })} required />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-600 ml-1">أيام العمل</label>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map(day => (
                    <button key={day} type="button" onClick={() => toggleAddDay(day)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border duration-300 ${addForm.availableDays.includes(day) ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105' : 'bg-slate-50 text-slate-400 border-slate-200 hover:border-primary/40'}`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex gap-4">
                <Button type="button" variant="ghost" className="flex-1 h-14 rounded-2xl" onClick={() => setIsAdding(false)}>إلغاء</Button>
                <Button type="submit" isLoading={isCreating} className="flex-1 h-14 rounded-2xl shadow-xl shadow-primary/25">تأكيد الإضافة</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingDoctor && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-500" onClick={() => setEditingDoctor(null)} />
          <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 w-full max-w-xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 relative z-[101] max-h-[90vh] overflow-y-auto">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-primary/[0.03] to-secondary/[0.03] sticky top-0 z-10">
              <div className="space-y-1">
                <h2 className="text-2xl font-black tracking-tighter font-outfit text-slate-900">تعديل <span className="gradient-text">بيانات الطبيب</span></h2>
                <p className="text-xs text-slate-400 font-bold">{editingDoctor.userId?.fullName}</p>
              </div>
              <button type="button" onClick={() => setEditingDoctor(null)} className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-red-500 hover:rotate-90 transition-all duration-500 shadow-sm">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-8 space-y-6 bg-white">
              
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 mb-1.5 tracking-tight">التخصص</label>
                <select
                  value={editForm.specializationId}
                  onChange={(e) => setEditForm({ ...editForm, specializationId: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 px-5 py-4 outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm font-medium transition-all shadow-sm appearance-none cursor-pointer"
                >
                  <option value="">-- اختر التخصص --</option>
                  {specs.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <Input label="رسوم الكشف (EGP)" type="number" min="0" value={editForm.consultationFee} onChange={(e) => setEditForm({ ...editForm, consultationFee: Number(e.target.value) })} required />
                <Input label="رسوم الإعادة (EGP)" type="number" min="0" value={editForm.followUpFee} onChange={(e) => setEditForm({ ...editForm, followUpFee: Number(e.target.value) })} required />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Input label="وقت البداية" type="time" dir="ltr" value={editForm.startTime} onChange={(e) => setEditForm({ ...editForm, startTime: e.target.value })} required />
                <Input label="وقت النهاية" type="time" dir="ltr" value={editForm.endTime} onChange={(e) => setEditForm({ ...editForm, endTime: e.target.value })} required />
                <Input label="مدة الجلسة (دقيقة)" type="number" min="5" max="120" value={editForm.slotDuration} onChange={(e) => setEditForm({ ...editForm, slotDuration: Number(e.target.value) })} required />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-600 ml-1">أيام العمل</label>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map(day => (
                    <button key={day} type="button" onClick={() => toggleEditDay(day)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border duration-300 ${editForm.availableDays.includes(day) ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105' : 'bg-slate-50 text-slate-400 border-slate-200 hover:border-primary/40'}`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex gap-4">
                <Button type="button" variant="ghost" className="flex-1 h-14 rounded-2xl" onClick={() => setEditingDoctor(null)}>إلغاء</Button>
                <Button type="submit" isLoading={isUpdating} className="flex-1 h-14 rounded-2xl shadow-xl shadow-primary/25">حفظ التعديلات</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
