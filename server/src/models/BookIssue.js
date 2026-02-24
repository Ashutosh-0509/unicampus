const mongoose = require('mongoose');

const bookIssueSchema = new mongoose.Schema({
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  issueDate: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  returnDate: Date,
  isReturned: { type: Boolean, default: false },
  renewCount: { type: Number, default: 0 },
  fine: { type: Number, default: 0 },
  fineStatus: { type: String, enum: ['none', 'pending', 'paid', 'waived'], default: 'none' },
}, { timestamps: true });

const BookIssue = mongoose.model('BookIssue', bookIssueSchema);
module.exports = BookIssue;
