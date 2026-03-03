const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Attendance = require('../models/Attendance');

const GROQ_API_KEY = process.env.GROQ_API_KEY;

router.get('/predict/:studentId', protect, async (req, res) => {
    try {
        const { studentId } = req.params;
        const totalLectures = 60; // Hardcoded as per requirement

        const records = await Attendance.find({ studentId });
        if (!records.length) {
            return res.json({
                overall_risk: 'SAFE',
                overall_message: 'Attendance data nahi mila!',
                subjects: []
            });
        }

        // 1. Group by subject and take latest (to avoid duplicates)
        const uniqueRecordsMap = {};
        records.forEach(r => {
            if (!uniqueRecordsMap[r.subject] || new Date(r.updatedAt) > new Date(uniqueRecordsMap[r.subject].updatedAt)) {
                uniqueRecordsMap[r.subject] = r;
            }
        });
        const uniqueRecords = Object.values(uniqueRecordsMap);

        const completedLectures = Math.max(...uniqueRecords.map(r => r.total), 0);
        const remainingLectures = Math.max(0, totalLectures - completedLectures);

        // 2. Mathematical Calculations
        const subjects = uniqueRecords.map(r => {
            const attended = r.attended;
            // Requirement: max(0, ceil(0.75 * totalLectures - attended))
            const needed = Math.max(0, Math.ceil(0.75 * totalLectures - attended));

            // can_miss calculation: (attended + remaining) - required_total
            const canMiss = Math.max(0, Math.floor((attended + remainingLectures) - (0.75 * totalLectures)));

            // realistic prediction: assume attending 80% of remaining
            const predicted = Math.min(100, Math.round(((attended + (remainingLectures * 0.8)) / totalLectures) * 100));

            return {
                subject: r.subject,
                current_percentage: r.percentage,
                risk_level: r.percentage < 65 ? 'HIGH' : r.percentage < 75 ? 'MEDIUM' : 'SAFE',
                lectures_needed: needed,
                can_miss: canMiss,
                predicted_percentage: predicted
            };
        });

        const atRiskCount = subjects.filter(s => s.current_percentage < 75).length;

        // 3. Groq advice fetch
        const subjectSummary = uniqueRecords.map(r => `${r.subject}: ${r.percentage}%`).join(', ');

        let advices = {};
        let overallMessage = atRiskCount > 0
            ? `${atRiskCount} subjects mein attendance 75% se kam hai. Focus badhao!`
            : 'Sab subjects mein attendance sahi chal rahi hai. Maintain it!';

        if (GROQ_API_KEY) {
            try {
                const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${GROQ_API_KEY}`
                    },
                    body: JSON.stringify({
                        model: 'llama-3.1-8b-instant',
                        messages: [
                            {
                                role: 'system',
                                content: 'You are an academic advisor. Respond ONLY in valid JSON. Minimal text.'
                            },
                            {
                                role: 'user',
                                content: `Give short Hinglish advice (5-8 words) for each subject and an overall summary message. 
Subjects: ${subjectSummary}
Respond ONLY with this JSON structure: {"overall": "msg", "advices": {"Subject Name": "advice"}}`
                            }
                        ],
                        temperature: 0.3,
                        max_tokens: 500
                    })
                });

                if (groqRes.ok) {
                    const groqData = await groqRes.json();
                    const content = groqData?.choices?.[0]?.message?.content || '';

                    // Robust JSON parse
                    try {
                        const startIdx = content.indexOf('{');
                        const endIdx = content.lastIndexOf('}');
                        if (startIdx !== -1 && endIdx !== -1) {
                            const parsed = JSON.parse(content.substring(startIdx, endIdx + 1));
                            advices = parsed.advices || {};
                            overallMessage = parsed.overall || overallMessage;
                        }
                    } catch (e) {
                        console.warn('Groq response parsing failed:', e.message);
                    }
                } else {
                    console.error('Groq API Error status:', groqRes.status);
                }
            } catch (err) {
                console.error('Groq connection failed:', err.message);
            }
        }

        // 3. Final Assembly
        const finalSubjects = subjects.map(s => ({
            ...s,
            advice: advices[s.subject] || (s.current_percentage < 75 ? 'Lectures attend karna shuru kardo!' : 'Achha kaam kar rahe ho, jaari rakho!')
        }));

        res.json({
            overall_risk: atRiskCount >= 2 ? 'HIGH' : atRiskCount === 1 ? 'MEDIUM' : 'SAFE',
            overall_message: overallMessage,
            subjects: finalSubjects
        });

    } catch (error) {
        console.error('Prediction error:', error.message);
        res.status(500).json({ error: 'Prediction processing failed' });
    }
});

module.exports = router;