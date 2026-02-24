const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { MaintenanceTicket, Notification } = require('../models');
const { upload, uploadToCloudinary } = require('../utils/cloudinary');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

// GET /api/maintenance/tickets
router.get('/tickets', async (req, res) => {
  try {
    const { studentId, status } = req.query;
    const filter = {};
    if (studentId) filter.studentId = studentId;
    if (status) filter.status = status;

    const tickets = await MaintenanceTicket.find(filter).sort({ createdAt: -1 }).lean();
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// GET /api/maintenance/tickets/:id
router.get('/tickets/:id', async (req, res) => {
  try {
    const ticket = await MaintenanceTicket.findOne({ id: req.params.id }).lean();
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch ticket' });
  }
});

// POST /api/maintenance/ticket
router.post('/ticket', upload.single('photo'), async (req, res) => {
  try {
    const { studentId, category, description, roomNumber } = req.body;

    if (!studentId || !category || !description || !roomNumber) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    let photoUrl = null;
    if (req.file) {
      const result = await uploadToCloudinary(req.file.path, 'smart_campus/maintenance');
      photoUrl = result.url;
    }

    const ticket = await MaintenanceTicket.create({
      id: uuidv4(),
      studentId,
      roomNumber,
      category,
      description,
      photo: photoUrl,
      status: 'requested',
      stages: {
        requested: { completed: true, at: new Date() },
        assigned: { completed: false },
        in_progress: { completed: false },
        fixed: { completed: false },
      },
    });

    await Notification.create({
      id: uuidv4(),
      userId: studentId,
      type: 'hostel',
      title: 'Maintenance Request Submitted',
      message: `Your maintenance request ${ticket.id} (${category}) has been submitted successfully.`,
      icon: 'wrench',
      read: false,
    });

    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/maintenance/ticket/:id/assign
router.patch('/ticket/:id/assign', async (req, res) => {
  try {
    const ticket = await MaintenanceTicket.findOne({ id: req.params.id });
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    ticket.status = 'assigned';
    ticket.stages.assigned = { completed: true, at: new Date(), assignedTo: req.body.assignedTo || 'Technician' };
    await ticket.save();

    await Notification.create({
      id: uuidv4(),
      userId: ticket.studentId,
      type: 'hostel',
      title: 'Technician Assigned',
      message: `Your maintenance request ${ticket.id} has been assigned to ${req.body.assignedTo || 'a technician'}.`,
      icon: 'wrench',
      read: false,
    });

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: 'Failed to assign technician' });
  }
});

// GET /api/maintenance/stats
router.get('/stats', async (req, res) => {
  try {
    const data = await MaintenanceTicket.find().lean();
    const stats = {
      total: data.length,
      requested: data.filter((d) => d.status === 'requested').length,
      assigned: data.filter((d) => d.status === 'assigned').length,
      in_progress: data.filter((d) => d.status === 'in_progress').length,
      fixed: data.filter((d) => d.status === 'fixed').length,
      resolved: data.filter((d) => d.status === 'resolved').length,
      byCategory: {},
    };
    data.forEach((t) => {
      stats.byCategory[t.category] = (stats.byCategory[t.category] || 0) + 1;
    });
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;
