const express = require('express');
const router = express.Router();
const { Notification } = require('../models');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

// GET /api/notifications
router.get('/', async (req, res) => {
  try {
    const userId = req.query.userId || req.user._id;
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 }).lean();
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// GET /api/notifications/unread-count
router.get('/unread-count', async (req, res) => {
  try {
    const userId = req.query.userId || req.user._id;
    const count = await Notification.countDocuments({ userId, read: false });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

// POST /api/notifications
router.post('/', async (req, res) => {
  try {
    const notification = await Notification.create({
      ...req.body,
      read: false,
    });
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

// PATCH /api/notifications/read-all
router.patch('/read-all', async (req, res) => {
  try {
    const userId = req.query.userId || req.user._id;
    const result = await Notification.updateMany({ userId, read: false }, { $set: { read: true } });
    res.json({ message: `${result.modifiedCount} notifications marked as read`, count: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, { $set: { read: true } }, { new: true });
    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark as read' });
  }
});

// POST /api/notifications/clear-all
router.post('/clear-all', async (req, res) => {
  try {
    const userId = req.body.userId || req.user._id;
    const result = await Notification.deleteMany({ userId });
    res.json({ message: 'All notifications cleared', count: result.deletedCount });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear notifications' });
  }
});

// DELETE /api/notifications/:id
router.delete('/:id', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

module.exports = router;
