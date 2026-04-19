"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { appointmentsAPI, doctorsAPI, usersAPI, User, Doctor, Appointment } from '@/lib/services';
import { 
  Users, Calendar, Activity, Clock, CheckCircle2, Stethoscope, ChevronLeft, CreditCard, DollarSign
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { clsx } from 'clsx';

export default function DashboardOverview() {
  const { user } = useAuth();

  switch(user?.role) {
    case 'admin':        return <AdminOverview />;
    case 'doctor':       return <DoctorOverview />;
    case 'receptionist': return <ReceptionistOverview />;
    case 'patient':      return <PatientOverview />;
    default: return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }
}

const isToday = (dateStr: string) => {
  if (!dateStr) return false;
  return new Date(dateStr).toISOString().split('T')[0] === new Date().toISOString().split('T')[0];
};
const isThisMonth = (dateStr: string) => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
};

function AdminOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ users: 0, doctors: 0, appointments: 0, todayAppts: 0, monthRevenue: 0, todayRevenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [usersRes, doctorsRes, apptsRes] = await Promise.all([
          usersAPI.getAll().catch(() => ({ data: { data: [] as User[] } })),
          doctorsAPI.getAll().catch(() => ({ data: { data: [] as Doctor[] } })),
          appointmentsAPI.getAll().catch(() => ({ data: { data: [] as Appointment[] } })),
        ]);
        
        const allAppts = (apptsRes.data.data || []) as any[];
        const todayAppts = allAppts.filter(a => isToday(a.date));
        const monthAppts = allAppts.filter(a => isThisMonth(a.date));

        const todayRevenue = todayAppts.filter(a => a.paymentStatus === 'paid').reduce((sum, a) => sum + (a.price || 0), 0);
        const monthRevenue = monthAppts.filter(a => a.paymentStatus === 'paid').reduce((sum, a) => sum + (a.price || 0), 0);

        setStats({
          users: usersRes.data.data?.length || 0,
          doctors: doctorsRes.data.data?.length || 0,
          appointments: allAppts.length,
          todayAppts: todayAppts.length,
          monthRevenue,
          todayRevenue
        });
      } catch {
      } finally { setLoading(false); }
    };
    load();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 relative">
      <div className="flex flex-col space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full w-fit text-[10px] font-black uppercase tracking-widest border border-primary/20">
          <Activity size={14} className="animate-pulse" />
          النظام متصل: {user?.fullName}
        </div>
        <h1 className="text-4xl font-black tracking-tighter">مركز <span className="gradient-text">القيادة</span></h1>
        <p className="text-slate-500 font-medium text-sm max-w-2xl leading-relaxed">نظرة شاملة على أداء العيادة وإحصائيات المستخدمين والأطباء.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        <StatCard icon={Users}       label="المستخدمون"    value={loading ? '...' : stats.users}       desc="حسابات مسجلة" />
        <StatCard icon={Stethoscope} label="الأطباء"       value={loading ? '...' : stats.doctors}     desc="طاقم طبي نشط" />
        <StatCard icon={Calendar}    label="مواعيد اليوم"  value={loading ? '...' : stats.todayAppts}  desc="مجدولة اليوم" />
        <StatCard icon={Activity}    label="إجمالي المواعيد" value={loading ? '...' : stats.appointments} desc="منذ البداية" />
        <StatCard icon={CreditCard}  label="إيرادات الشهر" value={loading ? '...' : `${stats.monthRevenue.toLocaleString()}`} desc="ج.م (خلال هذا الشهر)" variant="success" />
        <StatCard icon={DollarSign}  label="إيرادات اليوم" value={loading ? '...' : `${stats.todayRevenue.toLocaleString()}`} desc="ج.م (مدفوعات اليوم)" variant="warning" />
      </div>

      <div className="pt-4 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">بوابات الإدارة</h4>
          <div className="h-[1px] flex-1 bg-slate-100 mr-8" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickAction title="إدارة الأطباء"      desc="إدارة الأطباء والجداول الطبية"        href="/dashboard/doctors"       icon={Stethoscope} />
          <QuickAction title="إدارة المستخدمين"   desc="إدارة الحسابات والصلاحيات"            href="/dashboard/users"         icon={Users} />
          <QuickAction title="المواعيد"            desc="متابعة جميع مواعيد العيادة"           href="/dashboard/appointments"  icon={Calendar} />
        </div>
      </div>
    </div>
  );
}

function DoctorOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ todayAppts: 0, totalPatients: 0, monthRevenue: 0, todayRevenue: 0, upcomingPatients: [] as any[] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [apptsRes, docRes] = await Promise.all([
          appointmentsAPI.getAll(),
          doctorsAPI.getAll()
        ]);
        
        const currentDoctor = (docRes.data.data as any[]).find(d => d.userId?._id === user?._id);
        const allAppts = (apptsRes.data.data || []) as any[];
        
        // Filter ONLY appointments for THIS doctor
        const myAppts = allAppts.filter(a => a.doctorId?._id === currentDoctor?._id);
        
        const todayAppts = myAppts.filter(a => isToday(a.date));
        const monthAppts = myAppts.filter(a => isThisMonth(a.date));
        const uniquePatients = new Set(myAppts.map(a => a.patientId?._id)).size;

        const todayRevenue = todayAppts.filter(a => a.paymentStatus === 'paid').reduce((sum, a) => sum + (a.price || 0), 0);
        const monthRevenue = monthAppts.filter(a => a.paymentStatus === 'paid').reduce((sum, a) => sum + (a.price || 0), 0);

        setStats({
          todayAppts: todayAppts.length,
          totalPatients: uniquePatients,
          monthRevenue,
          todayRevenue,
          upcomingPatients: todayAppts.slice(0, 5)
        });
      } catch {
      } finally { setLoading(false); }
    };
    load();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="flex flex-col space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full w-fit text-[10px] font-black uppercase tracking-widest border border-primary/20">
          <Activity size={14} className="animate-pulse" />
          النظام متصل: {user?.fullName}
        </div>
        <h1 className="text-4xl font-black tracking-tighter">مساحة <span className="gradient-text">العمل</span></h1>
        <p className="text-slate-500 font-medium text-sm max-w-2xl leading-relaxed">أهلاً بك مجدداً. يمكنك متابعة أداء العيادة، إدارة المواعيد، والتواصل مع المرضى.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Calendar}    label="مواعيد اليوم"   value={loading ? '...' : stats.todayAppts} desc="مجدولة اليوم" />
        <StatCard icon={Users}       label="إجمالي المرضى"  value={loading ? '...' : stats.totalPatients} desc="طوال فترة العمل" />
        <StatCard icon={CreditCard}  label="إيرادات الشهر"  value={loading ? '...' : `${stats.monthRevenue.toLocaleString()}`} desc="ج.م (هذا الشهر)"     variant="success" />
        <StatCard icon={DollarSign}  label="إيرادات اليوم"  value={loading ? '...' : `${stats.todayRevenue.toLocaleString()}`} desc="ج.م (مدفوعات اليوم)" variant="warning" />
      </div>

      <div className="grid grid-cols-1 text-right">
        <div className="bg-white rounded-[2rem] border border-slate-100 p-8 space-y-8 shadow-xl shadow-slate-200/20">
          <div className="flex items-center justify-between">
            <Link href="/dashboard/queue" className="text-xs font-bold text-primary hover:underline">عرض القائمة كاملة</Link>
            <h4 className="text-xl font-bold">المرضى القادمون اليوم</h4>
          </div>
          <div className="space-y-4">
            {stats.upcomingPatients.length === 0 && !loading ? (
               <div className="text-center p-8 text-slate-500 font-bold">لا يوجد مرضى في قائمة الانتظار حالياً.</div>
            ) : (
               stats.upcomingPatients.map((p: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-white hover:border hover:border-slate-200 transition-all cursor-pointer text-right">
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-700" dir="ltr">{p.slotTime}</p>
                  <p className="text-[10px] font-bold text-emerald-500 uppercase">{p.status === 'checked_in' ? 'بالعيادة' : 'في الانتظار'}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-slate-900">{p.patientId?.fullName || 'مريض'}</p>
                    <p className="text-xs text-slate-500 font-medium">{p.appointmentType === 'consultation' ? 'كشف جديد' : 'متابعة'}</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    {p.patientId?.fullName?.charAt(0) || 'م'}
                  </div>
                </div>
              </div>
            )))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReceptionistOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ todayAppts: 0, todayRevenue: 0, newBookings: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [apptsRes, docsRes] = await Promise.all([
          appointmentsAPI.getAll(),
          doctorsAPI.getAll()
        ]);
        
        const allAppts = (apptsRes.data.data || []) as any[];
        const allDocs = (docsRes.data.data || []) as any[];
        
        const todayAppts = allAppts.filter(a => isToday(a.date));
        const todayRevenue = todayAppts.filter(a => a.paymentStatus === 'paid').reduce((sum, a) => sum + (a.price || 0), 0);
        const newBookings = todayAppts.filter(a => a.status === 'pending').length;

        setStats({
          todayAppts: todayAppts.length,
          todayRevenue,
          newBookings,
          workingDoctors: allDocs.length // Simplified for now
        });
      } catch {
      } finally { setLoading(false); }
    };
    load();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="flex flex-col space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full w-fit text-[10px] font-black uppercase tracking-widest border border-primary/20">
          <Activity size={14} className="animate-pulse" />
          النظام متصل: {user?.fullName}
        </div>
        <h1 className="text-4xl font-black tracking-tighter">مكتب <span className="gradient-text">الاستقبال</span></h1>
        <p className="text-slate-500 font-medium text-sm max-w-2xl leading-relaxed">تنظيم تدفق المرضى ومتابعة تحصيل إيرادات اليوم.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard icon={Users}      label="الوصول اليومي"  value={loading ? '...' : stats.todayAppts}    desc="المسجلون اليوم" />
        <StatCard icon={CreditCard} label="إيرادات اليوم"  value={loading ? '...' : `${stats.todayRevenue.toLocaleString()}`} desc="ج.م (مدفوعات اليوم)"   variant="success" />
        <StatCard icon={Calendar}   label="حجوزات جديدة"   value={loading ? '...' : stats.newBookings}    desc="في انتظار التأكيد" variant="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <QuickAction title="تسجيل مريض"    desc="تسجيل وصول مريض إلى قائمة الانتظار" href="/dashboard/reception"    icon={CheckCircle2} />
        <QuickAction title="دفعة جديدة"    desc="معالجة الرسوم والتأمين الطبي"          href="/dashboard/payments"     icon={CreditCard} />

      </div>
    </div>
  );
}

function PatientOverview() {
  const { user } = useAuth();
  const [nextAppointment, setNextAppointment] = useState<any>(null);
  const [stats, setStats] = useState({ totalVisits: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const apptsRes = await appointmentsAPI.getAll();
        const allAppts = (apptsRes.data.data || []) as any[];
        
        const upcoming = allAppts.filter(a => ['pending', 'confirmed'].includes(a.status)).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        if (upcoming.length > 0) setNextAppointment(upcoming[0]);
        
        setStats({ totalVisits: allAppts.filter(a => a.status === 'completed').length });
      } catch {
      } finally { setLoading(false); }
    };
    load();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="flex flex-col space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full w-fit text-[10px] font-black uppercase tracking-widest border border-primary/20">
          <Activity size={14} className="animate-pulse" />
          النظام متصل: {user?.fullName}
        </div>
        <h1 className="text-4xl font-black tracking-tighter">أهلاً <span className="gradient-text">بك</span></h1>
        <p className="text-slate-500 font-medium text-sm max-w-2xl leading-relaxed">رحلتك الصحية ومواعيدك القادمة في عيادتي.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-primary text-white p-6 rounded-[2rem] shadow-2xl shadow-primary/20 space-y-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 transition-transform duration-700 group-hover:scale-150" />
          <div className="flex items-center justify-between relative z-10">
            <h4 className="text-2xl font-bold">موعدك القادم</h4>
            <Calendar size={32} className="opacity-50" />
          </div>
          {nextAppointment ? (
            <div className="space-y-3 relative z-10">
              <p className="text-2xl font-black tracking-tighter" dir="ltr">{nextAppointment.slotTime} ، {new Date(nextAppointment.date).toLocaleDateString('ar-EG')}</p>
              <p className="text-white/80 font-bold text-lg">مع {nextAppointment.doctorId?.userId?.fullName || 'الطبيب'}</p>
            </div>
          ) : (
            <div className="space-y-3 relative z-10">
              <p className="text-2xl font-black opacity-80 tracking-tighter">لا يوجد مواعيد قادمة</p>
              <p className="text-white/80 font-bold text-lg">احجز موعدك الآن للاطمئنان على صحتك</p>
            </div>
          )}
          <div className="pt-2 relative z-10">
            <Link href={nextAppointment ? "/dashboard/history" : "/dashboard/book"}>
              <Button className="bg-white text-primary hover:bg-white/90 rounded-2xl px-10 h-14 text-lg font-black shadow-xl">
                {nextAppointment ? "عرض التفاصيل" : "حجز موعد جديد"}
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <StatCard icon={CheckCircle2} label="زياراتك السابقة" value={loading ? '...' : stats.totalVisits} desc="كشوفات مكتملة بالعيادة" variant="success" />
        </div>
      </div>

      <div className="pt-4">
        <div className="flex items-center justify-between mb-8">
          <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">إجراءات سريعة</h4>
          <div className="h-[1px] flex-1 bg-slate-100 mr-8" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <QuickAction title="حجز موعد"    desc="حجز زيارة مع أحد المتخصصين" href="/dashboard/book"    icon={Calendar} />
          <QuickAction title="السجل الطبي" desc="مراجعة زياراتك السابقة وتقارير الأطباء"       href="/dashboard/history" icon={Activity} />
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  desc?: string;
  variant?: 'primary' | 'success' | 'warning';
}

function StatCard({ icon: Icon, label, value, desc, variant = 'primary' }: StatCardProps) {
  const themes: Record<string, { bg: string; text: string; shadow: string }> = {
    primary: { bg: 'bg-primary/5 text-primary', text: 'text-primary', shadow: 'shadow-primary/5' },
    success: { bg: 'bg-emerald-500/5 text-emerald-600', text: 'text-emerald-600', shadow: 'shadow-emerald-500/5' },
    warning: { bg: 'bg-amber-500/5 text-amber-600', text: 'text-amber-600', shadow: 'shadow-amber-500/5' },
  };
  const theme = themes[variant];

  return (
    <div className={`bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl ${theme.shadow} hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 flex flex-col justify-between space-y-4 text-right group`}>
      <div className="flex items-center justify-between">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:rotate-12 ${theme.bg}`}>
          <Icon size={28} strokeWidth={2.5} />
        </div>
        <div className="text-left">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
          <p className="text-[10px] font-bold text-slate-300 mt-1">{desc}</p>
        </div>
      </div>
      <div className="pt-2">
        <h3 className={`text-4xl font-black tracking-tighter ${theme.text}`}>{value}</h3>
      </div>
    </div>
  );
}

interface QuickActionProps {
  title: string;
  desc: string;
  href: string;
  icon: React.ElementType;
}

function QuickAction({ title, desc, href, icon: Icon }: QuickActionProps) {
  return (
    <Link href={href} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/20 hover:shadow-2xl hover:scale-[1.02] hover:border-primary/20 transition-all duration-500 group block text-right relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 transition-transform duration-700 group-hover:scale-[2.5]" />
      
      <div className="relative z-10 flex flex-col items-start gap-6">
        <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner">
          <Icon size={28} strokeWidth={2.5} />
        </div>
        
        <div className="space-y-2">
          <h4 className="text-xl font-black text-slate-900 group-hover:text-primary transition-colors">{title}</h4>
          <p className="text-slate-500 font-medium text-sm leading-relaxed">{desc}</p>
        </div>
        
        <div className="flex items-center gap-2 text-xs font-black text-primary opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0 pt-2">
          دخول البوابة <ChevronLeft size={16} strokeWidth={3} />
        </div>
      </div>
    </Link>
  );
}
