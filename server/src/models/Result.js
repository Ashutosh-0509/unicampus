const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    semester: { type: Number, required: true },
    gpa: Number,
    cgpa: Number,
    subjects: [{
        subjectCode: String,
        subjectName: String,
        grade: String,
        credits: Number,
        marks: Number,
    }],
    publishedAt: { type: Date, default: Date.now },
}, { timestamps: true });

const Result = mongoose.model('Result', resultSchema);
module.exports = Result;
