"use client";

import React, { useEffect, useState } from 'react';
import { useToast } from '@/context/ToastContext';
import { appointmentsAPI, doctorsAPI, Appointment, Doctor } from '@/lib/services';
import { 
  Search, CheckCircle2, Clock, CreditCard, Ban, Wallet, DollarSign, Stethoscope, Globe, XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function ReceptionDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const toast = useToast();

  const load = async () => {
    try {
      const [apptsRes, docsRes] = await Promise.all([
        appointmentsAPI.getAll(),
        doctorsAPI.getAll()
      ]);
      setAppointments(apptsRes.data.data || []);
      setDoctors(docsRes.data.data || []);
    } catch { toast.error('فشل تحميل البيانات'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCheckIn = async (id: string) => {
    setActionLoading(id);
    try {
      await appointmentsAPI.checkIn(id);
      toast.success('تم تسجيل الوصول ✅');
      load();
    } catch (err: any) { toast.error(err.response?.data?.message || 'فشل'); }
    finally { setActionLoading(null); }
  };

  const handleRecordCash = async (id: string) => {
    setActionLoading(id);
    try {
      await appointmentsAPI.updateStatus(id, { paymentStatus: 'paid', paymentMethod: 'cash' });
      toast.success('تم تسجيل الدفع كاش 💰');
      load();
    } catch (err: any) { toast.error(err.response?.data?.message || 'فشل'); }
    finally { setActionLoading(null); }
  };

  const handleReject = async (id: string) => {
    if (!confirm('هل تريد رفض هذا الموعد؟')) return;
    setActionLoading(id);
    try {
      await appointmentsAPI.updateStatus(id, { status: 'rejected' });
      toast.warning('تم رفض الموعد');
      load();
    } catch (err: any) { toast.error(err.response?.data?.message || 'فشل'); }
    finally { setActionLoading(null); }
  };

  const handleComplete = async (id: string) => {
    setActionLoading(id);
    try {
      await appointmentsAPI.updateStatus(id, { status: 'completed' });
      toast.success('تم إنهاء الكشف بنجاح');
      load();
    } catch (err: any) { toast.error(err.response?.data?.message || 'فشل'); }
    finally { setActionLoading(null); }
  };

  const getStatusColor = (status: string) => {
    const c: any = {
      checked_in: 'bg-blue-100 text-blue-600',
      completed: 'bg-emerald-100 text-emerald-600',
      cancelled: 'bg-rose-100 text-rose-600',
      rejected: 'bg-rose-100 text-rose-600',
      pending: 'bg-slate-100 text-slate-500',
      confirmed: 'bg-amber-100 text-amber-600',
    };
    return c[status] || 'bg-slate-100 text-slate-500';
  };

  const statusTranslations: Record<string, string> = {
    pending: 'قيد الانتظار',
    confirmed: 'مؤكد',
    checked_in: 'في العيادة',
    completed: 'مكتمل',
    cancelled: 'ملغي',
    rejected: 'مرفوض',
  };

  const getDoctorName = (apt: Appointment) => apt.doctorId?.userId?.fullName || 'طبيب';
  const getPatientName = (apt: Appointment) => apt.patientId?.fullName || 'مريض';

  const filtered = appointments.filter((a: Appointment) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return getPatientName(a).toLowerCase().includes(q) || getDoctorName(a).toLowerCase().includes(q) || a.bookingCode?.toLowerCase().includes(q);
  }).sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

  const today = new Date().toISOString().split('T')[0];
  const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  
  const todayAppts = appointments.filter((a: Appointment) => a.date?.startsWith(today));
  const waiting = todayAppts.filter((a: Appointment) => ['pending', 'confirmed'].includes(a.status));
  const newConsults = todayAppts.filter((a: Appointment) => a.appointmentType === 'consultation');
  const followUps = todayAppts.filter((a: Appointment) => a.appointmentType === 'follow_up');
  const totalRevenue = todayAppts.filter((a: Appointment) => a.paymentStatus === 'paid').reduce((s: number, a: Appointment) => s + (a.price || 0), 0);

  const availableDoctorsToday = doctors.filter((doc: Doctor) => doc.availableDays?.includes(dayName));

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 text-right">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black">
            مكتب <span className="gradient-text">الاستقبال</span>
          </h1>
          <p className="text-slate-500 font-bold">بوابة إدارة طابور العيادة والمعاملات المالية</p>
        </div>
        <div className="flex items-center gap-4">
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard label="الوصول اليومي" val={todayAppts.length} color="blue" icon={Clock} />
        <MetricCard label="حجوزات جديدة" val={newConsults.length} color="indigo" icon={Globe} />
        <MetricCard label="إيرادات اليوم" val={`${totalRevenue} ج.م`} color="emerald" icon={CreditCard} />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-800 tracking-tight">الأطباء المتواجدون اليوم</h3>
        {availableDoctorsToday.length === 0 ? (
           <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl text-center text-slate-500 font-bold text-sm">
             لا يوجد أطباء متاحون اليوم
           </div>
        ) : (
           <div className="flex flex-wrap gap-4">
             {availableDoctorsToday.map(doc => (
                <div key={doc._id} className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center gap-4 shadow-sm min-w-[240px]">
                   <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                      {doc.userId?.fullName?.charAt(0) || 'ط'}
                   </div>
                   <div className="text-right">
                      <p className="font-bold text-slate-900">{doc.userId?.fullName || 'دكتور'}</p>
                      <p className="text-xs text-slate-500">{doc.specializationId?.name || 'تخصص عام'}</p>
                   </div>
                   <div className="mr-auto text-left">
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">متاح</span>
                   </div>
                </div>
             ))}
           </div>
        )}
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <div className="relative max-w-xl group">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
            <input 
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث باسم المريض، رقم الحجز، أو الطبيب..." 
              className="w-full bg-white border border-slate-200 rounded-2xl py-3 pr-12 pl-6 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-right"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-24 text-center space-y-4">
             <Ban size={48} className="mx-auto text-slate-200" />
             <p className="text-slate-400 font-bold text-sm">لا توجد نشاطات مطابقة لهذا اليوم</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-white/5">
                  <th className="px-8 py-5 text-right font-black text-sm">الرقم المرجعي</th>
                  <th className="px-8 py-5 text-right font-black text-sm">بيانات المريض</th>
                  <th className="px-8 py-5 text-right font-black text-sm">الطبيب المعالج</th>
                  <th className="px-8 py-5 text-right font-black text-sm">النوع / الحساب</th>
                  <th className="px-8 py-5 text-left font-black text-sm">العمليات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                {filtered.map((apt: Appointment) => (
                  <tr key={apt._id} className="group hover:bg-slate-50/50 dark:hover:bg-white/5 transition-all">
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        <p className="font-extrabold text-xs tracking-tight text-primary uppercase">{apt.bookingCode}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold flex items-center gap-1.5" dir="ltr">
                          <Clock size={12} className="opacity-70" /> {apt.slotTime}
                        </p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1.5">
                        <p className="font-black text-sm tracking-tight">{getPatientName(apt)}</p>
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(apt.status)}`}>
                          {statusTranslations[apt.status] || apt.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <p className="text-sm font-bold text-slate-600 dark:text-slate-300">{getDoctorName(apt)}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${apt.appointmentType === 'consultation' ? 'text-indigo-500 bg-indigo-50/50 border-indigo-100 dark:border-indigo-900/30' : 'text-emerald-500 bg-emerald-50/50 border-emerald-100 dark:border-emerald-900/30'}`}>
                          {apt.appointmentType === 'consultation' ? 'كشف جديد' : 'متابعة'}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                           <p className="text-sm font-black font-outfit" dir="ltr">{apt.price} <span className="text-[10px] text-slate-400">ج.م</span></p>
                           {(apt as any).paymentStatus === 'paid' && (
                             <div className="relative flex h-2 w-2">
                               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                               <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                             </div>
                           )}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-end gap-3 text-left">
                        {apt.status === 'pending' && (
                          <Button size="sm" variant="ghost" isLoading={actionLoading === apt._id} onClick={() => handleCheckIn(apt._id)}
                            className="rounded-xl text-xs font-bold h-9 px-4 bg-primary/5 hover:bg-primary hover:text-white transition-all">تسجيل الدخول</Button>
                        )}
                        {(apt as any).paymentStatus === 'unpaid' && !['cancelled','rejected'].includes(apt.status) && (
                          <div className="flex items-center gap-2">
                            <Button size="sm" isLoading={actionLoading === apt._id} onClick={() => handleRecordCash(apt._id)}
                              className="rounded-xl text-xs font-bold h-9 px-4 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 gap-2">
                              <Wallet size={14} /> كاش
                            </Button>
                            <Button size="sm" variant="outline" disabled
                              className="rounded-xl text-xs font-bold h-9 px-4 border-slate-200 text-slate-400 bg-slate-50 gap-2 cursor-not-allowed">
                              <CreditCard size={14} /> إلكتروني (قريباً)
                            </Button>
                          </div>
                        )}
                        {apt.status === 'checked_in' && (
                          <Button size="sm" isLoading={actionLoading === apt._id} onClick={() => handleComplete(apt._id)}
                            className="rounded-xl text-xs font-bold h-9 px-4 bg-primary hover:bg-primary/90 text-white shadow-sm transition-all">إنهاء الكشف</Button>
                        )}
                        {!['cancelled','rejected','completed'].includes(apt.status) && (
                          <button 
                            onClick={() => handleReject(apt._id)} 
                            className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all" 
                            title="إلغاء الزيارة"
                          >
                            <XCircle size={18} />
                          </button>
                        )}
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

function MetricCard({ label, val, color, icon: Icon }: any) {
  const s: any = { 
    blue: 'text-blue-600 bg-blue-50 border-blue-200', 
    indigo: 'text-indigo-600 bg-indigo-50 border-indigo-200', 
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-200', 
    amber: 'text-amber-600 bg-amber-50 border-amber-200' 
  };
  
  return (
    <div className={`p-6 rounded-2xl border transition-colors relative overflow-hidden flex flex-col justify-between h-32 ${s[color]}`}>
       <div className="flex items-center justify-between">
          <div className="space-y-1">
             <p className="text-xs font-bold opacity-80">{label}</p>
             <h4 className="text-3xl font-black font-outfit tracking-tight">{val}</h4>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/50 flex items-center justify-center">
             <Icon size={24} />
          </div>
       </div>
    </div>
  );
}
