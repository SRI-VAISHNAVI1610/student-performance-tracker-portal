const ActivityPoints = require('../models/Activity');

// @desc    Submit new activity request (Student)
// @route   POST /api/activities
// @access  Private (student)
const submitActivity = async (req, res) => {
    try {
        const { activityName, category, pointsClaimed, proofDocumentUrl } = req.body;

        const StudentProfile = require('../models/Student');
        const profile = await StudentProfile.findOne({ studentUserId: req.user._id });
        if (!profile) {
            return res.status(404).json({ message: 'Student profile not found' });
        }

        const activity = await ActivityPoints.create({
            rollNumber: profile.rollNumber,
            activityName,
            category,
            pointsClaimed,
            proofDocumentUrl
        });

        res.status(201).json(activity);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get activities with role-based filtering
// @route   GET /api/activities
// @access  Private
const getActivities = async (req, res) => {
    try {
        const role = req.user.role.toLowerCase();
        let filter = { ...req.query };

        if (filter.rollNumber && typeof filter.rollNumber === 'string') {
            filter.rollNumber = { $regex: new RegExp(`^${filter.rollNumber.trim()}$`, 'i') };
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

        const activities = await ActivityPoints.find(filter).sort({ createdAt: -1 });
        res.json(activities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get activities exactly matching rollNumber (fix for 404)
// @route   GET /api/activities/student/:rollNumber
// @access  Private
const getActivitiesByStudent = async (req, res) => {
    try {
        const rollNumber = req.params.rollNumber ? req.params.rollNumber.trim().toUpperCase() : '';
        const activities = await ActivityPoints.find({ rollNumber: new RegExp(`^${rollNumber}$`, 'i') });
        res.json(activities || []);
    } catch (error) {
        console.error("REPORT ERROR (getActivitiesByStudent):", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Review activity points (Admin/Staff)
// @route   PUT /api/activities/:id/review
// @access  Private (admin, staff)
const reviewActivity = async (req, res) => {
    try {
        const { status, remarks } = req.body;

        const activity = await ActivityPoints.findById(req.params.id);
        if (!activity) {
            return res.status(404).json({ message: 'Activity record not found' });
        }

        activity.status = status;
        activity.remarks = remarks || '';
        activity.reviewedBy = req.user._id;
        activity.reviewedAt = Date.now();

        await activity.save();
        res.json(activity);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    submitActivity,
    getActivities,
    getActivitiesByStudent,
    reviewActivity
};
