const express = require('express');
const router = express.Router();
const Doubt = require('../models/Doubt');
const { protect } = require('../middleware/authMiddleware');

/**
 * @desc    Get all doubts
 * @route   GET /api/doubts
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
    try {
        const doubts = await Doubt.find()
            .populate('studentId', 'name branch')
            .sort({ createdAt: -1 });
        res.json(doubts);
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
});

/**
 * @desc    Post a new doubt
 * @route   POST /api/doubts
 * @access  Private (Student)
 */
router.post('/', protect, async (req, res) => {
    try {
        const { title, description, subject } = req.body;
        const doubt = new Doubt({
            title,
            description,
            subject,
            studentId: req.user._id
        });
        await doubt.save();
        res.status(201).json(doubt);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * @desc    Respond to a doubt
 * @route   POST /api/doubts/:id/respond
 * @access  Private
 */
router.post('/:id/respond', protect, async (req, res) => {
    try {
        const { message } = req.body;
        const doubt = await Doubt.findById(req.params.id);

        if (!doubt) {
            return res.status(404).json({ error: 'Doubt not found' });
        }

        doubt.responses.push({
            sender: req.user.name,
            senderId: req.user._id,
            message
        });

        await doubt.save();
        res.status(201).json(doubt);
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
});

module.exports = router;
