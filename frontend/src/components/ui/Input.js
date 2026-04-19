"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Input = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const clsx_1 = require("clsx");
const tailwind_merge_1 = require("tailwind-merge");
function cn(...inputs) {
    return (0, tailwind_merge_1.twMerge)((0, clsx_1.clsx)(inputs));
}
const Input = ({ label, error, className, ...props }) => {
    return ((0, jsx_runtime_1.jsxs)("div", { className: "w-full space-y-2", children: [label && ((0, jsx_runtime_1.jsx)("label", { className: "text-sm font-bold text-slate-600 dark:text-slate-400 ml-1 tracking-tight", children: label })), (0, jsx_runtime_1.jsx)("input", { className: cn("w-full rounded-2xl border border-slate-200 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md px-5 py-3 transition-all duration-300 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary dark:border-slate-800 placeholder:text-slate-400 text-sm font-medium", error && "border-red-500/50 focus:ring-red-500/10 focus:border-red-500", className), ...props }), error && ((0, jsx_runtime_1.jsx)("span", { className: "text-xs text-red-500 ml-1 font-bold", children: error }))] }));
};
exports.Input = Input;
