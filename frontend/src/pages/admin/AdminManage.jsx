import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserPlus, BookOpen, Save, Loader2, AlertCircle } from 'lucide-react';
import API from '../../api';
import PremiumCard from '../../components/ui/PremiumCard';

const AdminManage = () => {
    const { user } = useAuth();
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'success' or 'error'
    const [formMode, setFormMode] = useState('student'); // 'student', 'teacher', 'subject'

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        rollNumber: '',
        department: 'Computer Science',
        semester: '1',
        batchYear: new Date().getFullYear().toString(),
        parentEmail: '',
        subjectName: '',
        subjectCode: '',
        staffId: ''
    });

    useEffect(() => {
        const fetchStaff = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const res = await API.get('/api/users', config);
                const fetchedUsers = res.data || [];
                setStaffList(fetchedUsers.filter(u => u.role === 'staff'));
            } catch (error) {
                console.error("Failed to fetch staff list", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStaff();
    }, [user]);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsSubmitting(true);
        
        try {
            if (formMode === 'student') {
                const payload = {
                    role: 'student',
                    name: formData.name,
                    email: formData.email,
                    password: formData.rollNumber, // default password
                    rollNumber: formData.rollNumber,
                    department: formData.department,
                    semester: formData.semester,
                    batchYear: formData.batchYear,
                    parentEmail: formData.parentEmail
                };
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                await API.post('/api/users', payload, config);
                setMessageType('success');
                setMessage('Student successfully created and assigned to department/semester!');
            } else if (formMode === 'teacher') {
                const payload = {
                    role: 'staff',
                    name: formData.name,
                    email: formData.email,
                    password: formData.email.split('@')[0], // default password
                    department: formData.department,
                    designation: 'Faculty' // explicit simple designation
                };
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                await API.post('/api/users', payload, config);
                setMessageType('success');
                setMessage('Teacher successfully created!');
                
                // Refresh staff list
                const res = await API.get('/api/users', config);
                const freshUsers = res.data || [];
                setStaffList(freshUsers.filter(u => u.role === 'staff'));
            } else if (formMode === 'subject') {
                const payload = {
                    subjectName: formData.subjectName,
                    subjectCode: formData.subjectCode,
                    department: formData.department,
                    semester: formData.semester,
                    credits: 3, // default
                    staffId: formData.staffId
                };
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                await API.post('/api/subjects', payload, config);
                setMessageType('success');
                setMessage('Subject successfully created and assigned to teacher!');
            }
            
            // clear form fields specific to mode
            setFormData(prev => ({ ...prev, name: '', email: '', parentEmail: '', rollNumber: '', subjectName: '', subjectCode: '' }));
            
        } catch (error) {
            console.error("API ERROR:", error.response?.data || error.message);
            setMessageType('error');
            setMessage(error.response?.data?.message || 'Operation failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center mt-32">
                <Loader2 className="animate-spin text-primary-600" size={48} />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create & Assign</h1>
                <p className="text-slate-500 mt-1">Easily onboard new identities and map institutional resources.</p>
            </div>

            <div className="flex gap-4">
                <button
                    onClick={() => { setFormMode('student'); setMessage(''); }}
                    className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${formMode === 'student' ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' : 'bg-white text-slate-600 border border-slate-200'}`}
                >
                    <UserPlus size={18} /> Student Creation
                </button>
                <button
                    onClick={() => { setFormMode('teacher'); setMessage(''); }}
                    className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${formMode === 'teacher' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-white text-slate-600 border border-slate-200'}`}
                >
                    <UserPlus size={18} /> Teacher Creation
                </button>
                <button
                    onClick={() => { setFormMode('subject'); setMessage(''); }}
                    className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${formMode === 'subject' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-white text-slate-600 border border-slate-200'}`}
                >
                    <BookOpen size={18} /> Assign Subject
                </button>
            </div>

            <PremiumCard>
                {message && (
                    <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 font-bold ${messageType === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
                        <AlertCircle size={20} />
                        <span>{message}</span>
                    </div>
                )}

                <form onSubmit={handleFormSubmit} className="space-y-6">
                    {/* Common Name & Email for Users */}
                    {(formMode === 'student' || formMode === 'teacher') && (
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Full Name</label>
                                <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Email Address</label>
                                <input required type="email" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary-500" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                            </div>
                        </div>
                    )}

                    {/* Student Specific */}
                    {formMode === 'student' && (
                        <>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Roll Number</label>
                                    <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-primary-500" value={formData.rollNumber} onChange={e => setFormData({...formData, rollNumber: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Parent/Guardian Email</label>
                                    <input required type="email" placeholder="Auto-generates parent portal" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-primary-500" value={formData.parentEmail} onChange={e => setFormData({...formData, parentEmail: e.target.value})} />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Department</label>
                                    <select className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})}>
                                        <option value="Computer Science">Computer Science</option>
                                        <option value="Information Tech">Information Tech</option>
                                        <option value="Electrical">Electrical</option>
                                        <option value="Mechanical">Mechanical</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Semester</label>
                                    <select className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none" value={formData.semester} onChange={e => setFormData({...formData, semester: e.target.value})}>
                                        {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Batch Year</label>
                                    <input required type="number" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none" value={formData.batchYear} onChange={e => setFormData({...formData, batchYear: e.target.value})} />
                                </div>
                            </div>
                        </>
                    )}

                    {/* Teacher Specific */}
                    {formMode === 'teacher' && (
                        <div className="space-y-2 w-1/2">
                            <label className="text-sm font-bold text-slate-700">Department</label>
                            <select className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})}>
                                <option value="Computer Science">Computer Science</option>
                                <option value="Information Tech">Information Tech</option>
                                <option value="Electrical">Electrical</option>
                                <option value="Mechanical">Mechanical</option>
                            </select>
                        </div>
                    )}

                    {/* Subject Assignment */}
                    {formMode === 'subject' && (
                        <>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Subject Code</label>
                                    <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none" placeholder="e.g. CS101" value={formData.subjectCode} onChange={e => setFormData({...formData, subjectCode: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Subject Name</label>
                                    <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none" value={formData.subjectName} onChange={e => setFormData({...formData, subjectName: e.target.value})} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Department Target</label>
                                    <select className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})}>
                                        <option value="Computer Science">Computer Science</option>
                                        <option value="Information Tech">Information Tech</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Semester Target</label>
                                    <select className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none" value={formData.semester} onChange={e => setFormData({...formData, semester: e.target.value})}>
                                        {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2 w-full">
                                <label className="text-sm font-bold text-slate-700">Assign Teacher (Staff)</label>
                                <select required className="w-full bg-indigo-50 text-indigo-900 border border-indigo-200 rounded-xl py-3 px-4 outline-none font-bold" value={formData.staffId} onChange={e => setFormData({...formData, staffId: e.target.value})}>
                                    <option value="">Select Teacher from roster...</option>
                                    {staffList.map(s => <option key={s._id} value={s._id}>{s.name} ({s.email})</option>)}
                                </select>
                            </div>
                        </>
                    )}

                    <div className="pt-6">
                        <button disabled={isSubmitting} type="submit" className="w-full px-6 py-4 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 active:scale-[0.99] transition-all flex items-center justify-center gap-2">
                            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            {formMode === 'student' ? 'Create & Assign Student' : formMode === 'teacher' ? 'Create Teacher' : 'Deploy Subject Assignment'}
                        </button>
                    </div>
                </form>
            </PremiumCard>
        </div>
    );
};

export default AdminManage;