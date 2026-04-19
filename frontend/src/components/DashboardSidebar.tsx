"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  UserSquare, 
  Settings, 
  LogOut,
  Stethoscope,
  Activity,
  CreditCard,
  ClipboardList,
  ChevronLeft
} from 'lucide-react';
import { clsx } from 'clsx';

export const DashboardSidebar = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const getMenuItems = () => {
    const base = [
      { name: 'الرئيسية', href: '/dashboard', icon: LayoutDashboard },
    ];

    if (user?.role === 'admin') {
      return [
        ...base,
        { name: 'الأطباء', href: '/dashboard/doctors', icon: UserSquare },
        { name: 'المستخدمون', href: '/dashboard/users', icon: Users },
        { name: 'التخصصات', href: '/dashboard/specialties', icon: ClipboardList },
        { name: 'المواعيد', href: '/dashboard/appointments', icon: Calendar },
      ];
    }

    if (user?.role === 'doctor') {
      return [
        ...base,
        { name: 'قائمة اليوم', href: '/dashboard/queue', icon: Calendar },
        { name: 'ملخص العيادة', href: '/dashboard/stats', icon: Activity },
      ];
    }

    if (user?.role === 'receptionist') {
      return [
        ...base,
        { name: 'مكتب الاستقبال', href: '/dashboard/reception', icon: Calendar },
        { name: 'الحسابات', href: '/dashboard/payments', icon: CreditCard },
      ];
    }

    if (user?.role === 'patient') {
      return [
        ...base,
        { name: 'احجز موعد', href: '/dashboard/book', icon: Calendar },
        { name: 'مواعيدي', href: '/dashboard/history', icon: Activity },
      ];
    }

    return base;
  };

  const roleLabels: Record<string, string> = {
    admin: 'المدير',
    doctor: 'طبيب',
    receptionist: 'استقبال',
    patient: 'مريض',
  };

  const menuItems = getMenuItems();

  return (
    <div className="w-80 h-screen fixed right-0 top-0 hidden lg:flex flex-col z-50">
      <div className="h-full bg-white flex flex-col p-8 space-y-10 relative overflow-hidden border-l border-slate-100 shadow-sm">

        <div className="flex items-center gap-5 px-2 relative z-10 group cursor-pointer">
          <div className="w-14 h-14 rounded-[1.5rem] bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20 relative overflow-hidden">
            <Stethoscope size={32} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[26px] font-black leading-none text-slate-900">
              عيادتي
            </span>
            <span className="text-[11px] font-bold text-slate-400 mt-1.5 opacity-80">إدارة العيادات</span>
          </div>
        </div>

        <nav className="flex-1 space-y-2 relative z-10 overflow-y-auto scrollbar-hide">
          <div className="px-3 mb-4 text-right">
            <div className="flex items-center gap-3 justify-start flex-row-reverse">
              <div className="h-[1px] w-4 bg-primary/30" />
              <p className="text-[11px] font-bold text-slate-400">القائمة</p>
            </div>
          </div>
          
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex items-center gap-4 px-5 py-4 rounded-2xl transition-colors duration-200 group relative text-right",
                  isActive 
                    ? "bg-primary text-white" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-primary"
                )}
              >
                <div className={clsx(
                   "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                   isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-400 group-hover:text-primary group-hover:bg-primary/10"
                )}>
                   <item.icon size={20} />
                </div>
                <span className="font-bold text-[15px] flex-1">{item.name}</span>
                
                {isActive && (
                   <div className="mr-auto w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="pt-6 border-t border-slate-100 relative z-10 space-y-3">
          
          <div className="px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3 text-right">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-lg shrink-0">
              {user?.fullName?.[0] || 'م'}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-bold text-slate-900 truncate">{user?.fullName || 'المستخدم'}</p>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-primary">{roleLabels[user?.role || ''] || user?.role}</span>
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-4 px-5 py-4 rounded-[1.5rem] text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors duration-200 w-full group text-right"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-red-100 group-hover:text-red-600 shrink-0 transition-colors">
               <LogOut size={20} />
            </div>
            <span className="font-bold text-[15px]">تسجيل الخروج</span>
          </button>
        </div>
      </div>
    </div>
  );
};
