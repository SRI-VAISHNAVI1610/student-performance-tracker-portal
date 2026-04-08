const express = require('express');
const router = express.Router();
const { createStudentProfile } = require('../controllers/studentController');
const { createSubject } = require('../controllers/subjectController');
const { createUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

// @desc    Admin specific operations
// @route   /api/admin

router.post('/student-profile', protect, authorize('Admin'), createStudentProfile);
router.post('/subjects', protect, authorize('Admin'), createSubject);
router.post('/users', protect, authorize('Admin'), createUser);

module.exports = router;
