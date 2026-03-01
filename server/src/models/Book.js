const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  isbn: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  author: { type: String, required: true },
  publisher: String,
  category: String,
  totalCopies: { type: Number, default: 1 },
  availableCopies: { type: Number, default: 1 },
  coverUrl: String,
  borrowedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  dueDate: { type: Date, default: null },
  addedAt: { type: Date, default: Date.now },
}, { timestamps: true });


const Book = mongoose.model('Book', bookSchema);
module.exports = Book;