const mongoose = require('mongoose');

const markSchema = new mongoose.Schema({
    rollNumber: {
        type: String,
        required: true
    },
    subjectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
    },
    semester: {
        type: Number,
        required: true
    },
    internal1: {
        type: Number,
        default: 0
    },
    internal2: {
        type: Number,
        default: 0
    },
    semesterExam: {
        type: Number,
        default: 0
    },
    total: {
        type: Number,
        default: 0
    },
    average: {
        type: Number,
        default: 0
    },
    enteredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

const Mark = mongoose.model('Mark', markSchema);
module.exports = Mark;

