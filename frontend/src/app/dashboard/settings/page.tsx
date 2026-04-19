"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  User, Shield, Bell, Globe, Moon, Sun, 
  Settings as SettingsIcon, LogOut, Key, Mail, CheckCircle2,
  ChevronLeft, Laptop, Smartphone
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', name: 'الهوية والملف الشخصي', icon: User, desc: 'المعلومات الشخصية والمهنية' },
    { id: 'security', name: 'الأمان والوصول', icon: Shield, desc: 'المصادقة والجلسات النشطة' },
    { id: 'notifications', name: 'الإشعارات', icon: Bell, desc: 'تفضيلات التنبيهات والبريد الإلكتروني' },
  ];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 relative text-right">
      
      <div className="absolute top-20 left-0 w-96 h-96 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-20 w-80 h-80 bg-secondary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
        <div className="space-y-3">
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full">
              <SettingsIcon size={14} className="animate-spin-slow" />
              <span className="text-[10px] font-black uppercase tracking-widest">لوحة التحكم</span>
           </div>
           <h1 className="text-5xl font-black tracking-tighter">
             تفضيلات <span className="gradient-text">النظام</span>
           </h1>
           <p className="text-slate-400 font-bold text-lg">إدارة هويتك السريرية وبيئة عملك الرقمية</p>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-200 text-slate-600 hover:bg-slate-50 font-bold">عرض السجلات</Button>
           <Button className="h-14 px-8 rounded-2xl shadow-xl shadow-primary/20 font-black">حفظ التغييرات</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
        
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-card p-4 rounded-[2rem] space-y-2 border-slate-100 shadow-xl shadow-slate-100/50">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-4 p-5 rounded-2xl transition-all duration-500 group relative ${activeTab === tab.id ? 'bg-primary text-white shadow-2xl shadow-primary/30' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${activeTab === tab.id ? 'bg-white/20' : 'bg-slate-100 group-hover:bg-primary/10'}`}>
                   <tab.icon size={22} />
                </div>
                <div className="text-right">
                   <p className="text-sm font-black tracking-tight">{tab.name}</p>
                   <p className={`text-[11px] font-bold mt-0.5 ${activeTab === tab.id ? 'text-white/70' : 'text-slate-400'}`}>{tab.desc}</p>
                </div>
                {activeTab === tab.id && <ChevronLeft size={18} className="mr-auto opacity-70" />}
              </button>
            ))}
          </div>

          <div className="p-8 rounded-[2rem] bg-gradient-to-bl from-slate-900 to-slate-800 text-white shadow-2xl space-y-6 relative overflow-hidden group">
             <div className="absolute top-0 left-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full" />
             <div className="space-y-1 relative z-10">
                <p className="text-[10px] font-black text-primary">النسخة الطبية</p>
                <h4 className="text-xl font-black">نسخة المؤسسات</h4>
             </div>
             <div className="flex items-center justify-between text-[11px] font-bold opacity-60 relative z-10">
                <span dir="ltr">Version: 2.4.0-premium</span>
                <span>نشط</span>
             </div>
             <div className="pt-4 border-t border-white/10 relative z-10">
                <Button className="w-full bg-white text-slate-900 hover:bg-slate-100 h-12 text-xs font-black rounded-xl">التحقق من التحديثات</Button>
             </div>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="glass-card rounded-[2.5rem] border-slate-100 shadow-2xl shadow-slate-200/50 min-h-[600px] overflow-hidden">
            {activeTab === 'profile' && (
              <div className="p-10 md:p-14 space-y-12 animate-in fade-in slide-in-from-left-8 duration-700">
                <div className="flex flex-col md:flex-row gap-12 items-start">
                    <div className="relative">
                       <div className="w-40 h-40 rounded-[3.5rem] bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center text-primary font-black text-6xl border-4 border-white shadow-2xl overflow-hidden">
                          {user?.fullName?.charAt(0)}
                       </div>
                       <button className="absolute -bottom-2 -left-2 w-14 h-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-primary shadow-xl hover:scale-110 transition-transform group">
                          <Sun size={24} className="group-hover:rotate-45 transition-transform duration-700" />
                       </button>
                    </div>
                    <div className="flex-1 space-y-6">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Input label="الاسم الكامل" defaultValue={user?.fullName} className="h-14 px-6 bg-slate-50 border-transparent focus:bg-white text-right" />
                          <Input label="رقم الهاتف" defaultValue={user?.phone} className="h-14 px-6 bg-slate-50 border-transparent focus:bg-white text-right" dir="ltr" />
                       </div>
                       <Input label="البريد الإلكتروني" defaultValue={user?.email} disabled className="h-14 px-6 bg-slate-100 border-transparent opacity-60 text-right" dir="ltr" />
                       <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100 text-right">
                          <Mail size={16} className="text-amber-600 mt-1 shrink-0" />
                          <p className="text-[11px] text-amber-800 font-bold leading-relaxed">البريد الإلكتروني مرتبط هويتك المؤسسية ولا يمكن تغييره.</p>
                       </div>
                    </div>
                </div>

                <div className="pt-10 border-t border-slate-100 flex justify-end gap-4">
                   <Button variant="ghost" className="rounded-2xl h-14 font-black px-10">تجاهل التغييرات</Button>
                   <Button className="rounded-2xl h-14 font-black px-12 shadow-2xl shadow-primary/25">تحديث الهوية</Button>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
               <div className="p-10 md:p-14 space-y-12 animate-in fade-in slide-in-from-left-8 duration-700">
                  <div className="space-y-8 max-w-2xl">
                     <div className="flex items-center gap-6 text-primary bg-primary/5 p-6 rounded-[2rem] border border-primary/10 shadow-sm">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/10 shrink-0">
                           <Key size={28} />
                        </div>
                        <div>
                           <h4 className="font-black text-lg tracking-tight">بيانات الاعتماد والأمان</h4>
                           <p className="text-xs text-slate-500 font-bold leading-relaxed mt-1">حافظ على التدوير الدوري لكلمة المرور لضمان أقصى درجات الأمان.</p>
                        </div>
                     </div>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                        <Input label="كلمة المرور الحالية" type="password" placeholder="••••••••" className="h-14 px-6 bg-slate-50" />
                        <Input label="مفتاح الأمان الجديد" type="password" placeholder="••••••••" className="h-14 px-6 bg-slate-50" />
                        <div className="md:col-span-2 text-right">
                           <Button className="rounded-2xl h-14 font-black px-10 shadow-xl shadow-primary/20">تحديث كلمة المرور</Button>
                        </div>
                     </div>
                  </div>

                  <div className="pt-12 border-t border-slate-100">
                     <div className="flex items-center justify-between mb-8">
                        <h4 className="text-sm font-black text-slate-400">الجلسات المعتمدة</h4>
                        <Button variant="ghost" className="text-xs font-black text-red-500 hover:bg-red-50">إنهاء الجميع</Button>
                     </div>
                     <div className="p-6 rounded-3xl border border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:bg-white hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500">
                        <div className="flex items-center gap-6">
                           <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-md group-hover:bg-primary group-hover:text-white transition-all shrink-0">
                              <Laptop size={24} />
                           </div>
                           <div>
                              <p className="font-black text-slate-900 tracking-tight">جلسة العمل الحالية</p>
                              <p className="text-[11px] text-slate-400 font-bold flex flex-wrap items-center gap-2 mt-1" dir="ltr">
                                 Cairo, Egypt • IP: 192.168.1.1 
                                 <span className="w-1 h-1 bg-slate-300 rounded-full hidden md:block" />
                                 Chrome Desktop
                              </p>
                           </div>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 text-[10px] font-black rounded-xl">
                           <CheckCircle2 size={12} />
                           معتمد
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {activeTab === 'notifications' && (
               <div className="p-10 md:p-14 text-center space-y-10 animate-in fade-in slide-in-from-left-8 duration-700">
                  <div className="w-24 h-24 bg-primary/5 border border-primary/10 rounded-[2.5rem] flex items-center justify-center mx-auto text-primary shadow-inner">
                     <Bell size={40} className="animate-bounce-slow" />
                  </div>
                  <div className="space-y-3">
                     <h3 className="text-3xl font-black tracking-tighter">محرك الإشعارات</h3>
                     <p className="text-slate-500 font-bold text-lg">تكوين مسار التنبيهات للأحداث السريرية</p>
                  </div>
                  <div className="max-w-xl mx-auto space-y-4 pt-6">
                     <ToggleRow title="إرسال البريد الطبي" desc="استلام جدول أعمال المرضى اليومي وملخصات المختبر" icon={Mail} />
                     <ToggleRow title="تنبيهات العيادة المباشرة" desc="تنبيهات فورية لتسجيل الدخول والفرز والإلغاء" icon={Bell} />
                     <ToggleRow title="تطورات النظام" desc="إصدارات وميزات سريرية جديدة للنظام" icon={SettingsIcon} />
                  </div>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({ title, desc, icon: Icon }: { title: string; desc: string; icon: any }) {
  const [enabled, setEnabled] = useState(true);
  return (
    <div className={`flex items-center justify-between p-6 rounded-[2rem] border transition-all duration-500 cursor-pointer text-right ${enabled ? 'bg-white border-primary/10 shadow-xl shadow-primary/5' : 'bg-slate-50/50 border-slate-100 opacity-60'}`} onClick={() => setEnabled(!enabled)}>
       <div className="flex items-center gap-5">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${enabled ? 'bg-primary/10 text-primary' : 'bg-slate-200 text-slate-400'}`}>
             <Icon size={20} />
          </div>
          <div className="text-right space-y-1">
             <p className="text-[15px] font-black tracking-tight">{title}</p>
             <p className="text-[11px] text-slate-400 font-bold leading-tight">{desc}</p>
          </div>
       </div>
       <div className={`w-14 h-8 rounded-full relative transition-all duration-500 shadow-inner mr-auto ${enabled ? 'bg-primary' : 'bg-slate-200'}`}>
          <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-all duration-500 ${enabled ? 'left-1' : 'left-7'}`} />
       </div>
    </div>
  );
}
