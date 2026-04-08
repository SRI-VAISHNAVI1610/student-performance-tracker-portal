import React, { useState, useEffect } from 'react';
import {
    BookOpen,
    TrendingUp,
    Loader2,
    Award,
    Download,
    Library,
    GraduationCap,
    CheckCircle2,
    Info,
    Calendar,
    ArrowUpRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Academic = () => {
    const { user } = useAuth();
    const role = user?.role?.toLowerCase();
    const [loading, setLoading] = useState(true);
    const [marks, setMarks] = useState([]);
    const [studentInfo, setStudentInfo] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                let studentId = user._id;

                if (role === 'parent') {
                    const studentRes = await axios.get(`http://localhost:5000/api/students?parentId=${user._id}`, config);
                    if (studentRes.data.length > 0) {
                        studentId = studentRes.data[0].userId;
                        setStudentInfo(studentRes.data[0]);
                    }
                } else if (role === 'student') {
                    const infoRes = await axios.get(`http://localhost:5000/api/students/me`, config);
                    setStudentInfo(infoRes.data);
                }

                const marksRes = await axios.get(`http://localhost:5000/api/marks?studentId=${studentId}`, config);
                setMarks(marksRes.data);
            } catch (err) {
                console.error("Transcript retrieval failed:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user.token, user._id, role]);

    const totalCredits = marks.reduce((acc, m) => acc + (m.subjectId?.credits || 0), 0);
    const avgGPA = studentInfo?.gpa || '0.00';

    if (loading) return (
        <div className="h-[60vh] flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
            <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Decrypting Academic Records...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none flex items-center gap-4">
                        <Library className="text-indigo-600" size={36} />
                        Academic <span className="text-indigo-600">Transcript</span>
                    </h1>
                    <p className="text-slate-500 mt-3 font-medium text-lg">
                        {role === 'parent' ? `Academic performance oversight for ${studentInfo?.name || 'ward'}` : 'Official record of academic achievements and credit accumulation'}
                    </p>
                </div>

                <button className="px-8 py-4 bg-blue-500 text-white rounded-[32px] font-black text-sm uppercase tracking-widest flex items-center gap-3 hover:bg-blue-600 transition-all shadow-sm active:scale-95">
                    <Download size={18} />
                    Export Ledger
                </button>
            </div>

            {/* Performance Snapshot */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-indigo-600 p-8 rounded-[40px] shadow-2xl shadow-indigo-200 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                        <GraduationCap size={80} />
                    </div>
                    <p className="text-[10px] font-black text-indigo-100 uppercase tracking-widest mb-3">Institutional CGPA</p>
                    <div className="flex items-end gap-3">
                        <p className="text-5xl font-black text-white leading-none">{avgGPA}</p>
                        <span className="bg-indigo-500/30 text-[10px] font-bold text-indigo-100 px-3 py-1 rounded-full mb-1">Top 5%</span>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 flex flex-col justify-between">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Total Earned Credits</p>
                        <p className="text-4xl font-black text-slate-900">{totalCredits}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-4 text-emerald-500 font-bold text-xs uppercase tracking-widest">
                        <CheckCircle2 size={14} />
                        Requirement Met
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 flex flex-col justify-between">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Active Subjects</p>
                        <p className="text-4xl font-black text-slate-900">{marks.length}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-4 text-indigo-500 font-bold text-xs uppercase tracking-widest underline cursor-pointer">
                        View Schedule
                        <ArrowUpRight size={14} />
                    </div>
                </div>
            </div>

            {/* Detailed Results */}
            <div className="bg-white rounded-[48px] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-10 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center">
                            <Calendar size={24} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Institutional Grading Registry</h3>
                            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Semester Cycle: Current</p>
                        </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100">
                        <Info size={14} className="text-indigo-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Verification Active</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 text-left">
                                <th className="py-6 px-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Course Index / Code</th>
                                <th className="py-6 px-10 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Int. Scrutiny (I & II)</th>
                                <th className="py-6 px-10 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Practical Lab</th>
                                <th className="py-6 px-10 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">End-Term Assessment</th>
                                <th className="py-6 px-10 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Composite Grade</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {(marks || []).map((m) => (
                                <tr key={m._id} className="group hover:bg-slate-50/30 transition-all">
                                    <td className="py-8 px-10">
                                        <div className="flex flex-col">
                                            <span className="font-black text-slate-900 tracking-tight text-lg leading-tight uppercase">{m.subjectId?.subjectName || 'Course Asset'}</span>
                                            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1">{m.subjectId?.subjectCode} • {m.subjectId?.credits} CR</span>
                                        </div>
                                    </td>
                                    <td className="py-8 px-10 text-center">
                                        <div className="inline-flex gap-2">
                                            <span className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center font-black text-slate-400 text-xs border border-slate-100">{m.internal1}</span>
                                            <span className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center font-black text-slate-400 text-xs border border-slate-100">{m.internal2}</span>
                                        </div>
                                    </td>
                                    <td className="py-8 px-10 text-center font-black text-slate-900 text-lg uppercase">
                                        {m.practical !== undefined ? m.practical : <span className="text-slate-200">N/A</span>}
                                    </td>
                                    <td className="py-8 px-10 text-center font-black text-slate-900 text-lg uppercase tracking-widest">
                                        {m.semesterExam} <span className="text-[10px] text-slate-300 ml-1">/ 100</span>
                                    </td>
                                    <td className="py-8 px-10 text-right">
                                        <div className="flex flex-col items-end">
                                            <span className={`text-3xl font-black leading-none ${m.grade === 'F' ? 'text-rose-500' : 'text-emerald-500'}`}>{m.grade}</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{m.totalMarks} Total Agg.</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {marks.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="py-32 text-center">
                                        <div className="max-w-xs mx-auto text-slate-300">
                                            <Library size={48} className="mx-auto mb-4 opacity-10" />
                                            <p className="font-black uppercase tracking-[0.2em] text-[10px]">Registry is currently vacant</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Academic;

