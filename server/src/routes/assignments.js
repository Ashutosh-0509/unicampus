const express = require('express');
const router = express.Router();
const { Assignment, Notification } = require('../models');
const { upload, uploadToCloudinary } = require('../utils/cloudinary');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

// GET /api/assignments
router.get('/', async (req, res) => {
  try {
    const { branch, status, subject, subjectCode, semester } = req.query;
    const filter = {};
    if (branch) filter.branch = branch;
    if (status) filter.status = status;
    if (subject) filter.subject = subject;
    if (subjectCode) filter.subjectCode = subjectCode;
    if (semester) filter.semester = parseInt(semester);

    const data = await Assignment.find(filter).sort({ createdAt: -1 }).lean();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

// GET /api/assignments/:id
router.get('/:id', async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id).lean();
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
    res.json(assignment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch assignment' });
  }
});

// POST /api/assignments
router.post('/', async (req, res) => {
  try {
    const assignment = await Assignment.create({
      ...req.body,
      status: 'pending',
    });
    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create assignment' });
  }
});

// PUT /api/assignments/:id
router.put('/:id', async (req, res) => {
  try {
    const updated = await Assignment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Assignment not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update assignment' });
  }
});

// POST /api/assignments/submit
router.post('/submit', upload.single('file'), async (req, res) => {
  try {
    const { assignmentId, studentId } = req.body;
    const currentStudentId = studentId || req.user._id;

    if (!assignmentId) return res.status(400).json({ error: 'assignmentId is required' });

    let fileUrl = null;
    if (req.file) {
      const result = await uploadToCloudinary(req.file.path, 'smart_campus/assignments');
      fileUrl = result.url;
    }

    const updated = await Assignment.findByIdAndUpdate(
      assignmentId,
      {
        status: 'submitted',
        submittedAt: new Date(),
        submissionFile: fileUrl,
        submittedBy: currentStudentId,
        studentId: currentStudentId,
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: 'Assignment not found' });

    await Notification.create({
      userId: currentStudentId,
      type: 'assignment',
      title: 'Assignment Submitted',
      message: `Your assignment "${updated.title}" has been submitted successfully.`,
      icon: 'check-circle',
      read: false,
    });

    res.json({ message: 'Assignment submitted successfully', assignment: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/assignments/:id
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Assignment.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Assignment not found' });
    res.json({ message: 'Assignment deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete assignment' });
  }
});

module.exports = router;
