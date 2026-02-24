const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subjectCode: { type: String, required: true },
    semester: Number,
    grade: String,
    marks: Number,
    examType: String,
    facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const Grade = mongoose.model('Grade', gradeSchema);
module.exports = Grade;
