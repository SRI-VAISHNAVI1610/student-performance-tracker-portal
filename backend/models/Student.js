const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema({
    rollNumber: {
        type: String,
        required: true,
        unique: true
    },
    studentUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fullName: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    semester: {
        type: Number,
        required: true
    },
    batchYear: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    parentUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    profilePhotoUrl: {
        type: String,
        default: ''
    }
}, { timestamps: true });

const StudentProfile = mongoose.model('StudentProfile', studentProfileSchema);
module.exports = StudentProfile;

