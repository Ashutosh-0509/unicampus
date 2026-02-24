const express = require('express');
const router = express.Router();
const axios = require('axios');
const { Attendance, BookIssue, Assignment } = require('../models');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// POST /api/chatbot/leave-advice
router.post('/leave-advice', async (req, res) => {
  try {
    const studentId = req.body.studentId || req.user.id;
    const { targetDate } = req.body;

    const attendanceData = await Attendance.find({ studentId }).lean();

    if (attendanceData.length === 0) {
      return res.json({
        recommendation: 'attend',
        message: 'No attendance records found. We recommend attending all classes.',
        subjects: [],
      });
    }

    try {
      const aiResponse = await axios.post(`${AI_SERVICE_URL}/chat/leave-advice`, {
        studentId,
        targetDate,
        attendanceData,
      }, { timeout: 10000 });

      return res.json(aiResponse.data);
    } catch (error) {
      // Fallback
    }

    const subjects = attendanceData.map((sub) => {
      const currentPct = parseFloat(sub.percentage) || 0;
      const newAttended = sub.attended || 0;
      const newTotal = (sub.total || 0) + 1;
      const projectedPct = ((newAttended / newTotal) * 100).toFixed(1);
      const risk = projectedPct < 65 ? 'high' : projectedPct < 75 ? 'medium' : 'low';

      return {
        subject: sub.subjectName || sub.subjectCode,
        faculty: sub.facultyName,
        currentPercentage: currentPct,
        projectedIfSkipped: parseFloat(projectedPct),
        attended: sub.attended,
        total: sub.total,
        risk,
        riskColor: risk === 'high' ? 'red' : risk === 'medium' ? 'amber' : 'green',
      };
    });

    const riskySubjects = subjects.filter((s) => s.risk !== 'low');
    const avgPct = subjects.reduce((sum, s) => sum + s.currentPercentage, 0) / subjects.length;

    let recommendation, message;
    if (riskySubjects.length > 0) {
      recommendation = 'attend';
      message = `⚠️ Skipping classes on ${targetDate || 'the target date'} would put ${riskySubjects.length} subject(s) at risk.`;
    } else if (avgPct > 85) {
      recommendation = 'safe_to_skip';
      message = `✅ Your overall attendance is strong. You can safely skip one day.`;
    } else {
      recommendation = 'caution';
      message = `⚡ Your attendance is moderate. Skipping is possible but monitor closely.`;
    }

    res.json({
      recommendation,
      message,
      subjects,
      targetDate: targetDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      generatedAt: new Date(),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate leave advice' });
  }
});

// POST /api/chatbot/library-renewal
router.post('/library-renewal', async (req, res) => {
  try {
    const studentId = req.body.studentId || req.user.id;
    const borrows = await BookIssue.find({ studentId, isReturned: false }).lean();

    if (borrows.length === 0) {
      return res.json({ suggest: false, message: 'No borrowed books.', books: [] });
    }

    const now = new Date();
    const booksNeedingRenewal = borrows.map((b) => {
      const dueDate = new Date(b.dueDate);
      const daysLeft = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
      return { ...b, daysLeft, urgent: daysLeft <= 3 };
    }).filter((b) => b.daysLeft <= 5);

    res.json({
      suggest: booksNeedingRenewal.length > 0,
      message: booksNeedingRenewal.length > 0 ? `📚 You have ${booksNeedingRenewal.length} book(s) due soon.` : 'All clear.',
      books: booksNeedingRenewal,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate library insights' });
  }
});

// POST /api/chatbot/academic-insights
router.post('/academic-insights', async (req, res) => {
  try {
    const studentId = req.body.studentId || req.user.id;
    const attendance = await Attendance.find({ studentId }).lean();
    const assignments = await Assignment.find({ studentId }).lean();

    const pending = assignments.filter((a) => a.status === 'pending');
    const avgAttendance = attendance.length > 0
      ? (attendance.reduce((sum, d) => sum + (d.percentage || 0), 0) / attendance.length).toFixed(1)
      : 0;

    res.json({
      summary: {
        averageAttendance: parseFloat(avgAttendance),
        totalSubjects: attendance.length,
        pendingAssignments: pending.length,
      },
      insights: [
        avgAttendance < 75 ? '⚠️ Attendance below 75%.' : '✅ Attendance is healthy.',
        pending.length > 0 ? `📝 ${pending.length} pending assignment(s).` : '✅ No pending assignments.',
      ],
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate academic insights' });
  }
});

module.exports = router;
