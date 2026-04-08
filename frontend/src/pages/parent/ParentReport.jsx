import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Download, FileText, Loader2, Award, Calendar, BookOpen, ShieldCheck, Users } from 'lucide-react';
import axios from 'axios';
import { generateStudentReport } from '../../utils/generatePDF';
import PremiumCard from '../../components/ui/PremiumCard';

const ParentReport = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [childrenList, setChildrenList] = useState([]);
    const [selectedChildId, setSelectedChildId] = useState('');
    const [generating, setGenerating] = useState(false);

    const fetchChildrenList = useCallback(async () => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.get('http://localhost:5000/api/students/children', config);
            setChildrenList(res.data || []);
            if (res.data?.length > 0 && !selectedChildId) {
                setSelectedChildId(res.data[0].rollNumber || res.data[0].studentId);
            }
        } catch (err) {
            console.error("Historical link retrieval failure", err);
        } finally {
            setLoading(false);
        }
    }, [user.token, selectedChildId]);

    useEffect(() => {
        if (user.token) fetchChildrenList();
    }, [fetchChildrenList]);

    const handleDownload = async () => {
        if (!selectedChildId) return;
        setGenerating(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const profileRes = await axios.get(`http://localhost:5000/api/students/profile?childId=${selectedChildId}`, config);
            const profile = profileRes.data;
            if (!profile) throw new Error("Profile disconnected");

            const rollNo = (profile.rollNumber || profile.studentId)?.toUpperCase();

            const [mRes, aRes, actRes] = await Promise.all([
                axios.get(`http://localhost:5000/api/marks?rollNumber=${rollNo}`, config),
                axios.get(`http://localhost:5000/api/attendance?rollNumber=${rollNo}`, config),
                axios.get(`http://localhost:5000/api/activities?rollNumber=${rollNo}`, config)
            ]);

            const data = { 
                profile, 
                raw: { 
                    marks: mRes.data || [], 
                    attendance: aRes.data || [], 
                    activities: actRes.data || [] 
                } 
            };
            
            console.log("REPORT DATA:", data);
            generateStudentReport(data);
        } catch(err) {
            console.error("Failed to generate report", err);
            alert("Error constructing report instance.");
        } finally {
            setGenerating(false);
        }
    };

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
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Export Official Record</h1>
                    <p className="text-slate-500 mt-1">Download unified performance PDF for your ward.</p>
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

            <PremiumCard className="p-10 rounded-[40px]">
                <div className="flex flex-col md:flex-row items-center gap-10">
                    <div className="h-40 w-40 bg-orange-50 rounded-[32px] flex items-center justify-center shrink-0 border border-orange-100 shadow-inner">
                        <FileText size={64} className="text-orange-500" />
                    </div>

                    <div className="space-y-6 flex-1">
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 mb-2">Ward Academic Dossier</h3>
                            <p className="text-slate-500 font-medium leading-relaxed">
                                This comprehensively generated PDF document provides a unified record spanning 
                                grading, course attendance metrics, and verified co-curricular commitments 
                                achieved by your ward.
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <span className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold border border-slate-200"><BookOpen size={14}/> Marks</span>
                            <span className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold border border-slate-200"><Calendar size={14}/> Attendance</span>
                            <span className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold border border-slate-200"><Award size={14}/> XP</span>
                        </div>

                        <button 
                            onClick={handleDownload}
                            disabled={generating || !selectedChildId}
                            className="bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 text-white px-8 py-5 rounded-[24px] font-black uppercase tracking-widest text-sm transition-all shadow-xl shadow-orange-600/30 flex items-center gap-4 active:scale-95"
                        >
                            {generating ? <Loader2 className="animate-spin" size={24} /> : <Download size={24} />}
                            {generating ? 'Querying Data Lake...' : 'Export Unified Report'}
                        </button>
                    </div>
                </div>
            </PremiumCard>
        </div>
    );
};

export default ParentReport;
