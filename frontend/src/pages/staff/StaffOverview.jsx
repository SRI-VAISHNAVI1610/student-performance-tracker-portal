import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Users, Search, Loader2, User, BookOpen, Target, Percent, Award } from 'lucide-react';
import API from '../../api';
import StatCard from '../../components/ui/StatCard';
import PremiumCard from '../../components/ui/PremiumCard';

const StaffOverview = () => {
    const { user } = useAuth();
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState('');
    const [selectedSem, setSelectedSem] = useState('1');
    const [studentData, setStudentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dataLoading, setDataLoading] = useState(false);
    const [stats, setStats] = useState({ avgAttendance: 0, avgMarks: 0 });

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const res = await API.get('/api/students');
                setStudents(res.data);
            } catch (error) {
                console.error("Failed to fetch students", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, [user]);

    useEffect(() => {
        const fetchStudentDetails = async () => {
            if (!selectedStudent) {
                setStudentData(null);
                return;
            }
            setDataLoading(true);
            try {
                const profile = students.find(s => s.rollNumber === selectedStudent);
                const [mRes, aRes] = await Promise.all([
                    API.get(`/api/marks?rollNumber=${selectedStudent}&semester=${selectedSem}`),
                    API.get(`/api/attendance?rollNumber=${selectedStudent}&semester=${selectedSem}`)
                ]);
                
                // Group Marks by Subject natively to eliminate frontend duplication
                const rawMarks = mRes.data || [];
                const groupedMarksObj = {};
                rawMarks.forEach(m => {
                    const subName = m.subjectId?.subjectName || 'Unknown Subject';
                    groupedMarksObj[subName] = m;
                });
                const cleanMarks = Object.values(groupedMarksObj);

                setStudentData({ profile, marks: cleanMarks, attendance: aRes.data });
            } catch (error) {
                console.error("Failed to fetch student data", error);
            } finally {
                setDataLoading(false);
            }
        };
        fetchStudentDetails();
    }, [selectedStudent, user, students, selectedSem]);

    // Live Metrics Data Synthesizer for Staff Overview
    useEffect(() => {
        const fetchGlobalStats = async () => {
            if (!students.length) return;
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                // Using subject/semester independent fetches to derive broad Staff load if possible, or using all accessible assigned marks
                // Wait, rather than fetching huge arrays of all students, let's fetch global marks for their assignment
                const [allMarksRes, allAttRes] = await Promise.all([
                    API.get(`/api/marks?semester=${selectedSem}`, config),
                    API.get(`/api/attendance?semester=${selectedSem}`, config)
                ]);
                
                const marks = allMarksRes.data || [];
                const atts = allAttRes.data || [];
                
                const avgM = marks.length > 0 ? (marks.reduce((s, m) => s + (m.total || 0), 0) / marks.length).toFixed(1) : 0;
                const pres = atts.filter(a => a.status === 'present').length;
                const avgA = atts.length > 0 ? Math.round((pres / atts.length) * 100) : 0;
                
                setStats({ avgMarks: avgM, avgAttendance: avgA });
            } catch (err) {
                console.error("Failed to load staff metrics", err);
            }
        };
        fetchGlobalStats();
    }, [students, selectedSem, user]);

    if (loading) return <div className="flex justify-center mt-32"><Loader2 className="animate-spin text-emerald-600" size={48} /></div>;

    const calcTotalAttendance = () => {
        if (!studentData?.attendance) return 0;
        const total = studentData.attendance.length;
        if (total === 0) return 0;
        const present = studentData.attendance.filter(a => a.status === 'present').length;
        return Math.round((present / total) * 100);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Overview</h1>
                <p className="text-slate-500 mt-1">Review student roster and individual academic profiles.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Target Scholars" value={students.length} icon={Target} color="emerald" />
                <StatCard title="Class Avg Attendance" value={`${stats.avgAttendance}%`} icon={Percent} color="emerald" />
                <StatCard title="Class Avg Marks" value={stats.avgMarks} subtitle="/ 100" icon={Award} color="emerald" />
            </div>

            <div className="flex gap-6">
                {/* Dropdown Selectors */}
                <PremiumCard className="flex-1 flex flex-col justify-center">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Select Target Matrix</p>
                    <div className="flex gap-4">
                        <select 
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none font-bold text-slate-700 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all cursor-pointer"
                            value={selectedStudent}
                            onChange={e => setSelectedStudent(e.target.value)}
                        >
                            <option value="">-- Choose a student to view dashboard --</option>
                            {students.map(s => <option key={s.rollNumber} value={s.rollNumber}>{s.fullName} ({s.rollNumber})</option>)}
                        </select>
                        <select 
                            className="bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none font-bold text-slate-700 w-40 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all cursor-pointer"
                            value={selectedSem}
                            onChange={e => setSelectedSem(e.target.value)}
                        >
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => <option key={sem} value={sem}>Semester {sem}</option>)}
                        </select>
                    </div>
                </PremiumCard>
            </div>

            {selectedStudent && (
                <PremiumCard glowColor="from-emerald-400 to-emerald-600" className="min-h-[400px]">
                    {dataLoading ? (
                        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-emerald-600" size={32} /></div>
                    ) : studentData ? (
                        <div className="space-y-8">
                            <div className="flex items-center gap-4 pb-6 border-b border-slate-100/50">
                                <div className="h-16 w-16 bg-gradient-to-br from-emerald-400 to-emerald-600 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg shadow-emerald-500/30">
                                    {studentData.profile.fullName.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">{studentData.profile.fullName}</h2>
                                    <p className="text-slate-500 font-bold text-sm tracking-wide">{studentData.profile.department} | Semester {studentData.profile.semester}</p>
                                </div>
                                <div className="ml-auto text-right">
                                    <h3 className="text-4xl font-extrabold text-emerald-600 tracking-tight">{calcTotalAttendance()}%</h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Aggregate Attendance</p>
                                </div>
                            </div>
                            
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2"><BookOpen size={20} className="text-emerald-600"/> Academic Marks</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {studentData.marks.length === 0 ? <p className="text-slate-400">No marks recorded.</p> : (studentData.marks || []).map((m, i) => (
                                        <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between shadow-sm hover:shadow-md transition-shadow">
                                            <span className="font-bold text-slate-700">{m.subjectId?.subjectName || 'Unknown Subject'}</span>
                                            <span className="font-black text-emerald-600">{m.total || 0}/100</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : null}
                </PremiumCard>
            )}
        </div>
    );
};

export default StaffOverview;