require('dotenv').config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function testGemini25() {
    console.log('Testing Gemini 2.5 Flash...');

    const prompt = 'Respond ONLY with valid JSON: {"status": "ok", "message": "hello from 2.5"}';

    try {
        const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.1,
                        maxOutputTokens: 2000
                    }
                })
            }
        );

        const geminiData = await geminiRes.json();
        console.log('Status:', geminiRes.status);

        if (!geminiRes.ok) {
            console.error('Error Data:', JSON.stringify(geminiData, null, 2));
            return;
        }

        const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        console.log('Raw text:', rawText);
    } catch (error) {
        console.error('Fetch error:', error.message);
    }
}

testGemini25();
