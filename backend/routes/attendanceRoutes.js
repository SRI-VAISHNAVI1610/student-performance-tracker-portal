const express = require('express');
const router = express.Router();
const { getAttendance, bulkAddAttendance } = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getAttendance);
router.post('/bulk', protect, authorize('staff', 'admin'), bulkAddAttendance);

module.exports = router;
