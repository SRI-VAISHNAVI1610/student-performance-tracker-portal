import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FileSpreadsheet, Save, Loader2, BookOpen, AlertCircle, Target, Percent, Award } from 'lucide-react';
import API from '../../api';
import StatCard from '../../components/ui/StatCard';
import PremiumCard from '../../components/ui/PremiumCard';

const StaffMarks = () => {
    const { user } = useAuth();
    const [students, setStudents] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [selectedSub, setSelectedSub] = useState('');
    const [selectedSem, setSelectedSem] = useState('1');
    const [loading, setLoading] = useState(true);
    const [marksMap, setMarksMap] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    
    // Analytics Metrics
    const [stats, setStats] = useState({ avgAttendance: 0, avgMarks: 0 });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [stdRes, subRes] = await Promise.all([
                    API.get('/api/students'),
                    API.get('/api/subjects')
                ]);
                setStudents(stdRes.data);
                const assignedSubjects = subRes.data.filter(s => s.staffId?._id === user._id || user.role === 'admin');
                setSubjects(assignedSubjects);
                if (assignedSubjects.length > 0) setSelectedSub(assignedSubjects[0]._id);
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    // Analytics computation
    useEffect(() => {
        if (!selectedSub || !selectedSem) return;
        const fetchAnalytics = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const [marksRes, attRes] = await Promise.all([
                    API.get(`/api/marks?subjectId=${selectedSub}&semester=${selectedSem}`, config),
                    API.get(`/api/attendance?subjectId=${selectedSub}&semester=${selectedSem}`, config)
                ]);
                
                const marks = marksRes.data || [];
                const atts = attRes.data || [];
                
                const avgM = marks.length > 0 ? (marks.reduce((sum, m) => sum + (m.total || 0), 0) / marks.length).toFixed(1) : 0;
                
                const present = atts.filter(a => a.status === 'present').length;
                const avgA = atts.length > 0 ? Math.round((present / atts.length) * 100) : 0;

                setStats({ avgMarks: avgM, avgAttendance: avgA });
            } catch (err) {
                console.error("Failed to load staff stats", err);
            }
        };
        fetchAnalytics();
    }, [selectedSub, selectedSem, user]);

    const handlePushMark = async (rollNumber) => {
        setMessage('');
        setIsSubmitting(true);
        try {
            const marksData = [{
                rollNumber,
                internal1: marksMap[rollNumber]?.internal1 || 0,
                internal2: marksMap[rollNumber]?.internal2 || 0,
                semesterExam: marksMap[rollNumber]?.semesterExam || 0
            }];

            await API.post('/api/marks/bulk', {
                subjectId: selectedSub,
                semester: Number(selectedSem),
                marksData
            });

            setMessageType('success');
            setMessage(`Successfully submitted marks for ${rollNumber}.`);
        } catch (error) {
            setMessageType('error');
            setMessage(error.response?.data?.message || error.message || "Publishing failure");
        } finally {
            setIsSubmitting(false);
        }
    };

    const targetStudents = students.filter(s => {
        if (!selectedSub) return false;
        const sub = subjects.find(sub => sub._id === selectedSub);
        return s.department === sub?.department;
    });

    if (loading) return <div className="flex justify-center mt-32"><Loader2 className="animate-spin text-emerald-600" size={48} /></div>;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Marks Entry</h1>
                <p className="text-slate-500 mt-1">Submit internal & model exam valuations for your subjects.</p>
            </div>

            {/* STAFF OVERVIEW BANNER */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Target Scholars" value={targetStudents.length} icon={Target} color="emerald" />
                <StatCard title="Avg Attendance" value={`${stats.avgAttendance}%`} icon={Percent} color="emerald" />
                <StatCard title="Class Avg Marks" value={stats.avgMarks} subtitle="/ 100" icon={Award} color="emerald" />
            </div>

            <PremiumCard>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Subject Context</label>
                <div className="flex items-center gap-4">
                    <BookOpen className="text-emerald-600" />
                    <select
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none font-bold text-slate-700 appearance-none cursor-pointer focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all"
                        value={selectedSub}
                        onChange={(e) => setSelectedSub(e.target.value)}
                    >
                        {subjects.length === 0 && <option value="">No subjects assigned</option>}
                        {subjects.map(s => (
                            <option key={s._id} value={s._id}>{s.subjectName} [{s.subjectCode}]</option>
                        ))}
                    </select>

                    <select
                        className="w-32 bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none font-bold text-slate-700 appearance-none cursor-pointer focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all"
                        value={selectedSem}
                        onChange={(e) => setSelectedSem(e.target.value)}
                    >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                            <option key={sem} value={sem}>Sem {sem}</option>
                        ))}
                    </select>
                </div>
            </PremiumCard>

            {message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 font-bold ${messageType === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
                    <AlertCircle size={20} />
                    <span>{message}</span>
                </div>
            )}

            <PremiumCard className="!p-0 overflow-hidden">
                <div className="overflow-x-auto w-full">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100/50">
                                <th className="py-4 pl-6 text-left text-xs font-black uppercase text-slate-500 tracking-widest">Student Identity</th>
                                <th className="py-4 text-left text-xs font-black uppercase text-slate-500 tracking-widest">Score Entry</th>
                                <th className="py-4 pr-6 text-right text-xs font-black uppercase text-slate-500 tracking-widest">Submit Operations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/50">
                            {targetStudents.length === 0 && (
                                <tr><td colSpan="3" className="py-8 text-center text-slate-400 font-medium">No students found matching this subject's criteria.</td></tr>
                            )}
                            {targetStudents.map(s => (
                                <tr key={s._id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="py-4 pl-6">
                                        <p className="font-black text-slate-900">{s.fullName}</p>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">{s.rollNumber}</p>
                                    </td>
                                    <td className="py-4">
                                        <div className="flex gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase">Int 1 (20)</label>
                                                <input 
                                                    type="number" max="20" placeholder="0"
                                                    className="w-16 bg-white shadow-sm border border-slate-200 rounded-lg py-2 px-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 font-bold transition-all"
                                                    onChange={(e) => setMarksMap(prev => ({ ...prev, [s.rollNumber]: { ...prev[s.rollNumber], internal1: e.target.value } }))}
                                                    value={marksMap[s.rollNumber]?.internal1 || ''}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase">Int 2 (20)</label>
                                                <input 
                                                    type="number" max="20" placeholder="0"
                                                    className="w-16 bg-white shadow-sm border border-slate-200 rounded-lg py-2 px-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 font-bold transition-all"
                                                    onChange={(e) => setMarksMap(prev => ({ ...prev, [s.rollNumber]: { ...prev[s.rollNumber], internal2: e.target.value } }))}
                                                    value={marksMap[s.rollNumber]?.internal2 || ''}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase">Sem (60)</label>
                                                <input 
                                                    type="number" max="60" placeholder="0"
                                                    className="w-16 bg-white shadow-sm border border-slate-200 rounded-lg py-2 px-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 font-bold transition-all"
                                                    onChange={(e) => setMarksMap(prev => ({ ...prev, [s.rollNumber]: { ...prev[s.rollNumber], semesterExam: e.target.value } }))}
                                                    value={marksMap[s.rollNumber]?.semesterExam || ''}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 pr-6 text-right">
                                        <button 
                                            onClick={() => handlePushMark(s.rollNumber)} 
                                            disabled={isSubmitting}
                                            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"
                                        >
                                            Save Data
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </PremiumCard>
        </div>
    );
};

export default StaffMarks;