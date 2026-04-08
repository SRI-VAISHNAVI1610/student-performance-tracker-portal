import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Loader2, Plus, Award, CheckCircle2, AlertCircle, Calendar } from 'lucide-react';
import axios from 'axios';
import PremiumCard from '../../components/ui/PremiumCard';

const StudentActivities = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [activities, setActivities] = useState([]);
    const [profile, setProfile] = useState(null);

    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activityForm, setActivityForm] = useState({ activityName: '', type: 'Workshop', description: '', semester: '1' });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const profileRes = await axios.get('http://localhost:5000/api/students/profile', config);
            const myProfile = profileRes.data;
            setProfile(myProfile);

            const rollNo = (myProfile.rollNumber || myProfile.studentId)?.toUpperCase();
            if (!rollNo) throw new Error("No roll number found");

            const activityRes = await axios.get(`http://localhost:5000/api/activities/student/${rollNo}`, config);
            setActivities(activityRes.data || []);
        } catch (error) {
            console.error("Failed to load activities", error);
        } finally {
            setLoading(false);
        }
    }, [user.token]);

    useEffect(() => {
        if (user.token) fetchData();
    }, [fetchData, user.token]);

    const handleActivitySubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post('http://localhost:5000/api/activities', {
                ...activityForm,
                rollNumber: (profile.rollNumber || profile.studentId)?.toUpperCase()
            }, config);

            setShowForm(false);
            setActivityForm({ activityName: '', type: 'Workshop', description: '', semester: '1' });
            fetchData(); // Refresh list
        } catch (err) {
            alert("Submission error. Verify network connectivity.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="flex justify-center mt-32"><Loader2 className="animate-spin text-purple-600" size={48} /></div>;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Activity Portfolio</h1>
                    <p className="text-slate-500 mt-1">Submit and track your institutional co-curricular engagements.</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-purple-600 text-white px-6 py-3 rounded-xl font-black text-sm uppercase tracking-widest flex items-center gap-2 hover:bg-purple-700 transition-all shadow-lg active:scale-95 whitespace-nowrap"
                >
                    {showForm ? 'Cancel Submission' : <><Plus size={18} /> New Submission</>}
                </button>
            </div>

            {showForm && (
                <PremiumCard className="border-2 border-purple-100 animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2"><Award className="text-purple-600" /> Register Co-Curricular Activity</h3>
                    <form onSubmit={handleActivitySubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Activity/Event Name</label>
                                <input
                                    type="text" required placeholder="e.g. AWS Cloud Workshop"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 font-bold transition-all"
                                    value={activityForm.activityName}
                                    onChange={(e) => setActivityForm({ ...activityForm, activityName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Category</label>
                                <select
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 font-bold appearance-none cursor-pointer transition-all"
                                    value={activityForm.type}
                                    onChange={(e) => setActivityForm({ ...activityForm, type: e.target.value })}
                                >
                                    <option value="Workshop">Workshop</option>
                                    <option value="Competition">Competition</option>
                                    <option value="Project">Project</option>
                                    <option value="Certification">Certification</option>
                                </select>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Description / Evidence Link</label>
                                <textarea
                                    required placeholder="Provide context or a verifiable link" rows="2"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 font-medium transition-all"
                                    value={activityForm.description}
                                    onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                                />
                            </div>
                        </div>
                        <button
                            type="submit" disabled={isSubmitting}
                            className="bg-purple-500 hover:bg-purple-600 text-white font-black py-4 px-8 rounded-xl transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 shadow-sm"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                            Submit for Staff Verification
                        </button>
                    </form>
                </PremiumCard>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activities.length === 0 && !showForm ? (
                    <div className="col-span-full py-16 bg-slate-50 border-2 border-dashed border-slate-200 text-center rounded-3xl">
                        <Award size={48} className="mx-auto text-slate-300 mb-4" />
                        <p className="text-slate-500 font-bold">No institutional activities logged in your portfolio.</p>
                    </div>
                ) : (
                    activities.map((a, i) => (
                        <PremiumCard key={i} className="hover:border-slate-300 transition-all flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${a.status === 'approved' ? 'bg-emerald-50 text-emerald-700' :
                                        a.status === 'pending' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                                    }`}>
                                        {a.status}
                                    </span>
                                    <div className="flex items-center gap-1 text-slate-400">
                                        <Calendar size={12} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">{new Date(a.dateSubmitted || Date.now()).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <h4 className="text-xl font-black text-slate-900 leading-tight mb-2">{a.activityName}</h4>
                                <p className="text-slate-500 text-sm font-medium mb-6 line-clamp-2">{a.description}</p>
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Type: {a.type}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black uppercase text-slate-400">XP</span>
                                    <span className={`text-xl font-black ${a.status === 'approved' ? 'text-emerald-600' : 'text-slate-300'}`}>{a.points || 0}</span>
                                </div>
                            </div>
                        </PremiumCard>
                    ))
                )}
            </div>
        </div>
    );
};

export default StudentActivities;