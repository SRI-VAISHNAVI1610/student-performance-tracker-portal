import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Loader2, Calendar, BookOpen, UserCheck, UserX } from 'lucide-react';
import axios from 'axios';
import PremiumCard from '../../components/ui/PremiumCard';

const StudentAttendance = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [attendanceData, setAttendanceData] = useState([]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const profileRes = await axios.get('http://localhost:5000/api/students/profile', config);
            const rollNo = (profileRes.data.rollNumber || profileRes.data.studentId)?.toUpperCase();
            if (!rollNo) throw new Error("No roll number found");

            const attendanceRes = await axios.get(`http://localhost:5000/api/attendance?rollNumber=${rollNo}`, config);
            setAttendanceData(attendanceRes.data || []);
        } catch (error) {
            console.error("Failed to load attendance", error);
        } finally {
            setLoading(false);
        }
    }, [user.token]);

    useEffect(() => {
        if (user.token) fetchData();
    }, [fetchData, user.token]);

    if (loading) return <div className="flex justify-center mt-32"><Loader2 className="animate-spin text-purple-600" size={48} /></div>;

    const groupedAttendance = attendanceData.reduce((acc, curr) => {
        const subj = curr.subjectId?.subjectName || curr.subjectId || 'Subject';
        if (!acc[subj]) acc[subj] = { total: 0, p: 0, a: 0 };
        acc[subj].total++;
        curr.status === 'present' ? acc[subj].p++ : acc[subj].a++;
        return acc;
    }, {});

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Attendance Log</h1>
                <p className="text-slate-500 mt-1">Detailed subject-wise breakdown of presence and compliance.</p>
            </div>

            {Object.keys(groupedAttendance).length === 0 ? (
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-12 text-center rounded-3xl">
                    <Calendar size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500 font-bold">No attendance sessions have been logged yet.</p>
                </div>
            ) : (
                <PremiumCard className="!p-0 overflow-hidden">
                    <div className="overflow-x-auto w-full">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="text-left py-4 px-8 text-xs font-black uppercase tracking-widest text-slate-500">Subject / Course Name</th>
                                    <th className="text-center py-4 px-6 text-xs font-black uppercase tracking-widest text-slate-500">Total Delivered</th>
                                    <th className="text-center py-4 px-6 text-xs font-black uppercase tracking-widest text-slate-500">Attended</th>
                                    <th className="text-center py-4 px-6 text-xs font-black uppercase tracking-widest text-slate-500">Missed</th>
                                    <th className="text-right py-4 px-8 text-xs font-black uppercase tracking-widest text-slate-500">Compliance</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {Object.entries(groupedAttendance).map(([subject, stats], idx) => {
                                    const pct = Math.round((stats.p / stats.total) * 100);
                                    return (
                                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-6 px-8">
                                                <div className="flex items-center gap-3">
                                                    <BookOpen size={18} className="text-slate-400" />
                                                    <span className="font-bold text-slate-900">{typeof subject === 'object' ? subject?.subjectName : subject}</span>
                                                </div>
                                            </td>
                                            <td className="py-6 px-6 text-center font-bold text-slate-500">{stats.total}</td>
                                            <td className="py-6 px-6 text-center">
                                                <span className="inline-flex items-center gap-1 font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">
                                                    {stats.p} <UserCheck size={14} />
                                                </span>
                                            </td>
                                            <td className="py-6 px-6 text-center">
                                                <span className="inline-flex items-center gap-1 font-bold text-red-600 bg-red-50 px-3 py-1 rounded-lg">
                                                    {stats.a} <UserX size={14} />
                                                </span>
                                            </td>
                                            <td className="py-6 px-8 text-right">
                                                <span className={`px-4 py-2 rounded-xl text-sm font-black ${pct >= 75 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                    {pct}%
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </PremiumCard>
            )}
        </div>
    );
};

export default StudentAttendance;