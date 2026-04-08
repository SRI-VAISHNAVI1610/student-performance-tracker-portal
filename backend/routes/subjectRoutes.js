const express = require('express');
const router = express.Router();
const { getSubjects, createSubject, updateSubject } = require('../controllers/subjectController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getSubjects)
    .post(protect, authorize('Admin'), createSubject);

router.route('/:id')
    .put(protect, authorize('Admin'), updateSubject);

module.exports = router;
