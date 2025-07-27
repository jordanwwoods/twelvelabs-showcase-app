require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const FormData = require('form-data');
const { OpenAI } = require('openai');

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = ['http://localhost:5173', 'https://master.d3velq4v6mncnz.amplifyapp.com'];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend server is running');
});

app.post('/api/search', async (req, res) => {
  const { indexId, prompt } = req.body;
  const apiKey = process.env.TWELVE_LABS_API_KEY;

  if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
    return res.status(500).json({ error: 'API key is missing or has not been set.' });
  }

  const formData = new FormData();
  formData.append('index_id', indexId);
  formData.append('query_text', prompt);
  formData.append('search_options', 'visual');
  formData.append('search_options', 'audio');
  formData.append('page_limit', '10');

  const options = {
    method: 'POST',
    url: 'https://api.twelvelabs.io/v1.3/search',
    headers: {
      ...formData.getHeaders(),
      'x-api-key': apiKey,
    },
    data: formData,
  };

  try {
    const response = await axios.request(options);
    res.json(response.data);
  } catch (error) {
    console.error('Error making search request to TwelveLabs:', error.response ? error.response.data : error.message);
    res.status(error.response ? error.response.status : 500).json({ 
      error: 'Failed to perform search.',
      details: error.response ? error.response.data : 'An unknown error occurred.',
    });
  }
});

app.post('/api/engineer-prompt', async (req, res) => {
  const { prompt } = req.body;
  const openaiApiKey = process.env.OPENAI_API_KEY;

  if (!openaiApiKey) {
    return res.status(500).json({ error: 'OpenAI API key is missing.' });
  }

  const openai = new OpenAI({ apiKey: openaiApiKey });

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a world-class prompt engineer specializing in the TwelveLabs video search API. Your task is to convert a user\'s simple query into a highly effective, detailed search prompt. The prompt must be descriptive, focusing on visual elements, on-screen text, actions, and spoken words. CRITICAL: The final prompt must be under 77 tokens. Be concise but powerful. Return only the engineered prompt text, with no additional explanation or pleasantries.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const engineeredPrompt = completion.choices[0].message.content.trim();
    res.json({ engineeredPrompt });

  } catch (error) {
    console.error('Error with OpenAI API:', error);
    res.status(500).json({ error: 'Failed to engineer prompt.' });
  }
});

app.get('/api/videos/:indexId/:videoId', async (req, res) => {
  const { indexId, videoId } = req.params;
  const apiKey = process.env.TWELVE_LABS_API_KEY;
  const url = `https://api.twelvelabs.io/v1.3/indexes/${indexId}/videos/${videoId}`;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key is missing.' });
  }

  console.log(`Proxying request for video info to: ${url}`);

  try {
    const response = await axios.get(url, {
      headers: {
        'x-api-key': apiKey,
      },
    });
    console.log('TwelveLabs Video API Response:', JSON.stringify(response.data, null, 2));
    res.json(response.data);
  } catch (error) {
    const status = error.response ? error.response.status : 500;
    const message = error.response ? error.response.data : 'Internal Server Error';
    console.error(`Error fetching video from Twelve Labs: ${status}`, message);
    res.status(status).json({ error: 'Failed to fetch video from Twelve Labs.', details: message });
  }
});

app.post('/api/analyze/:indexId/:videoId', async (req, res) => {
  const { videoId } = req.params; // indexId is not used by these endpoints
  const baseUrl = 'https://api.twelvelabs.io/v1.3';
  const axiosConfig = {
    headers: {
      'x-api-key': process.env.TWELVE_LABS_API_KEY,
      'Content-Type': 'application/json',
    },
  };

  try {
    console.log(`Analyzing video ${videoId} for title and summary.`);

    // Step 1: Get the title from the /gist endpoint (synchronous)
    const gistPromise = axios.post(`${baseUrl}/gist`, {
      video_id: videoId,
      types: ['title'],
    }, axiosConfig);

    // Step 2: Get the summary from the /summarize endpoint (synchronous)
    const summarizePromise = axios.post(`${baseUrl}/summarize`, {
      video_id: videoId,
      type: 'summary',
      prompt: 'Generate a concise, one-paragraph summary of the video.',
    }, axiosConfig);

    // Step 3: Execute both calls in parallel
    const [gistResponse, summarizeResponse] = await Promise.all([gistPromise, summarizePromise]);

    const title = gistResponse.data.title || 'Title not generated';
    const summary = summarizeResponse.data.summary || 'Summary not generated';

    console.log(`Successfully generated title: "${title}" and summary for video ${videoId}.`);
    res.json({ title, summary });

  } catch (error) {
    const errorDetails = error.response ? error.response.data : { message: error.message };
    console.error(`Error in /api/analyze for video ${videoId}:`, JSON.stringify(errorDetails, null, 2));
    res.status(500).json({ 
      message: 'Error analyzing video',
      error: errorDetails,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
