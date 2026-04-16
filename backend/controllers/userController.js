const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Get all users (with filtering options)
// @route   GET /api/users
// @access  Private (Admin)
const getUsers = async (req, res) => {
    try {
        const { role, search, department } = req.query;
        let query = {};

        if (role && typeof role === 'string') {
            query.role = role.toLowerCase();
        }

        if (search && typeof search === 'string') {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        // Apply strict safe queries preventing complex relational population crashes
        const users = await User.find(query)
            .select('-password')
            .populate('studentProfile')
            .populate('staffProfile');

        res.json(users || []);
    } catch (error) {
        console.error("GET USERS ERROR:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Update a user
// @route   PUT /api/users/:id
// @access  Private (Admin)
const updateUser = async (req, res) => {
    try {
        const { name, email, role, isActive } = req.body;

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.name = name || user.name;
        user.email = email || user.email;
        user.role = role || user.role;
        if (isActive !== undefined) user.isActive = isActive;

        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            isActive: updatedUser.isActive
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete a user
// @route   DELETE /api/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await user.deleteOne();
        res.json({ message: 'User removed completely' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update own user profile (Settings page)
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            if (req.body.recoveryEmail) {
                user.recoveryEmail = req.body.recoveryEmail; // Assume we added this to User model
            }

            if (req.body.password) {
                user.password = req.body.password; // Schema 'pre-save' hook hashes it
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Admin 'Add User' is essentially AuthController's register logic, so we can re-use that or build a specific one if needed. Here we add createUser explicitly for Admin:
// @desc    Admin Create User
// @route   POST /api/users
// @access  Private (Admin)
const createUser = async (req, res) => {
    try {
        const {
            name, email, password, role,
            rollNumber, department, semester, batchYear, phone, parentEmail, // Student fields
            designation, staffPhone // Staff fields
        } = req.body;

        const lowercaseRole = role.toLowerCase();

        // Check for existing user
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // 1. Create User account first
        const user = await User.create({
            name,
            email,
            password: password || (lowercaseRole === 'student' ? rollNumber : '123456'), // Default passwords
            role: lowercaseRole
        });

        // 2. Specialized Profile Creation
        if (lowercaseRole === 'student') {
            const StudentProfile = require('../models/Student');

            // Handle Parent side-creation
            let parentUserId = req.body.parentUserId;
            if (parentEmail && !parentUserId) {
                let parentUser = await User.findOne({ email: parentEmail });
                if (!parentUser) {
                    parentUser = await User.create({
                        name: `${name}'s Parent`,
                        email: parentEmail,
                        password: `${rollNumber}parent`,
                        role: 'parent'
                    });
                }
                parentUserId = parentUser._id;
            }

            await StudentProfile.create({
                rollNumber,
                studentUserId: user._id,
                fullName: name,
                department,
                semester,
                batchYear,
                phone,
                parentUserId
            });
        }
        else if (lowercaseRole === 'staff') {
            const StaffProfile = require('../models/StaffProfile');
            await StaffProfile.create({
                staffUserId: user._id,
                fullName: name,
                department,
                designation,
                phone: staffPhone || phone
            });
        }

        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get college-wide statistics
// @route   GET /api/users/stats
// @access  Private (Admin)
const getStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const adminCount = await User.countDocuments({ role: 'admin' });
        const staffCount = await User.countDocuments({ role: 'staff' });
        const studentCount = await User.countDocuments({ role: 'student' });
        const parentCount = await User.countDocuments({ role: 'parent' });

        // Department-wise student distribution
        const StudentProfile = require('../models/Student');
        const deptStats = await StudentProfile.aggregate([
            { $group: { _id: '$department', count: { $sum: 1 } } }
        ]);

        res.json({
            totals: {
                users: totalUsers,
                admins: adminCount,
                staff: staffCount,
                students: studentCount,
                parents: parentCount
            },
            departmentDistribution: deptStats.map(d => ({ name: d._id, count: d.count }))
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getUsers,
    updateUser,
    deleteUser,
    updateProfile,
    createUser,
    getStats
};
