"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCircle2, AlertCircle, Clock, Calendar, ChevronLeft, X } from 'lucide-react';
import { clsx } from 'clsx';

export const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const notifications = [
    {
      id: 1,
      title: "طلب موعد جديد",
      desc: "المريض أحمد علي يطلب استشارة في عيادة أمراض القلب.",
      time: "منذ دقيقتين",
      type: "appointment",
      unread: true
    },
    {
      id: 2,
      title: "اكتمل تحديث النظام",
      desc: "تم نشر إصدار ?????? v2.4.0-premium بنجاح.",
      time: "منذ ساعة",
      type: "system",
      unread: true
    },
    {
      id: 3,
      title: "نتائج المختبر جاهزة",
      desc: "تقارير المختبر الخاصة بالمريضة سارة خان متاحة الآن.",
      time: "منذ 3 ساعات",
      type: "lab",
      unread: false
    }
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "relative p-3 rounded-lg border transition-colors",
          isOpen 
            ? "bg-primary text-white border-primary" 
            : "bg-white border-slate-200 text-slate-500 hover:border-primary/30"
        )}
      >
        <Bell size={20} />
        {notifications.some(n => n.unread) && (
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-80 bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden z-50 text-right">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <h4 className="font-bold text-slate-900">الإشعارات</h4>
            <button className="text-xs text-primary hover:underline">تحديد كـ مقروء</button>
          </div>

          <div className="max-h-80 overflow-y-auto py-2">
            {notifications.map((notif) => (
              <div 
                key={notif.id}
                className={clsx(
                  "p-4 hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-50 last:border-0",
                  notif.unread && "bg-blue-50"
                )}
              >
                <div className="flex gap-3">
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-bold text-slate-900">{notif.title}</p>
                    <p className="text-xs text-slate-600">{notif.desc}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                      <Clock size={12} />
                      {notif.time}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
             <button className="text-sm font-bold text-primary hover:underline">
                عرض كل الإشعارات
             </button>
          </div>
        </div>
      )}
    </div>
  );
};
