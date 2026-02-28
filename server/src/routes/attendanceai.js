const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Attendance = require('../models/Attendance');

router.get('/predict/:studentId', protect, async (req, res) => {
    try {
        const { studentId } = req.params;
        const totalLectures = Number(req.query.totalLectures || 60);
        const records = await Attendance.find({ studentId });

        if (!records.length) {
            return res.json({ overall_risk: 'SAFE', overall_message: 'Koi data nahi!', subjects: [] });
        }

        const completedLectures = Math.max(...records.map(r => r.total));
        const remainingLectures = totalLectures - completedLectures;
        const atRisk = records.filter(r => r.percentage < 75).length;

        const subjects = records.map(r => {
            const needed = r.percentage < 75
                ? Math.max(0, Math.ceil(0.75 * (r.total + remainingLectures) - r.attended))
                : 0;
            const canMiss = r.percentage >= 75
                ? Math.max(0, Math.floor(r.attended - 0.75 * (r.total + remainingLectures)))
                : 0;
            const predicted = Math.min(100, Math.round(
                ((r.attended + remainingLectures * (r.percentage >= 75 ? 0.8 : 0.5)) / totalLectures) * 100
            ));
            return {
                subject: r.subject,
                current_percentage: r.percentage,
                risk_level: r.percentage < 65 ? 'HIGH' : r.percentage < 75 ? 'MEDIUM' : 'SAFE',
                lectures_needed: needed,
                can_miss: canMiss,
                predicted_percentage: predicted,
                advice: r.percentage < 75 ? 'Zyada lectures attend karo!' : 'Badhiya! Keep it up!'
            };
        });

        res.json({
            overall_risk: atRisk >= 2 ? 'HIGH' : atRisk === 1 ? 'MEDIUM' : 'SAFE',
            overall_message: atRisk > 0 ? `${atRisk} subjects mein attendance 75% se kam hai — jaldi sudhaaro!` : 'Sab subjects mein attendance achhi hai!',
            subjects
        });

    } catch (error) {
        console.error('Prediction error:', error.message);
        res.status(500).json({ error: 'Prediction failed: ' + error.message });
    }
});

module.exports = router;