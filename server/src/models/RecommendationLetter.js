const mongoose = require('mongoose');

const recommendationLetterSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: String,
    status: { type: String, enum: ['draft', 'submitted', 'provided'], default: 'draft' },
    submittedAt: Date,
    providedAt: Date,
}, { timestamps: true });

const RecommendationLetter = mongoose.model('RecommendationLetter', recommendationLetterSchema);
module.exports = RecommendationLetter;
