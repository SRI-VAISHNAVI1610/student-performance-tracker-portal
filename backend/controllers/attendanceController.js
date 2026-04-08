const Attendance = require('../models/Attendance');

// @desc    Get attendance records
// @route   GET /api/attendance
// @access  Private
const getAttendance = async (req, res) => {
    try {
        const role = req.user.role.toLowerCase();
        let filter = { ...req.query };

        if (filter.rollNumber && typeof filter.rollNumber === 'string') {
            filter.rollNumber = { $regex: new RegExp(`^${filter.rollNumber.trim()}$`, 'i') };
        }

        if (req.query.semester) {
            filter.semester = Number(req.query.semester);
        }

        if (role === 'student') {
            const StudentProfile = require('../models/Student');
            const profile = await StudentProfile.findOne({ studentUserId: req.user._id });
            if (profile) filter.rollNumber = profile.rollNumber;
            else return res.json([]);
        }
        else if (role === 'parent') {
            const StudentProfile = require('../models/Student');
            if (req.query.rollNumber) {
                const child = await StudentProfile.findOne({ rollNumber: { $regex: new RegExp(`^${req.query.rollNumber.trim()}$`, 'i') }, parentUserId: req.user._id });
                if (!child) return res.status(403).json({ message: 'Unauthorized child access' });
                filter.rollNumber = child.rollNumber;
            } else {
                const children = await StudentProfile.find({ parentUserId: req.user._id });
                filter.rollNumber = { $in: children.map(c => c.rollNumber) };
            }
        }
        else if (role === 'staff') {
            const Subject = require('../models/Subject');
            const mySubjects = await Subject.find({ staffId: req.user._id });
            const subjectIds = mySubjects.map(s => s._id.toString());

            if (req.query.subjectId) {
                if (!subjectIds.includes(req.query.subjectId)) {
                    return res.status(403).json({ message: 'Not authorized for this subject' });
                }
            } else {
                filter.subjectId = { $in: subjectIds };
            }
        }

        const attendance = await Attendance.find(filter).populate('subjectId', 'subjectName subjectCode');
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Bulk add or update attendance
// @route   POST /api/attendance/bulk
// @access  Private (Staff, Admin)
const bulkAddAttendance = async (req, res) => {
    try {
        let { date, subjectId, semester, attendanceData } = req.body;

        if (!date || !subjectId || !semester || !attendanceData) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        if (typeof semester !== 'number') {
            semester = Number(semester);
            if (isNaN(semester)) return res.status(400).json({ message: "Semester must be a number" });
        }

        if (typeof attendanceData !== 'object' || Array.isArray(attendanceData) || attendanceData === null) {
            return res.status(400).json({ message: "attendanceData must be a valid object map" });
        }

        const records = [];

        for (const rollNumber in attendanceData) {
            if (typeof rollNumber !== 'string') {
                return res.status(400).json({ message: "rollNumber must be string" });
            }

            records.push({
                rollNumber: rollNumber.trim().toUpperCase(),
                subjectId,
                semester,
                date,
                status: attendanceData[rollNumber],
                markedBy: req.user._id
            });
        }

        await Attendance.insertMany(records);

        res.status(201).json({ message: "Attendance saved successfully" });

    } catch (error) {
        console.error("ATTENDANCE ERROR:", error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAttendance,
    bulkAddAttendance
};
