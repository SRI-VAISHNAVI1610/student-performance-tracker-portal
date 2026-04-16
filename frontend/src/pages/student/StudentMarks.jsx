import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Loader2, AlertCircle, BookOpen } from 'lucide-react';
import API from '../../api';
import PremiumCard from '../../components/ui/PremiumCard';

const StudentMarks = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [marks, setMarks] = useState([]);
    const [selectedSem, setSelectedSem] = useState('1');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const profileRes = await API.get('/api/students/profile', config);
            const rollNo = (profileRes.data.rollNumber || profileRes.data.studentId)?.toUpperCase();
            if (!rollNo) throw new Error("No roll number found");

            const marksRes = await API.get(`/api/marks?rollNumber=${rollNo}&semester=${selectedSem}`, config);
            setMarks(marksRes.data || []);
        } catch (error) {
            console.error("Failed to load marks", error);
        } finally {
            setLoading(false);
        }
    }, [user.token]);

    useEffect(() => {
        if (user.token) fetchData();
    }, [fetchData, user.token, selectedSem]);

    if (loading) return <div className="flex justify-center mt-32"><Loader2 className="animate-spin text-purple-600" size={48} /></div>;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Academic Ledger</h1>
                    <p className="text-slate-500 mt-1">Detailed breakdown of internal valuations and examinations.</p>
                </div>
                <PremiumCard className="!p-2 !px-4 !shadow-sm !rounded-xl">
                    <select
                        className="bg-transparent text-slate-700 font-black outline-none cursor-pointer"
                        value={selectedSem}
                        onChange={e => setSelectedSem(e.target.value)}
                    >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => <option key={sem} value={sem}>Semester {sem}</option>)}
                    </select>
                </PremiumCard>
            </div>

            {marks.length === 0 ? (
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-12 text-center rounded-3xl">
                    <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500 font-bold">No academic valuations have been published yet.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {(marks || []).map((m, i) => (
                        <PremiumCard key={i} className="flex flex-col md:flex-row md:items-center justify-between hover:border-purple-300 transition-all gap-4">
                            <div className="flex items-center gap-5">
                                <div className={`h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center font-black text-2xl border border-slate-100 ${m.total >= 50 ? 'text-emerald-600' : 'text-red-500'}`}>
                                    {m.total >= 50 ? 'P' : 'F'}
                                </div>
                                <div>
                                    <p className="font-black text-slate-900 text-lg leading-none">{m.subjectId?.subjectName || m.subjectName || 'Subject'}</p>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">{m.subjectId?.subjectCode || m.subjectCode || 'UNKNOWN'} • SEM {m.semester || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-8 bg-slate-50 p-4 rounded-2xl border border-slate-100 md:bg-transparent md:border-none md:p-0">
                                <div className="text-center">
                                    <p className="font-black text-slate-600">{m.internal1 || 0}/20</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Int 1</p>
                                </div>
                                <div className="text-center">
                                    <p className="font-black text-slate-600">{m.internal2 || 0}/20</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Int 2</p>
                                </div>
                                <div className="text-center">
                                    <p className="font-black text-slate-600">{m.semesterExam || 0}/60</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sem</p>
                                </div>
                                <div className="text-right border-l-2 border-slate-100 pr-2 pl-8">
                                    <p className="text-2xl font-black text-slate-900 leading-none">{m.total}/100</p>
                                    <p className={`text-[10px] font-black uppercase tracking-widest mt-2 ${m.total >= 50 ? 'text-emerald-500' : 'text-red-500'}`}>
                                        {m.total >= 50 ? 'Passed Successfully' : 'Re-attempt Required'}
                                    </p>
                                </div>
                            </div>
                        </PremiumCard>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudentMarks;