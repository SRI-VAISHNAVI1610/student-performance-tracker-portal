import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Login from './pages/Login';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminManage from './pages/admin/AdminManage';
import AdminHelpDesk from './pages/admin/AdminHelpDesk';

// Staff
import StaffOverview from './pages/staff/StaffOverview';
import StaffMarks from './pages/staff/StaffMarks';
import StaffAttendance from './pages/staff/StaffAttendance';
import StaffActivities from './pages/staff/StaffActivities';
import StaffReport from './pages/staff/StaffReport';

// Student
import StudentDashboard from './pages/student/StudentDashboard';
import StudentMarks from './pages/student/StudentMarks';
import StudentAttendance from './pages/student/StudentAttendance';
import StudentActivities from './pages/student/StudentActivities';
import StudentReport from './pages/student/StudentReport';

// Parent
import ParentOverview from './pages/parent/ParentOverview';
import ParentMarks from './pages/parent/ParentMarks';
import ParentAttendance from './pages/parent/ParentAttendance';
import ParentActivities from './pages/parent/ParentActivities';
import ParentReport from './pages/parent/ParentReport';
import ParentSupport from './pages/parent/ParentSupport';

const Unauthorized = () => (
    <div className="flex items-center justify-center h-screen text-xl font-bold text-red-500">
        Unauthorized Access
    </div>
);

const LoadingScreen = () => (
    <div className="flex items-center justify-center h-screen text-xl font-bold text-slate-500">
        Loading...
    </div>
);

const RoleRoute = ({ admin, staff, student, parent }) => {
    const { user, loading } = useAuth();

    if (loading) return <LoadingScreen />;
    if (!user) return <Navigate to="/login" replace />;

    if (user.role === 'admin' && admin) return admin;
    if (user.role === 'staff' && staff) return staff;
    if (user.role === 'student' && student) return student;
    if (user.role === 'parent' && parent) return parent;

    return <Navigate to="/unauthorized" replace />;
};

const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return <LoadingScreen />;
    if (user) return <Navigate to="/" replace />;

    return children;
};

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            <Route path="/" element={<Layout />}>
                <Route
                    index
                    element={
                        <RoleRoute
                            admin={<AdminDashboard />}
                            staff={<StaffOverview />}
                            student={<StudentDashboard />}
                            parent={<ParentOverview />}
                        />
                    }
                />

                <Route path="marks" element={<RoleRoute staff={<StaffMarks />} student={<StudentMarks />} parent={<ParentMarks />} />} />
                <Route path="attendance" element={<RoleRoute staff={<StaffAttendance />} student={<StudentAttendance />} parent={<ParentAttendance />} />} />
                <Route path="activities" element={<RoleRoute staff={<StaffActivities />} student={<StudentActivities />} parent={<ParentActivities />} />} />
                <Route path="report" element={<RoleRoute staff={<StaffReport />} student={<StudentReport />} parent={<ParentReport />} />} />

                {/* Parent Support */}
                <Route path="support" element={<RoleRoute parent={<ParentSupport />} />} />

                {/* Admin */}
                <Route path="manage" element={<RoleRoute admin={<AdminManage />} />} />
                <Route path="helpdesk" element={<RoleRoute admin={<AdminHelpDesk />} />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <AppRoutes />
            </Router>
        </AuthProvider>
    );
};

export default App;