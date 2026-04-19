"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Button = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const clsx_1 = require("clsx");
const tailwind_merge_1 = require("tailwind-merge");
function cn(...inputs) {
    return (0, tailwind_merge_1.twMerge)((0, clsx_1.clsx)(inputs));
}
const Button = ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }) => {
    const variants = {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20',
        secondary: 'bg-secondary text-white hover:bg-secondary/90',
        accent: 'bg-accent text-white hover:bg-accent/90',
        ghost: 'hover:bg-slate-100 dark:hover:bg-slate-800',
        outline: 'border border-border hover:bg-slate-50 dark:hover:bg-slate-900',
    };
    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-5 py-2.5',
        lg: 'px-8 py-3.5 text-lg',
    };
    return ((0, jsx_runtime_1.jsxs)("button", { className: cn('inline-flex items-center justify-center rounded-2xl font-bold transition-all duration-300 active:scale-95 hover:translate-y-[-2px] disabled:opacity-50 disabled:pointer-events-none', variants[variant], sizes[size], className), style: { fontFamily: 'var(--font-outfit)' }, disabled: isLoading, ...props, children: [isLoading ? ((0, jsx_runtime_1.jsxs)("svg", { className: "animate-spin -ml-1 mr-2 h-4 w-4 text-current", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", children: [(0, jsx_runtime_1.jsx)("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), (0, jsx_runtime_1.jsx)("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })] })) : null, children] }));
};
exports.Button = Button;
