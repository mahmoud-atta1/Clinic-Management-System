"use client";

import React, { useState, useEffect } from 'react';
import { 
  CreditCard, DollarSign, Wallet, FileText, 
  Search, ArrowRight, CheckCircle2, TrendingUp,
  Filter, Download
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { appointmentsAPI, Appointment } from '@/lib/services';

export default function PaymentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = async () => {
    try {
      const res = await appointmentsAPI.getAll();
      setAppointments(res.data.data || []);
    } catch {
      console.error('Failed to load financial data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const paidAppointments = appointments.filter((a: any) => a.paymentStatus === 'paid');
  
  const totalRevenue = paidAppointments.reduce((sum, a) => sum + (a.price || 0), 0);
  const cashCollection = paidAppointments.filter((a: any) => a.paymentMethod === 'cash').reduce((sum, a) => sum + (a.price || 0), 0);
  const digitalCollection = paidAppointments.filter((a: any) => a.paymentMethod !== 'cash').reduce((sum, a) => sum + (a.price || 0), 0);

  const filtered = paidAppointments.filter((a: any) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const patientName = a.patientId?.fullName?.toLowerCase() || '';
    const bookingCode = a.bookingCode?.toLowerCase() || '';
    return patientName.includes(q) || bookingCode.includes(q);
  });
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 text-right">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black">
            الإدارة <span className="gradient-text">المالية</span>
          </h1>
          <p className="text-slate-500 font-bold">إدارة إيرادات العيادة، الإيصالات، والمدفوعات الإلكترونية</p>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="ghost" className="rounded-2xl h-12 px-6 border border-slate-200 dark:border-white/5 font-bold gap-2">
              <Download size={18} />
              تحميل تقرير التسوية
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <RevenueCard label="إجمالي الإيرادات" val={totalRevenue.toLocaleString()} unit="ج.م" delta="+18%" icon={DollarSign} />
        <RevenueCard label="التحصيل النقدي" val={cashCollection.toLocaleString()} unit="ج.م" delta="+12%" icon={Wallet} />
        <RevenueCard label="المدفوعات الرقمية" val={digitalCollection.toLocaleString()} unit="ج.م" delta="+34%" icon={CreditCard} />
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="relative max-w-md w-full group">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث برقم المعاملة أو اسم المريض..." 
              className="w-full bg-white border border-slate-200 rounded-2xl py-3 pr-12 pl-6 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all text-right"
            />
          </div>
          <div className="flex items-center gap-3">
             <Button variant="ghost" className="h-11 rounded-xl border border-slate-200 font-bold gap-2 text-slate-500 bg-white hover:bg-slate-50">
                <Filter size={16} />
                تصفية
             </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-slate-400 dark:text-slate-500 border-b border-white/5">
                <th className="px-8 py-5 text-right font-black text-sm">رقم المعاملة</th>
                <th className="px-8 py-5 text-right font-black text-sm">بيانات المريض</th>
                <th className="px-8 py-5 text-right font-black text-sm">المبلغ</th>
                <th className="px-8 py-5 text-right font-black text-sm">طريقة الدفع</th>
                <th className="px-8 py-5 text-left font-black text-sm">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 font-bold">
                     <div className="flex justify-center mb-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                     </div>
                     جاري تحميل البيانات...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400 font-bold">لا توجد معاملات مالية مطابقة</td>
                </tr>
              ) : filtered.map((apt: any) => (
                <tr key={apt._id} className="group hover:bg-slate-50/50 dark:hover:bg-white/5 transition-all">
                  <td className="px-8 py-6">
                    <p className="font-extrabold text-xs tracking-tight text-primary uppercase" dir="ltr">{apt.bookingCode}</p>
                    <p className="text-[10px] text-slate-400 font-bold mt-1">
                       {new Date(apt.date).toLocaleDateString('ar-EG')} - {apt.slotTime}
                    </p>
                  </td>
                  <td className="px-8 py-6">
                     <p className="font-black text-sm tracking-tight">{apt.patientId?.fullName || 'مريض غير معروف'}</p>
                  </td>
                  <td className="px-8 py-6">
                     <p className="text-sm font-black font-outfit" dir="ltr">{apt.price} <span className="text-[10px] text-slate-400">ج.م</span></p>
                  </td>
                  <td className="px-8 py-6">
                     <div className="flex items-center gap-2">
                        {apt.paymentMethod === 'cash' ? <Wallet size={14} className="text-amber-500" /> : <CreditCard size={14} className="text-primary" />}
                        <span className="text-[10px] font-bold text-slate-500">{apt.paymentMethod === 'cash' ? 'كاش' : 'دفع إلكتروني'}</span>
                     </div>
                  </td>
                  <td className="px-8 py-6 text-left">
                     <div className="flex items-center justify-end gap-3 text-left">
                        <span className="inline-flex px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold rounded-lg border border-emerald-500/10">
                           مكتملة
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-primary/10 hover:text-primary">
                           <FileText size={16} />
                        </div>
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function RevenueCard({ label, val, unit, delta, icon: Icon }: any) {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col justify-between text-right space-y-6">
       <div className="flex items-center justify-between">
          <div className="space-y-1 text-right">
             <p className="text-[11px] font-bold text-slate-500">{label}</p>
             <h4 className="text-4xl font-black text-slate-900 font-outfit" dir="ltr">{val} <span className="text-sm text-slate-400">{unit}</span></h4>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
             <Icon size={28} />
          </div>
       </div>
       <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg w-fit border border-emerald-100">
          <TrendingUp size={14} />
          {delta} عن الفترة السابقة
       </div>
    </div>
  );
}
