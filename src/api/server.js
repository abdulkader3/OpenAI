const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const rateLimit = require('express-rate-limit');

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Create rate limiter
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3 // limit each IP to 3 requests per minute
});

app.use('/api/chat', limiter);

app.post('/api/chat', async (req, res) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: req.body.messages,
      temperature: 0.7,
      max_tokens: 150
    });
    res.json(response.choices[0].message);
  } catch (error) {
    res.status(error.status || 500).json({ 
      error: error.message 
    });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 