import React, { useState, useEffect } from 'react';
import {
    Calendar as CalendarIcon,
    Check,
    X,
    Loader2,
    Filter,
    Save,
    Users,
    BookOpen,
    Clock,
    CheckCircle2,
    XCircle,
    ChevronDown,
    Search,
    BarChart3,
    ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Attendance = () => {
    const { user } = useAuth();
    const role = user.role.toLowerCase();

    const [filters, setFilters] = useState({
        date: new Date().toISOString().split('T')[0],
        department: '',
        year: '',
        semester: '',
        subjectId: ''
    });

    const [subjects, setSubjects] = useState([]);
    const [students, setStudents] = useState([]);
    const [dailyAttendance, setDailyAttendance] = useState({});
    const [attendanceLog, setAttendanceLog] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetchingStudents, setFetchingStudents] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                if (role === 'student' || role === 'parent') {
                    const res = await axios.get(`http://localhost:5000/api/attendance`, config);
                    setAttendanceLog(res.data);
                } else {
                    const subRes = await axios.get('http://localhost:5000/api/subjects', config);
                    setSubjects(subRes.data);
                }
            } catch (err) {
                console.error("Attendance system initialization error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [user.token, role]);

    const handleFetchClass = async () => {
        if (!filters.department || !filters.year || !filters.semester || !filters.subjectId) {
            setError("Configuration incomplete. Specify all parameters.");
            return;
        }
        setError('');
        setSuccess('');
        setFetchingStudents(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const query = `department=${filters.department}&year=${filters.year}&semester=${filters.semester}`;
            const res = await axios.get(`http://localhost:5000/api/students?${query}`, config);

            setStudents(res.data);
            const initialStatus = {};
            res.data.forEach(s => {
                initialStatus[s.studentId] = 'Present';
            });
            setDailyAttendance(initialStatus);
        } catch (err) {
            setError('Dataset retrieval failure.');
        } finally {
            setFetchingStudents(false);
        }
    };

    const toggleStatus = (roll) => {
        setDailyAttendance(prev => ({
            ...prev,
            [roll]: prev[roll] === 'Present' ? 'Absent' : 'Present'
        }));
    };

    const handleSaveAttendance = async () => {
        setError('');
        setSuccess('');
        setSaving(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const submitPromises = Object.keys(dailyAttendance).map(roll => {
                return axios.post('http://localhost:5000/api/attendance', {
                    studentId: roll,
                    subjectCode: filters.subjectId,
                    date: filters.date,
                    status: dailyAttendance[roll],
                    semester: filters.semester
                }, config);
            });

            await Promise.all(submitPromises);
            setSuccess(`Sync successful. Identity records updated for ${filters.date}.`);
        } catch (err) {
            setError('Transactional failure. Some records were not persisted.');
        } finally {
            setSaving(false);
        }
    };

    const stats = {
        total: students.length,
        present: Object.values(dailyAttendance).filter(v => v === 'Present').length,
        absent: Object.values(dailyAttendance).filter(v => v === 'Absent').length,
    };

    if (loading) return (
        <div className="h-[60vh] flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
            <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Authenticating Registry...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none flex items-center gap-4">
                        <CalendarIcon className="text-blue-600" size={36} />
                        Attendance <span className="text-blue-600">Module</span>
                    </h1>
                    <p className="text-slate-500 mt-3 font-medium text-lg">
                        {role === 'staff' || role === 'admin' ? 'Strategic presence tracking & academic logging' : 'Verifying institutional presence records'}
                    </p>
                </div>
            </div>

            {(role === 'staff' || role === 'admin') ? (
                <div className="space-y-6">
                    {/* Control Matrix */}
                    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Session Date</label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        className="w-full bg-slate-50 border-2 border-transparent rounded-[20px] py-3.5 px-6 outline-none focus:bg-white focus:border-blue-500 font-black text-slate-900 transition-all appearance-none"
                                        value={filters.date}
                                        onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                                    />
                                    <CalendarIcon className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={18} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Department</label>
                                <select
                                    className="w-full bg-slate-50 border-2 border-transparent rounded-[20px] py-3.5 px-6 outline-none focus:bg-white focus:border-blue-500 font-black text-xs uppercase tracking-widest text-slate-900 transition-all appearance-none"
                                    value={filters.department}
                                    onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                                >
                                    <option value="">Select Dept</option>
                                    <option value="Computer Science">Computer Science</option>
                                    <option value="Information Tech">Information Tech</option>
                                    <option value="Electrical">Electrical</option>
                                    <option value="Mechanical">Mechanical</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Academic Year</label>
                                <select
                                    className="w-full bg-slate-50 border-2 border-transparent rounded-[20px] py-3.5 px-6 outline-none focus:bg-white focus:border-blue-500 font-black text-xs uppercase tracking-widest text-slate-900 transition-all appearance-none"
                                    value={filters.year}
                                    onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                                >
                                    <option value="">Select Year</option>
                                    {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Semester</label>
                                <select
                                    className="w-full bg-slate-50 border-2 border-transparent rounded-[20px] py-3.5 px-6 outline-none focus:bg-white focus:border-blue-500 font-black text-xs uppercase tracking-widest text-slate-900 transition-all appearance-none"
                                    value={filters.semester}
                                    onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
                                >
                                    <option value="">Select Sem</option>
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Sem {s}</option>)}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Subject</label>
                                <select
                                    className="w-full bg-slate-50 border-2 border-transparent rounded-[20px] py-3.5 px-6 outline-none focus:bg-white focus:border-blue-500 font-black text-xs uppercase tracking-widest text-slate-900 transition-all appearance-none"
                                    value={filters.subjectId}
                                    onChange={(e) => setFilters({ ...filters, subjectId: e.target.value })}
                                >
                                    <option value="">Select Subject</option>
                                    {subjects.map(s => <option key={s._id} value={s.subjectCode}>{s.subjectName}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-slate-50">
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-emerald-500"></div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Default: Present</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-slate-200"></div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Manual Override Active</span>
                                </div>
                            </div>

                            <button
                                onClick={handleFetchClass}
                                disabled={fetchingStudents}
                                className="w-full sm:w-auto bg-blue-500 text-white px-10 py-4 rounded-[28px] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-600 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                            >
                                {fetchingStudents ? <Loader2 className="animate-spin" size={18} /> : <Users size={18} />}
                                Fetch Student Matrix
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-rose-50 border-2 border-rose-100 p-6 rounded-[32px] flex items-center gap-4 text-rose-600 animate-in slide-in-from-top-4">
                            <XCircle size={24} />
                            <p className="font-black text-sm uppercase tracking-widest">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="bg-emerald-50 border-2 border-emerald-100 p-6 rounded-[32px] flex items-center gap-4 text-emerald-600 animate-in slide-in-from-top-4">
                            <CheckCircle2 size={24} />
                            <p className="font-black text-sm uppercase tracking-widest">{success}</p>
                        </div>
                    )}

                    {students.length > 0 && (
                        <div className="bg-white rounded-[48px] shadow-sm border border-slate-100 overflow-hidden animate-in fade-in duration-700">
                            {/* Stats Summary */}
                            <div className="grid grid-cols-3 divide-x divide-slate-100 bg-slate-50/50 border-b border-slate-100">
                                <div className="p-8 text-center">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Enrolled</p>
                                    <p className="text-3xl font-black text-slate-900">{stats.total}</p>
                                </div>
                                <div className="p-8 text-center">
                                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-1">Present</p>
                                    <p className="text-3xl font-black text-emerald-600 leading-none">{stats.present}</p>
                                </div>
                                <div className="p-8 text-center">
                                    <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] mb-1">Absent</p>
                                    <p className="text-3xl font-black text-rose-600 leading-none">{stats.absent}</p>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-white border-b border-slate-100">
                                            <th className="text-left py-6 px-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Student Identity</th>
                                            <th className="text-center py-6 px-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Current Status</th>
                                            <th className="text-right py-6 px-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Manual Toggle</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {students.map(s => (
                                            <tr key={s._id} className="group hover:bg-slate-50/50 transition-all">
                                                <td className="py-6 px-10">
                                                    <div className="flex items-center gap-5">
                                                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black text-lg transition-all ${dailyAttendance[s.studentId] === 'Present' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                                            {s.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-slate-900 leading-tight">{s.name}</p>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{s.studentId}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-6 px-10 text-center">
                                                    <span className={`inline-flex items-center gap-2 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] animate-in zoom-in-95 ${dailyAttendance[s.studentId] === 'Present' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'}`}>
                                                        {dailyAttendance[s.studentId] === 'Present' ? <Check size={14} /> : <X size={14} />}
                                                        {dailyAttendance[s.studentId]}
                                                    </span>
                                                </td>
                                                <td className="py-6 px-10 text-right">
                                                    <button
                                                        onClick={() => toggleStatus(s.studentId)}
                                                        className={`h-12 w-12 rounded-2xl flex items-center justify-center mx-auto lg:ml-auto transition-all transform active:scale-90 ${dailyAttendance[s.studentId] === 'Present' ? 'bg-slate-100 text-slate-400 hover:bg-rose-100 hover:text-rose-600' : 'bg-slate-100 text-slate-400 hover:bg-emerald-100 hover:text-emerald-600'}`}
                                                    >
                                                        <ArrowRight size={20} className={dailyAttendance[s.studentId] === 'Present' ? '' : 'rotate-180'} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="p-10 bg-slate-50/50 flex justify-end">
                                <button
                                    onClick={handleSaveAttendance}
                                    disabled={saving}
                                    className="bg-blue-600 text-white px-12 py-5 rounded-[28px] font-black text-sm uppercase tracking-[0.2em] flex items-center gap-4 hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/30 active:scale-95 disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                    Commit Daily Registry
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-[48px] shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-10 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Personal History</h3>
                        <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full">
                            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{attendanceLog.length} recorded events</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-slate-50/30">
                                    <th className="text-left py-6 px-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Date Log</th>
                                    <th className="text-left py-6 px-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Subject Asset</th>
                                    <th className="text-left py-6 px-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Verification Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {attendanceLog.map((record, index) => (
                                    <tr key={index} className="group hover:bg-slate-50/50 transition-all">
                                        <td className="py-6 px-10">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                                    <Clock size={18} />
                                                </div>
                                                <span className="font-extrabold text-slate-900">{new Date(record.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                            </div>
                                        </td>
                                        <td className="py-6 px-10">
                                            <div className="flex flex-col">
                                                <span className="font-black text-slate-700 uppercase tracking-widest text-[11px]">{record.subjectCode}</span>
                                                <span className="text-[10px] font-bold text-slate-400">Academic Semester {record.semester || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="py-6 px-10">
                                            <span className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${record.status === 'Present' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                                {record.status === 'Present' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                                                {record.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {attendanceLog.length === 0 && (
                                    <tr>
                                        <td colSpan="3" className="py-24 text-center">
                                            <div className="max-w-xs mx-auto text-slate-400">
                                                <BarChart3 size={48} className="mx-auto mb-4 opacity-10" />
                                                <p className="font-black uppercase tracking-[0.2em] text-[10px]">Registry is currently vacant</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Attendance;

