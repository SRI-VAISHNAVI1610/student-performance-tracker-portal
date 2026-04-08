import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard,
    GraduationCap,
    CalendarCheck,
    Award,
    Users,
    Settings,
    FileSpreadsheet,
    FileText,
    LogOut
} from 'lucide-react';

const Sidebar = () => {
    const { user, logout } = useAuth();

    if (!user) return null;

    const role = user.role.toLowerCase();

    const roleNavItems = {
        student: [
            { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
            { name: 'Marks View', icon: GraduationCap, path: '/marks' },
            { name: 'Attendance View', icon: CalendarCheck, path: '/attendance' },
            { name: 'Activity Request', icon: Award, path: '/activities' },
            { name: 'Download Report', icon: FileText, path: '/report' }
        ],
        parent: [
            { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
            { name: 'Support Desk', icon: FileText, path: '/support' },
            { name: 'Download Report', icon: FileText, path: '/report' }
        ],
        staff: [
            { name: 'Overview', icon: LayoutDashboard, path: '/' },
            { name: 'Marks Entry', icon: FileSpreadsheet, path: '/marks' },
            { name: 'Attendance', icon: Users, path: '/attendance' },
            { name: 'Activity Approval', icon: Award, path: '/activities' },
            { name: 'Download Report', icon: FileText, path: '/report' }
        ],
        admin: [
            { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
            { name: 'Create & Assign', icon: Settings, path: '/manage' },
            { name: 'Help Desk', icon: FileText, path: '/helpdesk' }
        ]
    };

    const navItems = roleNavItems[role] || [];

    const themeMap = {
        admin: { activeBg: 'bg-blue-50 text-blue-600 border-l-4 border-blue-500', iconColor: 'text-blue-500' },
        staff: { activeBg: 'bg-emerald-50 text-emerald-600 border-l-4 border-emerald-500', iconColor: 'text-emerald-500' },
        student: { activeBg: 'bg-purple-50 text-purple-600 border-l-4 border-purple-500', iconColor: 'text-purple-500' },
        parent: { activeBg: 'bg-orange-50 text-orange-600 border-l-4 border-orange-500', iconColor: 'text-orange-500' }
    };

    const t = themeMap[role] || themeMap.student;

    return (
        <aside className="fixed left-0 top-0 h-full w-64 bg-white text-slate-800 shadow-sm z-50 overflow-y-auto">
            <div className="flex flex-col h-full">

                {/* Logo */}
                <div className="p-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500 rounded-lg">
                            <GraduationCap className="text-white" size={24} />
                        </div>
                        <span className="text-xl font-bold">SPT ERP</span>
                    </div>
                </div>

                {/* Menu */}
                <nav className="flex-1 px-4 py-6">
                    <ul className="space-y-2">
                        {navItems.map((item) => (
                            <li key={item.name}>
                                <NavLink
                                    to={item.path}
                                    end={item.path === '/'}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all
                                        ${isActive
                                            ? `${t.activeBg}`
                                            : 'text-slate-500 hover:bg-slate-100'}`
                                    }
                                >
                                    {({ isActive }) => (
                                        <>
                                            <item.icon
                                                size={20}
                                                className={isActive ? t.iconColor : ''}
                                            />
                                            <span>{item.name}</span>
                                        </>
                                    )}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100">
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    >
                        <LogOut size={20} />
                        <span>Sign Out</span>
                    </button>
                </div>

            </div>
        </aside>
    );
};

export default Sidebar;