const mongoose = require('mongoose');

const activityPointsSchema = new mongoose.Schema({
    rollNumber: {
        type: String,
        required: true
    },
    activityName: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['sports', 'cultural', 'technical', 'nss', 'ncc'],
        required: true
    },
    pointsClaimed: {
        type: Number,
        required: true
    },
    proofDocumentUrl: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewedAt: {
        type: Date
    },
    remarks: {
        type: String,
        default: ''
    }
}, { timestamps: true });

const ActivityPoints = mongoose.model('ActivityPoints', activityPointsSchema);
module.exports = ActivityPoints;

