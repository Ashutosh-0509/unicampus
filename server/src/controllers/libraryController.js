const axios = require('axios');
const nodemailer = require('nodemailer');
const { Book, BookIssue, User, Notification } = require('../models');

const OPEN_LIBRARY_API = process.env.OPEN_LIBRARY_API || 'https://openlibrary.org/api/books';
const DAILY_FINE_RATE = Number(process.env.DAILY_FINE_RATE || 5);
const BOOK_ISSUE_LIMIT = Number(process.env.BOOK_ISSUE_LIMIT || 3);
const MAX_RENEWALS = Number(process.env.MAX_RENEWALS || 2);

const mailer = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT || 587),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function calcFine(dueDate, now = new Date()) {
  const due = startOfDay(dueDate);
  const today = startOfDay(now);
  if (today <= due) return { daysOverdue: 0, fine: 0 };
  const daysOverdue = Math.ceil((today - due) / (1000 * 60 * 60 * 24));
  return { daysOverdue, fine: daysOverdue * DAILY_FINE_RATE };
}

// @desc    ISBN Lookup
// @route   GET /api/library/books/isbn-lookup
async function lookupISBN(req, res) {
  try {
    const { isbn } = req.query;
    if (!isbn) return res.status(400).json({ error: 'isbn is required' });

    const url = `${OPEN_LIBRARY_API}?bibkeys=ISBN:${isbn}&format=json&jscmd=data`;
    const response = await axios.get(url, { timeout: 10000 });
    const key = `ISBN:${isbn}`;
    const data = response.data?.[key];
    if (!data) return res.status(404).json({ error: 'No details found for ISBN' });

    const result = {
      title: data.title || '',
      author: (data.authors || []).map((a) => a.name).join(', '),
      publisher: (data.publishers || []).map((p) => p.name).join(', '),
      coverUrl: data.cover?.large || data.cover?.medium || data.cover?.small || '',
    };

    return res.json(result);
  } catch (e) {
    return res.status(500).json({ error: 'Failed to lookup ISBN', details: e.message });
  }
}

// @desc    Add a book
// @route   POST /api/library/books
async function addBook(req, res) {
  try {
    const payload = { ...req.body };
    if (!payload.isbn) return res.status(400).json({ error: 'isbn is required' });

    const existing = await Book.findOne({ isbn: payload.isbn });
    if (existing) return res.status(409).json({ error: 'Book with this ISBN already exists' });

    const book = await Book.create(payload);
    return res.status(201).json(book);
  } catch (e) {
    return res.status(500).json({ error: 'Failed to add book', details: e.message });
  }
}

// @desc    Get all books
// @route   GET /api/library/books
async function getBooks(req, res) {
  try {
    const { search, category } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { isbn: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) filter.category = category;

    const books = await Book.find(filter).sort({ createdAt: -1 }).lean();
    return res.json(books);
  } catch (e) {
    return res.status(500).json({ error: 'Failed to fetch books' });
  }
}

// @desc    Update a book
// @route   PATCH /api/library/books/:id
async function updateBook(req, res) {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!book) return res.status(404).json({ error: 'Book not found' });
    return res.json(book);
  } catch (e) {
    return res.status(500).json({ error: 'Failed to update book' });
  }
}

// @desc    Delete a book
// @route   DELETE /api/library/books/:id
async function deleteBook(req, res) {
  try {
    const activeIssue = await BookIssue.findOne({ bookId: req.params.id, isReturned: false });
    if (activeIssue) return res.status(400).json({ error: 'Cannot delete book with active issues' });

    const deleted = await Book.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Book not found' });

    return res.json({ message: 'Book removed' });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to delete book' });
  }
}

// @desc    Issue a book
// @route   POST /api/library/issue
async function issueBook(req, res) {
  try {
    const { bookId, studentId, dueDays = 14 } = req.body;
    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ error: 'Book not found' });
    if (book.availableCopies <= 0) return res.status(400).json({ error: 'No copies available' });

    const student = await User.findById(studentId);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const activeIssues = await BookIssue.countDocuments({ studentId: student._id, isReturned: false });
    if (activeIssues >= BOOK_ISSUE_LIMIT) return res.status(400).json({ error: 'Issue limit reached' });

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + Number(dueDays));

    const issue = await BookIssue.create({
      bookId: book._id,
      studentId: student._id,
      dueDate,
    });

    await Book.findByIdAndUpdate(bookId, { $inc: { availableCopies: -1 } });

    await Notification.create({
      userId: student._id,
      type: 'library',
      title: 'Book Issued',
      message: `Book '${book.title}' issued. Due: ${dueDate.toLocaleDateString()}`,
      read: false,
    });

    const populated = await BookIssue.findById(issue._id).populate('bookId', 'title author isbn');
    return res.status(201).json(populated);
  } catch (e) {
    return res.status(500).json({ error: 'Failed to issue book', details: e.message });
  }
}

// @desc    Return a book
// @route   POST /api/library/return/:issueId
async function returnBook(req, res) {
  try {
    const issue = await BookIssue.findById(req.params.issueId).populate('bookId', 'title');
    if (!issue) return res.status(404).json({ error: 'Issue record not found' });
    if (issue.isReturned) return res.status(400).json({ error: 'Book already returned' });

    const { fine } = calcFine(issue.dueDate);
    issue.isReturned = true;
    issue.returnDate = new Date();
    issue.fine = fine;
    issue.fineStatus = fine > 0 ? 'pending' : 'none';
    await issue.save();

    await Book.findByIdAndUpdate(issue.bookId, { $inc: { availableCopies: 1 } });

    return res.json({
      fine,
      returnDate: issue.returnDate,
      bookTitle: issue.bookId?.title,
      message: 'Book returned successfully'
    });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to return book' });
  }
}

// @desc    Get overdue books
// @route   GET /api/library/overdue
async function getOverdueBooks(req, res) {
  try {
    const now = new Date();
    const issues = await BookIssue.find({ isReturned: false, dueDate: { $lt: now } })
      .populate('bookId', 'title isbn')
      .populate('studentId', 'name email branch')
      .lean();

    const result = issues.map((issue) => {
      const { daysOverdue, fine } = calcFine(issue.dueDate, now);
      return { ...issue, daysOverdue, currentFine: fine };
    }).sort((a, b) => b.daysOverdue - a.daysOverdue);

    return res.json(result);
  } catch (e) {
    return res.status(500).json({ error: 'Failed to fetch overdue books' });
  }
}

// @desc    Waive fine
// @route   POST /api/library/fine/:issueId/waive
async function waiveFine(req, res) {
  try {
    const issue = await BookIssue.findByIdAndUpdate(
      req.params.issueId,
      { $set: { fineStatus: 'waived', fine: 0 } },
      { new: true },
    );
    if (!issue) return res.status(404).json({ error: 'Issue record not found' });
    return res.json(issue);
  } catch (e) {
    return res.status(500).json({ error: 'Failed to waive fine' });
  }
}

// @desc    Mark fine as paid
// @route   PATCH /api/library/fine/:issueId/paid
async function markFinePaid(req, res) {
  try {
    const issue = await BookIssue.findByIdAndUpdate(
      req.params.issueId,
      { $set: { fineStatus: 'paid' } },
      { new: true },
    );
    if (!issue) return res.status(404).json({ error: 'Issue record not found' });
    return res.json(issue);
  } catch (e) {
    return res.status(500).json({ error: 'Failed to update fine status' });
  }
}

// @desc    Bulk remind overdue
// @route   POST /api/library/bulk-remind
async function bulkRemind(req, res) {
  try {
    const now = new Date();
    const overdue = await BookIssue.find({ isReturned: false, dueDate: { $lt: now } })
      .populate('bookId', 'title')
      .populate('studentId', 'name email')
      .lean();

    const results = await Promise.allSettled(overdue.map(async (item) => {
      if (!item.studentId?.email) return;
      await mailer.sendMail({
        from: process.env.EMAIL_USER,
        to: item.studentId.email,
        subject: `Library Overdue Notice — ${item.bookId?.title || 'Book'}`,
        text: `Dear ${item.studentId.name}, your book '${item.bookId?.title}' was due on ${new Date(item.dueDate).toLocaleDateString()}. Please return immediately.`,
      });
    }));

    const remindedCount = results.filter((r) => r.status === 'fulfilled').length;
    return res.json({ remindedCount, message: 'Overdue reminders sent' });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to send reminders' });
  }
}

// @desc    Search books
// @route   GET /api/library/books/search
async function searchBooks(req, res) {
  try {
    const { q = '', category } = req.query;
    const filter = {
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { author: { $regex: q, $options: 'i' } },
      ],
    };
    if (category) filter.category = category;

    const books = await Book.find(filter).lean();
    const result = books.map((b) => ({
      ...b,
      isAvailable: Number(b.availableCopies || 0) > 0,
    }));
    return res.json(result);
  } catch (e) {
    return res.status(500).json({ error: 'Failed to search books' });
  }
}

// @desc    Reserve a book
// @route   POST /api/library/reserve/:bookId
async function reserveBook(req, res) {
  try {
    const studentId = req.user._id;
    const book = await Book.findById(req.params.bookId);
    if (!book) return res.status(404).json({ error: 'Book not found' });
    if (book.availableCopies <= 0) return res.status(400).json({ error: 'No copies available' });

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 1);

    const issue = await BookIssue.create({
      bookId: book._id,
      studentId,
      dueDate,
    });

    await Book.findByIdAndUpdate(book._id, { $inc: { availableCopies: -1 } });

    await Notification.create({
      userId: studentId,
      type: 'library',
      title: 'Book Reserved',
      message: `Book '${book.title}' reserved. Collect from library within 24 hours.`,
      read: false,
    });

    return res.status(201).json(issue);
  } catch (e) {
    return res.status(500).json({ error: 'Failed to reserve book' });
  }
}

// @desc    Get my books
// @route   GET /api/library/my-books
async function getMyBooks(req, res) {
  try {
    const studentId = req.user._id;
    const issues = await BookIssue.find({ studentId, isReturned: false })
      .populate('bookId', 'title author isbn category')
      .sort({ createdAt: -1 })
      .lean();

    const result = issues.map((issue) => {
      const { daysOverdue, fine } = calcFine(issue.dueDate);
      return { ...issue, isOverdue: daysOverdue > 0, daysOverdue, currentFine: fine };
    });

    return res.json(result);
  } catch (e) {
    return res.status(500).json({ error: 'Failed to fetch issued books' });
  }
}

// @desc    Renew book
// @route   POST /api/library/renew/:issueId
async function renewBook(req, res) {
  try {
    const issue = await BookIssue.findById(req.params.issueId);
    if (!issue) return res.status(404).json({ error: 'Issue record not found' });
    if (issue.isReturned) return res.status(400).json({ error: 'Book already returned' });

    if (req.user.role === 'student' && String(req.user._id) !== String(issue.studentId)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (Number(issue.renewCount || 0) >= MAX_RENEWALS) {
      return res.status(400).json({ error: `Maximum renewals (${MAX_RENEWALS}) reached` });
    }

    const newDueDate = new Date(issue.dueDate);
    newDueDate.setDate(newDueDate.getDate() + 7);

    issue.dueDate = newDueDate;
    issue.renewCount = (issue.renewCount || 0) + 1;
    await issue.save();

    return res.json(issue);
  } catch (e) {
    return res.status(500).json({ error: 'Failed to renew book' });
  }
}

module.exports = {
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
};
