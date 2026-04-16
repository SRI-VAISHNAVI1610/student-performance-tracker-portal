import React, { useState, useEffect, useCallback } from 'react';
import {
    Award,
    Plus,
    CheckCircle2,
    XCircle,
    Loader2,
    Clock,
    Zap,
    FileText,
    AlertCircle,
    ChevronRight,
    Filter,
    BarChart3,
    History,
    ShieldCheck,
    ArrowUpRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../api';

const Activities = () => {
    const { user } = useAuth();
    const role = user?.role?.toLowerCase();
    const isTeacher = role === 'staff' || role === 'admin';
    const isStudent = role === 'student';
    const isParent = role === 'parent';

    const [showForm, setShowForm] = useState(false);
    const [activities, setActivities] = useState([]);
    const [requests, setRequests] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ activityName: '', type: 'Competition', semester: '1', description: '' });
    const [pointsData, setPointsData] = useState({});
    const [studentProfile, setStudentProfile] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            if (isTeacher) {
                const res = await API.get('/api/activity-requests/pending', config);
                setPendingRequests(res.data);
            } else if (isStudent) {
                const profileRes = await API.get('/api/students/profile', config);
                const myProfile = profileRes.data;
                setStudentProfile(myProfile);

                const [reqRes, actRes] = await Promise.all([
                    API.get(`/api/activity-requests/me`, config),
                    myProfile ? API.get(`/api/activities/student/${myProfile.studentId}`, config) : Promise.resolve({ data: [] })
                ]);
                setRequests(reqRes.data);
                setActivities(actRes.data);
            } else if (isParent) {
                const profileRes = await API.get('/api/students/profile', config);
                const childProfile = profileRes.data;
                setStudentProfile(childProfile);

                if (childProfile) {
                    const actRes = await API.get(`/api/activities/student/${childProfile.studentId}`, config);
                    setActivities(actRes.data);
                }
            }
        } catch (err) {
            console.error("Activity sync failure:", err);
        } finally {
            setLoading(false);
        }
    }, [user.token, isTeacher, isStudent, isParent]);

    useEffect(() => {
        if (user.token) fetchData();
    }, [fetchData]);

    const handleRequestSubmit = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await API.post('/api/activity-requests', formData, config);
            setShowForm(false);
            fetchData();
        } catch (err) {
            console.error("Submission blocked:", err);
        }
    };

    const handleUpdateStatus = async (requestId, status) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const points = pointsData[requestId] || 0;
            if (status === 'Approved' && !points) return;
            await API.put(`/api/activity-requests/${requestId}`, { status, points }, config);
            fetchData();
        } catch (err) {
            console.error("Status update error:", err);
        }
    };

    const totalPoints = (activities ?? []).reduce((sum, act) => sum + (act.points || 0), 0);

    if (loading) return (
        <div className="h-[60vh] flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-amber-600 mb-4" size={48} />
            <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Accessing Activity Ledger...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none flex items-center gap-4">
                        <Zap className="text-amber-500" size={36} />
                        Activity <span className="text-amber-500">Hub</span>
                    </h1>
                    <p className="text-slate-500 mt-3 font-medium text-lg">
                        {isTeacher ? 'Strategic oversight of student extracurricular engagement' : 'Accelerate your professional portfolio with institutional credits'}
                    </p>
                </div>

                {isStudent && (
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className={`px-8 py-4 rounded-[32px] font-black text-sm uppercase tracking-widest flex items-center gap-3 transition-all shadow-sm active:scale-95 ${showForm ? 'bg-slate-100 text-slate-400' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                    >
                        {showForm ? <XCircle size={18} /> : <Plus size={18} />}
                        {showForm ? 'Abort Request' : 'Claim Credits'}
                    </button>
                )}
            </div>

            {/* Summary Stats (Mobile Friendly) */}
            {!isTeacher && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-amber-50 p-8 rounded-[40px] border-2 border-amber-100/50">
                        <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-3">Institutional Credits</p>
                        <p className="text-4xl font-black text-amber-900">{totalPoints}</p>
                    </div>
                    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Verified Assets</p>
                        <p className="text-4xl font-black text-slate-900">{activities.length}</p>
                    </div>
                    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Pending Scrutiny</p>
                        <p className="text-4xl font-black text-slate-900">{requests.filter(r => r.status === 'Pending').length}</p>
                    </div>
                </div>
            )}

            {isStudent && showForm && (
                <div className="bg-white p-10 rounded-[48px] shadow-sm border border-slate-100 animate-in slide-in-from-top-10 duration-500">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="h-12 w-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center">
                            <FileText size={24} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Credit Acquisition Request</h3>
                    </div>

                    <form onSubmit={handleRequestSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Activity Descriptor</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border-2 border-transparent rounded-[24px] py-4 px-6 outline-none focus:bg-white focus:border-amber-500 font-black text-slate-900 placeholder:text-slate-300 transition-all"
                                    placeholder="Institutional Hackathon"
                                    value={formData.activityName}
                                    onChange={(e) => setFormData({ ...formData, activityName: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Category</label>
                                <select
                                    className="w-full bg-slate-50 border-2 border-transparent rounded-[24px] py-4 px-6 outline-none focus:bg-white focus:border-amber-500 font-black text-xs uppercase tracking-widest text-slate-900 transition-all appearance-none"
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option value="Competition">Competition</option>
                                    <option value="Paper">Paper Presentation</option>
                                    <option value="Project">Research Project</option>
                                    <option value="Other">Standard Asset</option>
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Academic Sem</label>
                                <select
                                    className="w-full bg-slate-50 border-2 border-transparent rounded-[24px] py-4 px-6 outline-none focus:bg-white focus:border-amber-500 font-black text-xs uppercase tracking-widest text-slate-900 transition-all appearance-none"
                                    value={formData.semester}
                                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                                >
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(n => <option key={n} value={n}>Semester {n}</option>)}
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Context / Evidence</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border-2 border-transparent rounded-[24px] py-4 px-6 outline-none focus:bg-white focus:border-amber-500 font-black text-slate-900 placeholder:text-slate-300 transition-all"
                                    placeholder="Position SEC-01"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end pt-4">
                            <button type="submit" className="bg-amber-500 text-white px-12 py-5 rounded-[28px] font-black text-sm uppercase tracking-widest flex items-center gap-3 hover:bg-amber-600 transition-all shadow-xl shadow-amber-500/30 active:scale-95">
                                <CheckCircle2 size={18} />
                                Initialize Request
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {isTeacher && (
                <div className="bg-white rounded-[48px] shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-10 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center">
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Pending Infrastructure Approvals</h3>
                                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Verification queue active</p>
                            </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full">
                            <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{pendingRequests.length} awaiting action</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="text-left py-6 px-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Agent Identity</th>
                                    <th className="text-left py-6 px-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Activity Asset</th>
                                    <th className="text-center py-6 px-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Academic Context</th>
                                    <th className="text-center py-6 px-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Credit Assignment</th>
                                    <th className="text-right py-6 px-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Authorization</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {pendingRequests.map((req) => (
                                    <tr key={req._id} className="group hover:bg-slate-50/30 transition-all">
                                        <td className="py-8 px-10">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-indigo-600">
                                                    {req.studentId?.name?.charAt(0) || 'S'}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-black text-slate-900 tracking-tight text-lg">{req.studentId?.name || 'Unknown Agent'}</span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{req.studentId?.studentId || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-8 px-10">
                                            <div className="flex flex-col">
                                                <span className="font-black text-slate-700 uppercase tracking-widest text-xs leading-none">{req.activityName}</span>
                                                <span className="text-[10px] font-bold text-amber-500 mt-2">{req.type}</span>
                                            </div>
                                        </td>
                                        <td className="py-8 px-10 text-center font-black text-slate-400 text-xs">SEM {req.semester}</td>
                                        <td className="py-8 px-10">
                                            <div className="flex items-center justify-center gap-3">
                                                <input
                                                    type="number"
                                                    className="w-24 bg-white border-2 border-slate-100 rounded-2xl py-3 px-4 outline-none focus:border-rose-500 font-black text-center text-slate-900 transition-all placeholder:text-slate-200 shadow-sm"
                                                    value={pointsData[req._id] || ''}
                                                    onChange={(e) => setPointsData({ ...pointsData, [req._id]: e.target.value })}
                                                    placeholder="0"
                                                />
                                                <span className="text-[10px] font-black text-slate-300 uppercase">PTS</span>
                                            </div>
                                        </td>
                                        <td className="py-8 px-10 text-right">
                                            <div className="flex justify-end gap-3">
                                                <button
                                                    onClick={() => handleUpdateStatus(req._id, 'Approved')}
                                                    className="h-12 w-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                                                >
                                                    <CheckCircle2 size={22} />
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateStatus(req._id, 'Rejected')}
                                                    className="h-12 w-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                                >
                                                    <XCircle size={22} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {pendingRequests.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="py-32 text-center">
                                            <div className="max-w-xs mx-auto text-slate-300">
                                                <ShieldCheck size={48} className="mx-auto mb-4 opacity-20" />
                                                <p className="font-black uppercase tracking-[0.2em] text-[10px]">Verification queue cleared</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Request Timeline / History */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {isStudent && (
                    <div className="bg-white rounded-[48px] shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-10 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Request Matrix</h3>
                            <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full">
                                <History size={14} className="text-slate-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{requests.length} total claims</span>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <tbody className="divide-y divide-slate-50">
                                    {requests.map((req) => (
                                        <tr key={req._id} className="group hover:bg-slate-50/30 transition-all">
                                            <td className="py-6 px-10">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-slate-800 uppercase tracking-widest text-[11px] mb-1">{req.activityName}</span>
                                                    <span className="text-[10px] font-bold text-slate-400">Academic Semester {req.semester}</span>
                                                </div>
                                            </td>
                                            <td className="py-6 px-10 text-right">
                                                <span className={`inline-flex items-center gap-2 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${req.status === 'Approved' ? 'bg-emerald-500 text-white shadow-emerald-500/10' : req.status === 'Rejected' ? 'bg-rose-500 text-white shadow-rose-500/10' : 'bg-amber-500 text-white shadow-amber-500/10'}`}>
                                                    {req.status === 'Pending' ? <Clock size={12} className="animate-spin" /> : <ChevronRight size={12} />}
                                                    {req.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {requests.length === 0 && (
                                        <tr>
                                            <td className="py-24 text-center">
                                                <p className="font-black uppercase tracking-[0.2em] text-[10px] text-slate-300">No requests initialized</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                <div className={`bg-white rounded-[48px] shadow-sm border border-slate-100 overflow-hidden ${!isStudent ? 'lg:col-span-2' : ''}`}>
                    <div className="p-10 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                            {isParent ? `${studentProfile?.name}'s Credit Ledger` : 'Institutional Credit Ledger'}
                        </h3>
                        <div className="h-10 w-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center shadow-sm">
                            <Award size={22} />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-slate-50/30">
                                    <th className="text-left py-6 px-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Activity Asset</th>
                                    <th className="text-center py-6 px-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Verified Credit</th>
                                    <th className="text-right py-6 px-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Record Data</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {activities.map((act) => (
                                    <tr key={act._id} className="group hover:bg-slate-50/30 transition-all">
                                        <td className="py-6 px-10">
                                            <div className="flex flex-col">
                                                <span className="font-black text-slate-800 uppercase tracking-widest text-[11px] mb-1">{act.activityName}</span>
                                                <span className="text-[10px] font-bold text-amber-500">{act.type}</span>
                                            </div>
                                        </td>
                                        <td className="py-6 px-10 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <span className="text-2xl font-black text-emerald-600">+{act.points}</span>
                                                <ArrowUpRight size={14} className="text-emerald-300" />
                                            </div>
                                        </td>
                                        <td className="py-6 px-10 text-right">
                                            <span className="font-extrabold text-slate-900">{new Date(act.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                        </td>
                                    </tr>
                                ))}
                                {activities.length === 0 && (
                                    <tr>
                                        <td colSpan="3" className="py-24 text-center">
                                            <div className="max-w-xs mx-auto text-slate-300">
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
            </div>
        </div>
    );
};

export default Activities;

