import React, { useState, useEffect } from 'react';
import {
    Users as UsersIcon,
    UserPlus,
    Search,
    Loader2,
    Edit3,
    Trash2,
    X,
    CheckCircle2,
    Shield,
    Briefcase,
    GraduationCap,
    Heart,
    MoreHorizontal,
    Mail,
    Lock,
    ToggleLeft,
    ChevronRight,
    AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../api';

const UsersPage = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchUsers = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${currentUser.token}` } };
            const res = await API.get(`/api/users?role=${roleFilter}&search=${searchQuery}`, config);
            setUsers(res.data);
        } catch (err) {
            console.error("User directory sync failure:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [currentUser.token, roleFilter, searchQuery]);

    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Student', status: 'Active' });

    const handleAddUser = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const config = { headers: { Authorization: `Bearer ${currentUser.token}` } };
            await API.post('/api/users', formData, config);
            setShowModal(false);
            fetchUsers();
            resetForm();
        } catch (err) {
            alert(err.response?.data?.message || "User provisioning failed.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditClick = (u) => {
        setSelectedUser(u);
        setFormData({ name: u.name, email: u.email, role: u.role, status: u.status, password: '' });
        setIsEditing(true);
        setShowModal(true);
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const config = { headers: { Authorization: `Bearer ${currentUser.token}` } };
            await API.put(`/api/users/${selectedUser._id}`, formData, config);
            setShowModal(false);
            setIsEditing(false);
            fetchUsers();
            resetForm();
        } catch (err) {
            alert(err.response?.data?.message || "Identity update failed.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm("Permanently revoke access for this identity?")) return;
        try {
            const config = { headers: { Authorization: `Bearer ${currentUser.token}` } };
            await API.delete(`/api/users/${id}`, config);
            fetchUsers();
        } catch (err) {
            alert(err.response?.data?.message || "Deprovisioning failed.");
        }
    };

    const resetForm = () => {
        setFormData({ name: '', email: '', password: '', role: 'Student', status: 'Active' });
        setSelectedUser(null);
    };

    const getRoleIcon = (role) => {
        switch (role.toLowerCase()) {
            case 'admin': return <Shield className="text-rose-500" size={16} />;
            case 'staff': return <Briefcase className="text-amber-500" size={16} />;
            case 'student': return <GraduationCap className="text-blue-500" size={16} />;
            case 'parent': return <Heart className="text-emerald-500" size={16} />;
            default: return <UsersIcon size={16} />;
        }
    };

    const getRoleStyles = (role) => {
        switch (role.toLowerCase()) {
            case 'admin': return "bg-rose-50 text-rose-600 border-rose-100";
            case 'staff': return "bg-amber-50 text-amber-600 border-amber-100";
            case 'student': return "bg-blue-50 text-blue-600 border-blue-100";
            case 'parent': return "bg-emerald-50 text-emerald-600 border-emerald-100";
            default: return "bg-slate-50 text-slate-600 border-slate-100";
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none flex items-center gap-4">
                        <UsersIcon className="text-indigo-600" size={36} />
                        Access <span className="text-indigo-600">Control</span>
                    </h1>
                    <p className="text-slate-500 mt-3 font-medium text-lg">
                        Managing {users.length} authenticated institution identities
                    </p>
                </div>

                <button
                    onClick={() => { resetForm(); setIsEditing(false); setShowModal(true); }}
                    className="bg-indigo-600 text-white px-8 py-4 rounded-[32px] font-black text-sm uppercase tracking-widest flex items-center gap-3 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
                >
                    <UserPlus size={18} />
                    Provision User
                </button>
            </div>

            {/* Filter Matrix */}
            <div className="bg-white p-6 rounded-[40px] shadow-sm border border-slate-100 flex flex-col xl:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name or email identity..."
                        className="w-full bg-slate-50 border-2 border-transparent rounded-[24px] py-4 pl-14 pr-6 outline-none focus:bg-white focus:border-indigo-500/20 focus:ring-4 focus:ring-indigo-500/5 transition-all font-bold text-slate-900 placeholder:text-slate-400"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-3 w-full xl:w-auto">
                    <select
                        className="flex-1 xl:w-48 bg-slate-50 border-2 border-transparent rounded-2xl py-3 px-6 outline-none focus:bg-white focus:border-indigo-500/20 font-black text-xs uppercase tracking-widest text-slate-600 cursor-pointer transition-all appearance-none"
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                    >
                        <option value="">All Roles</option>
                        <option value="Admin">Admin</option>
                        <option value="Staff">Staff</option>
                        <option value="Student">Student</option>
                        <option value="Parent">Parent</option>
                    </select>

                    <button
                        onClick={() => { setRoleFilter(''); setSearchQuery(''); }}
                        className="p-3 bg-slate-100 text-slate-400 rounded-2xl hover:bg-slate-200 hover:text-slate-600 transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Users Data Grid */}
            <div className="bg-white rounded-[48px] shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="text-left py-6 px-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Identity</th>
                                <th className="text-left py-6 px-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">System Role</th>
                                <th className="text-left py-6 px-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Auth Status</th>
                                <th className="text-right py-6 px-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Management</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="py-20 text-center">
                                        <Loader2 className="animate-spin text-indigo-600 mx-auto" size={40} />
                                        <p className="text-slate-400 font-bold mt-4 uppercase tracking-widest text-xs">Querying Auth Vault...</p>
                                    </td>
                                </tr>
                            ) : (
                                users.map((u) => (
                                    <tr key={u._id} className="group hover:bg-slate-50/50 transition-all">
                                        <td className="py-6 px-10">
                                            <div className="flex items-center gap-5">
                                                <div className="h-12 w-12 bg-slate-100 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-lg group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                    {u.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 leading-tight">{u.name}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Mail size={12} className="text-slate-300" />
                                                        <p className="text-[10px] font-bold text-slate-400 tracking-wide uppercase">{u.email}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-6 px-10">
                                            <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getRoleStyles(u.role)}`}>
                                                {getRoleIcon(u.role)}
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="py-6 px-10 whitespace-nowrap">
                                            <div className={`flex items-center gap-2 ${u.status === 'Active' ? 'text-emerald-500' : 'text-slate-300'}`}>
                                                <div className={`h-2 w-2 rounded-full ${u.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
                                                <span className="text-[10px] font-black uppercase tracking-widest">{u.status} identity</span>
                                            </div>
                                        </td>
                                        <td className="py-6 px-10 text-right">
                                            <div className="flex justify-end items-center gap-2">
                                                <button
                                                    onClick={() => handleEditClick(u)}
                                                    className="h-10 w-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-indigo-100 hover:text-indigo-600 transition-all"
                                                >
                                                    <Edit3 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(u._id)}
                                                    className="h-10 w-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-rose-100 hover:text-rose-600 transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                            {!loading && users.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="py-20 text-center">
                                        <div className="max-w-xs mx-auto text-slate-400">
                                            <AlertCircle size={48} className="mx-auto mb-4 opacity-20" />
                                            <p className="font-black uppercase tracking-widest text-xs">No credentialed identities found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Management Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-500/50 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowModal(false)}></div>
                    <div className="relative w-full max-w-lg bg-white rounded-[48px] shadow-2xl p-10 animate-in zoom-in-95 duration-300">
                        <div className="absolute top-0 right-0 p-8">
                            <button onClick={() => setShowModal(false)} className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors pointer-events-auto">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="mb-8">
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none">
                                {isEditing ? 'Update' : 'Initialize'} <span className="text-indigo-600">Identity</span>
                            </h3>
                            <p className="text-slate-500 font-medium mt-2 text-sm">Configure system access levels and credentials.</p>
                        </div>

                        <form onSubmit={isEditing ? handleUpdateUser : handleAddUser} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Display Name</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-[20px] py-4 px-6 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-black text-slate-900 transition-all placeholder:text-slate-300"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Email Identity</label>
                                <input
                                    type="email"
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-[20px] py-4 px-6 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-black text-slate-900 transition-all placeholder:text-slate-300"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">
                                    Secure Password {isEditing && "(Optional)"}
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                    <input
                                        type="password"
                                        minLength={6}
                                        placeholder={isEditing ? "••••••••" : "Min 6 characters"}
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-[20px] py-4 pl-14 pr-6 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-black text-slate-900 transition-all placeholder:text-slate-300"
                                        required={!isEditing}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">System Role</label>
                                    <select
                                        className={`w-full bg-slate-100 border-2 border-transparent rounded-[20px] py-4 px-6 outline-none font-black text-xs uppercase tracking-widest cursor-pointer transition-all appearance-none ${getRoleStyles(formData.role)}`}
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    >
                                        <option value="Admin">Admin</option>
                                        <option value="Staff">Staff</option>
                                        <option value="Student">Student</option>
                                        <option value="Parent">Parent</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Identity Status</label>
                                    <select
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-[20px] py-4 px-6 outline-none focus:border-indigo-500 font-black text-xs uppercase tracking-widest cursor-pointer transition-all appearance-none"
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-6">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-black py-5 rounded-[24px] shadow-sm transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="animate-spin" size={24} />
                                    ) : (
                                        <>
                                            <CheckCircle2 size={24} />
                                            {isEditing ? 'Commit Changes' : 'Initialize Identity'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersPage;

