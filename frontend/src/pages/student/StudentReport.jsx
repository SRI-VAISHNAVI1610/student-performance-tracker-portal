import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Download, FileText, Loader2, Award, Calendar, BookOpen } from 'lucide-react';
import API from '../../api';
import { generateStudentReport } from '../../utils/generatePDF';
import PremiumCard from '../../components/ui/PremiumCard';

const StudentReport = () => {
    const { user } = useAuth();
    const [generating, setGenerating] = useState(false);

    const handleDownload = async () => {
        setGenerating(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const profileRes = await API.get('/api/students/profile', config);
            const profile = profileRes.data;
            if (!profile) throw new Error("Profile disconnected");

            const rollNo = (profile.rollNumber || profile.studentId)?.toUpperCase();

            const [mRes, aRes, actRes] = await Promise.all([
                API.get(`/api/marks?rollNumber=${rollNo}`, config),
                API.get(`/api/attendance?rollNumber=${rollNo}`, config),
                API.get(`/api/activities?rollNumber=${rollNo}`, config)
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

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Performance Report</h1>
                <p className="text-slate-500 mt-1">Export your complete, unified academic record as an official PDF document.</p>
            </div>

            <PremiumCard className="p-10 rounded-[40px]">
                <div className="flex flex-col md:flex-row items-center gap-10">
                    <div className="h-40 w-40 bg-purple-50 rounded-[32px] flex items-center justify-center shrink-0 border border-purple-100 shadow-inner">
                        <FileText size={64} className="text-purple-500" />
                    </div>

                    <div className="space-y-6 flex-1">
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 mb-2">Semester Unified Record</h3>
                            <p className="text-slate-500 font-medium leading-relaxed">
                                This dynamically generated document incorporates all verified internal scores, 
                                aggregated attendance records across enrolled courses, and your approved 
                                institutional activity portfolio.
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <span className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold border border-slate-200"><BookOpen size={14}/> Marks</span>
                            <span className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold border border-slate-200"><Calendar size={14}/> Attendance</span>
                            <span className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold border border-slate-200"><Award size={14}/> Activities</span>
                        </div>

                        <button 
                            onClick={handleDownload}
                            disabled={generating}
                            className="bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white px-8 py-5 rounded-[24px] font-black uppercase tracking-widest text-sm transition-all shadow-xl shadow-purple-600/30 flex items-center gap-4 active:scale-95"
                        >
                            {generating ? <Loader2 className="animate-spin" size={24} /> : <Download size={24} />}
                            {generating ? 'Compiling Document...' : 'Export PDF Document'}
                        </button>
                    </div>
                </div>
            </PremiumCard>
        </div>
    );
};

export default StudentReport;