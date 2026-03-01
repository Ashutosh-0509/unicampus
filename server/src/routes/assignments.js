const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
const { protect, authorize } = require('../middleware/authMiddleware');

/**
 * @desc    Get all assignments for the student's branch and semester
 * @route   GET /api/assignments
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
  try {
    const { branch, semester } = req.user;
    const assignments = await Assignment.find({ branch, semester })
      .populate('assignedBy', 'name')
      .sort({ createdAt: -1 });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

/**
 * @desc    Create a new assignment
 * @route   POST /api/assignments
 * @access  Private (Faculty/Admin)
 */
router.post('/', protect, authorize('faculty', 'admin'), async (req, res) => {
  try {
    const assignment = new Assignment({
      ...req.body,
      assignedBy: req.user._id
    });
    await assignment.save();
    res.status(201).json(assignment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @desc    Submit an assignment
 * @route   POST /api/assignments/:id/submit
 * @access  Private (Student)
 */
router.post('/:id/submit', protect, async (req, res) => {
  try {
    const { file } = req.body;
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Check if already submitted
    const alreadySubmitted = assignment.submissions.find(
      s => s.studentId.toString() === req.user._id.toString()
    );

    if (alreadySubmitted) {
      return res.status(400).json({ error: 'Assignment already submitted' });
    }

    assignment.submissions.push({
      studentId: req.user._id,
      file,
      submittedAt: Date.now()
    });

    await assignment.save();
    res.status(200).json({ message: 'Assignment submitted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;
