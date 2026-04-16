import React, { useState } from 'react';
import API from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Loader2, Send, AlertCircle } from 'lucide-react';
import PremiumCard from '../../components/ui/PremiumCard';

const ParentComplaints = () => {
    const { user } = useAuth();

    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [responseMsg, setResponseMsg] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        setResponseMsg('');
        setError('');

        if (!subject || !message) {
            setError('Please fill all fields');
            return;
        }

        try {
            setLoading(true);

            const config = {
                headers: {
                    Authorization: `Bearer ${user?.token}`
                }
            };

            await API.post(
                '/api/complaints',
                { subject, message },
                config
            );

            setResponseMsg('Complaint submitted successfully!');
            setSubject('');
            setMessage('');

        } catch (err) {
            console.error("Complaint error:", err.response?.data || err.message);
            setError(err.response?.data?.message || 'Failed to submit complaint');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-8 space-y-6">

            {/* TITLE */}
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900">
                    Issue / Complaint
                </h1>
                <p className="text-slate-500 mt-1">
                    Raise concerns regarding your child's academics or system.
                </p>
            </div>

            {/* ERROR MESSAGE */}
            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2">
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}

            {/* SUCCESS MESSAGE */}
            {responseMsg && (
                <div className="bg-green-50 text-green-600 p-4 rounded-xl">
                    {responseMsg}
                </div>
            )}

            {/* FORM */}
            <PremiumCard className="p-8">
                <div className="space-y-6">
                    {/* SUBJECT */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">
                            Subject
                        </label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Enter complaint subject"
                            className="w-full border border-slate-300 bg-slate-50 text-slate-900 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                        />
                    </div>

                    {/* MESSAGE */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">
                            Description
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Describe your issue..."
                            rows={6}
                            className="w-full border border-slate-300 bg-slate-50 text-slate-900 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium resize-y"
                        />
                    </div>

                    {/* BUTTON */}
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-orange-500/20 hover:shadow-orange-500/40 active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none"
                    >
                    {loading ? (
                        <Loader2 className="animate-spin" size={20} />
                    ) : (
                        <>
                            <Send size={18} />
                            Submit Complaint
                        </>
                    )}
                </button>

                </div>
            </PremiumCard>
        </div>
    );
};

export default ParentComplaints;