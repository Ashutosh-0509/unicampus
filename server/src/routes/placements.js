const express = require('express');
const router = express.Router();
const { PlacementDrive } = require('../models/Placement');
const { protect } = require('../middleware/authMiddleware');

/**
 * @desc    Get all placement drives
 * @route   GET /api/placements
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
  try {
    const drives = await PlacementDrive.find()
      .sort({ deadline: 1 });
    res.json(drives);
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

/**
 * @desc    Apply for a placement drive
 * @route   POST /api/placements/:id/apply
 * @access  Private
 */
router.post('/:id/apply', protect, async (req, res) => {
  try {
    const drive = await PlacementDrive.findById(req.params.id);

    if (!drive) {
      return res.status(404).json({ error: 'Placement drive not found' });
    }

    if (drive.status !== 'open') {
      return res.status(400).json({ error: 'This drive is no longer accepting applications' });
    }

    if (drive.applicants.includes(req.user._id)) {
      return res.status(400).json({ error: 'Already applied' });
    }

    drive.applicants.push(req.user._id);
    await drive.save();

    res.json({ message: 'Application submitted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;
