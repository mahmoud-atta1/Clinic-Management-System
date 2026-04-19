"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useToast = exports.ToastProvider = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const lucide_react_1 = require("lucide-react");
const ToastContext = (0, react_1.createContext)(undefined);
const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = (0, react_1.useState)([]);
    const addToast = (0, react_1.useCallback)((type, message) => {
        const id = Date.now().toString();
        setToasts((prev) => [...prev, { id, type, message }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    }, []);
    const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));
    const value = {
        success: (message) => addToast('success', message),
        error: (message) => addToast('error', message),
        warning: (message) => addToast('warning', message),
        info: (message) => addToast('info', message),
    };
    const icons = {
        success: (0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle2, { size: 18, className: "shrink-0" }),
        error: (0, jsx_runtime_1.jsx)(lucide_react_1.XCircle, { size: 18, className: "shrink-0" }),
        warning: (0, jsx_runtime_1.jsx)(lucide_react_1.AlertTriangle, { size: 18, className: "shrink-0" }),
        info: (0, jsx_runtime_1.jsx)(lucide_react_1.Info, { size: 18, className: "shrink-0" }),
    };
    const styles = {
        success: 'bg-emerald-600 text-white',
        error: 'bg-rose-600 text-white',
        warning: 'bg-amber-500 text-white',
        info: 'bg-blue-600 text-white',
    };
    return ((0, jsx_runtime_1.jsxs)(ToastContext.Provider, { value: value, children: [children, (0, jsx_runtime_1.jsx)("div", { className: "fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none", children: toasts.map((toast) => ((0, jsx_runtime_1.jsxs)("div", { className: `flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl max-w-sm pointer-events-auto animate-in slide-in-from-bottom-4 fade-in duration-300 ${styles[toast.type]}`, children: [icons[toast.type], (0, jsx_runtime_1.jsx)("p", { className: "text-sm font-semibold flex-1 leading-snug", children: toast.message }), (0, jsx_runtime_1.jsx)("button", { onClick: () => removeToast(toast.id), className: "opacity-70 hover:opacity-100 transition-opacity", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { size: 16 }) })] }, toast.id))) })] }));
};
exports.ToastProvider = ToastProvider;
const useToast = () => {
    const context = (0, react_1.useContext)(ToastContext);
    if (!context)
        throw new Error('useToast must be used within ToastProvider');
    return context;
};
exports.useToast = useToast;
