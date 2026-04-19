import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = ({ label, error, icon, className, ...props }: InputProps) => {
  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="block text-sm font-bold text-slate-700 ml-1 mb-1.5 tracking-tight">
          {label}
        </label>
      )}
      <div className="relative group">
        {icon && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors pointer-events-none flex items-center justify-center">
            {icon}
          </div>
        )}
        <input
          className={cn(
            "w-full rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 px-5 py-4 outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 placeholder:text-slate-400 text-sm font-medium transition-all shadow-sm text-slate-900",
            icon && "pr-12",
            error && "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20",
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <span className="block text-xs text-rose-500 font-bold mt-1.5 ml-1">
          {error}
        </span>
      )}
    </div>
  );
};
