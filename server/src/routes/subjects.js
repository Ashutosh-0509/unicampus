const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { Subject } = require('../models');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

// GET /api/subjects
router.get('/', async (req, res) => {
  try {
    const { branch, semester, facultyId } = req.query;
    const filter = {};
    if (branch) filter.branch = branch;
    if (semester) filter.semester = parseInt(semester);
    if (facultyId) filter.facultyId = facultyId;

    const subjects = await Subject.find(filter).lean();
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

// GET /api/subjects/:code
router.get('/:code', async (req, res) => {
  try {
    const subject = await Subject.findOne({ $or: [{ code: req.params.code }, { id: req.params.code }] }).lean();
    if (!subject) return res.status(404).json({ error: 'Subject not found' });
    res.json(subject);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subject' });
  }
});

// POST /api/subjects
router.post('/', async (req, res) => {
  try {
    const subject = await Subject.create({
      id: uuidv4(),
      ...req.body,
    });
    res.status(201).json(subject);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create subject' });
  }
});

// PUT /api/subjects/:id
router.put('/:id', async (req, res) => {
  try {
    const updated = await Subject.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Subject not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update subject' });
  }
});

module.exports = router;
