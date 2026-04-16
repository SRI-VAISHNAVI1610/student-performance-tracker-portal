import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, User, Lock, Briefcase, ChevronRight, AlertCircle, Loader2, ShieldCheck, Cpu } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const result = await login(email, password, role);

        if (result.success) {
            navigate('/');
        } else {
            setError(result.message);
        }

        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-blue-500/30">
            {/* High-Fidelity Background Architecture */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[150px] rounded-full animate-pulse duration-[10000ms]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-400/10 blur-[150px] rounded-full animate-pulse duration-[8000ms]"></div>

            <div className="w-full max-w-[440px] z-10 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                <div className="bg-white backdrop-blur-3xl border border-slate-200 rounded-[48px] shadow-xl overflow-hidden">
                    {/* Brand Meta */}
                    <div className="p-12 text-center border-b border-slate-100 relative">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
                        <div className="inline-flex p-5 bg-blue-50 rounded-[32px] mb-8 transform hover:rotate-6 transition-transform duration-500 shadow-sm border border-blue-100">
                            <GraduationCap className="text-blue-600" size={40} strokeWidth={2.5} />
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-3 uppercase">SPT <span className="text-blue-500">ERP</span></h2>
                        <div className="flex items-center justify-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-ping"></div>
                            <p className="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">Institutional Secure Access</p>
                        </div>
                    </div>

                    {/* Authentication Logic Center */}
                    <div className="p-12 space-y-8">
                        {error && (
                            <div className="p-5 bg-red-50 border border-red-100 rounded-3xl flex items-start gap-4 text-red-600 animate-in zoom-in-95 duration-300">
                                <AlertCircle className="mt-0.5 shrink-0" size={20} />
                                <div className="space-y-1">
                                    <p className="font-bold text-xs uppercase tracking-widest leading-none">Access Refused</p>
                                    <p className="text-sm font-medium opacity-80">{error}</p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-6">
                            {/* Role Selection Matrix */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 ml-5">Authority Role</label>
                                <div className="relative group">
                                    <Briefcase className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                                    <select
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-[28px] py-5 pl-16 pr-12 text-slate-800 font-bold text-sm outline-none focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/5 transition-all appearance-none cursor-pointer hover:bg-slate-100"
                                    >
                                        <option value="student">Student Registry</option>
                                        <option value="parent">Guardian Monitor</option>
                                        <option value="staff">Faculty Portal</option>
                                        <option value="admin">Root Administrator</option>
                                    </select>
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                        <ChevronRight size={18} className="rotate-90" />
                                    </div>
                                </div>
                            </div>

                            {/* Identity Fields */}
                            <div className="space-y-5">
                                <div className="space-y-3">
                                    <div className="relative group">
                                        <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                                        <input
                                            type="email"
                                            placeholder="Institutional ID (Email)"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-[28px] py-5 pl-16 pr-8 text-slate-800 font-bold text-sm outline-none focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/5 transition-all placeholder:text-slate-400"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="relative group">
                                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                                        <input
                                            type="password"
                                            placeholder="Secure Access Token"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-[28px] py-5 pl-16 pr-8 text-slate-800 font-bold text-sm outline-none focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/5 transition-all placeholder:text-slate-400"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-black text-xs uppercase tracking-[0.2em] py-6 rounded-[32px] shadow-sm shadow-blue-500/20 active:scale-[0.97] transition-all flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed mt-4 group"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        <ShieldCheck size={18} />
                                        <span>Authorize Session</span>
                                        <ChevronRight size={18} className="group-hover:translate-x-2 transition-transform duration-300" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Engine Meta Footer */}
                    <div className="px-12 py-8 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Cpu className="text-slate-400" size={16} />
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">SPT Core v2.4</span>
                        </div>
                        <div className="flex gap-4">
                            <div className="h-1 w-1 rounded-full bg-slate-300"></div>
                            <div className="h-1 w-1 rounded-full bg-slate-300"></div>
                            <div className="h-1 w-1 rounded-full bg-slate-300"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;

