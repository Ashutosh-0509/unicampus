const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
  lookupISBN,
  addBook,
  getBooks,
  updateBook,
  deleteBook,
  issueBook,
  returnBook,
  getOverdueBooks,
  waiveFine,
  markFinePaid,
  bulkRemind,
  searchBooks,
  reserveBook,
  getMyBooks,
  renewBook,
} = require('../controllers/libraryController');

router.get('/books/search', protect, authorize('student', 'faculty', 'admin'), searchBooks);
router.get('/books/isbn-lookup', protect, authorize('admin'), lookupISBN);
router.get('/books', protect, authorize('admin', 'faculty'), getBooks);
router.post('/books', protect, authorize('admin'), addBook);
router.patch('/books/:id', protect, authorize('admin'), updateBook);
router.delete('/books/:id', protect, authorize('admin'), deleteBook);

router.post('/issue', protect, authorize('admin'), issueBook);
router.post('/return/:issueId', protect, authorize('admin'), returnBook);
router.get('/overdue', protect, authorize('admin'), getOverdueBooks);
router.post('/fine/:issueId/waive', protect, authorize('admin'), waiveFine);
router.patch('/fine/:issueId/paid', protect, authorize('admin'), markFinePaid);
router.post('/bulk-remind', protect, authorize('admin'), bulkRemind);

router.post('/reserve/:bookId', protect, authorize('student'), reserveBook);
router.get('/my-books', protect, authorize('student', 'admin', 'faculty'), getMyBooks);
router.post('/renew/:issueId', protect, authorize('student', 'admin'), renewBook);

module.exports = router;
