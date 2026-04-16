import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useAuth } from '../../context/AuthContext';

const Layout = () => {
    const { user } = useAuth();

    const getRoleBg = () => {
        if (!user) return 'from-slate-50';

        const role = user.role?.toLowerCase();

        switch (role) {
            case 'admin': return 'from-blue-50';
            case 'staff': return 'from-emerald-50';
            case 'student': return 'from-purple-50';
            case 'parent': return 'from-orange-50';
            default: return 'from-slate-50';
        }
    };

    return (
        <div className={`min-h-screen bg-gradient-to-br ${getRoleBg()} via-white to-slate-100 flex`}>

            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="flex-1 flex flex-col ml-64 min-h-screen">
                <Navbar />

                <main className="flex-1 p-8 overflow-y-auto relative">

                    {/* Background Glow */}
                    <div className="absolute top-0 left-0 w-full h-80 bg-white/30 backdrop-blur-2xl -z-10 pointer-events-none" />

                    <div className="max-w-[1400px] mx-auto w-full transition-all duration-300">
                        <Outlet />
                    </div>

                </main>
            </div>
        </div>
    );
};

export default Layout;