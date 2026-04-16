import React, { useState, useEffect } from 'react';
import {
    Users as UsersIcon,
    UserPlus,
    Search,
    Filter,
    Loader2,
    X,
    CheckCircle2,
    ChevronRight,
    MoreHorizontal,
    Mail,
    BookOpen,
    GraduationCap,
    Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../api';
import { generateStudentReport } from '../utils/generatePDF';

const Students = () => {
    const { user } = useAuth();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [deptFilter, setDeptFilter] = useState('');
    const [yearFilter, setYearFilter] = useState('');
    const [semFilter, setSemFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        studentId: '',
        name: '',
        department: 'Computer Science',
        year: '1',
        semester: '1',
        studentEmail: '',
        parentEmail: ''
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const query = `department=${deptFilter}&year=${yearFilter}&semester=${semFilter}`;
            const studentRes = await API.get(`/api/students?${query}`, config);
            setStudents(studentRes.data);
        } catch (err) {
            console.error("Historical dataset sync failure:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user.token, deptFilter, yearFilter, semFilter]);

    const handleAddStudent = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await API.post('/api/students/admin/create-student', formData, config);
            setShowModal(false);
            fetchData();
            // Reset form
            setFormData({
                studentId: '',
                name: '',
                department: 'Computer Science',
                year: '1',
                semester: '1',
                studentEmail: '',
                parentEmail: ''
            });
        } catch (err) {
            alert(err.response?.data?.message || "Registration failure. Verify inputs.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDownloadReport = async (student) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const rollNo = student.studentId || student.rollNumber;
            const [mRes, aRes, actRes] = await Promise.all([
                API.get(`/api/marks?rollNumber=${rollNo}`, config),
                API.get(`/api/attendance?rollNumber=${rollNo}`, config),
                API.get(`/api/activities/student/${rollNo}`, config)
            ]);
            const data = { profile: student, raw: { marks: mRes.data, attendance: aRes.data, activities: actRes.data } };
            generateStudentReport(data);
        } catch(err) {
            console.error(err);
        }
    };

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.studentId?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none flex items-center gap-4">
                        <UsersIcon className="text-blue-600" size={36} />
                        Student <span className="text-blue-600">Register</span>
                    </h1>
                    <p className="text-slate-500 mt-3 font-medium text-lg">
                        Managing {students.length} institutional academic profiles
                    </p>
                </div>

                {user.role === 'admin' && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-blue-500 text-white px-8 py-4 rounded-[32px] font-black text-sm uppercase tracking-widest flex items-center gap-3 hover:bg-blue-600 transition-all shadow-sm active:scale-95"
                    >
                        <UserPlus size={18} />
                        Enroll Student
                    </button>
                )}
            </div>

            {/* Filter & Search Matrix */}
            <div className="bg-white p-6 rounded-[40px] shadow-sm border border-slate-100 flex flex-col xl:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name, roll number or department..."
                        className="w-full bg-slate-50 border-2 border-transparent rounded-[24px] py-4 pl-14 pr-6 outline-none focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/5 transition-all font-bold text-slate-900 placeholder:text-slate-400"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                    <select
                        className="bg-slate-50 border-2 border-transparent rounded-2xl py-3 px-6 outline-none focus:bg-white focus:border-blue-500/20 font-black text-xs uppercase tracking-widest text-slate-600 cursor-pointer transition-all appearance-none"
                        value={deptFilter}
                        onChange={(e) => setDeptFilter(e.target.value)}
                    >
                        <option value="">Departments</option>
                        <option value="Computer Science">Comp. Science</option>
                        <option value="Information Tech">Infra Tech</option>
                        <option value="Electrical">Electrical</option>
                        <option value="Mechanical">Mechanical</option>
                    </select>

                    <select
                        className="bg-slate-50 border-2 border-transparent rounded-2xl py-3 px-6 outline-none focus:bg-white focus:border-blue-500/20 font-black text-xs uppercase tracking-widest text-slate-600 cursor-pointer transition-all appearance-none"
                        value={yearFilter}
                        onChange={(e) => setYearFilter(e.target.value)}
                    >
                        <option value="">All Years</option>
                        {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
                    </select>

                    <button
                        onClick={() => { setDeptFilter(''); setYearFilter(''); setSemFilter(''); setSearchQuery(''); }}
                        className="p-3 bg-slate-100 text-slate-400 rounded-2xl hover:bg-slate-200 hover:text-slate-600 transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Students Data Grid */}
            <div className="bg-white rounded-[48px] shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="text-left py-6 px-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Identity</th>
                                <th className="text-left py-6 px-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Department</th>
                                <th className="text-left py-6 px-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Academic Level</th>
                                <th className="text-left py-6 px-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Enrollment Status</th>
                                <th className="text-right py-6 px-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center">
                                        <Loader2 className="animate-spin text-blue-600 mx-auto" size={40} />
                                        <p className="text-slate-400 font-bold mt-4 uppercase tracking-widest text-xs">Accessing Student Core...</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredStudents.map((student) => (
                                    <tr key={student._id} className="group hover:bg-slate-50/50 transition-all">
                                        <td className="py-6 px-10">
                                            <div className="flex items-center gap-5">
                                                <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[20px] shadow-lg shadow-blue-500/20 flex items-center justify-center text-white font-black text-xl">
                                                    {student.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 leading-tight">{student.name}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{student.studentId}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-6 px-10">
                                            <div className="flex items-center gap-3">
                                                <div className="h-2 w-2 rounded-full bg-blue-400"></div>
                                                <span className="font-extrabold text-slate-700 text-sm whitespace-nowrap">{student.department}</span>
                                            </div>
                                        </td>
                                        <td className="py-6 px-10 whitespace-nowrap">
                                            <span className="inline-flex items-center gap-2 bg-slate-100 px-4 py-1.5 rounded-full text-[10px] font-black text-slate-600 uppercase tracking-widest">
                                                Year {student.year} • Sem {student.semester}
                                            </span>
                                        </td>
                                        <td className="py-6 px-10 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-emerald-500">
                                                <CheckCircle2 size={16} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Active Status</span>
                                            </div>
                                        </td>
                                        <td className="py-6 px-10 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <button 
                                                    onClick={() => handleDownloadReport(student)}
                                                    className="h-10 w-10 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center hover:bg-slate-200 hover:text-slate-900 transition-all font-bold"
                                                    title="Download Report"
                                                >
                                                    ⬇️
                                                </button>
                                                <button className="h-10 w-10 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all group-hover:shadow-lg group-hover:shadow-blue-600/20">
                                                    <ChevronRight size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                            {!loading && filteredStudents.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center">
                                        <div className="max-w-xs mx-auto text-slate-400">
                                            <UsersIcon size={48} className="mx-auto mb-4 opacity-20" />
                                            <p className="font-black uppercase tracking-widest text-xs">No matching institutional records</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Registration Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-500/50 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowModal(false)}></div>
                    <div className="relative w-full max-w-2xl bg-white rounded-[48px] shadow-2xl shadow-slate-900/60 p-12 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="absolute top-0 right-0 p-8">
                            <button onClick={() => setShowModal(false)} className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors pointer-events-auto">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="mb-10 text-center">
                            <div className="h-16 w-16 bg-blue-600 rounded-[28px] mx-auto flex items-center justify-center text-white shadow-xl shadow-blue-600/30 mb-6">
                                <UserPlus size={32} />
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight">Institutional Enrollment</h3>
                            <p className="text-slate-500 font-medium mt-2">Initialize student metadata & automatic credential provisioning.</p>
                        </div>

                        <form onSubmit={handleAddStudent} className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Roll Identity</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 21CS001"
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-[24px] py-4 px-6 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-black text-slate-900 transition-all placeholder:text-slate-300 uppercase"
                                        required
                                        value={formData.studentId}
                                        onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Full Legal Name</label>
                                    <input
                                        type="text"
                                        placeholder="Full Name"
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-[24px] py-4 px-6 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-black text-slate-900 transition-all placeholder:text-slate-300"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Academic Dept</label>
                                    <select
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-[24px] py-4 px-6 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-black text-slate-900 transition-all appearance-none"
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    >
                                        <option value="Computer Science">Computer Science</option>
                                        <option value="Information Tech">Information Tech</option>
                                        <option value="Electrical">Electrical</option>
                                        <option value="Mechanical">Mechanical</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Year</label>
                                    <select
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-[24px] py-4 px-6 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-black text-slate-900 transition-all appearance-none"
                                        value={formData.year}
                                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                    >
                                        {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Sem</label>
                                    <select
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-[24px] py-4 px-6 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-black text-slate-900 transition-all appearance-none"
                                        value={formData.semester}
                                        onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Sem {s}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Student Email</label>
                                    <input
                                        type="email"
                                        placeholder="student@college.edu"
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-[24px] py-4 px-6 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-black text-slate-900 transition-all placeholder:text-slate-300"
                                        required
                                        value={formData.studentEmail}
                                        onChange={(e) => setFormData({ ...formData, studentEmail: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Parent Email</label>
                                    <input
                                        type="email"
                                        placeholder="parent@service.com"
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-[24px] py-4 px-6 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-black text-slate-900 transition-all placeholder:text-slate-300"
                                        required
                                        value={formData.parentEmail}
                                        onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="pt-6">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-black py-5 rounded-[28px] shadow-sm transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : <CheckCircle2 size={24} />}
                                    Finalize Enrollment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Students;

