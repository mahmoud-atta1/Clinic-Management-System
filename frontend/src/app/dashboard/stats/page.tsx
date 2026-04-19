"use client";

import React from 'react';
import { 
  Activity, Users, TrendingUp, Calendar, 
  BarChart4, ArrowUpRight, ArrowDownRight, User
} from 'lucide-react';

export default function PatientStatsPage() {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 text-right">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black">
            إحصائيات <span className="gradient-text">العيادة</span>
          </h1>
          <p className="text-slate-500 font-bold">تحليلات الأداء السريري ورؤى بيانات المرضى</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard label="المرضى شهرياً" val="142" delta="+12%" up icon={Users} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-10 space-y-8">
            <div className="flex items-center justify-between text-right">
               <h3 className="text-lg font-bold tracking-tight">ساعات الذروة التشغيلية</h3>
               <BarChart4 className="text-slate-400" size={20} />
            </div>
            <div className="h-64 flex items-end justify-between gap-4">
               {[40, 70, 45, 90, 65, 30, 85].map((h, i) => (
                 <div key={i} className="flex-1 space-y-3 group">
                    <div className="relative h-full w-full bg-slate-50 rounded-xl overflow-hidden border border-slate-100">
                       <div 
                        className="absolute bottom-0 w-full bg-blue-500 transition-all duration-1000 group-hover:bg-blue-600" 
                        style={{ height: `${h}%` }}
                       />
                    </div>
                    <p className="text-[11px] text-center font-bold text-slate-500">يوم {i+1}</p>
                 </div>
               ))}
            </div>
         </div>

         <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-10 space-y-8 text-right">
            <h3 className="text-lg font-bold tracking-tight">النشاط السريري الأخير</h3>
            <div className="space-y-6">
               {[1, 2, 3, 4].map(i => (
                 <div key={i} className="flex items-center justify-between group">
                    <span className="text-[11px] font-bold text-slate-400">منذ ساعتين</span>
                    <div className="flex items-center gap-4">
                       <div className="text-right">
                          <p className="text-sm font-bold text-slate-900 tracking-tight">حالة مريض #{Math.floor(Math.random() * 9000) + 1000}</p>
                          <p className="text-[10px] text-slate-500 font-bold">تم الانتهاء من الكشف التشخيصي</p>
                       </div>
                       <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-200 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                          <User size={18} />
                       </div>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}

function StatCard({ label, val, delta, up, icon: Icon }: any) {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col justify-between text-right space-y-6">
       <div className="flex items-center justify-between">
          <div className="space-y-1 text-right">
             <p className="text-[11px] font-bold text-slate-500">{label}</p>
             <div className="flex items-baseline gap-3 justify-end">
                <div className={`flex items-center text-[10px] font-bold gap-1 px-2 py-0.5 rounded border ${up ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-amber-600 bg-amber-50 border-amber-100'}`}>
                   {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                   <span dir="ltr">{delta}</span>
                </div>
                <h4 className="text-4xl font-black text-slate-900 font-outfit" dir="ltr">{val}</h4>
             </div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shrink-0">
             <Icon size={28} />
          </div>
       </div>
    </div>
  );
}
