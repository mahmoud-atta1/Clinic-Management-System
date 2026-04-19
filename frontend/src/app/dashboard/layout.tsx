"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { NotificationDropdown } from '@/components/NotificationDropdown';
import { Settings as SettingsIcon } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-primary">
        <div className="animate-spin rounded-[1.5rem] h-14 w-14 border-[5px] border-primary/10 border-t-primary shadow-2xl shadow-primary/20"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC] font-cairo selection:bg-primary/20 selection:text-primary">
      
      <DashboardSidebar />

      <div className="flex-1 lg:mr-80 h-full flex flex-col relative overflow-hidden">
        
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/[0.03] rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/[0.03] rounded-full blur-[120px] -ml-64 -mb-64 pointer-events-none" />

        <header className="h-16 px-8 flex items-center justify-between sticky top-0 z-40 bg-white/60 backdrop-blur-2xl border-b border-slate-100/50">
          <div className="flex-1">
             <h2 className="text-xl font-black text-slate-900 tracking-tighter">نظام <span className="gradient-text">عيادتي</span></h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col text-right mr-4">
              <p className="text-sm font-black text-slate-900">{user?.fullName}</p>
              <p className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">{user?.role}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white shadow-xl shadow-slate-200/50 flex items-center justify-center text-primary font-black text-xl border border-slate-100">
              {user?.fullName?.charAt(0)}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-hidden relative z-10 px-8 py-8">
           <div className="max-w-7xl mx-auto h-full overflow-y-auto scrollbar-hide">
              {children}
           </div>
        </main>


      </div>
    </div>
  );
}
