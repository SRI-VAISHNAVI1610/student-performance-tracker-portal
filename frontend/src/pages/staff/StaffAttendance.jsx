import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Save, Loader2, BookOpen, AlertCircle, UserCheck, UserX } from 'lucide-react';
import API from '../../api';
import PremiumCard from '../../components/ui/PremiumCard';

const StaffAttendance = () => {
    const { user } = useAuth();

    const [students, setStudents] = useState([]);
    const [subjects, setSubjects] = useState([]);

    const [selectedSubject, setSelectedSubject] = useState("");
    const [selectedSemester, setSelectedSemester] = useState(1); // ✅ FIXED

    const [attendanceData, setAttendanceData] = useState([]);

    const [loading, setLoading] = useState(true);

    const [attendanceDate, setAttendanceDate] = useState(
        new Date().toISOString().split('T')[0]
    );

    const [attendanceMap, setAttendanceMap] = useState({});

    const [isSubmitting, setIsSubmitting] = useState(false);

    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    // ✅ FETCH STUDENTS + SUBJECTS
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [stdRes, subRes] = await Promise.all([
                    API.get('/api/students'),
                    API.get('/api/subjects')
                ]);

                setStudents(stdRes.data || []);

                const assignedSubjects = (subRes.data || []).filter(
                    s => s.staffId?._id === user?._id || user?.role === 'admin'
                );

                setSubjects(assignedSubjects || []);

                if (assignedSubjects.length > 0) {
                    setSelectedSubject(assignedSubjects[0]._id);
                }

            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    // ✅ SAFE SUBJECT OBJECT
    const selectedSubObj = (subjects || []).find(
        sub => sub._id === selectedSubject
    );

    const fetchAttendance = async () => {
        try {
            const res = await API.get(`/api/attendance?subject=${selectedSubject}&semester=${selectedSemester}`);
            setAttendanceData(res.data || []);
        } catch (err) {
            console.error("Attendance fetch error:", err);
            setAttendanceData([]);
        }
    };

    useEffect(() => {
        if (selectedSubject && selectedSemester) {
            fetchAttendance();
        }
    }, [selectedSubject, selectedSemester]);

    // ✅ FILTER STUDENTS
    const targetStudents = (students || []).filter(s => {
        if (!selectedSubObj) return false;
        return s.department === selectedSubObj.department;
    });

    // ✅ SUBMIT ATTENDANCE
    const handleBulkAttendance = async () => {
        setMessage('');
        setIsSubmitting(true);

        try {
            console.log("Sending attendance:", attendanceMap);

            await API.post('/api/attendance/bulk', {
                date: attendanceDate,
                subjectId: selectedSubject,
                semester: Number(selectedSemester),
                attendanceData: attendanceMap
            });

            setMessageType('success');
            setMessage('Attendance submitted successfully');
            setAttendanceMap({});

        } catch (error) {
            setMessageType('error');
            setMessage(
                error.response?.data?.message || error.message || "Error submitting"
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center mt-32">
                <Loader2 className="animate-spin text-green-500" size={48} />
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-5xl">

            <div>
                <h1 className="text-3xl font-bold text-slate-900">
                    Attendance Entry
                </h1>
                <p className="text-slate-500">
                    Mark student attendance
                </p>
            </div>

            {/* CONTROLS */}
            <PremiumCard className="flex flex-col md:flex-row gap-4 justify-between">

                <div className="flex gap-4 items-center">

                    {/* SUBJECT */}
                    <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="border p-2 rounded bg-white text-slate-900 font-semibold focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all outline-none"
                    >
                        <option value="">Select Subject</option>
                        {(subjects || []).map((s) => (
                            <option key={s._id} value={s._id}>
                                {s.subjectName}
                            </option>
                        ))}
                    </select>

                    {/* SEMESTER */}
                    <select
                        value={selectedSemester}
                        onChange={(e) => setSelectedSemester(e.target.value)}
                        className="border p-2 rounded bg-white text-slate-900 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all outline-none"
                    >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                            <option key={sem} value={sem}>
                                Semester {sem}
                            </option>
                        ))}
                    </select>
                </div>

                {/* DATE */}
                <input
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    className="border p-2 rounded focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all outline-none"
                />
            </PremiumCard>

            {/* MESSAGE */}
            {message && (
                <div className={`p-3 rounded ${messageType === 'error'
                    ? 'bg-red-100 text-red-600'
                    : 'bg-green-100 text-green-700'
                    }`}>
                    {message}
                </div>
            )}

            {/* STUDENTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                {targetStudents.length === 0 && (
                    <p className="text-gray-400">
                        No students found
                    </p>
                )}

                {(targetStudents || []).map((s) => (
                    <div key={s._id} className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-emerald-300 transition-all flex justify-between items-center">

                        <div>
                            <p className="font-bold">{s.fullName}</p>
                            <p className="text-sm text-gray-500">{s.rollNumber}</p>
                        </div>

                        <div className="flex gap-2">

                            <button
                                onClick={() =>
                                    setAttendanceMap(prev => ({
                                        ...prev,
                                        [s.rollNumber]: 'present'
                                    }))
                                }
                                className={`p-2 rounded ${attendanceMap[s.rollNumber] === 'present'
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-200'
                                    }`}
                            >
                                <UserCheck size={16} />
                            </button>

                            <button
                                onClick={() =>
                                    setAttendanceMap(prev => ({
                                        ...prev,
                                        [s.rollNumber]: 'absent'
                                    }))
                                }
                                className={`p-2 rounded ${attendanceMap[s.rollNumber] === 'absent'
                                    ? 'bg-red-500 text-white'
                                    : 'bg-gray-200'
                                    }`}
                            >
                                <UserX size={16} />
                            </button>

                        </div>
                    </div>
                ))}
            </div>

            {/* SUBMIT */}
            {targetStudents.length > 0 && (
                <button
                    onClick={handleBulkAttendance}
                    disabled={isSubmitting || Object.keys(attendanceMap).length === 0}
                    className="bg-emerald-500 text-white px-8 py-4 rounded-xl hover:bg-emerald-600 disabled:opacity-50 transition-all active:scale-95 shadow-md font-black w-full flex items-center justify-center gap-2"
                >
                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    {isSubmitting ? 'Submitting Data...' : 'Submit Final Attendance'}
                </button>
            )}

        </div>
    );
};

export default StaffAttendance;