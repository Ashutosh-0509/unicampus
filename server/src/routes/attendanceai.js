const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Attendance = require('../models/Attendance');

const GROQ_API_KEY = process.env.GROQ_API_KEY;

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

        // Calculate predictions ourselves
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
                _advice_key: r.subject
            };
        });

        // Ask Groq only for short advice per subject
        const subjectList = records.map(r => `${r.subject}: ${r.percentage}%`).join(', ');

        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: 'llama3-8b-8192',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful academic advisor. Always respond in valid JSON only, no markdown.'
                    },
                    {
                        role: 'user',
                        content: `Give short Hinglish advice (5-8 words) for each subject and an overall message.
Subjects: ${subjectList}
Respond ONLY with JSON like: {"overall":"msg here","advices":{"Subject Name":"advice here"}}`
                    }
                ],
                temperature: 0.3,
                max_tokens: 300
            })
        });

        const groqData = await groqRes.json();
        console.log('Groq status:', groqRes.status);

        let advices = {};
        let overallMessage = atRisk > 0
            ? `${atRisk} subjects mein attendance 75% se kam hai!`
            : 'Sab subjects mein attendance achhi hai!';

        if (groqRes.ok) {
            const content = groqData?.choices?.[0]?.message?.content || '';
            console.log('Groq response:', content);
            try {
                const parsed = JSON.parse(content);
                advices = parsed.advices || {};
                overallMessage = parsed.overall || overallMessage;
            } catch (e) {
                console.log('Groq parse failed, using defaults');
            }
        }

        // Build final response
        const finalSubjects = subjects.map(s => ({
            subject: s.subject,
            current_percentage: s.current_percentage,
            risk_level: s.risk_level,
            lectures_needed: s.lectures_needed,
            can_miss: s.can_miss,
            predicted_percentage: s.predicted_percentage,
            advice: advices[s.subject] || (s.current_percentage < 75 ? 'Zyada lectures attend karo!' : 'Keep it up!')
        }));

        res.json({
            overall_risk: atRisk >= 2 ? 'HIGH' : atRisk === 1 ? 'MEDIUM' : 'SAFE',
            overall_message: overallMessage,
            subjects: finalSubjects
        });

    } catch (error) {
        console.error('Prediction error:', error.message);
        res.status(500).json({ error: 'Prediction failed: ' + error.message });
    }
});

module.exports = router;