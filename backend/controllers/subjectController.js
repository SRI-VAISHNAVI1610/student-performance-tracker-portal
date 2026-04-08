const Subject = require('../models/Subject');

// @desc    Get all subjects
// @route   GET /api/subjects
// @access  Private
const getSubjects = async (req, res) => {
    try {
        const filter = {};
        if (req.query.department) filter.department = req.query.department;
        if (req.query.semester) filter.semester = req.query.semester;

        const subjects = await Subject.find(filter).populate('staffId', 'name email');
        res.json(subjects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a subject
// @route   POST /api/subjects
// @access  Private (Admin)
const createSubject = async (req, res) => {
    try {
        const { subjectCode, subjectName, department, semester, credits, staffId } = req.body;

        const subjectExists = await Subject.findOne({ subjectCode });
        if (subjectExists) {
            return res.status(400).json({ message: 'Subject already exists' });
        }

        const subject = await Subject.create({
            subjectCode,
            subjectName,
            department,
            semester,
            credits,
            staffId
        });

        res.status(201).json(subject);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a subject
// @route   PUT /api/subjects/:id
// @access  Private (Admin)
const updateSubject = async (req, res) => {
    try {
        const { subjectCode, subjectName, department, semester, credits, staffId } = req.body;

        const subject = await Subject.findById(req.params.id);
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }

        subject.subjectCode = subjectCode || subject.subjectCode;
        subject.subjectName = subjectName || subject.subjectName;
        subject.department = department || subject.department;
        subject.semester = semester || subject.semester;
        subject.credits = credits || subject.credits;
        subject.staffId = staffId || subject.staffId;

        const updatedSubject = await subject.save();
        res.json(updatedSubject);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getSubjects,
    createSubject,
    updateSubject
};
