const express = require('express');
const router = express.Router();
const { getAuth } = require('@clerk/express');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Retries when Google reports temporary overload (503)
async function generateWithRetry(prompt, attempts = 3) {
  for (let i = 0; i < attempts; i++) {
    try {
      return await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt
      });
    } catch (err) {
      const busy = String(err.message).includes('503') || String(err.message).includes('UNAVAILABLE');
      if (!busy || i === attempts - 1) throw err;
      await sleep(1500 * (i + 1));
    }
  }
}

router.post('/generate', async (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const { topic, tone } = req.body;
    if (!topic || !topic.trim()) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const prompt = `Generate 3 short, punchy content ideas (with a hook/caption each) for a social media post about: "${topic}". Tone: ${tone || 'casual and confident'}. Format as a numbered list, no extra commentary.`;

    const response = await generateWithRetry(prompt);
    res.json({ ideas: response.text });
  } catch (err) {
    console.error('AI GENERATE ERROR:', err.message);
    res.status(503).json({
      error: err.message,
      friendly: 'The AI is busy right now. Please try again in a few seconds.'
    });
  }
});

module.exports = router;