import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Loader2, Award, Calendar, Users, ShieldCheck, CheckCircle } from 'lucide-react';
import API from '../../api';
import PremiumCard from '../../components/ui/PremiumCard';

const ParentActivities = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [childrenList, setChildrenList] = useState([]);
    const [selectedChildId, setSelectedChildId] = useState('');
    const [activities, setActivities] = useState([]);

    const fetchChildrenList = useCallback(async () => {
        try {
            const res = await API.get('/api/students/children');
            setChildrenList(res.data);
            if (res.data.length > 0 && !selectedChildId) {
                setSelectedChildId(res.data[0].rollNumber || res.data[0].studentId);
            }
        } catch (err) {
            console.error("Historical link retrieval failure", err);
        }
    }, [user.token, selectedChildId]);

    const fetchActivities = useCallback(async () => {
        if (!selectedChildId) return;
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const studentRes = await API.get(`/api/students/profile?childId=${selectedChildId}`, config);
            const child = studentRes.data;

            if (child) {
                const rollNo = (child.rollNumber || child.studentId)?.toUpperCase();
                const activitiesRes = await API.get(`/api/activities/student/${rollNo}`, config);
                setActivities(activitiesRes.data || []);
            }
        } catch (err) {
            console.error("Data fetch failure", err);
        } finally {
            setLoading(false);
        }
    }, [user.token, selectedChildId]);

    useEffect(() => {
        if (user.token) fetchChildrenList();
    }, [fetchChildrenList]);

    useEffect(() => {
        if (selectedChildId) fetchActivities();
    }, [fetchActivities, selectedChildId]);

    if (loading && childrenList.length === 0) return <div className="flex justify-center mt-32"><Loader2 className="animate-spin text-orange-600" size={48} /></div>;

    if (childrenList.length === 0) return (
        <div className="bg-orange-50 border border-orange-100 p-12 rounded-3xl text-center max-w-2xl mx-auto mt-16">
            <ShieldCheck className="mx-auto text-orange-500 mb-6" size={64} />
            <h2 className="text-2xl font-black text-slate-900 mb-2">Guardian Link Required</h2>
            <p className="text-slate-600">No student profile is currently mapped to your parent account.</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Activity Portfolio</h1>
                    <p className="text-slate-500 mt-1">Review your ward's institutional co-curricular engagements.</p>
                </div>
                <PremiumCard className="!p-2 flex items-center gap-2">
                    <div className="pl-4 pr-2 flex items-center gap-2 text-slate-400">
                        <Users size={16} />
                        <span className="text-xs font-bold uppercase tracking-widest">Active Ward:</span>
                    </div>
                    {childrenList.map(child => (
                        <button
                            key={child._id}
                            onClick={() => setSelectedChildId(child.rollNumber || child.studentId)}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${selectedChildId === (child.rollNumber || child.studentId) ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            {child.fullName.split(' ')[0]}
                        </button>
                    ))}
                </PremiumCard>
            </div>

            {loading ? <div className="flex justify-center py-20"><Loader2 className="animate-spin text-orange-600" size={48} /></div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {activities.length === 0 ? (
                        <div className="col-span-full py-16 bg-slate-50 border-2 border-dashed border-slate-200 text-center rounded-3xl">
                            <Award size={48} className="mx-auto text-slate-300 mb-4" />
                            <p className="text-slate-500 font-bold">No institutional activities logged for this ward.</p>
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
            )}
        </div>
    );
};

export default ParentActivities;
