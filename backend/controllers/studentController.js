const mongoose = require('mongoose');
const Student = require('../models/Student');
const User = require('../models/User');

// @desc    Get all students
// @route   GET /api/students
// @access  Private (Admin, Staff)
const getStudents = async (req, res) => {
    try {
        let filter = {};

        const role = req.user.role.toLowerCase(); // ✅ FIX: normalize role to lowercase

        if (role === 'student') {
            filter.studentUserId = req.user._id;

        } else if (role === 'parent') {
            if (req.query.studentId) {
                filter.rollNumber = { $regex: new RegExp(`^${req.query.studentId}$`, 'i') };
            }
            filter.parentUserId = req.user._id;

        } else if (role === 'staff') {
            // ✅ FIX: check both staffId AND teacherId fields
            const Subject = require('../models/Subject');
            const teacherSubjects = await Subject.find({
                $or: [
                    { teacherId: req.user._id },
                    { staffId: req.user._id }
                ]
            });

            // ✅ FIX: if no assigned subjects, still return all students in CS dept
            if (teacherSubjects.length === 0) {
                // Return all students so staff can see them
                const allStudents = await Student.find({})
                    .populate('studentUserId', 'name email')
                    .populate('parentUserId', 'name email');
                return res.json(allStudents);
            }

            const depts = [...new Set(teacherSubjects.map(s => s.department))];
            const sems = [...new Set(teacherSubjects.map(s => Number(s.semester)))];

            filter.department = { $in: depts };
            filter.semester = { $in: sems };

            if (req.query.department && depts.includes(req.query.department)) {
                filter.department = req.query.department;
            }
            if (req.query.semester && sems.includes(Number(req.query.semester))) {
                filter.semester = Number(req.query.semester);
            }
            if (req.query.year) filter.year = Number(req.query.year);

        } else {
            // Admin sees everything
            if (req.query.department) filter.department = req.query.department;
            if (req.query.year) filter.batchYear = String(req.query.year);
            if (req.query.semester) filter.semester = Number(req.query.semester);
            if (req.query.parentId) filter.parentUserId = req.query.parentId;
        }

        const students = await Student.find(filter)
            .populate('studentUserId', 'name email')
            .populate('parentUserId', 'name email');

        res.json(students);

    } catch (error) {
        console.error("REPORT ERROR (getStudents):", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get student by ID
// @route   GET /api/students/:id
// @access  Private
const getStudentById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid Student ID format' });
        }
        const student = await Student.findById(req.params.id)
            .populate('studentUserId', 'name email')
            .populate('parentUserId', 'name email');

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const role = req.user.role.toLowerCase(); // ✅ FIX: lowercase role

        if (role === 'student' && student.studentUserId._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to view other students' });
        }

        if (role === 'parent' && student.parentUserId._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to view other students' });
        }

        res.json(student);

    } catch (error) {
        console.error('getStudentById error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Admin create student + user + parent accounts in one step
// @route   POST /api/students/admin/create-student
// @access  Private (Admin)
const adminCreateStudent = async (req, res) => {
    try {
        const {
            studentId,
            name,
            department,
            year,
            semester,
            studentEmail,
            parentEmail
        } = req.body;

        const normalizedRollNumber = studentId.trim().toUpperCase();

        // 1. Check if student profile already exists
        const exists = await Student.findOne({ rollNumber: normalizedRollNumber });
        if (exists) {
            return res.status(400).json({ message: 'Student with this Roll Number already exists' });
        }

        // 2. Create Student User account
        let studentUser = await User.findOne({ email: studentEmail });
        if (!studentUser) {
            studentUser = await User.create({
                name,
                email: studentEmail,
                password: studentId, // default password = roll number
                role: 'student',
                isActive: true
            });
        }

        // 3. Create Parent User account
        let parentUser = await User.findOne({ email: parentEmail });
        if (!parentUser) {
            parentUser = await User.create({
                name: name + ' Parent',
                email: parentEmail,
                password: studentId + 'parent', // default password
                role: 'parent',
                isActive: true
            });
        }

        // 4. Create Student Profile
        const student = await Student.create({
            rollNumber: normalizedRollNumber,
            fullName: name,
            department,
            batchYear: String(year),
            semester: Number(semester),
            studentUserId: studentUser._id,
            parentUserId: parentUser._id,
            phone: "0000000000"
        });

        res.status(201).json({
            message: 'Student enrolled successfully',
            student,
            credentials: {
                student: { email: studentEmail, password: studentId },
                parent: { email: parentEmail, password: studentId + 'parent' }
            }
        });

    } catch (error) {
        console.error('adminCreateStudent error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Admin create student profile (linking existing accounts)
// @route   POST /api/students
// @access  Private (Admin)
const createStudentProfile = async (req, res) => {
    try {
        const { studentId, name, department, year, semester, userId, parentId } = req.body;
        const normalizedRollNumber = studentId ? studentId.trim().toUpperCase() : undefined;

        const studentExists = await Student.findOne({ rollNumber: normalizedRollNumber });
        if (studentExists) {
            return res.status(400).json({ message: 'Student profile already exists with this ID' });
        }

        // ✅ FIX: lowercase role check
        const studentUser = await User.findById(userId);
        if (!studentUser || studentUser.role.toLowerCase() !== 'student') {
            return res.status(400).json({ message: 'Valid Student User account required' });
        }

        const parentUser = await User.findById(parentId);
        if (!parentUser || parentUser.role.toLowerCase() !== 'parent') {
            return res.status(400).json({ message: 'Valid Parent User account required' });
        }

        const student = await Student.create({
            rollNumber: normalizedRollNumber,
            fullName: name,
            department,
            batchYear: String(year),
            semester: Number(semester),
            parentUserId: parentId,
            studentUserId: userId,
            phone: "0000000000"
        });

        res.status(201).json({
            message: 'Student profile created and linked successfully',
            student
        });

    } catch (error) {
        console.error('createStudentProfile error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get current user's student profile
// @route   GET /api/students/profile
// @access  Private (Student, Parent)
const getMyProfile = async (req, res) => {
    try {
        let student = null;
        const role = req.user.role.toLowerCase(); // ✅ FIX: lowercase role

        if (role === 'student') {
            student = await Student.findOne({ studentUserId: req.user._id })
                .populate('studentUserId', 'name email')
                .populate('parentUserId', 'name email');
        }

        if (role === 'parent') {
            const childId = req.query.childId;
            const filter = { parentUserId: req.user._id };
            if (childId) filter.rollNumber = { $regex: new RegExp(`^${childId.trim()}$`, 'i') };

            student = await Student.findOne(filter)
                .populate('studentUserId', 'name email')
                .populate('parentUserId', 'name email');
        }

        if (!student) {
            return res.status(404).json({ message: 'Profile Unlinked. Please contact administrator to link your profile.' });
        }

        res.json(student);

    } catch (error) {
        console.error("REPORT ERROR (getMyProfile):", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all children for a parent
// @route   GET /api/students/children
// @access  Private (Parent)
const getChildren = async (req, res) => {
    try {
        const role = req.user.role.toLowerCase(); // ✅ FIX: lowercase role

        if (role !== 'parent') {
            return res.status(403).json({ message: 'Only parents can access this' });
        }

        const children = await Student.find({ parentUserId: req.user._id })
            .populate('studentUserId', 'name email');

        res.json(children);

    } catch (error) {
        console.error('getChildren error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private (Admin)
const deleteStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Also delete the user account
        if (student.studentUserId) await User.findByIdAndDelete(student.studentUserId);
        await Student.findByIdAndDelete(req.params.id);

        res.json({ message: 'Student removed successfully' });

    } catch (error) {
        console.error('deleteStudent error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getStudents,
    getStudentById,
    createStudentProfile,
    adminCreateStudent,
    getMyProfile,
    getChildren,
    deleteStudent
};