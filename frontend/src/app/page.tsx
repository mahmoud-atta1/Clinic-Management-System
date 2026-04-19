"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Shield, Activity, Zap, ArrowLeft, CheckCircle2, 
  Stethoscope, Users, CreditCard, Layout 
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import MainNavbar from "@/components/MainNavbar";
import api from "@/lib/api";

export default function Home() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await api.get("/doctors");
        setDoctors(res.data.data.slice(0, 2));
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  return (
    <div className="h-screen bg-slate-50 font-sans text-right overflow-hidden flex flex-col">
      <MainNavbar />

      <main className="flex-1 relative flex items-center justify-center overflow-hidden pt-20">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px] -ml-64 -mb-64 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            
            <div className="space-y-10 animate-in fade-in slide-in-from-right duration-1000 relative z-10">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-white border border-slate-100 shadow-xl shadow-slate-200/20 text-primary rounded-full text-xs font-black tracking-widest uppercase">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                رعاية صحية تثق بها في عيادتي
              </div>
              
              <div className="space-y-6">
                <h1 className="text-6xl lg:text-8xl font-black leading-[1.1] text-slate-900 tracking-tighter">
                  صحتك هي <br />
                  <span className="gradient-text">أولويتنا القصوى.</span>
                </h1>
                <p className="text-xl text-slate-500 font-medium max-w-xl leading-relaxed">
                  نظام طبي متكامل يجمع بين التكنولوجيا المتطورة والرعاية الإنسانية. احجز موعدك الآن وتواصل مع نخبة من الأطباء المتخصصين.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
                <Link href="/register" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto h-16 px-12 text-xl font-black gap-4 shadow-2xl shadow-primary/30 rounded-2xl group transition-all duration-500 hover:scale-105 active:scale-95">
                    احجز موعدك الآن
                    <ArrowLeft size={24} className="group-hover:-translate-x-2 transition-transform duration-500" />
                  </Button>
                </Link>
                <Link href="/login" className="w-full sm:w-auto">
                   <Button variant="ghost" className="w-full sm:w-auto h-16 px-10 text-lg font-bold text-slate-600 hover:bg-slate-100 rounded-2xl">
                     دخول الأعضاء
                   </Button>
                </Link>
              </div>

              <div className="flex items-center gap-10 pt-10 border-t border-slate-100">
                <StatPreview icon={Users} label="مريض يثق بنا" value="+2,000" />
                <StatPreview icon={Stethoscope} label="طبيب متخصص" value="+50" />
              </div>
            </div>

            <div className="relative hidden lg:block animate-in fade-in zoom-in duration-1000 delay-200">
              <div className="absolute -inset-10 bg-gradient-to-tr from-primary/10 to-secondary/10 rounded-[4rem] blur-3xl opacity-30 animate-pulse" />
              <div className="relative rounded-[3.5rem] bg-white p-4 shadow-2xl shadow-slate-300/30 border border-slate-100 group">
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 rounded-[3.5rem]" />
                <img 
                  src="/hero.png" 
                  alt="عيادتي" 
                  className="w-full h-[550px] object-cover rounded-[3rem] shadow-inner" 
                />
                
                {/* Floating Info Cards */}
                <div className="absolute -left-10 top-20 bg-white p-6 rounded-[2rem] shadow-2xl border border-slate-50 flex items-center gap-4 animate-bounce-slow">
                   <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center shadow-inner">
                      <CheckCircle2 size={24} />
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase">مواعيد مؤكدة</p>
                      <p className="font-black text-slate-900">حجز فوري</p>
                   </div>
                </div>

                <div className="absolute -right-10 bottom-20 bg-white p-6 rounded-[2rem] shadow-2xl border border-slate-50 flex items-center gap-4 animate-bounce-slow delay-700">
                   <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center shadow-inner">
                      <Activity size={24} />
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase">ملف طبي</p>
                      <p className="font-black text-slate-900">متابعة دقيقة</p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer minimal for no-scroll */}
      <footer className="h-20 px-10 border-t border-slate-100 flex items-center justify-between text-slate-400 text-xs font-bold bg-white/50 backdrop-blur-xl relative z-20">
         <div className="flex items-center gap-2">
            <Stethoscope size={18} className="text-primary" />
            <span className="font-black text-slate-900 tracking-tighter">عيادتي</span>
         </div>
         <p>© 2026 جميع الحقوق محفوظة لنظام عيادتي الإلكتروني</p>
         <div className="flex gap-8">
            <Link href="#" className="hover:text-primary transition-colors uppercase tracking-widest">الخصوصية</Link>
            <Link href="#" className="hover:text-primary transition-colors uppercase tracking-widest">الشروط</Link>
         </div>
      </footer>
    </div>
  );
}

function StatPreview({ icon: Icon, label, value }: any) {
  return (
    <div className="flex items-center gap-4 group">
      <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all duration-500">
        <Icon size={24} />
      </div>
      <div className="text-right">
        <p className="text-2xl font-black text-slate-900 tracking-tighter group-hover:text-primary transition-colors">{value}</p>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      </div>
    </div>
  );
}
