"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAuth = exports.AuthProvider = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const api_1 = __importDefault(require("@/lib/api"));
const AuthContext = (0, react_1.createContext)(undefined);
const AuthProvider = ({ children }) => {
    const [user, setUser] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const router = (0, navigation_1.useRouter)();

    (0, react_1.useEffect)(() => {
        const restoreSession = async () => {
            try {
                const res = await api_1.default.get('/auth/profile');
                if (res.data.success) {
                    setUser(res.data.data);
                }
            }
            catch {
                setUser(null);
            }
            finally {
                setLoading(false);
            }
        };
        restoreSession();
    }, []);
    const login = async (credentials) => {
        const res = await api_1.default.post('/auth/login', credentials);
        if (res.data.success) {
            setUser(res.data.data);
        }
    };
    const signup = async (data) => {
        const res = await api_1.default.post('/auth/signup', data);
        if (res.data.success) {
            setUser(res.data.data);
        }
    };
    const logout = async () => {
        try {
            await api_1.default.get('/auth/logout');
        }
        catch {

        }
        finally {
            setUser(null);
            router.push('/login');
        }
    };
    return ((0, jsx_runtime_1.jsx)(AuthContext.Provider, { value: { user, loading, login, signup, logout }, children: children }));
};
exports.AuthProvider = AuthProvider;
const useAuth = () => {
    const context = (0, react_1.useContext)(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
exports.useAuth = useAuth;
