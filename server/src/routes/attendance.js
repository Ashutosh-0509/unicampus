const express = require('express');
const router = express.Router();
const multer = require('multer');
const xlsx = require('xlsx');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const Attendance = require('../models/Attendance');
const { markAttendance, notifyAtRiskStudent, getAttendanceAnalytics } = require('../controllers/attendanceController');

// Multer setup for Excel upload
const storage = multer.memoryStorage();
const upload = multer({ storage });

/**
 * @route   POST /api/attendance/mark
 * @desc    Mark attendance for multiple students in a session
 * @access  Private (Faculty, Admin)
 */
router.post('/mark', protect, authorize('faculty', 'admin'), markAttendance);

/**
 * @route   POST /api/attendance/notify-risk
 * @desc    Send attendance alert notifications to student and parent
 * @access  Private (Faculty, Admin)
 */
router.post('/notify-risk', protect, authorize('faculty', 'admin'), notifyAtRiskStudent);

/**
 * @route   GET /api/attendance/analytics/:studentId
 * @desc    Get attendance analytics for a specific student
 * @access  Private
 */
router.get('/analytics/:studentId', protect, getAttendanceAnalytics);

/**
 * @route   POST /api/attendance/upload-excel
 * @desc    Bulk upload/update attendance via Excel
 * @access  Private (Faculty, Admin)
 */
router.post(
    '/upload-excel',
    protect,
    authorize('faculty', 'admin'),
    upload.single('file'),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = xlsx.utils.sheet_to_json(sheet);

            console.log(`📊 Excel rows received: ${rows.length}`);
            if (!rows.length) {
                return res.status(400).json({ error: 'Excel file is empty' });
            }

            let created = 0;
            let updated = 0;
            const errors = [];

            for (const row of rows) {
                try {
                    const studentId = String(
                        row['RollNo'] ||
                        row['rollno'] ||
                        row['StudentId'] ||
                        row['studentId'] ||
                        ''
                    ).trim();

                    const subject = String(
                        row['Subject'] || row['subject'] || ''
                    ).trim();

                    const attended = Number(row['Attended'] || 0);
                    const total = Number(row['Total'] || 0);
                    const branch = String(row['Branch'] || 'CS').trim();
                    const semester = Number(row['Semester'] || 1);
                    const credits = Number(row['Credits'] || 3);

                    const subjectCode = String(
                        row['SubjectCode'] ||
                        subject.substring(0, 6).toUpperCase()
                    );

                    if (!studentId || !subject) {
                        errors.push(`Row skipped - missing studentId or subject`);
                        continue;
                    }

                    const percentage = total > 0 ? Math.round((attended / total) * 100) : 0;

                    const result = await Attendance.findOneAndUpdate(
                        { studentId, subject },
                        {
                            $set: {
                                studentId,
                                subject,
                                subjectCode,
                                branch,
                                semester,
                                credits,
                                attended,
                                total,
                                percentage,
                                faculty: req.user?.name || 'Faculty',
                                lastUpdated: new Date(),
                            },
                        },
                        {
                            upsert: true,
                            returnDocument: 'after',
                            setDefaultsOnInsert: true,
                            rawResult: true,
                        }
                    );

                    if (result.lastErrorObject.upserted) {
                        created++;
                    } else {
                        updated++;
                    }

                } catch (err) {
                    console.error("Row error:", err.message);
                    errors.push(err.message);
                }
            }

            console.log(
                `✅ Done! Created: ${created}, Updated: ${updated}, Errors: ${errors.length}`
            );

            res.json({
                message: '✅ Excel processed successfully',
                created,
                updated,
                total: rows.length,
                errors: errors.slice(0, 5),
            });

        } catch (error) {
            console.error('❌ Excel upload error:', error);
            res.status(500).json({ error: 'Failed to process Excel: ' + error.message });
        }
    }
);

module.exports = router;
