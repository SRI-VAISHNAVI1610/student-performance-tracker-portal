import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FileText, Download, Loader2, User } from 'lucide-react';
import axios from 'axios';
import { generateStudentReport } from '../../utils/generatePDF';
import PremiumCard from '../../components/ui/PremiumCard';

const StaffReport = () => {
    const { user } = useAuth();
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState('');
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const res = await axios.get('http://localhost:5000/api/students', config);
                setStudents(res.data || []);
            } catch (error) {
                console.error("Failed to fetch students", error);
            } finally {
                setLoading(false);
            }
        };
        if (user?.token) fetchStudents();
    }, [user]);

    const handleDownloadReport = async (e) => {
        e.preventDefault();
        if (!selectedStudent) return;
        
        setGenerating(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const profile = students.find(s => s.rollNumber === selectedStudent);
            if (!profile) throw new Error("Student profile disconnected.");

            const rollNo = profile.rollNumber;
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
            console.error("PDF generation error:", err);
            alert("Failed to generate PDF. Check console for details.");
        } finally {
            setGenerating(false);
        }
    };

    if (loading) return <div className="flex justify-center mt-32"><Loader2 className="animate-spin text-emerald-600" size={48} /></div>;

    const selectedProfile = students.find(s => s.rollNumber === selectedStudent);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Download Report</h1>
                <p className="text-slate-500 mt-1">Generate comprehensive academic analysis reports for assigned students.</p>
            </div>

            <PremiumCard>
                <form onSubmit={handleDownloadReport} className="space-y-8">
                    <div className="space-y-4">
                        <label className="text-sm font-bold text-slate-700">Select Target Student</label>
                        <select 
                            required
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-6 outline-none font-bold text-slate-700 appearance-none cursor-pointer text-lg focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all"
                            value={selectedStudent}
                            onChange={e => setSelectedStudent(e.target.value)}
                        >
                            <option value="">-- Choose from roster --</option>
                            {students.map(s => <option key={s.rollNumber} value={s.rollNumber}>{s.fullName} ({s.rollNumber})</option>)}
                        </select>
                    </div>

                    {selectedProfile && (
                        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 flex items-center gap-6">
                            <div className="h-16 w-16 bg-white rounded-2xl shadow-sm flex items-center justify-center font-black text-emerald-600 text-2xl">
                                {selectedProfile.fullName.charAt(0)}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">{selectedProfile.fullName}</h3>
                                <p className="text-sm font-medium text-slate-600">{selectedProfile.department} - Semester {selectedProfile.semester}</p>
                            </div>
                        </div>
                    )}

                    <div className="pt-4 border-t border-slate-100/50">
                        <button 
                            type="submit"
                            disabled={!selectedStudent || generating}
                            className="w-full px-6 py-4 bg-green-500 text-white rounded-xl font-black hover:bg-green-600 active:scale-[0.99] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:active:scale-100 shadow-sm"
                        >
                            {generating ? <Loader2 className="animate-spin" size={24} /> : <Download size={24} />}
                            Download Unified PDF Report
                        </button>
                    </div>
                </form>
            </PremiumCard>
        </div>
    );
};

export default StaffReport;