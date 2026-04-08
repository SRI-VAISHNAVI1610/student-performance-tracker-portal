import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { BookOpen, Calendar, Award, TrendingUp, Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import StatCard from '../../components/ui/StatCard';
import ChartContainer from '../../components/ui/ChartContainer';
import PremiumCard from '../../components/ui/PremiumCard';

const StudentDashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [selectedSem, setSelectedSem] = useState('1');

    const fetchData = useCallback(async () => {
        if (!user?.token) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const profileRes = await axios.get('http://localhost:5000/api/students/profile', config);
            const myProfile = profileRes.data;

            if (!myProfile) return setData(null);
            const rollNo = (myProfile.rollNumber || myProfile.studentId)?.toUpperCase();

            const [marksRes, attendanceRes, activityRes] = await Promise.all([
                axios.get(`http://localhost:5000/api/marks?rollNumber=${rollNo}&semester=${selectedSem}`, config),
                axios.get(`http://localhost:5000/api/attendance?rollNumber=${rollNo}&semester=${selectedSem}`, config),
                axios.get(`http://localhost:5000/api/activities/student/${rollNo}`, config)
            ]);

            const marks = marksRes.data || [];
            const attendance = attendanceRes.data || [];
            const activities = activityRes.data || [];

            const presentCount = attendance.filter(a => a.status === 'present').length;
            const attendanceRate = attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : 0;
            const earnedPoints = activities.filter(a => a.status === 'approved').reduce((s, a) => s + (a.points || 0), 0);
            
            // Map Total directly to 10-point scale for accurate GPA metrics 
            const gpa = marks.length > 0 ? (marks.reduce((acc, m) => acc + ((m.total || 0) / 10), 0) / marks.length).toFixed(2) : '0.00';

            setData({
                profile: myProfile,
                summaries: { gpa, attendanceRate, courseCount: [...new Set((marks || []).map(m => m.subjectId))].length, xp: earnedPoints },
                charts: { trend: [{ name: 'Sem 1', gpa: 8.2 }, { name: 'Sem 2', gpa: 8.5 }, { name: 'Current', gpa: parseFloat(gpa) }] },
                raw: { attendance }
            });
        } catch (error) {
            console.error("Failed to load dashboard data", error);
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [user.token]);

    useEffect(() => {
        if (!user?.token) return;
        
        fetchData(); // Initial load
        
        // Background long-polling interval 
        const ticker = setInterval(() => {
            fetchData();
        }, 5000);

        return () => clearInterval(ticker);
    }, [fetchData, user?.token, selectedSem]);

    if (loading && !data) return <div className="flex justify-center mt-32"><Loader2 className="animate-spin text-purple-600" size={48} /></div>;
    if (!data) return (
        <div className="bg-amber-50 rounded-3xl p-12 text-center max-w-2xl mx-auto mt-16 border border-amber-100">
            <AlertCircle size={48} className="mx-auto text-amber-500 mb-4" />
            <h2 className="text-2xl font-black text-slate-900 mb-2">Profile Unlinked</h2>
            <p className="text-slate-600">Your account isn't mapped to a student roll number yet. Please contact admin.</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Overview</h1>
                    <p className="text-slate-500 mt-1">High-level insights across all your academic verticals.</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200">
                    <select
                        className="bg-white text-black border-slate-300 rounded font-black outline-none cursor-pointer px-2 py-1"
                        value={selectedSem}
                        onChange={e => setSelectedSem(e.target.value)}
                    >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => <option key={sem} value={sem}>Semester {sem}</option>)}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Current GPA" value={data.summaries.gpa} icon={TrendingUp} color="emerald" />
                <StatCard title="Attendance" value={`${data.summaries.attendanceRate}%`} icon={Calendar} color="blue" />
                <StatCard title="Active Courses" value={data.summaries.courseCount} icon={BookOpen} color="indigo" />
                <StatCard title="Activity XP" value={data.summaries.xp} icon={Award} color="orange" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* GPA Projection Chart */}
                <div className="lg:col-span-2">
                    <ChartContainer title="Performance Velocity" height={300} glowColor="from-indigo-400 to-indigo-600">
                        {data?.charts?.trend?.length > 0 && (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data.charts.trend}>
                                    <defs>
                                        <linearGradient id="colorGpa" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 700 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 700 }} domain={[0, 10]} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Area type="monotone" dataKey="gpa" stroke="#2563EB" strokeWidth={4} fillOpacity={1} fill="url(#colorGpa)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </ChartContainer>
                </div>

                {/* Attendance Chart */}
                <PremiumCard glowColor="from-emerald-400 to-emerald-600" className="flex flex-col justify-center">
                    <h3 className="text-xl font-extrabold text-center mb-4 text-slate-900 tracking-tight">Live Attendance</h3>
                    <div style={{ width: "100%", height: 260 }} className="relative flex items-center justify-center font-sans">
                        {data?.summaries?.attendanceRate !== undefined && (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={[{ value: data.summaries.attendanceRate }, { value: 100 - data.summaries.attendanceRate }]}
                                        innerRadius={60} outerRadius={80} paddingAngle={8} stroke="none" dataKey="value"
                                    >
                                        <Cell fill="#22C55E" />
                                        <Cell fill="#EAF2FF" />
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-black text-slate-900">{data.summaries.attendanceRate}%</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-6 text-center">
                        <div>
                            <p className="text-2xl font-black text-green-500">{(data?.raw?.attendance || []).filter(a => a.status === 'present').length}</p>
                            <p className="text-[10px] font-bold text-gray-500 uppercase mt-1">Present</p>
                        </div>
                        <div>
                            <p className="text-2xl font-black text-red-500">{(data?.raw?.attendance || []).filter(a => a.status === 'absent').length}</p>
                            <p className="text-[10px] font-bold text-gray-500 uppercase mt-1">Absent</p>
                        </div>
                    </div>
                </PremiumCard>
            </div>
        </div>
    );
};

export default StudentDashboard;