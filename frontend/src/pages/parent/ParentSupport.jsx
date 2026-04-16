import React, { useState } from 'react';
import API from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Loader2, Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import PremiumCard from '../../components/ui/PremiumCard';

const ParentSupport = () => {
    const { user } = useAuth();
    
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [category, setCategory] = useState('Staff');
    const [loading, setLoading] = useState(false);
    const [responseMsg, setResponseMsg] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        setResponseMsg('');
        setError('');

        if (!subject.trim() || !message.trim()) {
            setError('Please fill out all fields.');
            return;
        }

        try {
            setLoading(true);

            if (!user?.token) {
                setError('Authorization failed. Please re-login.');
                return;
            }

            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            };

            await API.post(
                '/api/support',
                { subject, message, category },
                config
            );

            setResponseMsg('Support request sent successfully!');
            setSubject('');
            setMessage('');
            setCategory('Staff');

        } catch (err) {
            console.error("Support error:", err.response?.data || err.message);
            setError(err.response?.data?.message || 'Failed to submit support request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-8 space-y-6">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    Support Desk
                </h1>
                <p className="text-slate-500 mt-1 font-medium">
                    Send queries directly to the staff or management securely.
                </p>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3 font-medium animate-in fade-in slide-in-from-top-2">
                    <AlertCircle size={20} className="shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            {responseMsg && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 px-4 py-3 rounded-xl flex items-center gap-3 font-medium animate-in fade-in slide-in-from-top-2">
                    <CheckCircle2 size={20} className="shrink-0" />
                    <p>{responseMsg}</p>
                </div>
            )}

            <PremiumCard className="p-8">
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">
                            Category
                        </label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full border border-slate-300 bg-slate-50 text-slate-900 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-semibold cursor-pointer"
                        >
                            <option value="Staff">Academic Staff</option>
                            <option value="Management">College Management</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">
                            Subject
                        </label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Brief title for your query"
                            className="w-full border border-slate-300 bg-slate-50 text-slate-900 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">
                            Detailed Message
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Explain your query clearly..."
                            rows={6}
                            className="w-full border border-slate-300 bg-slate-50 text-slate-900 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium resize-y"
                        />
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-orange-500/20 hover:shadow-orange-500/40 active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <>
                                <Send size={20} />
                                Submit Request
                            </>
                        )}
                    </button>
                </div>
            </PremiumCard>
        </div>
    );
};

export default ParentSupport;
