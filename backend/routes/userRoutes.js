const express = require('express');
const router = express.Router();
const {
    getUsers,
    updateUser,
    deleteUser,
    updateProfile,
    createUser,
    getStats
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/profile').put(protect, updateProfile); // Own settings
router.route('/stats').get(protect, authorize('Admin'), getStats);

router.route('/')
    .get(protect, authorize('Admin'), getUsers)
    .post(protect, authorize('Admin'), createUser);

router.route('/:id')
    .put(protect, authorize('Admin'), updateUser)
    .delete(protect, authorize('Admin'), deleteUser);

module.exports = router;
