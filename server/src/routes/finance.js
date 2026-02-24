const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { FinanceRecord } = require('../models');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

// GET /api/finance
router.get('/', async (req, res) => {
  try {
    const { studentId, type, status } = req.query;
    const filter = {};
    if (studentId) filter.studentId = studentId;
    if (type) filter.type = type;
    if (status) filter.status = status;

    const records = await FinanceRecord.find(filter).sort({ createdAt: -1 }).lean();
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch finance records' });
  }
});

// POST /api/finance
router.post('/', async (req, res) => {
  try {
    const record = await FinanceRecord.create({
      id: uuidv4(),
      ...req.body,
    });
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create record' });
  }
});

// PUT /api/finance/:id
router.put('/:id', async (req, res) => {
  try {
    const updated = await FinanceRecord.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Record not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update record' });
  }
});

// GET /api/finance/summary
router.get('/summary', async (req, res) => {
  try {
    const data = await FinanceRecord.find().lean();
    const summary = {
      totalCollected: data.filter((d) => d.status === 'paid').reduce((s, d) => s + (d.amount || 0), 0),
      totalPending: data.filter((d) => d.status === 'pending').reduce((s, d) => s + (d.amount || 0), 0),
      totalRecords: data.length,
      byType: {},
    };
    data.forEach((item) => {
      if (!summary.byType[item.type]) summary.byType[item.type] = { paid: 0, pending: 0 };
      summary.byType[item.type][item.status] = (summary.byType[item.type][item.status] || 0) + (item.amount || 0);
    });
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch finance summary' });
  }
});

module.exports = router;
