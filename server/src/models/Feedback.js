const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  subject: String,
  rating: Number,
  comments: String,
  semester: Number,
  year: Number,
}, { timestamps: true });

const Feedback = mongoose.model('Feedback', feedbackSchema);
module.exports = Feedback;
