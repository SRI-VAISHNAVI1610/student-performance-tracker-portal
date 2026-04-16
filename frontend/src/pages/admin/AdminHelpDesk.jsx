import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Search, KeyRound, Loader2, AlertCircle } from 'lucide-react';
import API from '../../api';
import PremiumCard from '../../components/ui/PremiumCard';

const AdminHelpDesk = () => {
    const { user } = useAuth();
    const [usersList, setUsersList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState(''); // limit to student/teacher
    
    const [selectedUser, setSelectedUser] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const res = await API.get('/api/users', config);
                // Help desk is requested for student and teacher primarily
                const fetchedUsers = res.data || [];
                setUsersList(fetchedUsers.filter(u => u.role === 'student' || u.role === 'staff'));
            } catch (error) {
                console.error("Failed to fetch users", error.response?.data || error);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [user]);

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setMessage('');
        
        if (!selectedUser) {
            setMessageType('error');
            setMessage('Please select a user first.');
            return;
        }

        setIsSubmitting(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await API.put(`/api/users/${selectedUser._id}`, { password: newPassword }, config);
            
            setMessageType('success');
            setMessage(`Password successfully reset for ${selectedUser.name}!`);
            setNewPassword('');
            setSelectedUser(null);
        } catch (error) {
            console.error("API ERROR:", error.response?.data || error.message);
            setMessageType('error');
            setMessage(error.response?.data?.message || 'Password reset failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredUsers = usersList.filter(u => {
        const rollNo = u.studentProfile?.rollNumber || '';
        const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             rollNo.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === '' || u.role === roleFilter;
        return matchesSearch && matchesRole;
    }).slice(0, 50); // limit display

    if (loading) {
        return (
            <div className="flex justify-center mt-32">
                <Loader2 className="animate-spin text-primary-600" size={48} />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Help Desk</h1>
                <p className="text-slate-500 mt-1">Manage physical access, override passwords, and resolve identity lockouts.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Search & Select Section */}
                <PremiumCard className="h-[600px] flex flex-col !p-0">
                    <div className="p-8 border-b border-slate-100 flex flex-col flex-1 h-full">
                        <h3 className="text-xl font-bold text-slate-900 mb-6">1. Locate User</h3>
                    
                    <div className="space-y-4 mb-6">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                                type="text" 
                                placeholder="Search by name, email, or roll..." 
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-primary-500"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <select 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none font-bold text-slate-600"
                            value={roleFilter}
                            onChange={e => setRoleFilter(e.target.value)}
                        >
                            <option value="">All Supported Roles</option>
                            <option value="student">Student</option>
                            <option value="staff">Teacher</option>
                        </select>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        {filteredUsers.map(u => (
                            <div 
                                key={u._id}
                                onClick={() => setSelectedUser(u)}
                                className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedUser?._id === u._id ? 'bg-primary-50 border-primary-500 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-300'}`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-slate-800">{u.name}</h4>
                                        <p className="text-sm text-slate-500">{u.email}</p>
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${u.role === 'student' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                        {u.role === 'staff' ? 'Teacher' : 'Student'}
                                    </span>
                                </div>
                                {u.role === 'student' && u.studentProfile?.rollNumber && (
                                    <p className="text-xs font-bold text-slate-400 mt-2">Roll: {u.studentProfile.rollNumber}</p>
                                )}
                            </div>
                        ))}
                        {filteredUsers.length === 0 && (
                            <div className="text-center text-slate-400 font-medium py-8">No users found.</div>
                        )}
                    </div>
                    </div>
                </PremiumCard>

                {/* Reset Action Section */}
                <PremiumCard className="h-fit sticky top-24">
                    <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <ShieldCheck className="text-primary-600" />
                        2. Execute Override
                    </h3>

                    {message && (
                        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 font-bold ${messageType === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
                            <AlertCircle size={20} />
                            <span>{message}</span>
                        </div>
                    )}

                    {!selectedUser ? (
                        <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-8 text-center">
                            <KeyRound className="mx-auto text-slate-300 mb-3" size={32} />
                            <p className="text-slate-500 font-bold">Select a user from the directory to begin the reset sequence.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleResetPassword} className="space-y-6">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Target User</p>
                                <p className="text-lg font-black text-slate-900">{selectedUser.name}</p>
                                <p className="text-sm font-medium text-slate-600">{selectedUser.email}</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">New Authorization Token (Password)</label>
                                <input 
                                    required 
                                    type="password" 
                                    placeholder="Enter new strong password"
                                    className="w-full bg-white border border-slate-300 rounded-xl py-3 px-4 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all font-medium"
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    minLength="6"
                                />
                                <p className="text-xs text-slate-500">Must be at least 6 characters long.</p>
                            </div>

                            <button 
                                disabled={isSubmitting || !newPassword} 
                                type="submit" 
                                className="w-full px-6 py-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:active:scale-100"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <KeyRound size={20} />}
                                Force Password Reset
                            </button>
                        </form>
                    )}
                </PremiumCard>
            </div>
        </div>
    );
};

export default AdminHelpDesk;