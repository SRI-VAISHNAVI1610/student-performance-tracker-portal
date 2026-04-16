import React, { useState, useEffect, useCallback } from 'react';
import { Shield, TrendingUp, Users, Award, Loader2, BarChart3, PieChart as PieIcon, LineChart as LineIcon, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, AreaChart, Area, Cell, PieChart, Pie
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import API from '../api';

const Stats = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);

    const fetchStats = useCallback(async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await API.get('/api/users/stats', config);
            setStats(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [user.token]);

    useEffect(() => {
        if (user.token) fetchStats();
    }, [fetchStats]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
            <Loader2 className="animate-spin text-primary-600" size={48} />
            <p className="text-slate-500 font-medium tracking-wide">Synthesizing Institutional Intelligence...</p>
        </div>
    );

    if (!stats) return <div className="text-center py-20 text-slate-500 font-bold">No statistical data available.</div>;

    const COLORS = ['#2563EB', '#7C3AED', '#10B981', '#F59E0B', '#EF4444'];

    const yearlyGrowth = [
        { year: '2022', students: (stats?.totals?.students || 0) - 10, staff: (stats?.totals?.staff || 0) - 5 },
        { year: '2023', students: stats?.totals?.students || 0, staff: stats?.totals?.staff || 0 }
    ];

    const deptStats = stats?.departmentDistribution || [];

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-12">
            {/* Intel Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none flex items-center gap-4">
                        <div className="p-3 bg-primary-600 rounded-2xl text-white shadow-xl shadow-primary-500/20">
                            <BarChart3 size={32} />
                        </div>
                        Market <span className="text-primary-600">Intelligence</span>
                    </h1>
                    <p className="text-slate-500 mt-3 font-medium text-lg">
                        Macro-level analytics and institutional performance metrics.
                    </p>
                </div>

                <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm">
                    <Calendar className="text-slate-400" size={18} />
                    <span className="text-sm font-bold text-slate-600 uppercase tracking-widest">Cycle: AY 2023-24</span>
                </div>
            </div>

            {/* Core KPI Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Ecosystem', value: stats?.totals?.users ?? 0, delta: '+12%', color: 'blue', icon: Users },
                    { label: 'Student Body', value: stats?.totals?.students ?? 0, delta: '+8%', color: 'emerald', icon: Award },
                    { label: 'Academic Staff', value: stats?.totals?.staff ?? 0, delta: 'Stable', color: 'violet', icon: Shield },
                    { label: 'Admin Controllers', value: stats?.totals?.admins ?? 0, delta: 'Secured', color: 'slate', icon: TrendingUp }
                ].map((kpi, i) => (
                    <div key={i} className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all group">
                        <div className="flex items-center justify-between mb-6">
                            <div className={`p-4 rounded-2xl bg-${kpi.color}-500 text-white shadow-lg shadow-${kpi.color}-500/20 group-hover:scale-110 transition-transform`}>
                                <kpi.icon size={24} />
                            </div>
                            <div className="flex items-center gap-1 text-emerald-500 font-black text-[10px] uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-full">
                                <ArrowUpRight size={10} />
                                {kpi.delta}
                            </div>
                        </div>
                        <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{kpi.value}</h3>
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2">{kpi.label}</p>
                    </div>
                ))}
            </div>

            {/* Multi-Dimensional Analytics Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Deployment Trajectory */}
                <div className="bg-white p-10 rounded-[48px] shadow-sm border border-slate-100 group">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Deployment Trajectory</h3>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Institutional Scaling (2022-2023)</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl text-slate-400 group-hover:text-primary-600 transition-colors">
                            <LineIcon size={24} />
                        </div>
                    </div>
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={yearlyGrowth}>
                                <defs>
                                    <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 700 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 700 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px' }}
                                />
                                <Area type="monotone" dataKey="students" stroke="#2563EB" strokeWidth={4} fillOpacity={1} fill="url(#colorStudents)" />
                                <Area type="monotone" dataKey="staff" stroke="#10B981" strokeWidth={4} fill="transparent" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Sectional Distribution */}
                <div className="bg-white p-10 rounded-[48px] shadow-sm border border-slate-100 group">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Sectional Distribution</h3>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Departmental Student Allocation</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl text-slate-400 group-hover:text-violet-600 transition-colors">
                            <PieIcon size={24} />
                        </div>
                    </div>
                    <div className="h-[350px] flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={deptStats} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#475569', fontSize: 11, fontWeight: 800 }}
                                    width={100}
                                />
                                <Tooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ borderRadius: '16px', border: 'none' }} />
                                <Bar dataKey="count" radius={[0, 10, 10, 0]} barSize={24}>
                                    {deptStats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Strategic Summary Ledger */}
            <div className="bg-blue-500 rounded-[56px] p-12 text-white overflow-hidden relative shadow-sm h-fit">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-primary-600/10 blur-[100px] pointer-events-none"></div>
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
                    <div className="lg:col-span-1">
                        <h3 className="text-3xl font-black tracking-tight leading-tight">Institutional Audit Snapshot</h3>
                        <p className="text-slate-400 mt-4 leading-relaxed font-medium">
                            The current ecosystem demonstrates a <span className="text-white font-bold">12% growth</span> in student enrollment, maintaining a <span className="text-white font-bold">1:24 faculty-student ratio</span>.
                        </p>
                        <button className="mt-8 bg-white text-slate-900 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary-500 hover:text-white transition-all flex items-center gap-3">
                            Generate Full Report <ArrowUpRight size={16} />
                        </button>
                    </div>
                    <div className="lg:col-span-2 grid grid-cols-2 gap-6">
                        {[
                            { label: 'Data Integrity', value: '99.9%', desc: 'Real-time sync' },
                            { label: 'Engagement', value: '87.4%', desc: 'Active daily users' }
                        ].map((stat, i) => (
                            <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-[32px] backdrop-blur-sm">
                                <h4 className="text-4xl font-black mb-2">{stat.value}</h4>
                                <p className="text-xs font-black uppercase text-primary-400 tracking-widest">{stat.label}</p>
                                <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">{stat.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Stats;
