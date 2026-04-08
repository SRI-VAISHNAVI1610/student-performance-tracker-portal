const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    rollNumber: {
        type: String,
        required: true
    },
    subjectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    semester: {
        type: Number,
        required: true,
        default: 1
    },
    status: {
        type: String,
        enum: ['present', 'absent', 'od'],
        required: true
    },
    markedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);
module.exports = Attendance;

