const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { Resource } = require('../models');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

// GET /api/resources
router.get('/', async (req, res) => {
  try {
    const { branch, semester, subjectCode } = req.query;
    const filter = {};
    if (branch) filter.branch = branch;
    if (semester) filter.semester = parseInt(semester);
    if (subjectCode) filter.subjectCode = subjectCode;

    const resources = await Resource.find(filter).sort({ isPinned: -1, createdAt: -1 }).lean();
    res.json(resources);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
});

// POST /api/resources
router.post('/', async (req, res) => {
  try {
    const resource = await Resource.create({
      id: uuidv4(),
      ...req.body,
    });
    res.status(201).json(resource);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create resource' });
  }
});

// DELETE /api/resources/:id
router.delete('/:id', async (req, res) => {
  try {
    const resource = await Resource.findOneAndDelete({ id: req.params.id });
    if (!resource) return res.status(404).json({ error: 'Resource not found' });
    res.json({ message: 'Resource deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete resource' });
  }
});

module.exports = router;
