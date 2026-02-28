require('dotenv').config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function listModels() {
    console.log('Listing models...');
    try {
        const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`
        );
        const data = await res.json();
        console.log('Status:', res.status);
        if (data.models) {
            console.log('Available models:');
            data.models.forEach(m => console.log(m.name));
        } else {
            console.log('No models found or error:', JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

listModels();
