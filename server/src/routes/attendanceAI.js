const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Attendance = require('../models/Attendance');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// ✅ AI Attendance Prediction
router.get('/predict/:studentId', protect, async (req, res) => {
    try {
        const { studentId } = req.params;
        const { totalLectures = 60 } = req.query; // Total lectures in semester

        // Fetch real attendance data
        const records = await Attendance.find({ studentId });

        if (!records.length) {
            return res.json({ predictions: [], message: 'No attendance data found' });
        }

        // Build prompt for Gemini
        const attendanceData = records.map(r => ({
            subject: r.subject,
            attended: r.attended,
            total: r.total,
            percentage: r.percentage,
        }));

        const remainingLectures = Number(totalLectures) - Math.max(...records.map(r => r.total));

        const prompt = `
You are an academic advisor AI. Analyze this student's attendance and give predictions.

Current Attendance Data:
${attendanceData.map(r => `- ${r.subject}: ${r.attended}/${r.total} classes (${r.percentage}%)`).join('\n')}

Total lectures in semester: ${totalLectures}
Lectures completed so far: ${Math.max(...records.map(r => r.total))}
Remaining lectures: ${remainingLectures}

For each subject, calculate:
1. Current percentage
2. If below 75%: How many MORE lectures must attend to reach 75%
3. If already above 75%: How many can miss and still stay above 75%
4. Predicted end-of-semester percentage if current trend continues
5. Risk level: HIGH (below 65%), MEDIUM (65-74%), SAFE (75%+)

Respond in JSON format only, no extra text:
{
  "overall_risk": "HIGH/MEDIUM/SAFE",
  "overall_message": "short motivational message in Hinglish",
  "subjects": [
    {
      "subject": "subject name",
      "current_percentage": 83,
      "risk_level": "SAFE",
      "lectures_needed": 0,
      "can_miss": 5,
      "predicted_percentage": 85,
      "advice": "short advice in Hinglish"
    }
  ]
}`;

        // Call Gemini API
        const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.3, maxOutputTokens: 1000 }
                })
            }
        );

        const geminiData = await geminiRes.json();
        const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '';

        // Parse JSON from response
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('Invalid Gemini response');

        const prediction = JSON.parse(jsonMatch[0]);
        res.json(prediction);

    } catch (error) {
        console.error('AI Prediction error:', error);
        res.status(500).json({ error: 'AI prediction failed: ' + error.message });
    }
});

module.exports = router;