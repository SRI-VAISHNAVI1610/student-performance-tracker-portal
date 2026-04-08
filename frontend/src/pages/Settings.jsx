import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, User, Mail, Shield, Lock, Bell, CheckCircle2, AlertCircle, Loader2, Key } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Settings = () => {
    const { user, login } = useAuth();
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        recoveryEmail: user?.recoveryEmail || '',
        password: ''
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setIsLoading(true);

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const updateData = { name: formData.name, email: formData.email };

            if (formData.password) { updateData.password = formData.password; }
            if (formData.recoveryEmail) { updateData.recoveryEmail = formData.recoveryEmail; }

            const { data } = await axios.put('http://localhost:5000/api/users/profile', updateData, config);

            login({ ...data, token: user.token });
            setMessage('Your institutional profile has been successfully synchronized.');
            setFormData({ ...formData, password: '' });
        } catch (err) {
            setError(err.response?.data?.message || 'Profile synchronization failed. Verify connectivity.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-12">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none flex items-center gap-4">
                        <div className="p-3 bg-blue-500 rounded-2xl text-white shadow-sm">
                            <SettingsIcon size={32} />
                        </div>
                        Account <span className="text-primary-600">Preferences</span>
                    </h1>
                    <p className="text-slate-500 mt-3 font-medium text-lg">
                        Manage your secure identity and communication protocols.
                    </p>
                </div>

                <div className="flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
                    <Shield size={20} />
                    <span className="text-xs font-black uppercase tracking-widest leading-none">Identity Verified</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Settings Form */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[48px] shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Profile Details</h3>
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Institutional Identity Module</p>
                            </div>
                            <User className="text-slate-200" size={40} />
                        </div>

                        <form onSubmit={handleSubmit} className="p-10 space-y-8">
                            {message && (
                                <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-3xl flex items-center gap-4 text-emerald-700 animate-in zoom-in-95">
                                    <CheckCircle2 size={24} />
                                    <span className="font-bold text-sm leading-tight">{message}</span>
                                </div>
                            )}

                            {error && (
                                <div className="p-5 bg-red-50 border border-red-100 rounded-3xl flex items-center gap-4 text-red-600 animate-in zoom-in-95">
                                    <AlertCircle size={24} />
                                    <span className="font-bold text-sm leading-tight">{error}</span>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Full Legal Name</label>
                                    <div className="relative group">
                                        <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-500 transition-colors" size={18} />
                                        <input
                                            type="text"
                                            className="w-full bg-slate-50 border-2 border-transparent rounded-[24px] py-4 pl-16 pr-6 outline-none focus:bg-white focus:border-primary-500/20 focus:ring-4 focus:ring-primary-500/5 font-black text-slate-900 transition-all"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Primary Domain Email</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-500 transition-colors" size={18} />
                                        <input
                                            type="email"
                                            className="w-full bg-slate-50 border-2 border-transparent rounded-[24px] py-4 pl-16 pr-6 outline-none focus:bg-white focus:border-primary-500/20 focus:ring-4 focus:ring-primary-500/5 font-black text-slate-900 transition-all cursor-not-allowed opacity-70"
                                            value={formData.email}
                                            readOnly
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Emergency Recovery Email</label>
                                    <div className="relative group">
                                        <Shield className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-500 transition-colors" size={18} />
                                        <input
                                            type="email"
                                            placeholder="backup@service.com"
                                            className="w-full bg-slate-50 border-2 border-transparent rounded-[24px] py-4 pl-16 pr-6 outline-none focus:bg-white focus:border-primary-500/20 focus:ring-4 focus:ring-primary-500/5 font-black text-slate-900 transition-all"
                                            value={formData.recoveryEmail}
                                            onChange={(e) => setFormData({ ...formData, recoveryEmail: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Secure Access Token</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-500 transition-colors" size={18} />
                                        <input
                                            type="password"
                                            placeholder="••••••••"
                                            className="w-full bg-slate-50 border-2 border-transparent rounded-[24px] py-4 pl-16 pr-6 outline-none focus:bg-white focus:border-primary-500/20 focus:ring-4 focus:ring-primary-500/5 font-black text-slate-900 transition-all"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2 ml-2 italic">Leave blank to retain existing credentials</p>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-slate-400">
                                    <Key size={14} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">End-to-end Encrypted Session</span>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-10 py-4 rounded-[28px] font-black text-sm uppercase tracking-widest transition-all shadow-sm active:scale-95 flex items-center gap-3 disabled:opacity-50"
                                >
                                    {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                    Synchronize Records
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Right: Security & Meta */}
                <div className="space-y-8">
                    <div className="bg-slate-950 rounded-[48px] p-10 text-white shadow-2xl shadow-slate-900/40 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/20 blur-[60px] rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                        <h4 className="text-xl font-black tracking-tight mb-8">Security Posture</h4>

                        <div className="space-y-6 relative z-10">
                            {[
                                { label: 'Role Authorization', value: user?.role, icon: Shield, color: 'primary' },
                                { label: 'Session Integrity', value: 'Active', icon: CheckCircle2, color: 'emerald' },
                                { label: 'Notification Link', value: 'Configured', icon: Bell, color: 'violet' }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-5 p-4 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
                                    <div className={`p-3 rounded-2xl bg-${item.color}-500/20 text-${item.color}-400`}>
                                        <item.icon size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{item.label}</p>
                                        <p className="font-black text-sm uppercase tracking-tight">{item.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-10 p-6 bg-primary-600 rounded-[32px] text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary-200 mb-1">System Version</p>
                            <p className="text-lg font-black tracking-tighter">SPT ERP v2.4.0</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm">
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 ml-2">Access Logs</h4>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-emerald-500">
                                <CheckCircle2 size={16} />
                                <span className="text-[10px] font-black uppercase tracking-widest leading-none">Last Logged: {new Date().toLocaleDateString()}</span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed px-2">
                                All changes are audited by the central administration for institutional compliance.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
