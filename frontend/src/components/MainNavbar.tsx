"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function MainNavbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 w-full z-50 px-6 py-4 bg-white/80 backdrop-blur-sm border-b border-slate-200" dir="rtl">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white">
              <Stethoscope size={24} />
            </div>
            <span className="text-xl font-bold text-slate-900">عيادتي</span>
          </div>
        </Link>
        <div className="hidden md:flex items-center gap-8">
           <Link href="/#features" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">خدماتنا</Link>
           <Link href="/#doctors" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">أطباء العيادة</Link>
           <Link href="#" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">نصائح طبية</Link>
        </div>
        <div className="flex items-center gap-3">
           {pathname !== '/login' && (
             <Link href="/login">
               <Button variant="ghost" className="text-slate-600 font-bold">تسجيل الدخول</Button>
             </Link>
           )}
           {pathname !== '/register' && (
             <Link href="/register">
               <Button className="font-bold">حساب جديد</Button>
             </Link>
           )}
        </div>
      </div>
    </nav>
  );
}
