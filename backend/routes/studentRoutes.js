const express = require('express');
const router = express.Router();
const { getStudents, getStudentById, createStudentProfile, getMyProfile, getChildren } = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/profile', protect, getMyProfile);

router.get('/children', protect, authorize('Parent'), getChildren);

router.route('/')
    .get(protect, authorize('Admin', 'Staff', 'Student', 'Parent'), getStudents)
    .post(protect, authorize('Admin'), createStudentProfile);

router.route('/:id')
    .get(protect, getStudentById);

module.exports = router;
