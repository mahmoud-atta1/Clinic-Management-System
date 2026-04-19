"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { appointmentsAPI, Appointment } from '@/lib/services';
import { 
  Calendar, Clock, CheckCircle2, FileText, ArrowRight, ArrowLeft, MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function DoctorQueuePage() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [completingAppointmentId, setCompletingAppointmentId] = useState<string | null>(null);
  const [medicalNotes, setMedicalNotes] = useState('');

  const load = async () => {
    try {
      const res = await appointmentsAPI.getAll();
      setAppointments(res.data.data || []);
    } catch { toast.error('فشل تحميل قائمة المرضى'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleOpenModal = (apt: any) => {
    setCompletingAppointmentId(apt._id);
    setMedicalNotes(apt.notes || '');
  };

  const handleFinish = async () => {
    if (!completingAppointmentId) return;
    setActionLoading(completingAppointmentId);
    try {
      await appointmentsAPI.complete(completingAppointmentId, medicalNotes);
      toast.success('تم إنهاء الكشف بنجاح وحفظ التقرير الطبي');
      setCompletingAppointmentId(null);
      setMedicalNotes('');
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'فشل إنهاء الكشف');
    } finally {
      setActionLoading(null);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const todayAppts = appointments.filter((a: Appointment) => a.date?.startsWith(today));
  
  const upcoming = todayAppts.filter((a: Appointment) => ['pending', 'confirmed', 'checked_in'].includes(a.status));
  const completed = todayAppts.filter((a: Appointment) => a.status === 'completed');

  const displayedList = activeTab === 'upcoming' ? upcoming : completed;

  const currentPatient = upcoming.find((a: Appointment) => a.status === 'checked_in') || upcoming[0];
  const expectedRevenue = todayAppts
    .filter((a: Appointment) => ['completed', 'checked_in', 'pending'].includes(a.status))
    .reduce((sum: number, a: Appointment) => sum + (a.price || 0), 0);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-primary/10" />
        <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black">
            قائمة <span className="gradient-text">الانتظار اليومية</span>
          </h1>
          <p className="text-slate-500 font-bold tracking-tight">
            {new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        
        <div className="flex items-center p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
          <button 
            onClick={() => setActiveTab('upcoming')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'upcoming' ? 'bg-white text-primary shadow-sm border border-slate-200' : 'text-slate-500 hover:text-primary'}`}
          >
            القادمة ({upcoming.length})
          </button>
          <button 
            onClick={() => setActiveTab('completed')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'completed' ? 'bg-white text-primary shadow-sm border border-slate-200' : 'text-slate-500 hover:text-primary'}`}
          >
            المكتملة ({completed.length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-3xl flex items-center justify-between text-right">
          <div className="space-y-1">
            <p className="text-emerald-700 text-xs font-bold">الإيرادات المتوقعة اليوم</p>
            <h3 className="text-2xl font-black text-emerald-600 font-outfit" dir="ltr">{expectedRevenue} <span className="text-xs text-emerald-500">ج.م</span></h3>
          </div>
          <div className="w-12 h-12 bg-emerald-200 rounded-xl flex items-center justify-center text-emerald-700">
            <CheckCircle2 size={24} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-3xl flex items-center justify-between col-span-2">
           <div className="flex items-center gap-6 text-right">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 border border-blue-100">
                <Clock size={28} />
              </div>
              <div className="space-y-1">
                <p className="text-blue-600 text-xs font-bold">المريض الحالي بالعيادة</p>
                <h3 className="text-xl font-bold text-slate-900">
                  {currentPatient ? `${currentPatient.patientId?.fullName || 'مريض'} ` : 'لا يوجد مرضى حالياً'}
                  {currentPatient && <span className="text-slate-500 font-medium ml-2 text-sm font-outfit" dir="ltr">(رقم {currentPatient.queueNumber})</span>}
                </h3>
              </div>
           </div>
           {currentPatient && (
             <Button 
               onClick={() => handleOpenModal(currentPatient)}
               className="rounded-xl font-bold flex items-center gap-2 h-10 px-6"
             >
                إنهاء الكشف
                <ArrowLeft size={18} />
             </Button>
           )}
        </div>
      </div>

      <div className="space-y-5">
        {displayedList.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-24 text-center space-y-4">
             <Calendar size={48} className="mx-auto text-slate-300" />
             <p className="text-slate-500 font-bold text-sm">قائمة الانتظار فارغة حالياً</p>
          </div>
        ) : (
          displayedList.map((appointment: any) => (
            <div 
              key={appointment._id}
              className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col md:flex-row md:items-center gap-6 hover:border-primary/40 transition-all text-right shadow-sm"
            >
              <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500 font-bold text-xl font-outfit border border-slate-200">
                {appointment.queueNumber}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-3">
                  <h4 className="font-bold text-lg tracking-tight text-slate-900">{appointment.patientId?.fullName || 'مريض غير معروف'}</h4>
                  {appointment.status === 'checked_in' && (
                    <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-3 py-1 rounded-full border border-emerald-200">
                      داخل العيادة
                    </span>
                  )}
                  {appointment.status === 'confirmed' && (
                    <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-3 py-1 rounded-full border border-blue-200">
                      مؤكد
                    </span>
                  )}
                  {appointment.status === 'completed' && (
                    <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-3 py-1 rounded-full border border-slate-200">
                      مكتمل
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs font-bold text-slate-500 tracking-tight">
                  <div className="flex items-center gap-1.5" dir="ltr">
                    <Clock size={14} className="text-primary" />
                    {appointment.slotTime}
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  <div className="text-[11px]">
                    {appointment.appointmentType === 'consultation' ? 'كشف مبدئي' : 'متابعة'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 mr-auto text-left">
                <Button variant="ghost" onClick={() => handleOpenModal(appointment)} className="rounded-xl text-slate-500 hover:text-primary hover:bg-blue-50 gap-2 font-bold px-4 h-10 border border-slate-200">
                  <FileText size={18} />
                  <span className="hidden sm:inline">{appointment.status === 'completed' ? 'تعديل التقرير' : 'إضافة تقرير'}</span>
                </Button>
                {activeTab === 'upcoming' && (
                  <Button 
                    onClick={() => handleOpenModal(appointment)}
                    className="rounded-xl font-bold gap-2 px-6 h-10"
                  >
                    إنهاء الكشف
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {completingAppointmentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" dir="rtl">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">التقرير الطبي (الروشتة)</h3>
              <button onClick={() => setCompletingAppointmentId(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors">
                ✕
              </button>
            </div>
            <div className="p-6">
              <label className="block text-sm font-bold text-slate-700 mb-2">الوصفة الطبية وملاحظات الكشف</label>
              <textarea 
                value={medicalNotes}
                onChange={(e) => setMedicalNotes(e.target.value)}
                placeholder="اكتب الأدوية والتعليمات الطبية للمريض هنا..."
                className="w-full h-40 border border-slate-200 rounded-2xl p-4 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none transition-all"
              />
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <Button variant="ghost" onClick={() => setCompletingAppointmentId(null)} className="rounded-xl font-bold px-6 border border-slate-200 bg-white">
                إلغاء
              </Button>
              <Button isLoading={actionLoading === completingAppointmentId} onClick={handleFinish} className="rounded-xl font-bold px-8">
                حفظ وإنهاء الكشف
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
