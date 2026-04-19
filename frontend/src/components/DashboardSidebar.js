"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardSidebar = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const link_1 = __importDefault(require("next/link"));
const navigation_1 = require("next/navigation");
const AuthContext_1 = require("@/context/AuthContext");
const lucide_react_1 = require("lucide-react");
const clsx_1 = require("clsx");
const DashboardSidebar = () => {
    const pathname = (0, navigation_1.usePathname)();
    const { user, logout } = (0, AuthContext_1.useAuth)();
    const getMenuItems = () => {

        const base = [
            { name: 'Dashboard', href: '/dashboard', icon: lucide_react_1.LayoutDashboard },
        ];
        if (user?.role === 'admin') {
            return [
                ...base,
                { name: 'Manage Doctors', href: '/dashboard/doctors', icon: lucide_react_1.UserSquare },
                { name: 'Manage Users', href: '/dashboard/users', icon: lucide_react_1.Users },
                { name: 'Specialties', href: '/dashboard/specialties', icon: lucide_react_1.ClipboardList },
                { name: 'All Appointments', href: '/dashboard/appointments', icon: lucide_react_1.Calendar },
                { name: 'Settings', href: '/dashboard/settings', icon: lucide_react_1.Settings },
            ];
        }
        if (user?.role === 'doctor') {
            return [
                ...base,
                { name: 'Daily Queue', href: '/dashboard/queue', icon: lucide_react_1.Calendar },
                { name: 'Patient Stats', href: '/dashboard/stats', icon: lucide_react_1.Activity },
            ];
        }
        if (user?.role === 'receptionist') {
            return [
                ...base,
                { name: 'Reception Queue', href: '/dashboard/reception', icon: lucide_react_1.Calendar },
                { name: 'Payments', href: '/dashboard/payments', icon: lucide_react_1.CreditCard },
            ];
        }
        if (user?.role === 'patient') {
            return [
                ...base,
                { name: 'Book Doctor', href: '/dashboard/book', icon: lucide_react_1.Calendar },
                { name: 'My History', href: '/dashboard/history', icon: lucide_react_1.Activity },
            ];
        }
        return base;
    };
    const menuItems = getMenuItems();
    return ((0, jsx_runtime_1.jsx)("div", { className: "w-72 h-screen fixed left-0 top-0 hidden lg:flex flex-col p-6 z-50", children: (0, jsx_runtime_1.jsxs)("div", { className: "h-full glass-card flex flex-col p-6 space-y-8 relative overflow-hidden", children: [(0, jsx_runtime_1.jsx)("div", { className: "absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl" }), (0, jsx_runtime_1.jsx)("div", { className: "absolute -bottom-24 -left-24 w-48 h-48 bg-secondary/10 rounded-full blur-3xl" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3 px-2 relative z-10", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shadow-lg shadow-primary/20 animate-float", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Stethoscope, { size: 24 }) }), (0, jsx_runtime_1.jsx)("span", { className: "text-2xl font-bold tracking-tight gradient-text", style: { fontFamily: 'var(--font-outfit)' }, children: "MediLife" })] }), (0, jsx_runtime_1.jsx)("nav", { className: "flex-1 space-y-2 relative z-10", children: menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return ((0, jsx_runtime_1.jsxs)(link_1.default, { href: item.href, className: (0, clsx_1.clsx)("flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative", isActive
                                ? "bg-primary text-white shadow-lg shadow-primary/25 glow-primary"
                                : "text-slate-500 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 hover:text-primary"), children: [(0, jsx_runtime_1.jsx)(item.icon, { size: 20, className: (0, clsx_1.clsx)("transition-transform duration-300", !isActive && "group-hover:scale-110") }), (0, jsx_runtime_1.jsx)("span", { className: "font-semibold text-[15px]", children: item.name }), isActive && ((0, jsx_runtime_1.jsx)("div", { className: "absolute right-3 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]" }))] }, item.href));
                    }) }), (0, jsx_runtime_1.jsx)("div", { className: "pt-6 border-t border-slate-200 dark:border-slate-800 relative z-10", children: (0, jsx_runtime_1.jsxs)("button", { onClick: logout, className: "flex items-center gap-3 px-4 py-3.5 rounded-2xl text-red-500 hover:bg-red-500/10 transition-all duration-300 w-full group", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.LogOut, { size: 20, className: "group-hover:-translate-x-1 transition-transform" }), (0, jsx_runtime_1.jsx)("span", { className: "font-semibold text-[15px]", children: "Sign Out" })] }) })] }) }));
};
exports.DashboardSidebar = DashboardSidebar;
