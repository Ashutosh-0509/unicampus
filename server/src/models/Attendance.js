const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    studentId: { type: String, required: true },
    subject: { type: String, required: true },
    subjectCode: { type: String, default: '' },
    branch: { type: String, default: 'CS' },
    semester: { type: Number, default: 1 },
    attended: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    faculty: { type: String, default: 'Faculty' },
    credits: { type: Number, default: 3 },
    lastUpdated: { type: Date, default: Date.now },
}, { timestamps: true });

// Check if the model is already defined to avoid OverwriteModelError or cached old schema
const Attendance = mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;