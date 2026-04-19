"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import { appointmentsAPI, Appointment } from '@/lib/services';
import { 
  Calendar, Clock, CheckCircle2, XCircle, AlertCircle, Stethoscope, MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function HistoryPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const toast = useToast();
  const router = useRouter();

  const load = async () => {
    try {
      const res = await appointmentsAPI.getAll();
      setAppointments(res.data.data || []);
    } catch { toast.error('فشل تحميل المواعيد'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCancel = async (id: string) => {
    if (!confirm('هل أنت متأكد من إلغاء هذا الموعد؟')) return;
    setCancelling(id);
    try {
      await appointmentsAPI.cancel(id);
      toast.success('تم إلغاء الموعد');
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'فشل إلغاء الموعد');
    } finally { setCancelling(null); }
  };

  const getStatusStyle = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-amber-50 text-amber-600 border-amber-100',
      confirmed: 'bg-blue-50 text-blue-600 border-blue-100',
      checked_in: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      completed: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      cancelled: 'bg-rose-50 text-rose-600 border-rose-100',
      rejected: 'bg-rose-50 text-rose-600 border-rose-100',
    };
    return styles[status] || 'bg-slate-50 text-slate-500 border-slate-100';
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
  const canCancel = (apt: Appointment) => {
    if (!['pending', 'confirmed'].includes(apt.status)) return false;
    
    const appointmentTime = new Date(apt.date);
    const timeParts = (apt.slotTime || "").replace(/ (AM|PM)/, "").split(":");
    const hour = Number(timeParts[0] || 0);
    const min = Number(timeParts[1] || 0);
    const isPM = (apt.slotTime || "").includes("PM");
    
    let finalHour = hour;
    if (isPM && hour !== 12) finalHour += 12;
    if (!isPM && hour === 12) finalHour = 0;
    
    appointmentTime.setHours(finalHour, min, 0, 0);

    const now = new Date();
    const hoursDiff = (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursDiff >= 5;
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 text-right">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900">
            مواعيدي
          </h1>
          <p className="text-slate-500 font-bold">تتبع مواعيدك القادمة والسابقة</p>
        </div>
      </div>

      {appointments.length === 0 ? (
        <div className="bg-white p-24 text-center space-y-6 rounded-3xl border border-slate-200">
          <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center mx-auto border border-slate-100">
            <Calendar size={40} className="text-slate-400" />
          </div>
          <div className="space-y-2">
            <p className="text-slate-600 font-bold text-sm">لا توجد مواعيد سابقة</p>
            <p className="text-slate-500 text-xs font-medium">لم تقم بحجز أي مواعيد طبية معنا حتى الآن.</p>
          </div>
          <Button onClick={() => router.push('/dashboard/book')} className="rounded-2xl px-8 h-12 font-black">
            احجز زيارتك الأولى
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {appointments.map((apt: Appointment) => (
            <div key={apt._id} className="bg-white p-6 rounded-2xl flex flex-col md:flex-row md:items-center gap-6 border border-slate-200 hover:border-primary/30 transition-colors">
              <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center shrink-0 ${getStatusStyle(apt.status)}`}>
                {apt.status === 'completed' ? <CheckCircle2 size={32} /> : apt.status === 'cancelled' || apt.status === 'rejected' ? <XCircle size={32} /> : <Stethoscope size={32} />}
              </div>

              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="font-bold text-xl tracking-tight text-slate-900">{getDoctorName(apt)}</h3>
                  <div className="flex gap-2">
                    <span className={`text-[10px] px-3 py-1 rounded-full font-bold border ${getStatusStyle(apt.status)}`}>
                      {statusTranslations[apt.status] || apt.status}
                    </span>
                    <span className={`text-[10px] px-3 py-1 rounded-full font-bold border ${apt.appointmentType === 'consultation' ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                      {apt.appointmentType === 'consultation' ? 'كشف مبدئي' : 'متابعة'}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-bold text-slate-600">
                  <span className="flex items-center gap-2"><CalendarIcon size={16} className="text-primary" /> {new Date(apt.date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <span className="flex items-center gap-2" dir="ltr"><Clock size={16} className="text-primary" /> {apt.slotTime}</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300 hidden md:block" />
                  <span className="text-emerald-600 font-outfit text-base" dir="ltr">{apt.price} <span className="text-[10px]">ج.م</span></span>
                </div>
              </div>

              {apt.notes && (
                <div className="w-full md:w-auto md:flex-1 p-4 bg-blue-50/50 border border-blue-100 rounded-xl mt-4 md:mt-0">
                  <p className="text-xs font-bold text-blue-600 mb-1">تقرير الطبيب وملاحظاته:</p>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{apt.notes}</p>
                </div>
              )}

              <div className="flex items-center gap-4 mr-auto text-left">
                {canCancel(apt) && (
                  <Button 
                    variant="outline" 
                    isLoading={cancelling === apt._id}
                    onClick={() => handleCancel(apt._id)}
                    className="rounded-xl text-xs font-bold text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 h-10 px-6"
                  >
                    إلغاء الموعد
                  </Button>
                )}
                {!canCancel(apt) && ['pending', 'confirmed'].includes(apt.status) && (
                  <span className="text-[10px] text-red-500 font-bold px-3">تجاوز فترة الإلغاء المسموحة</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200 flex items-start gap-4 text-right">
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
          <AlertCircle size={22} />
        </div>
        <div className="space-y-1">
           <p className="text-sm font-bold text-amber-800">ملاحظة هامة</p>
           <p className="text-sm text-amber-700 font-medium leading-relaxed">
             يُسمح بإلغاء المواعيد فقط <span className="font-bold">قبل 5 ساعات</span> على الأقل من الوقت المحدد للكشف.
           </p>
        </div>
      </div>
    </div>
  );
}

const CalendarIcon = ({ size, className }: { size: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
