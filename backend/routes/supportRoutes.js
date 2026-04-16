const express = require('express');
const router = express.Router();
const { createSupportTicket } = require('../controllers/supportController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('parent'), createSupportTicket);

module.exports = router;
