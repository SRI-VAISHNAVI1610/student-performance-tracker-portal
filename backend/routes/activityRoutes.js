const express = require('express');
const router = express.Router();
const {
    getActivities,
    submitActivity,
    reviewActivity,
    getActivitiesByStudent
} = require('../controllers/activityController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getActivities)
    .post(protect, authorize('student'), submitActivity);

router.get('/student/:rollNumber', protect, getActivitiesByStudent);

router.put('/:id/review', protect, authorize('staff'), reviewActivity);

module.exports = router;
