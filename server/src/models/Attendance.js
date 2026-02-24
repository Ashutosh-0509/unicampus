const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subject: String,
    subjectCode: String,
    branch: String,
    semester: Number,
    attended: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    percentage: Number,
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    credits: Number,
    lastUpdated: { type: Date, default: Date.now },
}, { timestamps: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);
module.exports = Attendance;
