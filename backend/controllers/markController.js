const Mark = require('../models/Mark');

// @desc    Enter marks for students (Bulk)
// @route   POST /api/marks/bulk
// @access  Private (Staff, Admin)
const bulkEnterMarks = async (req, res) => {
    try {
        const { subjectId, semester, marksData } = req.body; // marksData: [{ rollNumber, internal1, internal2, semesterExam }]

        if (!subjectId || !semester || !marksData) {
            return res.status(400).json({ message: 'Missing required configuration fields' });
        }

        const results = [];
        for (const item of marksData) {
            const normalizedRoll = item.rollNumber.trim().toUpperCase();

            // Extract with fallbacks to avoid NaN
            const i1 = Number(item.internal1) || 0;
            const i2 = Number(item.internal2) || 0;
            const semExam = Number(item.semesterExam) || 0;

            const total = i1 + i2 + semExam;
            const average = Number((total / 3).toFixed(2));

            let mark = await Mark.findOne({
                rollNumber: normalizedRoll,
                subjectId,
                semester
            });

            if (mark) {
                mark.internal1 = i1;
                mark.internal2 = i2;
                mark.semesterExam = semExam;
                mark.total = total;
                mark.average = average;
                mark.enteredBy = req.user._id;
                await mark.save();
                results.push(mark);
            } else {
                mark = await Mark.create({
                    rollNumber: normalizedRoll,
                    subjectId,
                    semester,
                    internal1: i1,
                    internal2: i2,
                    semesterExam: semExam,
                    total: total,
                    average: average,
                    enteredBy: req.user._id
                });
                results.push(mark);
            }
        }

        res.status(201).json({ message: 'Marks processed successfully', count: results.length });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get marks records
// @route   GET /api/marks
// @access  Private
const getMarks = async (req, res) => {
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

        const marks = await Mark.find(filter)
            .populate('subjectId', 'subjectName subjectCode')
            .populate('enteredBy', 'name');

        res.json(marks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a specific marks record
// @route   PUT /api/marks/:id
// @access  Private (Admin, Staff)
const updateMark = async (req, res) => {
    try {
        const { marksObtained, maxMarks } = req.body;

        const mark = await Mark.findById(req.params.id);

        if (!mark) {
            return res.status(404).json({ message: 'Mark record not found' });
        }

        if (marksObtained !== undefined) {
            if (maxMarks !== undefined && marksObtained > maxMarks) {
                return res.status(400).json({ message: 'Marks obtained cannot exceed max marks' });
            }
            if (maxMarks === undefined && marksObtained > mark.maxMarks) {
                return res.status(400).json({ message: 'Marks obtained cannot exceed current max marks' });
            }
            mark.marksObtained = marksObtained;
        }

        if (maxMarks !== undefined) {
            mark.maxMarks = maxMarks;
        }

        mark.enteredBy = req.user._id;
        await mark.save();

        res.json(mark);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    bulkEnterMarks,
    getMarks,
    updateMark
};
