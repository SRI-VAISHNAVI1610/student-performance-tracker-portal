import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Loader2, CheckCircle, Award } from 'lucide-react';
import API from '../../api';
import PremiumCard from '../../components/ui/PremiumCard';

const StaffActivities = () => {
    const { user } = useAuth();
    const [pendingActivities, setPendingActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const res = await API.get('/api/activities?status=pending');
                // Can filter by user's department if necessary, but returning all pending for now
                setPendingActivities(res.data.filter(a => a.status === 'pending'));
            } catch (error) {
                console.error("Failed to fetch activities", error);
            } finally {
                setLoading(false);
            }
        };
        fetchActivities();
    }, [user]);

    const handleApprove = async (activityId) => {
        const inputPoints = document.getElementById(`pts-${activityId}`)?.value || 10;
        try {
            await API.put(`/api/activities/${activityId}/review`, { status: 'approved', points: Number(inputPoints) });
            setPendingActivities(prev => prev.filter(a => a._id !== activityId));
        } catch (error) {
            alert("Verification failed.");
        }
    };

    if (loading) return <div className="flex justify-center mt-32"><Loader2 className="animate-spin text-emerald-600" size={48} /></div>;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Activity Approval</h1>
                <p className="text-slate-500 mt-1">Review and assign points for student co-curricular activities.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pendingActivities.length === 0 ? (
                    <div className="col-span-full py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-center">
                        <CheckCircle size={48} className="text-emerald-500 mx-auto mb-4" />
                        <p className="text-slate-500 font-bold">No pending activities require review.</p>
                    </div>
                ) : (
                    pendingActivities.map(a => (
                        <PremiumCard key={a._id} className="flex flex-col justify-between group hover:border-emerald-300 hover:shadow-md transition-all">
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-black text-[10px] uppercase tracking-widest rounded-lg">
                                        {a.category}
                                    </span>
                                    <span className="text-xs font-bold text-slate-400">{new Date(a.dateSubmitted).toLocaleDateString()}</span>
                                </div>
                                <h3 className="text-xl font-black text-slate-900 mb-2">{a.activityName}</h3>
                                <p className="text-slate-500 text-sm font-medium mb-6 line-clamp-3">{a.description}</p>
                                
                                <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
                                    <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-black">
                                        <Award size={18} className="text-slate-400" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800 text-sm">Student Record</p>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{a.rollNumber}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-end gap-4 pt-6">
                                <div className="flex-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Points to Award</label>
                                    <input 
                                        type="number" 
                                        id={`pts-${a._id}`}
                                        defaultValue="10" 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 font-black outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all" 
                                    />
                                </div>
                                <button 
                                    onClick={() => handleApprove(a._id)}
                                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl transition-all shadow-md active:scale-95 whitespace-nowrap"
                                >
                                    Approve
                                </button>
                            </div>
                        </PremiumCard>
                    ))
                )}
            </div>
        </div>
    );
};

export default StaffActivities;