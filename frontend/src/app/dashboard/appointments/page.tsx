"use client";

import React, { useState, useEffect } from 'react';
import { useToast } from '@/context/ToastContext';
import { appointmentsAPI, doctorsAPI, usersAPI } from '@/lib/services';
import { 
  Calendar, Search, Filter, Clock, CheckCircle2, 
  ArrowLeft, User, MoreVertical, FileText, X
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function MasterAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const toast = useToast();

  const [isAdding, setIsAdding] = useState(false);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [form, setForm] = useState({ doctorId: '', patientId: '', date: '', slotTime: '', type: 'consultation' });
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [fetchingSlots, setFetchingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try {
      const [aptRes, docRes, patRes] = await Promise.all([
        appointmentsAPI.getAll(),
        doctorsAPI.getAll(),
        usersAPI.getAll({ role: 'patient' })
      ]);
      setAppointments(aptRes.data.data || []);
      setDoctors(docRes.data.data || []);
      setPatients(patRes.data.data || []);
    } catch { toast.error('فشل تحميل قائمة المواعيد'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (form.doctorId && form.date) {
      const fetchSlots = async () => {
        setFetchingSlots(true);
        try {
          const res = await appointmentsAPI.getAvailableSlots(form.doctorId, form.date);
          setAvailableSlots(res.data.data || []);
        } catch { toast.error('فشل تحميل الأوقات المتاحة'); }
        finally { setFetchingSlots(false); }
      };
      fetchSlots();
    }
  }, [form.doctorId, form.date]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await appointmentsAPI.book({
        ...form,
        appointmentType: form.type as any
      });
      toast.success('تم حجز الموعد بنجاح! 🎉');
      setIsAdding(false);
      setForm({ doctorId: '', patientId: '', date: '', slotTime: '', type: 'consultation' });
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'فشل حجز الموعد');
    } finally { setSubmitting(false); }
  };

  const filtered = appointments.filter((a: any) => {
    const q = search.toLowerCase();
    const pName = a.patientId?.fullName?.toLowerCase() || '';
    const dName = a.doctorId?.userId?.fullName?.toLowerCase() || '';
    return pName.includes(q) || dName.includes(q) || a.bookingCode?.toLowerCase().includes(q);
  });

  const getStatusColor = (status: string) => {
    const c: any = {
      checked_in: 'text-indigo-500 bg-indigo-500/5 border-indigo-500/10',
      completed: 'text-emerald-500 bg-emerald-500/5 border-emerald-500/10',
      cancelled: 'text-rose-500 bg-rose-500/5 border-rose-500/10',
      rejected: 'text-rose-500 bg-rose-500/5 border-rose-500/10',
      pending: 'text-amber-500 bg-amber-500/5 border-amber-500/10',
      confirmed: 'text-blue-500 bg-blue-500/5 border-blue-500/10',
    };
    return c[status] || 'text-slate-500 bg-slate-500/5 border-slate-500/10';
  };

  const statusTranslations: Record<string, string> = {
    checked_in: 'في العيادة',
    completed: 'مكتمل',
    cancelled: 'ملغي',
    rejected: 'مرفوض',
    pending: 'قيد الانتظار',
    confirmed: 'مؤكد',
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black">
            إدارة <span className="gradient-text">المواعيد</span>
          </h1>
          <p className="text-slate-500 font-bold">إشراف كامل على جميع مواعيد العيادة</p>
        </div>
        <div className="flex items-center gap-3">
           <Button onClick={() => setIsAdding(true)} className="rounded-2xl h-14 px-8 font-black gap-2 shadow-2xl shadow-primary/20">
              <Calendar size={20} />
              حجز موعد جديد
           </Button>
           <Button variant="ghost" className="rounded-2xl h-14 px-6 border border-slate-200 dark:border-white/5 font-bold gap-2">
              <FileText size={18} />
              تصدير البيانات
           </Button>
        </div>
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-500" onClick={() => setIsAdding(false)} />
          <div className="modal-glass w-full max-w-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 relative z-[101]">
            <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-gradient-to-l from-primary/[0.03] to-secondary/[0.03]">
              <div className="space-y-1.5">
                <h2 className="text-2xl font-black text-slate-900">حجز <span className="gradient-text">زيارة جديدة</span></h2>
                <p className="text-xs text-slate-400 font-bold">تنظيم وإدارة المواعيد الطبية</p>
              </div>
              <button onClick={() => setIsAdding(false)} className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-red-500 hover:rotate-90 transition-all duration-500 shadow-sm">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleBook} className="p-10 space-y-8 bg-white/50 text-right">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-500 ml-1">اختر المريض</label>
                  <select 
                    value={form.patientId} onChange={(e) => setForm({...form, patientId: e.target.value})}
                    className="w-full modal-input px-6 py-4 text-sm font-bold text-slate-700 outline-none appearance-none cursor-pointer" required
                  >
                    <option value="">-- اختر المريض --</option>
                    {patients.map(p => <option key={p._id} value={p._id}>{p.fullName} ({p.phone})</option>)}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-500 ml-1">الطبيب المعالج</label>
                  <select 
                    value={form.doctorId} onChange={(e) => setForm({...form, doctorId: e.target.value})}
                    className="w-full modal-input px-6 py-4 text-sm font-bold text-slate-700 outline-none appearance-none cursor-pointer" required
                  >
                    <option value="">-- اختر الطبيب --</option>
                    {doctors.map(d => <option key={d._id} value={d._id}>{d.userId?.fullName}</option>)}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-500 ml-1">تاريخ الموعد</label>
                  <input 
                    type="date" value={form.date} onChange={(e) => setForm({...form, date: e.target.value, slotTime: ''})}
                    className="w-full modal-input px-6 py-4 text-sm font-bold text-slate-700 outline-none text-right" required
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-500 ml-1">الوقت المتاح</label>
                  <select 
                    value={form.slotTime} onChange={(e) => setForm({...form, slotTime: e.target.value})}
                    disabled={!form.date || fetchingSlots}
                    className="w-full modal-input px-6 py-4 text-sm font-bold text-slate-700 outline-none appearance-none disabled:opacity-50 cursor-pointer" required
                  >
                    <option value="">{fetchingSlots ? 'جاري جلب الأوقات...' : '-- اختر الوقت --'}</option>
                    {availableSlots.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              
              <div className="pt-4">
                <Button type="submit" isLoading={submitting} className="w-full rounded-2xl h-16 font-black text-lg gap-3 shadow-2xl shadow-primary/20">
                  <CheckCircle2 size={24} />
                  تأكيد وحجز الموعد
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3 relative group">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث برقم الحجز، اسم المريض أو الطبيب..." 
            className="w-full bg-white/40 border border-slate-200 rounded-2xl py-4 pr-12 pl-6 text-sm font-medium focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-right"
          />
        </div>
        <Button variant="ghost" className="h-full rounded-2xl border border-slate-200 font-extrabold gap-2 text-slate-500">
           <Filter size={18} />
           فلاتر متقدمة
        </Button>
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
             <Calendar size={48} className="mx-auto text-slate-200" />
             <p className="text-slate-400 font-bold text-sm">لا توجد مواعيد مسجلة تطابق بحثك</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-right">
              <thead>
                <tr className="text-slate-400 border-b border-slate-100">
                  <th className="px-8 py-5 font-black text-sm">الحجز / الوقت</th>
                  <th className="px-8 py-5 font-black text-sm">المريض</th>
                  <th className="px-8 py-5 font-black text-sm">الطبيب المعالج</th>
                  <th className="px-8 py-5 font-black text-sm">الحالة / النوع</th>
                  <th className="px-8 py-5 font-black text-sm text-left">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((apt: any) => (
                  <tr key={apt._id} className="group hover:bg-slate-50/50 transition-all">
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        <p className="font-extrabold text-sm text-primary uppercase">{apt.bookingCode}</p>
                        <p className="text-[11px] text-slate-500 font-bold flex items-center gap-1.5 leading-none">
                           {new Date(apt.date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })} • {apt.slotTime}
                        </p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <p className="font-extrabold text-sm tracking-tight">{apt.patientId?.fullName || 'غير معروف'}</p>
                       <p className="text-[11px] text-slate-400 font-bold leading-none mt-1" dir="ltr">{apt.patientId?.phone}</p>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                             <User size={14} />
                          </div>
                          <p className="text-sm font-bold text-slate-600">{apt.doctorId?.userId?.fullName || 'طبيب'}</p>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="space-y-2">
                          <span className={`inline-flex px-3 py-1 rounded-xl text-[10px] font-bold border ${getStatusColor(apt.status)}`}>
                            {statusTranslations[apt.status] || apt.status}
                          </span>
                          <p className="text-[10px] font-bold text-slate-500 flex items-center gap-1.5 px-1 leading-none">
                             <ArrowLeft size={10} className="text-primary/50" />
                             {apt.appointmentType === 'consultation' ? 'كشف جديد' : 'متابعة'}
                          </p>
                       </div>
                    </td>
                    <td className="px-8 py-6 text-left">
                       <div className="flex justify-end gap-2">
                          <button className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-primary hover:bg-primary/5 transition-all">
                             <MoreVertical size={18} />
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
    </div>
  );
}
