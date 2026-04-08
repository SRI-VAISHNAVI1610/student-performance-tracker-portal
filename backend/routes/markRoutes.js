const express = require('express');
const router = express.Router();
const { getMarks, bulkEnterMarks, updateMark } = require('../controllers/markController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getMarks);
router.post('/bulk', protect, authorize('staff', 'admin'), bulkEnterMarks);

router.route('/:id')
    .put(protect, authorize('admin', 'staff'), updateMark);

module.exports = router;
