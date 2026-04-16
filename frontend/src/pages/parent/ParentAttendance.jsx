import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Loader2, Calendar, BookOpen, UserCheck, UserX, Users, ShieldCheck } from 'lucide-react';
import API from '../../api';
import PremiumCard from '../../components/ui/PremiumCard';

const ParentAttendance = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [childrenList, setChildrenList] = useState([]);
    const [selectedChildId, setSelectedChildId] = useState('');
    const [attendanceData, setAttendanceData] = useState([]);

    const fetchChildrenList = useCallback(async () => {
        try {
            const res = await API.get('/api/students/children');
            setChildrenList(res.data);
            if (res.data.length > 0 && !selectedChildId) {
                setSelectedChildId(res.data[0].rollNumber || res.data[0].studentId);
            }
        } catch (err) {
            console.error("Historical link retrieval failure", err);
        }
    }, [user.token, selectedChildId]);

    const fetchAttendance = useCallback(async () => {
        if (!selectedChildId) return;
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const studentRes = await API.get(`/api/students/profile?childId=${selectedChildId}`, config);
            const child = studentRes.data;

            if (child) {
                const rollNo = (child.rollNumber || child.studentId)?.toUpperCase();
                const attendanceRes = await API.get(`/api/attendance?rollNumber=${rollNo}`, config);
                setAttendanceData(attendanceRes.data || []);
            }
        } catch (err) {
            console.error("Data fetch failure", err);
        } finally {
            setLoading(false);
        }
    }, [user.token, selectedChildId]);

    useEffect(() => {
        if (user.token) fetchChildrenList();
    }, [fetchChildrenList]);

    useEffect(() => {
        if (selectedChildId) fetchAttendance();
    }, [fetchAttendance, selectedChildId]);

    if (loading && childrenList.length === 0) return <div className="flex justify-center mt-32"><Loader2 className="animate-spin text-orange-600" size={48} /></div>;

    if (childrenList.length === 0) return (
        <div className="bg-orange-50 border border-orange-100 p-12 rounded-3xl text-center max-w-2xl mx-auto mt-16">
            <ShieldCheck className="mx-auto text-orange-500 mb-6" size={64} />
            <h2 className="text-2xl font-black text-slate-900 mb-2">Guardian Link Required</h2>
            <p className="text-slate-600">No student profile is currently mapped to your parent account.</p>
        </div>
    );

    const groupedAttendance = attendanceData.reduce((acc, curr) => {
        const subj = curr.subjectId?.subjectName || curr.subjectId || 'Subject';
        if (!acc[subj]) acc[subj] = { total: 0, p: 0, a: 0 };
        acc[subj].total++;
        curr.status === 'present' ? acc[subj].p++ : acc[subj].a++;
        return acc;
    }, {});

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Attendance Log</h1>
                    <p className="text-slate-500 mt-1">Monitor daily presence and absence records of your ward.</p>
                </div>
                <PremiumCard className="!p-2 flex items-center gap-2">
                    <div className="pl-4 pr-2 flex items-center gap-2 text-slate-400">
                        <Users size={16} />
                        <span className="text-xs font-bold uppercase tracking-widest">Active Ward:</span>
                    </div>
                    {childrenList.map(child => (
                        <button
                            key={child._id}
                            onClick={() => setSelectedChildId(child.rollNumber || child.studentId)}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${selectedChildId === (child.rollNumber || child.studentId) ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            {child.fullName.split(' ')[0]}
                        </button>
                    ))}
                </PremiumCard>
            </div>

            {loading ? <div className="flex justify-center py-20"><Loader2 className="animate-spin text-orange-600" size={48} /></div> : (
                Object.keys(groupedAttendance).length === 0 ? (
                    <PremiumCard className="p-12 text-center text-slate-500 border-none">
                        <Calendar size={48} className="mx-auto text-slate-300 mb-4" />
                        <p className="font-bold">No attendance sessions have been logged yet.</p>
                    </PremiumCard>
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
                )
            )}
        </div>
    );
};

export default ParentAttendance;
