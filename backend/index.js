const express = require('express');
const { TwelveLabs } = require('twelvelabs-node');
const cors = require('cors');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Use the OpenAI key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'https://master.d3velq4v6mncnz.amplifyapp.com'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};

app.use(cors(corsOptions));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).send('Backend is healthy');
});

// Search endpoint
app.post('/api/search', async (req, res) => {
  const { indexId, prompt, apiKey } = req.body;
  if (!indexId || !prompt || !apiKey) {
    return res.status(400).json({ error: 'indexId, prompt, and apiKey are required' });
  }

  try {
    const client = new TwelveLabs({ apiKey });
    const response = await client.search.query({
      indexId,
      query: prompt,
      searchOptions: ['visual', 'conversation'],
      pageLimit: 10,
    });
    res.json(response);
  } catch (error) {
    console.error('Error in /api/search:', error);
    res.status(500).json({ error: 'Failed to perform search' });
  }
});

// Prompt engineering endpoint
app.post('/api/engineer-prompt', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a world-class prompt engineer for the Twelve Labs multimodal video understanding API. Your task is to refine a user's simple query into a highly effective, descriptive prompt. The prompt must not exceed 77 tokens. Focus on visual descriptions and potential spoken phrases. Return only the engineered prompt in your response, with no additional text or pleasantries.`,
        },
        { role: 'user', content: prompt },
      ],
    });
    res.json({ engineeredPrompt: completion.choices[0].message.content });
  } catch (error) {
    console.error('Error in /api/engineer-prompt:', error);
    res.status(500).json({ error: 'Failed to engineer prompt' });
  }
});

// Video analysis endpoint (for title and summary)
app.post('/api/analyze', async (req, res) => {
  const { indexId, videoId, apiKey } = req.body;
  if (!indexId || !videoId || !apiKey) {
    return res.status(400).json({ error: 'indexId, videoId, and apiKey are required' });
  }

  try {
    const client = new TwelveLabs({ apiKey });

    // Gist Task
    const gistTask = await client.task.create({
      indexId,
      videoId,
      features: ['gist'],
    });

    // Wait for gist task to complete
    await client.task.waitFor(gistTask.id, {
      timeout: 1200 * 1000,
      pollingInterval: 5 * 1000,
    });
    const gistData = await client.task.retrieve(gistTask.id);
    const title = gistData.video?.metadata?.gist?.title || 'Untitled Video';
    
    // Summarize Task
    const summarizeTask = await client.task.create({
      indexId,
      videoId,
      features: ['summarize'],
      prompt: 'Create a concise, one-paragraph summary of the video content.',
    });

    // Wait for summarize task to complete
    await client.task.waitFor(summarizeTask.id, {
      timeout: 1200 * 1000,
      pollingInterval: 5 * 1000,
    });
    const summarizeData = await client.task.retrieve(summarizeTask.id);
    const summary = summarizeData.video?.metadata?.summary?.content || 'Summary could not be generated.';

    res.json({ title, summary });
  } catch (error) {
    console.error(`Error in /api/analyze for video ${videoId}:`, error);
    res.status(500).json({ error: 'Failed to analyze video' });
  }
});

// Video stream retrieval endpoint
app.post('/api/videos', async (req, res) => {
  const { indexId, videoId, apiKey } = req.body;
   if (!indexId || !videoId || !apiKey) {
    return res.status(400).json({ error: 'indexId, videoId, and apiKey are required' });
  }

  try {
    const client = new TwelveLabs({ apiKey });
    const video = await client.video.retrieve(indexId, videoId);
    res.json(video);
  } catch (error) {
    console.error(`Error retrieving video ${videoId}:`, error);
    if (error.response && error.response.status === 404) {
        res.status(404).json({ error: 'Video not ready or not found.' });
    } else {
        res.status(500).json({ error: 'Failed to retrieve video stream info.' });
    }
  }
});


app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});