import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Loader2, BookOpen, Users, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import PremiumCard from '../../components/ui/PremiumCard';

const ParentMarks = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [childrenList, setChildrenList] = useState([]);
    const [selectedChildId, setSelectedChildId] = useState('');
    const [marks, setMarks] = useState([]);

    const fetchChildrenList = useCallback(async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/students/children');
            setChildrenList(res.data);
            if (res.data.length > 0 && !selectedChildId) {
                setSelectedChildId(res.data[0].rollNumber || res.data[0].studentId);
            }
        } catch (err) {
            console.error("Historical link retrieval failure", err);
        }
    }, [user.token, selectedChildId]);

    const fetchMarks = useCallback(async () => {
        if (!selectedChildId) return;
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const studentRes = await axios.get(`http://localhost:5000/api/students/profile?childId=${selectedChildId}`, config);
            const child = studentRes.data;

            if (child) {
                const rollNo = (child.rollNumber || child.studentId)?.toUpperCase();
                const marksRes = await axios.get(`http://localhost:5000/api/marks?rollNumber=${rollNo}`, config);
                setMarks(marksRes.data || []);
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
        if (selectedChildId) fetchMarks();
    }, [fetchMarks, selectedChildId]);

    if (loading && childrenList.length === 0) return <div className="flex justify-center mt-32"><Loader2 className="animate-spin text-orange-600" size={48} /></div>;

    if (childrenList.length === 0) return (
        <div className="bg-orange-50 border border-orange-100 p-12 rounded-3xl text-center max-w-2xl mx-auto mt-16">
            <ShieldCheck className="mx-auto text-orange-500 mb-6" size={64} />
            <h2 className="text-2xl font-black text-slate-900 mb-2">Guardian Link Required</h2>
            <p className="text-slate-600">No student profile is currently mapped to your parent account.</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Academic Ledger</h1>
                    <p className="text-slate-500 mt-1">Review internal valuations and examinations for your ward.</p>
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
                marks.length === 0 ? (
                    <PremiumCard className="p-12 text-center text-slate-500 border-none">
                        <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
                        <p className="font-bold">No academic valuations have been published yet.</p>
                    </PremiumCard>
                ) : (
                    <div className="space-y-4">
                        {(marks || []).map((m, i) => (
                            <PremiumCard key={i} className="flex flex-col md:flex-row md:items-center justify-between hover:border-orange-200 transition-all gap-4">
                                <div className="flex items-center gap-5">
                                    <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center font-black text-slate-900 border border-slate-100 text-2xl">
                                        {m.grade}
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-900 text-lg leading-none">{m.subjectId?.subjectName || m.subjectName || 'Subject'}</p>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">{m.subjectId?.subjectCode || m.subjectCode || 'UNKNOWN'} • SEM {m.semester || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="md:text-right bg-slate-50 p-4 rounded-2xl border border-slate-100 md:bg-transparent md:border-none md:p-0">
                                    <p className="text-2xl font-black text-slate-900 leading-none">{m.totalMarks}/100</p>
                                    <p className={`text-[10px] font-black uppercase tracking-widest mt-2 ${m.grade === 'U' || m.grade === 'F' ? 'text-red-500' : 'text-emerald-500'}`}>
                                        {m.grade === 'U' || m.grade === 'F' ? 'Re-attempt Required' : 'Passed Successfully'}
                                    </p>
                                </div>
                            </PremiumCard>
                        ))}
                    </div>
                )
            )}
        </div>
    );
};

export default ParentMarks;
