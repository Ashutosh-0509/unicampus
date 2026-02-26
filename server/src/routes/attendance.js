const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const multer = require('multer');
const xlsx = require('xlsx');
const Attendance = require('../models/Attendance');

const {
    markAttendance,
    notifyAtRiskStudent,
    getAttendanceAnalytics,
} = require('../controllers/attendanceController');

// Multer memory storage for Excel
const upload = multer({ storage: multer.memoryStorage() });

// ✅ AI Analytics — student accessible
router.get('/analytics/:studentId', protect, getAttendanceAnalytics);

// ✅ GET all attendance — faculty, admin, student accessible
router.get('/', protect, async (req, res) => {
    try {
        const { studentId, subject } = req.query;
        let query = {};

        // Students can only see their own data
        if (req.user.role === 'student') {
            query.studentId = req.user.studentId || req.user.rollNumber || req.user.id;
        } else {
            if (studentId) query.studentId = studentId;
            if (subject) query.subject = subject;
        }

        const records = await Attendance.find(query).sort({ lastUpdated: -1 });
        res.json(records);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ Excel Bulk Upload — faculty only
router.post('/upload-excel', protect, authorize('faculty', 'admin'), upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = xlsx.utils.sheet_to_json(sheet);

        if (!rows.length) return res.status(400).json({ error: 'Excel file is empty' });

        let created = 0, updated = 0;
        const errors = [];

        for (const row of rows) {
            try {
                const studentId = String(row['RollNo'] || row['rollno'] || row['StudentId'] || row['studentId'] || row['Roll Number'] || '').trim();
                const subject = String(row['Subject'] || row['subject'] || '').trim();
                const attended = Number(row['Attended'] || row['attended'] || 0);
                const total = Number(row['Total'] || row['total'] || 0);
                const branch = String(row['Branch'] || row['branch'] || 'CS').trim();
                const semester = Number(row['Semester'] || row['semester'] || 1);
                const credits = Number(row['Credits'] || row['credits'] || 3);
                const subjectCode = String(row['SubjectCode'] || row['subjectCode'] || subject.substring(0, 6).toUpperCase());

                if (!studentId || !subject) { errors.push(`Missing studentId or subject`); continue; }

                const percentage = total > 0 ? Math.round((attended / total) * 100) : 0;
                const existing = await Attendance.findOne({ studentId, subject });

                if (existing) {
                    existing.attended = attended;
                    existing.total = total;
                    existing.percentage = percentage;
                    existing.lastUpdated = new Date();
                    await existing.save();
                    updated++;
                } else {
                    await Attendance.create({
                        studentId, subject, subjectCode,
                        branch, semester, credits,
                        attended, total, percentage,
                        faculty: req.user?.name || 'Faculty',
                        lastUpdated: new Date(),
                    });
                    created++;
                }
            } catch (e) { errors.push(e.message); }
        }

        res.json({ message: '✅ Excel processed!', created, updated, total: rows.length, errors: errors.slice(0, 5) });

    } catch (error) {
        console.error('Excel upload error:', error);
        res.status(500).json({ error: 'Failed to process Excel: ' + error.message });
    }
});

// ✅ Update single attendance record
router.put('/:id', protect, authorize('faculty', 'admin'), async (req, res) => {
    try {
        const record = await Attendance.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!record) return res.status(404).json({ error: 'Record not found' });
        res.json(record);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Faculty-only routes
router.use(protect, authorize('faculty', 'admin'));
router.post('/mark', markAttendance);
router.post('/notify-student', notifyAtRiskStudent);

module.exports = router;