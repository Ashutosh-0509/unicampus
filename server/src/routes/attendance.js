const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
    markAttendance,
    notifyAtRiskStudent,
    getAttendanceAnalytics,
} = require('../controllers/attendanceController');

// ✅ AI Analytics route — student accessible (MUST be before faculty-only middleware)
router.get('/analytics/:studentId', protect, getAttendanceAnalytics);

// Faculty-only routes
router.use(protect, authorize('faculty'));
router.post('/mark', markAttendance);
router.post('/notify-student', notifyAtRiskStudent);

module.exports = router;