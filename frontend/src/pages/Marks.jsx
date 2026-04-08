import React, { useState, useEffect } from 'react';
import {
    FileText,
    Save,
    Loader2,
    Search,
    Filter,
    GraduationCap,
    BookOpen,
    Target,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    Database,
    ChevronRight,
    Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Marks = () => {
    const { user } = useAuth();
    const [filters, setFilters] = useState({
        department: '',
        year: '',
        semester: '',
        subjectId: ''
    });

    const [subjects, setSubjects] = useState([]);
    const [students, setStudents] = useState([]);
    const [studentMarks, setStudentMarks] = useState({});
    const [loading, setLoading] = useState(true);
    const [fetchingStudents, setFetchingStudents] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const subRes = await axios.get('http://localhost:5000/api/subjects', config);
                setSubjects(subRes.data);
            } catch (err) {
                setError('Registry synchronization failure.');
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [user.token]);

    const handleFetchStudents = async () => {
        if (!filters.department || !filters.year || !filters.semester || !filters.subjectId) {
            setError("Configuration incomplete. All parameters must be defined.");
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
            const marksData = {};
            res.data.forEach(s => {
                marksData[s.studentId] = {
                    internal1: '',
                    internal2: '',
                    practical: '',
                    semesterExam: ''
                };
            });
            setStudentMarks(marksData);
        } catch (err) {
            setError('Data retrieval error. Identity cluster not found.');
        } finally {
            setFetchingStudents(false);
        }
    };

    const handleMarkChange = (roll, field, value) => {
        const numValue = value === '' ? '' : Math.min(100, Math.max(0, parseInt(value) || 0));
        setStudentMarks(prev => ({
            ...prev,
            [roll]: { ...prev[roll], [field]: numValue }
        }));
    };

    const handleSaveBatch = async () => {
        setError('');
        setSuccess('');
        setSaving(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const savePromises = Object.keys(studentMarks).map(roll => {
                const markData = studentMarks[roll];
                if (markData.internal1 !== '' || markData.internal2 !== '' || markData.practical !== '' || markData.semesterExam !== '') {
                    return axios.post('http://localhost:5000/api/marks', {
                        studentId: roll,
                        subjectId: filters.subjectId,
                        semester: filters.semester,
                        ...markData
                    }, config);
                }
                return null;
            }).filter(p => p !== null);

            if (savePromises.length === 0) {
                setError("No entry data detected. Transaction aborted.");
                setSaving(false);
                return;
            }

            await Promise.all(savePromises);
            setSuccess("Institutional performance records synchronized successfully.");
        } catch (err) {
            setError(err.response?.data?.message || 'Database commit failure. Integrity at risk.');
        } finally {
            setSaving(false);
        }
    };

    const calculateAverage = (field) => {
        const values = Object.values(studentMarks).map(m => m[field]).filter(v => v !== '');
        if (values.length === 0) return 0;
        return (values.reduce((a, b) => a + (parseInt(b) || 0), 0) / values.length).toFixed(1);
    };

    if (loading) return (
        <div className="h-[60vh] flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
            <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Accessing Grade Vault...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none flex items-center gap-4">
                        <FileText className="text-indigo-600" size={36} />
                        Performance <span className="text-indigo-600">Entry</span>
                    </h1>
                    <p className="text-slate-500 mt-3 font-medium text-lg">
                        High-precision grade management & academic verification
                    </p>
                </div>
            </div>

            {/* Control Matrix */}
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Academic Dept</label>
                        <select
                            className="w-full bg-slate-50 border-2 border-transparent rounded-[20px] py-4 px-6 outline-none focus:bg-white focus:border-indigo-500 font-black text-xs uppercase tracking-widest text-slate-900 transition-all appearance-none"
                            value={filters.department}
                            onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                        >
                            <option value="">Departments</option>
                            <option value="Computer Science">Computer Science</option>
                            <option value="Information Tech">Information Tech</option>
                            <option value="Electrical">Electrical</option>
                            <option value="Mechanical">Mechanical</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Year</label>
                        <select
                            className="w-full bg-slate-50 border-2 border-transparent rounded-[20px] py-4 px-6 outline-none focus:bg-white focus:border-indigo-500 font-black text-xs uppercase tracking-widest text-slate-900 transition-all appearance-none"
                            value={filters.year}
                            onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                        >
                            <option value="">Academic Year</option>
                            {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Semester</label>
                        <select
                            className="w-full bg-slate-50 border-2 border-transparent rounded-[20px] py-4 px-6 outline-none focus:bg-white focus:border-indigo-500 font-black text-xs uppercase tracking-widest text-slate-900 transition-all appearance-none"
                            value={filters.semester}
                            onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
                        >
                            <option value="">Enrollment Sem</option>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Sem {s}</option>)}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Subject Asset</label>
                        <select
                            className="w-full bg-slate-50 border-2 border-transparent rounded-[20px] py-4 px-6 outline-none focus:bg-white focus:border-indigo-500 font-black text-xs uppercase tracking-widest text-slate-900 transition-all appearance-none"
                            value={filters.subjectId}
                            onChange={(e) => setFilters({ ...filters, subjectId: e.target.value })}
                        >
                            <option value="">Subject Directory</option>
                            {subjects.map(s => <option key={s._id} value={s.subjectCode}>{s.subjectName}</option>)}
                        </select>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-slate-50">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-indigo-500"></div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Secure Entry Mode</span>
                        </div>
                    </div>

                    <button
                        onClick={handleFetchStudents}
                        disabled={fetchingStudents}
                        className="w-full sm:w-auto bg-blue-500 text-white px-10 py-4 rounded-[32px] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-600 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                    >
                        {fetchingStudents ? <Loader2 className="animate-spin" size={18} /> : <Target size={18} />}
                        Sync Performance Matrix
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-rose-50 border-2 border-rose-100 p-6 rounded-[32px] flex items-center gap-4 text-rose-600 animate-in slide-in-from-top-4 shadow-lg shadow-rose-900/5">
                    <AlertCircle size={24} />
                    <p className="font-black text-sm uppercase tracking-widest">{error}</p>
                </div>
            )}

            {success && (
                <div className="bg-emerald-50 border-2 border-emerald-100 p-6 rounded-[32px] flex items-center gap-4 text-emerald-600 animate-in slide-in-from-top-4 shadow-lg shadow-emerald-900/5">
                    <CheckCircle2 size={24} />
                    <p className="font-black text-sm uppercase tracking-widest">{success}</p>
                </div>
            )}

            {students.length > 0 && (
                <div className="space-y-6 animate-in fade-in duration-700">
                    {/* Analytics Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Int 1 Avg</p>
                            <div className="flex items-end gap-3">
                                <span className="text-4xl font-black text-slate-900">{calculateAverage('internal1')}</span>
                                <span className="text-xs font-bold text-slate-300 mb-1.5 uppercase">pts</span>
                            </div>
                        </div>
                        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Int 2 Avg</p>
                            <div className="flex items-end gap-3">
                                <span className="text-4xl font-black text-slate-900">{calculateAverage('internal2')}</span>
                                <span className="text-xs font-bold text-slate-300 mb-1.5 uppercase">pts</span>
                            </div>
                        </div>
                        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Practical</p>
                            <div className="flex items-end gap-3">
                                <span className="text-4xl font-black text-slate-900">{calculateAverage('practical')}</span>
                                <span className="text-xs font-bold text-slate-300 mb-1.5 uppercase">pts</span>
                            </div>
                        </div>
                        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
                            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-4">Class Score</p>
                            <div className="flex items-end gap-3">
                                <span className="text-4xl font-black text-indigo-600">{calculateAverage('semesterExam')}</span>
                                <span className="text-xs font-bold text-indigo-300 mb-1.5 uppercase">pts</span>
                            </div>
                        </div>
                    </div>

                    {/* Grade Entry Matrix */}
                    <div className="bg-white rounded-[48px] shadow-sm border border-slate-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                        <th className="text-left py-6 px-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Identification</th>
                                        <th className="text-center py-6 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Int 1</th>
                                        <th className="text-center py-6 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Int 2</th>
                                        <th className="text-center py-6 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Practical</th>
                                        <th className="text-center py-6 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Sem Exam</th>
                                        <th className="text-right py-6 px-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Analysis</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {students.map(s => (
                                        <tr key={s._id} className="group hover:bg-slate-50/50 transition-all">
                                            <td className="py-6 px-10">
                                                <div className="flex items-center gap-5">
                                                    <div className="h-12 w-12 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-lg text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                        {s.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-900 leading-tight">{s.name}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{s.studentId}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-6 px-6">
                                                <input
                                                    type="number"
                                                    className="w-20 mx-auto block bg-white border-2 border-slate-100 rounded-xl py-2 px-3 outline-none focus:border-indigo-500 font-extrabold text-center text-slate-900 transition-all placeholder:text-slate-200"
                                                    placeholder="--"
                                                    value={studentMarks[s.studentId]?.internal1}
                                                    onChange={(e) => handleMarkChange(s.studentId, 'internal1', e.target.value)}
                                                />
                                            </td>
                                            <td className="py-6 px-6">
                                                <input
                                                    type="number"
                                                    className="w-20 mx-auto block bg-white border-2 border-slate-100 rounded-xl py-2 px-3 outline-none focus:border-indigo-500 font-extrabold text-center text-slate-900 transition-all placeholder:text-slate-200"
                                                    placeholder="--"
                                                    value={studentMarks[s.studentId]?.internal2}
                                                    onChange={(e) => handleMarkChange(s.studentId, 'internal2', e.target.value)}
                                                />
                                            </td>
                                            <td className="py-6 px-6">
                                                <input
                                                    type="number"
                                                    className="w-20 mx-auto block bg-white border-2 border-slate-100 rounded-xl py-2 px-3 outline-none focus:border-indigo-500 font-extrabold text-center text-slate-900 transition-all placeholder:text-slate-200"
                                                    placeholder="--"
                                                    value={studentMarks[s.studentId]?.practical}
                                                    onChange={(e) => handleMarkChange(s.studentId, 'practical', e.target.value)}
                                                />
                                            </td>
                                            <td className="py-6 px-6">
                                                <input
                                                    type="number"
                                                    className="w-20 mx-auto block bg-white border-2 border-slate-100 rounded-xl py-2 px-3 outline-none focus:border-indigo-500 font-extrabold text-center text-slate-900 transition-all placeholder:text-slate-200"
                                                    placeholder="--"
                                                    value={studentMarks[s.studentId]?.semesterExam}
                                                    onChange={(e) => handleMarkChange(s.studentId, 'semesterExam', e.target.value)}
                                                />
                                            </td>
                                            <td className="py-6 px-10 text-right">
                                                <div className="flex justify-end items-center gap-2">
                                                    {(parseInt(studentMarks[s.studentId]?.semesterExam) > 40) ? (
                                                        <Award className="text-emerald-400" size={18} />
                                                    ) : (
                                                        <TrendingUp className="text-slate-200" size={18} />
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-10 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-slate-100">
                            <div className="flex items-center gap-4 text-slate-400">
                                <Database size={18} />
                                <span className="text-[10px] font-black uppercase tracking-widest leading-none">Automatic checksum validation enabled</span>
                            </div>

                            <button
                                onClick={handleSaveBatch}
                                disabled={saving}
                                className="w-full sm:w-auto bg-indigo-600 text-white px-12 py-5 rounded-[28px] font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/30 active:scale-95 disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                Commit Batch Analytics
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Marks;
