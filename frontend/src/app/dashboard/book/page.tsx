"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import { doctorsAPI, appointmentsAPI, Doctor } from '@/lib/services';
import { 
  CheckCircle2, User, ArrowRight, ArrowLeft, Clock, Calendar, Stethoscope, Search, Info
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { clsx } from 'clsx';

export default function BookingPage() {
  const [step, setStep] = useState(1);
  const [selection, setSelection] = useState({ doctor: null as Doctor | null, date: '', slot: null as string | null, type: 'consultation' as 'consultation' | 'follow_up' });
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await doctorsAPI.getAll();
        setDoctors(res.data.data || []);
      } catch { toast.error('فشل تحميل قائمة الأطباء'); }
      finally { setLoadingDoctors(false); }
    };
    load();
  }, []);

  useEffect(() => {
    if (!selection.doctor?._id || !selection.date) return;
    const load = async () => {
      setLoadingSlots(true);
      try {
        const res = await appointmentsAPI.getAvailableSlots(selection.doctor?._id as string, selection.date);
        setSlots(res.data.data || []);
      } catch { toast.error('فشل تحميل المواعيد المتاحة'); }
      finally { setLoadingSlots(false); }
    };
    load();
  }, [selection.doctor?._id, selection.date]);

  const handleBook = async () => {
    if (!selection.doctor?._id || !selection.slot) return;
    setBooking(true);
    try {
      await appointmentsAPI.book({
        doctorId: selection.doctor._id,
        date: selection.date,
        slotTime: selection.slot,
        appointmentType: selection.type,
      });
      toast.success('تم الحجز بنجاح! 🎉');
      router.push('/dashboard/history');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'فشل الحجز');
    } finally { setBooking(false); }
  };

  const getDoctorName = (doc: Doctor | null) => doc?.userId?.fullName || 'طبيب';
  const getPrice = () => {
    if (!selection.doctor) return 0;
    return selection.type === 'consultation' ? selection.doctor.consultationFee : selection.doctor.followUpFee;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full w-fit text-[10px] font-black uppercase tracking-widest border border-primary/20 mx-auto">
          <Calendar size={14} className="animate-pulse" />
          حجز موعد جديد
        </div>
        <h1 className="text-3xl font-black tracking-tighter">
          رعاية طبية <span className="gradient-text">بلمسة عصرية</span>
        </h1>
        <p className="text-slate-500 font-medium text-sm max-w-xl mx-auto">خطوات بسيطة لحجز موعدك مع أفضل المتخصصين في العيادة.</p>
      </div>

      <div className="flex items-center justify-center gap-8 max-w-2xl mx-auto relative px-8" dir="ltr">
        {[1, 2, 3].map((i) => (
          <React.Fragment key={i}>
            <div className="relative flex flex-col items-center gap-3 z-10 group">
              <div className={clsx(
                "w-14 h-14 rounded-[1.5rem] flex items-center justify-center font-black transition-all duration-700 border-2",
                step >= i 
                  ? "bg-primary text-white border-primary shadow-2xl shadow-primary/30 scale-110" 
                  : "bg-white text-slate-300 border-slate-100 group-hover:border-primary/30"
              )}>
                {step > i ? <CheckCircle2 size={24} /> : <span>{i}</span>}
              </div>
              <span className={clsx(
                "text-[11px] font-black uppercase tracking-[0.2em] absolute -bottom-8 whitespace-nowrap transition-all duration-500",
                step >= i ? "text-primary opacity-100" : "text-slate-400 opacity-40"
              )}>
                {i === 1 ? 'الطبيب' : i === 2 ? 'الموعد' : 'تأكيد'}
              </span>
            </div>
            {i < 3 && (
              <div className="flex-1 h-[2px] bg-slate-100 relative overflow-hidden rounded-full">
                <div 
                  className="absolute inset-0 bg-primary transition-all duration-1000 ease-in-out" 
                  style={{ width: step > i ? '100%' : '0%' }} 
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="min-h-[300px] pt-6">
        
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-2 h-8 bg-primary rounded-full" />
                <h2 className="text-2xl font-black">اختر <span className="text-primary">طبيبك</span></h2>
              </div>
              <div className="relative group hidden md:block">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                <input type="text" placeholder="ابحث عن طبيب..." className="bg-slate-50 border border-slate-100 rounded-2xl py-3 pr-12 pl-6 text-sm font-bold focus:ring-4 focus:ring-primary/10 outline-none w-64 transition-all text-right" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-7 space-y-6">
                {loadingDoctors ? (
                  <div className="flex flex-col items-center justify-center h-64 space-y-4">
                     <div className="relative w-12 h-12">
                        <div className="absolute inset-0 rounded-full border-4 border-primary/10" />
                        <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                      </div>
                      <p className="text-slate-400 font-bold text-sm">جاري جلب القائمة...</p>
                  </div>
                ) : doctors.length === 0 ? (
                  <div className="bg-white border-2 border-dashed border-slate-100 p-20 rounded-[3rem] text-center space-y-6">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                      <Stethoscope size={48} />
                    </div>
                    <div className="space-y-2">
                      <p className="text-slate-500 font-black text-xl">لا يوجد أطباء حالياً</p>
                      <p className="text-slate-400 font-bold text-sm">سيتم إضافة طاقمنا الطبي قريباً، يرجى المحاولة لاحقاً.</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {doctors.map((doc: Doctor) => (
                      <div 
                        key={doc._id}
                        onClick={() => setSelection({ ...selection, doctor: doc, slot: null })}
                        className={clsx(
                          "bg-white p-8 rounded-[2.5rem] border flex items-center gap-8 cursor-pointer transition-all duration-500 group relative overflow-hidden",
                          selection.doctor?._id === doc._id 
                            ? "border-primary shadow-2xl shadow-primary/10 ring-8 ring-primary/5 -translate-x-2" 
                            : "border-slate-100 hover:border-primary/20 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-x-2"
                        )}
                      >
                        {selection.doctor?._id === doc._id && (
                          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
                        )}
                        
                        <div className={clsx(
                          "w-20 h-20 rounded-[1.8rem] flex items-center justify-center shrink-0 border transition-all duration-700",
                          selection.doctor?._id === doc._id ? "bg-primary text-white border-primary shadow-lg" : "bg-slate-50 text-slate-300 border-slate-100 group-hover:scale-105"
                        )}>
                          <User size={40} strokeWidth={2.5} />
                        </div>
                        
                        <div className="flex-1 space-y-2 text-right">
                          <h4 className="font-black text-xl text-slate-900 group-hover:text-primary transition-colors">{getDoctorName(doc)}</h4>
                          <div className="flex flex-wrap gap-2">
                            <span className="text-[11px] font-black text-primary/80 bg-primary/5 px-4 py-1 rounded-xl border border-primary/10">
                              {doc.specializationId?.name || 'ممارس عام'}
                            </span>
                            <span className="text-[11px] font-bold text-slate-400 bg-slate-50 px-4 py-1 rounded-xl border border-slate-100">
                              خبرة {Math.floor(Math.random() * 15) + 5} سنوات
                            </span>
                          </div>
                        </div>
                        
                        <div className="text-left space-y-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">سعر الكشف</p>
                          <p className="text-2xl font-black text-emerald-500 font-outfit" dir="ltr">{doc.consultationFee} <span className="text-[10px] text-slate-400">ج.م</span></p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="lg:col-span-5 space-y-8">
                <div className="bg-slate-900/5 dark:bg-white/5 p-10 rounded-[3rem] border border-slate-100 dark:border-white/5 space-y-8">
                   <div className="flex items-center gap-3">
                      <Info size={18} className="text-primary" />
                      <p className="text-sm font-black text-slate-700 uppercase tracking-tight">تفاصيل الزيارة</p>
                   </div>
                   
                   <div className="space-y-6">
                      <BookingTypeCard 
                        active={selection.type === 'consultation'}
                        onClick={() => setSelection({...selection, type: 'consultation'})}
                        title="كشف جديد"
                        desc="زيارة للتشخيص المبدئي والفحص الشامل"
                        price={selection.doctor?.consultationFee}
                        color="primary"
                      />
                      <BookingTypeCard 
                        active={selection.type === 'follow_up'}
                        onClick={() => setSelection({...selection, type: 'follow_up'})}
                        title="إعادة / متابعة"
                        desc="متابعة دورية لخطة العلاج المقررة"
                        price={selection.doctor?.followUpFee}
                        color="emerald"
                      />
                   </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-left-8 duration-1000">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-8 bg-primary rounded-full" />
                  <h2 className="text-2xl font-black text-slate-900">موعد <span className="text-primary">الزيارة</span></h2>
                </div>
                <p className="text-slate-500 font-medium mr-6">اختر التاريخ والوقت المناسبين لك من التقويم التفاعلي.</p>
              </div>
              <div className="flex items-center gap-3 px-6 py-3 bg-white border border-slate-100 rounded-2xl shadow-xl shadow-slate-200/20">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">المواعيد محدثة مباشرة</span>
              </div>
            </div>

            <div className="relative group p-2">
              <div className="flex gap-5 overflow-x-auto pb-8 pt-4 scrollbar-hide" dir="ltr">
                {Array.from({ length: 14 }).map((_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() + i);
                  const dateStr = date.toISOString().split('T')[0];
                  const daysAr = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
                  const dayNameAr = daysAr[date.getDay()];
                  const isAvailable = selection.doctor?.availableDays.includes(dayNameAr) || selection.doctor?.availableDays.includes(date.toLocaleDateString('en-US', { weekday: 'long' }));
                  const isSelected = selection.date === dateStr;

                  return (
                    <button
                      key={dateStr}
                      disabled={!isAvailable}
                      onClick={() => setSelection({ ...selection, date: dateStr, slot: null })}
                      className={clsx(
                        "flex flex-col items-center justify-center min-w-[90px] h-[110px] rounded-[2rem] border transition-all duration-700 relative shrink-0",
                        !isAvailable 
                          ? "bg-slate-50 border-slate-100 opacity-30 grayscale cursor-not-allowed" 
                          : isSelected
                            ? "bg-primary border-primary text-white shadow-2xl shadow-primary/40 scale-110 -translate-y-4 z-10"
                            : "bg-white border-slate-100 text-slate-600 hover:border-primary/40 hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-2"
                      )}
                    >
                      <span className={clsx("text-[11px] font-black mb-2", isSelected ? "text-white/70" : "text-slate-400")}>
                        {dayNameAr}
                      </span>
                      <span className="text-3xl font-black font-outfit tracking-tighter mb-1">
                        {date.getDate()}
                      </span>
                      <span className={clsx("text-[11px] font-black uppercase tracking-widest", isSelected ? "text-white/70" : "text-slate-500")}>
                        {date.toLocaleDateString('ar-EG', { month: 'short' })}
                      </span>
                      {isSelected && (
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white shadow-lg ring-4 ring-primary/20" />
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-slate-50/50 to-transparent pointer-events-none" />
              <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-slate-50/50 to-transparent pointer-events-none" />
            </div>

            <div className="space-y-10">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                   <h3 className="text-2xl font-black text-slate-800 tracking-tight">الفترات المتاحة</h3>
                   <p className="text-xs text-slate-400 font-bold">يرجى اختيار التوقيت الأنسب لك</p>
                </div>
                {selection.date && (
                  <div className="flex items-center gap-3 bg-primary/5 px-6 py-3 rounded-2xl border border-primary/10 shadow-sm animate-in fade-in slide-in-from-right-4">
                    <Calendar size={18} className="text-primary" />
                    <span className="text-sm font-black text-primary">
                      {new Date(selection.date).toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </span>
                  </div>
                )}
              </div>

              {!selection.date ? (
                <div className="bg-white border-2 border-dashed border-slate-100 p-12 rounded-[2rem] text-center space-y-4 opacity-80">
                  <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto text-slate-200">
                    <Calendar size={40} />
                  </div>
                  <p className="text-slate-400 font-black text-lg">الرجاء تحديد تاريخ من القائمة أعلاه للمتابعة</p>
                </div>
              ) : loadingSlots ? (
                <div className="flex flex-col items-center justify-center p-24 space-y-4">
                   <div className="relative w-14 h-14">
                      <div className="absolute inset-0 rounded-full border-4 border-primary/10" />
                      <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                    </div>
                    <p className="text-slate-400 font-bold">جاري تحديث المواعيد...</p>
                </div>
              ) : slots.length === 0 ? (
                <div className="bg-rose-50/30 border-2 border-dashed border-rose-100 p-24 rounded-[3rem] text-center space-y-6">
                  <div className="w-20 h-20 bg-rose-100/50 rounded-3xl flex items-center justify-center mx-auto text-rose-500">
                    <Clock size={40} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-rose-600 font-black text-xl">جدول الطبيب ممتلئ</p>
                    <p className="text-slate-400 font-bold text-sm max-w-sm mx-auto">لا توجد أوقات متاحة في هذا اليوم، جرب اختيار يوم آخر أو طبيب مختلف.</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3" dir="ltr">
                  {slots.map(slot => (
                    <button 
                      key={slot}
                      onClick={() => setSelection({...selection, slot})}
                      className={clsx(
                        "p-4 rounded-2xl border font-black text-sm transition-all duration-500 flex items-center gap-3 justify-center font-outfit relative overflow-hidden group",
                        selection.slot === slot 
                          ? "bg-primary border-primary text-white shadow-2xl shadow-primary/30 scale-105 z-10" 
                          : "bg-white border-slate-100 text-slate-600 hover:border-primary/40 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-2"
                      )}
                    >
                      <Clock size={18} className={clsx("transition-transform duration-500 group-hover:rotate-12", selection.slot === slot ? 'text-white' : 'text-primary/70')} /> 
                      {slot}
                      {selection.slot === slot && (
                        <div className="absolute top-0 right-0 w-12 h-12 bg-white/20 rounded-full blur-2xl -mr-6 -mt-6" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="max-w-2xl mx-auto space-y-12 py-8 animate-in zoom-in-95 duration-1000">
            <div className="text-center space-y-6">
              <div className="w-24 h-24 rounded-[3rem] bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto shadow-inner border border-emerald-500/10 relative">
                <CheckCircle2 size={48} className="animate-pulse" />
                <div className="absolute inset-0 rounded-[3rem] border-4 border-emerald-500/20 animate-ping" />
              </div>
              <div className="space-y-2">
                <h2 className="text-4xl font-black tracking-tighter">مراجعة و<span className="text-emerald-500">تأكيد</span></h2>
                <p className="text-slate-500 font-medium text-lg">يرجى التأكد من كافة تفاصيل الحجز قبل الإتمام.</p>
              </div>
            </div>

            <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-2xl shadow-slate-200/30 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -ml-32 -mt-32" />
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-32 -mb-32" />
                
                <div className="space-y-8 relative z-10">
                  <ConfirmRow label="الطبيب المعالج" value={getDoctorName(selection.doctor)} icon={<User size={18} />} />
                  <ConfirmRow 
                    label="نوع الاستشارة" 
                    value={
                      <span className={clsx(
                        "px-6 py-2 rounded-2xl text-xs font-black border",
                        selection.type === 'consultation' ? 'bg-primary/5 text-primary border-primary/20' : 'bg-emerald-500/5 text-emerald-500 border-emerald-500/20'
                      )}>
                        {selection.type === 'consultation' ? 'كشف مبدئي' : 'متابعة وإعادة'}
                      </span>
                    } 
                  />
                  <ConfirmRow label="تاريخ الحجز" value={selection.date ? new Date(selection.date).toLocaleDateString('ar-EG', { weekday: 'long', month: 'long', day: 'numeric' }) : ''} icon={<CalendarIcon size={18} />} />
                  <ConfirmRow label="وقت الموعد" value={<span className="text-primary font-black text-xl font-outfit">{selection.slot}</span>} icon={<Clock size={18} />} />
                </div>
                
                <div className="mt-12 pt-10 border-t border-dashed border-slate-200 flex justify-between items-end relative z-10">
                  <div className="space-y-2">
                     <p className="text-xs font-black text-slate-400 uppercase tracking-widest">إجمالي المبلغ المطلوب</p>
                     <p className="text-5xl font-black text-emerald-500 font-outfit" dir="ltr">{getPrice()} <span className="text-base text-slate-400">ج.م</span></p>
                  </div>
                  <div className="text-left bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100">
                     <p className="text-[10px] font-black text-slate-400 tracking-tight leading-relaxed">الدفع يتم نقداً في العيادة<br/>برجاء الحضور قبل الموعد بـ 10 دقائق.</p>
                  </div>
                </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-slate-100">
        <button 
          disabled={step === 1} 
          onClick={() => setStep(step - 1)} 
          className="rounded-[1.5rem] px-10 h-14 font-black text-sm text-slate-400 hover:text-primary hover:bg-slate-50 disabled:opacity-0 transition-all flex items-center gap-3 group"
        >
          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          الرجوع للخلف
        </button>
        <Button 
          disabled={step === 1 ? !selection.doctor : step === 2 ? !selection.slot : booking}
          isLoading={booking}
          onClick={() => step < 3 ? setStep(step + 1) : handleBook()}
          className="rounded-[2rem] px-16 h-16 font-black text-lg flex items-center gap-4 group shadow-2xl shadow-primary/30"
        >
          {step === 3 ? 'تأكيد الحجز النهائي' : 'المتابعة للخطوة التالية'}
          <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
}

function BookingTypeCard({ active, onClick, title, desc, price, color }: any) {
  const colors: any = {
    primary: { border: 'border-primary', ring: 'ring-primary/10', text: 'text-primary', bg: 'bg-primary/5' },
    emerald: { border: 'border-emerald-500', ring: 'ring-emerald-500/10', text: 'text-emerald-500', bg: 'bg-emerald-500/5' }
  };
  const theme = colors[color];

  return (
    <button 
      onClick={onClick}
      className={clsx(
        "w-full p-8 bg-white rounded-[2.5rem] border text-right transition-all duration-500 relative overflow-hidden group",
        active ? `${theme.border} ring-8 ${theme.ring} shadow-xl shadow-slate-200/50` : "border-slate-100 hover:border-slate-200"
      )}
    >
      {active && <div className={clsx("absolute top-0 left-0 w-32 h-32 rounded-full blur-3xl -ml-16 -mt-16", theme.bg)} />}
      <div className="flex items-center justify-between relative z-10">
        <span className="font-black text-lg text-slate-900">{title}</span>
        <span className={clsx("text-xl font-black font-outfit", active ? theme.text : "text-slate-400")} dir="ltr">
          {price || '---'} <span className="text-[10px]">ج.م</span>
        </span>
      </div>
      <p className="text-[11px] text-slate-500 font-bold mt-2 pl-12 leading-relaxed opacity-70">{desc}</p>
    </button>
  );
}

function ConfirmRow({ label, value, icon }: { label: string; value: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center group py-2 border-b border-slate-50 last:border-0">
      <div className="flex items-center gap-4">
         <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all duration-500">
            {icon}
         </div>
         <span className="text-slate-500 text-sm font-black">{label}</span>
      </div>
      <div className="font-black text-slate-900 group-hover:-translate-x-2 transition-transform duration-500">{value}</div>
    </div>
  );
}

const CalendarIcon = ({ size, className }: { size: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
