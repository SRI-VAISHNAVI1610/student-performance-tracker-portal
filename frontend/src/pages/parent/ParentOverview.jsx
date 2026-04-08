import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    AreaChart, Area, PieChart, Pie, Cell,
    ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';
import {
    Loader2, TrendingUp, Calendar, BookOpen, Award
} from 'lucide-react';
import axios from 'axios';
import StatCard from '../../components/ui/StatCard';
import ChartContainer from '../../components/ui/ChartContainer';
import PremiumCard from '../../components/ui/PremiumCard';

const ParentOverview = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [children, setChildren] = useState([]);
    const [selected, setSelected] = useState('');
    const [data, setData] = useState(null);

    // FETCH CHILDREN
    const fetchChildren = useCallback(async () => {
        try {
            const res = await axios.get(
                'http://localhost:5000/api/students/children',
                { headers: { Authorization: `Bearer ${user?.token}` } }
            );

            const list = res.data || [];
            setChildren(list);

            if (list.length > 0) {
                setSelected(list[0].rollNumber || list[0].studentId);
            }
        } catch (err) {
            console.error(err);
        }
    }, [user?.token]);

    // FETCH DATA
    const fetchData = useCallback(async () => {
        if (!selected) return;

        try {
            const config = {
                headers: { Authorization: `Bearer ${user?.token}` }
            };

            const student = await axios.get(
                `http://localhost:5000/api/students/profile?childId=${selected}`,
                config
            );

            const roll = (student.data.rollNumber || student.data.studentId)?.toUpperCase();

            const [marks, attendance, activities] = await Promise.all([
                axios.get(`http://localhost:5000/api/marks?rollNumber=${roll}`, config),
                axios.get(`http://localhost:5000/api/attendance?rollNumber=${roll}`, config),
                axios.get(`http://localhost:5000/api/activities/student/${roll}`, config)
            ]);

            const m = marks.data || [];
            const a = attendance.data || [];
            const act = activities.data || [];

            const present = a.filter(x => x.status === 'present').length;
            const attendanceRate = a.length ? Math.round((present / a.length) * 100) : 0;

            const gpa = m.length
                ? (m.reduce((acc, x) => acc + (x.gradePoints || 0), 0) / m.length).toFixed(2)
                : '0.00';

            setData({
                gpa,
                attendanceRate,
                courses: new Set(m.map(x => x.subjectId)).size,
                xp: act.reduce((acc, x) => acc + (x.points || 0), 0),
                trend: [
                    { name: 'Sem 1', gpa: 7.8 },
                    { name: 'Sem 2', gpa: 8.4 },
                    { name: 'Current', gpa: parseFloat(gpa) }
                ]
            });

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [selected, user?.token]);

    useEffect(() => {
        fetchChildren();
    }, [fetchChildren]);

    useEffect(() => {
        fetchData();
        
        const interval = setInterval(() => {
            fetchData();
        }, 15000); // 15 seconds polling

        return () => clearInterval(interval);
    }, [fetchData]);

    if (loading) {
        return (
            <div className="flex justify-center mt-32">
                <Loader2 className="animate-spin text-orange-500" size={50} />
            </div>
        );
    }

    return (
        <div className="relative p-8 space-y-8 bg-gradient-to-br from-slate-50 to-white min-h-screen">

            {/* BACKGROUND GLOW */}
            <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-r from-orange-100 via-transparent to-blue-100 blur-3xl opacity-40 -z-10"></div>

            {/* HEADER */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-extrabold text-slate-900">
                    Guardian Dashboard
                </h1>

                <div className="flex gap-2">
                    {children.map(child => (
                        <button
                            key={child._id}
                            onClick={() => setSelected(child.rollNumber || child.studentId)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition 
                            ${selected === (child.rollNumber || child.studentId)
                                    ? 'bg-orange-500 text-white shadow-lg'
                                    : 'bg-white shadow-sm hover:bg-gray-100'
                                }`}
                        >
                            {child.fullName}
                        </button>
                    ))}
                </div>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="GPA" value={data?.gpa} icon={TrendingUp} color="emerald" />
                <StatCard title="Attendance" value={`${data?.attendanceRate}%`} icon={Calendar} color="blue" />
                <StatCard title="Courses" value={data?.courses} icon={BookOpen} color="indigo" />
                <StatCard title="XP" value={data?.xp} icon={Award} color="orange" />
            </div>

            {/* CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* AREA CHART */}
                <ChartContainer title="Performance Trend" height={300} glowColor="from-orange-400 to-orange-600">
                    {Array.isArray(data?.trend) && data.trend.length > 0 && (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.trend}>
                                <defs>
                                    <linearGradient id="colorGpa" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis domain={[0, 10]} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Area
                                    dataKey="gpa"
                                    stroke="#f97316"
                                    fill="url(#colorGpa)"
                                    strokeWidth={3}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </ChartContainer>

                {/* PIE CHART */}
                <PremiumCard glowColor="from-orange-400 to-orange-600" className="flex flex-col items-center justify-center">
                    <h2 className="font-extrabold text-xl mb-4 text-slate-900 tracking-tight">Attendance Analysis</h2>

                    <div style={{ width: "100%", height: 260 }} className="relative flex justify-center items-center">
                        {data?.attendanceRate !== undefined && (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={[
                                            { value: data?.attendanceRate },
                                            { value: 100 - data?.attendanceRate }
                                        ]}
                                        innerRadius={60}
                                        outerRadius={80}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        <Cell fill="#f97316" />
                                        <Cell fill="#fff7ed" />
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-4xl font-black text-slate-900">{data?.attendanceRate}%</span>
                        </div>
                    </div>
                </PremiumCard>

            </div>
        </div>
    );
};

export default ParentOverview;