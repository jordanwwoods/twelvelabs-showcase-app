import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

import Indexer from './components/Indexer/Indexer';
import Prompts from './components/Prompts/Prompts';
import CustomPrompt from './components/CustomPrompt/CustomPrompt';
import Results from './components/Results/Results';
import type { SearchResult } from './types';
import { API_BASE_URL } from './config';

function App() {
  const [apiKey, setApiKey] = useState(() => sessionStorage.getItem('twelveLabsApiKey') || '');
  const [indexId, setIndexId] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [engineeredPrompt, setEngineeredPrompt] = useState<string | null>(null);

  useEffect(() => {
    sessionStorage.setItem('twelveLabsApiKey', apiKey);
  }, [apiKey]);

  const handleSearch = async (prompt: string) => {
    if (!indexId) {
      setError('Please provide an Index ID.');
      return;
    }
    if (!apiKey) {
      setError('Please provide a Twelve Labs API Key.');
      return;
    }
    setLoading(true);
    setError(null);
    setEngineeredPrompt(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/search`, {
        indexId,
        prompt,
        apiKey, // Pass the API key to the backend
      });
      setResults(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred during search.');
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSearch = async (prompt: string) => {
    if (!indexId) {
      setError('Please provide an Index ID.');
      return;
    }
     if (!apiKey) {
      setError('Please provide a Twelve Labs API Key.');
      return;
    }
    setLoading(true);
    setError(null);
    setEngineeredPrompt(null);
    try {
      const engineerResponse = await axios.post(`${API_BASE_URL}/api/engineer-prompt`, {
        prompt,
        apiKey, // Pass the API key to the backend
      });
      const newPrompt = engineerResponse.data.engineeredPrompt;
      setEngineeredPrompt(newPrompt);
      await handleSearch(newPrompt);
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred while engineering the prompt.');
      setResults(null);
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <img src="/twelvelabslogo.jpg" alt="TwelveLabs Logo" className="app-logo" />
      
      <div className="api-key-input-container">
        <label htmlFor="apiKey">Twelve Labs API Key</label>
        <input
          id="apiKey"
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your Twelve Labs API key"
        />
      </div>

      <Indexer value={indexId} onChange={(e) => setIndexId(e.target.value)} />
      <Prompts onSearch={handleSearch} />
      <CustomPrompt onCustomSearch={handleCustomSearch} isLoading={loading} />
      
      {engineeredPrompt && (
        <div className="engineered-prompt-display">
          <strong>Engineered Prompt:</strong> {engineeredPrompt}
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      <Results indexId={indexId} apiKey={apiKey} results={results} loading={loading} />
    </div>
  );
}

export default App;