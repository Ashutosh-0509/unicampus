const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { protect, authorize } = require('../middleware/authMiddleware');

/**
 * @desc    Get all active events
 * @route   GET /api/events
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
    try {
        const events = await Event.find({ isActive: true })
            .sort({ date: 1 });
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
});

/**
 * @desc    Create a new event
 * @route   POST /api/events
 * @access  Private (Faculty/Admin)
 */
router.post('/', protect, authorize('faculty', 'admin'), async (req, res) => {
    try {
        const event = new Event({
            ...req.body,
            createdBy: req.user._id
        });
        await event.save();
        res.status(201).json(event);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * @desc    Register for an event
 * @route   POST /api/events/:id/register
 * @access  Private
 */
router.post('/:id/register', protect, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        if (event.registeredStudents.length >= event.maxParticipants) {
            return res.status(400).json({ error: 'Event is full' });
        }

        if (event.registeredStudents.includes(req.user._id)) {
            return res.status(400).json({ error: 'Already registered' });
        }

        event.registeredStudents.push(req.user._id);
        await event.save();

        res.json({ message: 'Registered successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
});

module.exports = router;
