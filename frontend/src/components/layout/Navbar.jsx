import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell, User, Search, Check, AlertCircle, Info, CheckCircle2, Clock } from 'lucide-react';

const MOCK_NOTIFICATIONS = [
    { id: 1, title: 'System Maintenance', message: 'Servers will reboot at 2:00 AM.', time: '2h ago', type: 'alert', read: false },
    { id: 2, title: 'Exam Schedule', message: 'Final exam timetable is updated.', time: '5h ago', type: 'info', read: false },
    { id: 3, title: 'Welcome to SPT', message: 'Explore the new dashboard UI.', time: '1d ago', type: 'success', read: true }
];

const Navbar = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAllRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    if (!user) return null;

    return (
        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-8 shadow-sm">
            {/* Left side: Portal Title */}
            <div className="flex items-center gap-4 flex-1">
                <h2 className="text-xl font-black tracking-tight text-slate-800 uppercase">
                    {user.role === 'admin' && 'Admin Portal'}
                    {user.role === 'staff' && 'Staff Portal'}
                    {user.role === 'student' && 'Student Portal'}
                    {user.role === 'parent' && 'Parent Portal'}
                </h2>
            </div>

            {/* Right side: User Actions */}
            <div className="flex items-center gap-6">
                <div className="relative" ref={dropdownRef}>
                    <button 
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="relative text-slate-500 hover:text-primary-600 transition-colors p-2 hover:bg-slate-50 rounded-lg"
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 ring-2 ring-white text-[8px] font-black text-white">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    {/* Notifications Dropdown */}
                    {showDropdown && (
                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <h3 className="font-extrabold text-slate-900 tracking-tight">Notifications</h3>
                                {unreadCount > 0 && (
                                    <button 
                                        onClick={markAllRead}
                                        className="text-[11px] font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1 bg-primary-50 px-2 py-1 rounded-md"
                                    >
                                        <Check size={12} /> Mark all read
                                    </button>
                                )}
                            </div>
                            
                            <div className="max-h-[320px] overflow-y-auto">
                                {notifications.length > 0 ? (
                                    notifications.map(notif => (
                                        <div key={notif.id} className={`p-4 border-b border-slate-50 flex gap-3 hover:bg-slate-50 transition-colors cursor-pointer ${notif.read ? 'opacity-60' : 'bg-slate-50/50'}`}>
                                            <div className="mt-1">
                                                {notif.type === 'alert' && <AlertCircle size={16} className="text-red-500" />}
                                                {notif.type === 'info' && <Info size={16} className="text-blue-500" />}
                                                {notif.type === 'success' && <CheckCircle2 size={16} className="text-emerald-500" />}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-0.5">
                                                    <p className={`text-sm ${notif.read ? 'font-semibold text-slate-700' : 'font-extrabold text-slate-900'}`}>{notif.title}</p>
                                                    {!notif.read && <div className="h-2 w-2 bg-primary-500 rounded-full mt-1"></div>}
                                                </div>
                                                <p className="text-xs font-medium text-slate-500 line-clamp-2">{notif.message}</p>
                                                <div className="flex items-center gap-1 mt-2 text-[10px] font-bold text-slate-400 capitalize">
                                                    <Clock size={10} /> {notif.time}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-slate-400 font-bold text-sm">
                                        All caught up!
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="h-8 w-px bg-slate-200 mx-1"></div>

                <div className="flex items-center gap-3 pl-2">
                    <div className="text-right flex flex-col justify-center">
                        <p className="text-sm font-semibold text-slate-800 leading-tight">{user.name}</p>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{user.role}</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary-600 to-indigo-500 p-0.5 shadow-md">
                        <div className="h-full w-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                            {user.profilePicture ? (
                                <img src={user.profilePicture} alt="Profile" className="h-full w-full object-cover" />
                            ) : (
                                <User className="text-primary-600" size={20} />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
