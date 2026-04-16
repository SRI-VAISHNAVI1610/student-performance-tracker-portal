const mongoose = require('mongoose');

const supportSchema = new mongoose.Schema({
    parentUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['Staff', 'Management'],
        required: true
    },
    status: {
        type: String,
        enum: ['Open', 'In Progress', 'Resolved'],
        default: 'Open'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Support', supportSchema);
