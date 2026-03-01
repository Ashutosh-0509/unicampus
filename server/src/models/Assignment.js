const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
    title: String,
    subject: String,
    subjectCode: String,
    dueDate: Date,
    status: { type: String, default: 'pending' },
    branch: String,
    semester: Number,
    description: String,
    totalMarks: Number,
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    facultyId: String, // Keeping as string for legacy or external refs if needed, but assignedBy is primary
    referenceFile: String,
    submittedAt: Date,
    submissionFile: String,
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    studentId: String, // Keeping as string for legacy
    submissions: [{
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        file: String,
        submittedAt: { type: Date, default: Date.now },
        grade: String,
        feedback: String
    }]
}, { timestamps: true });


const Assignment = mongoose.model('Assignment', assignmentSchema);
module.exports = Assignment;
