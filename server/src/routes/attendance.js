const express = require('express');
const router = express.Router();
const multer = require('multer');
const xlsx = require('xlsx');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const Attendance = require('../models/Attendance');
const { markAttendance, notifyAtRiskStudent, getAttendanceAnalytics } = require('../controllers/attendanceController');

const upload = multer({ storage: multer.memoryStorage() });

router.get('/predict/:studentId', protect, async (req, res) => {
    console.log(`🤖 AI Prediction requested for student: ${req.params.studentId}`);
    try {
        const { studentId } = req.params;
        const totalLectures = Number(req.query.totalLectures || 60);
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

        if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not found');

        const records = await Attendance.find({ studentId });
        if (!records.length) {
            console.log(`⚠️ No records found for student: ${studentId}`);
            return res.json({
                overall_risk: 'SAFE',
                overall_message: 'Attendance data not found for prediction.',
                subjects: []
            });
        }

        const completedLectures = Math.max(...records.map(r => r.total || 0));
        const remainingLectures = Math.max(0, totalLectures - completedLectures);

        const prompt = `You are an academic advisor. Respond ONLY with valid JSON. No markdown, no explanation.
Student Attendance:
${records.map(r => `${r.subject}: ${r.attended}/${r.total} = ${r.percentage}%`).join('\n')}

Total semester lectures: ${totalLectures}
Completed so far: ${completedLectures}
Remaining: ${remainingLectures}

For subjects below 75% calculate lectures needed to reach 75%.
Respond EXACTLY in this JSON format:
{"overall_risk":"HIGH","overall_message":"short Hinglish message","subjects":[{"subject":"name","current_percentage":83,"risk_level":"SAFE","lectures_needed":0,"can_miss":5,"predicted_percentage":85,"advice":"short Hinglish advice"}]}`;

        const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.2,
                        maxOutputTokens: 1500
                    }
                })
            }
        );

        const geminiData = await geminiRes.json();
        if (!geminiRes.ok) {
            console.error('❌ Gemini Error:', geminiData);
            throw new Error(geminiData?.error?.message || 'Gemini API error');
        }

        const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        let prediction;
        try {
            prediction = JSON.parse(rawText.replace(/```json|```/g, '').trim());
        } catch {
            const match = rawText.match(/\{[\s\S]*\}/);
            if (!match) throw new Error('Invalid JSON from AI');
            prediction = JSON.parse(match[0]);
        }

        console.log('✅ AI Prediction successful');
        res.json(prediction);
    } catch (error) {
        console.error('❌ AI Prediction error:', error.message);
        res.status(500).json({ error: 'AI prediction failed', details: error.message });
    }
});

// ✅ GET attendance
router.get('/', protect, async (req, res) => {
    try {
        const { studentId, subject } = req.query;
        let query = {};
        if (req.user.role === 'student') {
            query.studentId = req.user.rollNumber || req.user.studentId || String(req.user._id);
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

router.get('/analytics/:studentId', protect, getAttendanceAnalytics);

// ✅ POST attendance
router.post('/', protect, authorize('faculty', 'admin'), async (req, res) => {
    try {
        const { studentId, subject, attended, total, faculty, branch, semester, credits } = req.body;
        if (!studentId || !subject) return res.status(400).json({ error: 'studentId and subject required' });
        const percentage = total > 0 ? Math.round((attended / total) * 100) : 0;
        const record = await Attendance.findOneAndUpdate(
            { studentId, subject },
            { $set: { studentId, subject, attended, total, percentage, faculty, branch, semester, credits, lastUpdated: new Date() } },
            { upsert: true, new: true }
        );
        res.json(record);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ Excel Upload
router.post('/upload-excel', protect, authorize('faculty', 'admin'), upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = xlsx.utils.sheet_to_json(sheet);
        console.log(`📊 Excel rows received: ${rows.length}`);
        if (!rows.length) return res.status(400).json({ error: 'Excel file is empty' });
        let created = 0, updated = 0;
        const errors = [];
        for (const row of rows) {
            try {
                const studentId = String(row['RollNo'] || row['rollno'] || row['StudentId'] || row['studentId'] || '').trim();
                const subject = String(row['Subject'] || row['subject'] || '').trim();
                const attended = Number(row['Attended'] || row['attended'] || 0);
                const total = Number(row['Total'] || row['total'] || 0);
                const branch = String(row['Branch'] || row['branch'] || 'CS').trim();
                const semester = Number(row['Semester'] || row['semester'] || 1);
                const credits = Number(row['Credits'] || row['credits'] || 3);
                const subjectCode = String(row['SubjectCode'] || row['subjectCode'] || subject.substring(0, 6).toUpperCase());
                if (!studentId || !subject) { errors.push('Missing studentId or subject'); continue; }
                const percentage = total > 0 ? Math.round((attended / total) * 100) : 0;
                const result = await Attendance.findOneAndUpdate(
                    { studentId, subject },
                    { $set: { studentId, subject, subjectCode, branch, semester, credits, attended, total, percentage, faculty: req.user?.name || 'Faculty', lastUpdated: new Date() } },
                    { upsert: true, new: true, rawResult: true }
                );
                if (result.lastErrorObject?.upserted) created++;
                else updated++;
            } catch (e) {
                console.error('Row error:', e.message);
                errors.push(e.message);
            }
        }
        console.log(`✅ Done! Created: ${created}, Updated: ${updated}`);
        res.json({ message: '✅ Excel processed!', created, updated, total: rows.length, errors: errors.slice(0, 5) });
    } catch (error) {
        console.error('❌ Excel upload error:', error);
        res.status(500).json({ error: 'Failed to process Excel: ' + error.message });
    }
});

router.put('/:id', protect, authorize('faculty', 'admin'), async (req, res) => {
    try {
        const record = await Attendance.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!record) return res.status(404).json({ error: 'Record not found' });
        res.json(record);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/mark', protect, authorize('faculty', 'admin'), markAttendance);
router.post('/notify-student', protect, authorize('faculty', 'admin'), notifyAtRiskStudent);


// End of AI route (moved up)

module.exports = router;