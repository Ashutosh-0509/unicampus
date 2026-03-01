const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const { protect } = require('../middleware/authMiddleware');

/**
 * @desc    Get all books
 * @route   GET /api/library
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
  try {
    const books = await Book.find().sort({ title: 1 });
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

/**
 * @desc    Borrow a book
 * @route   POST /api/library/borrow/:id
 * @access  Private
 */
router.post('/borrow/:id', protect, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    if (book.availableCopies <= 0) {
      return res.status(400).json({ error: 'No copies available' });
    }

    book.availableCopies -= 1;
    book.borrowedBy = req.user._id;
    book.dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days

    await book.save();
    res.json({ message: 'Book borrowed successfully', dueDate: book.dueDate });
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;
