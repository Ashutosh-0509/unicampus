const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Attendance = require('../models/Attendance');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

router.get('/predict/:studentId', protect, async (req, res) => {
    try {
        const { studentId } = req.params;
        const totalLectures = Number(req.query.totalLectures || 60);

        const records = await Attendance.find({ studentId });
        if (!records.length) {
            return res.json({
                overall_risk: 'SAFE',
                overall_message: 'Koi attendance data nahi mila!',
                subjects: []
            });
        }

        const completedLectures = Math.max(...records.map(r => r.total));
        const remainingLectures = totalLectures - completedLectures;

        const prompt = `You are an academic advisor. Analyze this student attendance data and respond ONLY with valid JSON, no markdown, no code blocks, no extra text.

Student Attendance:
${records.map(r => `${r.subject}: ${r.attended}/${r.total} = ${r.percentage}%`).join('\n')}

Total semester lectures: ${totalLectures}
Completed so far: ${completedLectures}
Remaining: ${remainingLectures}

Respond with this exact JSON:
{"overall_risk":"HIGH","overall_message":"short Hinglish message","subjects":[{"subject":"name","current_percentage":83,"risk_level":"SAFE","lectures_needed":0,"can_miss":5,"predicted_percentage":85,"advice":"short Hinglish advice"}]}`;

        const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.1,
                        maxOutputTokens: 2000,
                    }
                })
            }
        );

        const geminiData = await geminiRes.json();
        console.log('Gemini status:', geminiRes.status);

        if (!geminiRes.ok) {
            throw new Error(`Gemini API error: ${geminiData?.error?.message || 'Unknown'}`);
        }

        const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        console.log('Raw text:', rawText.substring(0, 300));

        let prediction;
        try {
            prediction = JSON.parse(rawText);
        } catch {
            const jsonMatch = rawText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                prediction = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('Could not parse response');
            }
        }

        res.json(prediction);

    } catch (error) {
        console.error('AI Prediction error:', error.message);
        res.status(500).json({ error: 'AI prediction failed: ' + error.message });
    }
});

module.exports = router;