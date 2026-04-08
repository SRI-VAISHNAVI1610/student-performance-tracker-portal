import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Users, BookOpen, Shield, Loader2, Trash2, Mail, Briefcase } from 'lucide-react';
import axios from 'axios';
import StatCard from '../../components/ui/StatCard';
import PremiumCard from '../../components/ui/PremiumCard';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ students: 0, staff: 0, subjects: 0 });
    const [usersList, setUsersList] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                if (!user?.token) {
                    setLoading(false);
                    return;
                }
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const [usersRes, subjectRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/users', config),
                    axios.get('http://localhost:5000/api/subjects', config)
                ]);
                
                const users = usersRes.data || [];
                const students = users.filter(u => u.role === 'student');
                const teachers = users.filter(u => u.role === 'staff');
                
                setStats({
                    students: students.length,
                    staff: teachers.length,
                    subjects: subjectRes.data?.length || 0
                });
                setUsersList(users);
            } catch (error) {
                console.error("API ERROR:", error.response?.data || error.message);
                setUsersList([]);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user]);

    const handleDeleteUser = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`http://localhost:5000/api/users/${id}`, config);
            setUsersList(usersList.filter(u => u._id !== id));
        } catch (error) {
            console.error("Failed to delete user", error);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <Loader2 className="animate-spin text-primary-600" size={48} />
                <p className="text-slate-500 font-medium">Loading Overview Data...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Overview</h1>
                <p className="text-slate-500 mt-1">High-level institutional statistics.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <StatCard title="Total Students" value={stats.students} icon={Users} color="blue" />
                <StatCard title="Total Teachers" value={stats.staff} icon={Shield} color="emerald" />
                <StatCard title="Total Subjects" value={stats.subjects} icon={BookOpen} color="purple" />
            </div>

            {/* Manage Users Section */}
            <PremiumCard className="mt-8 !p-0">
                <div className="p-8 border-b border-slate-100/50 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Manage Users</h2>
                        <p className="text-slate-500 text-sm mt-1 font-medium">View and remove accounts</p>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-white border-b border-slate-100">
                            <tr>
                                <th className="text-left py-4 px-8 text-xs font-black uppercase tracking-widest text-slate-400">User Details</th>
                                <th className="text-left py-4 px-6 text-xs font-black uppercase tracking-widest text-slate-400">Role</th>
                                <th className="text-right py-4 px-8 text-xs font-black uppercase tracking-widest text-slate-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {(!usersList || usersList.length === 0) ? (
                                <tr>
                                    <td colSpan="3" className="py-8 text-center text-slate-400 font-medium">No data available</td>
                                </tr>
                            ) : (
                                (usersList || []).map((u) => (
                                    <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="py-4 px-8">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl justify-center items-center flex font-bold bg-slate-100 text-slate-600">
                                                    {u.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">{u.name}</p>
                                                    <div className="flex items-center gap-1 mt-1 text-slate-400 text-sm">
                                                        <Mail size={12} /> {u.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`inline-flex items-center gap-1 font-bold px-3 py-1 rounded-lg text-xs uppercase tracking-wider
                                                ${u.role === 'admin' ? 'bg-red-50 text-red-600' : ''}
                                                ${u.role === 'staff' ? 'bg-emerald-50 text-emerald-600' : ''}
                                                ${u.role === 'student' ? 'bg-blue-50 text-blue-600' : ''}
                                                ${u.role === 'parent' ? 'bg-purple-50 text-purple-600' : ''}
                                            `}>
                                                <Briefcase size={12} /> {u.role}
                                            </span>
                                        </td>
                                        <td className="py-4 px-8 text-right">
                                            <button 
                                                onClick={() => handleDeleteUser(u._id)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                                title="Delete User"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </PremiumCard>
        </div>
    );
};

export default AdminDashboard;