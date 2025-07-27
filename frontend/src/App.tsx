import { useState } from 'react';
import axios from 'axios';
import './App.css';

export interface SearchResult {
  data: {
    video_id: string;
    start: number;
    end: number;
    confidence: string;
    thumbnail_url: string;
  }[];
}
import Indexer from './components/Indexer/Indexer';
import Prompts from './components/Prompts/Prompts';
import CustomPrompt from './components/CustomPrompt/CustomPrompt';
import Results from './components/Results/Results';

function App() {
  const [indexId, setIndexId] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [engineeredPrompt, setEngineeredPrompt] = useState('');

  const handleSearch = async (prompt: string) => {
    
    if (!indexId) {
      alert('Please enter an Index ID');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3001/api/search', {
        indexId,
        prompt,
      });
      setResults(response.data);
    } catch (error) {
      console.error('Error searching:', error);
      alert('An error occurred during the search.');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSearch = async (rawPrompt: string) => {
    if (!indexId) {
      alert('Please enter an Index ID');
      return;
    }
    setLoading(true);
    setResults(null);
    setEngineeredPrompt('');

    try {
      // Step 1: Engineer the prompt
      const engineerResponse = await axios.post('http://localhost:3001/api/engineer-prompt', {
        prompt: rawPrompt,
      });
      const finalPrompt = engineerResponse.data.engineeredPrompt;
      setEngineeredPrompt(finalPrompt);

      // Step 2: Search with the engineered prompt
      await handleSearch(finalPrompt);

    } catch (error) {
      console.error('Error during custom search:', error);
      alert('An error occurred during the custom search process.');
      setLoading(false); // Ensure loading is turned off on error
    }
  };

  return (
    <div className="App">
      <img src="/twelvelabslogo.jpg" alt="TwelveLabs Logo" className="app-logo" />
      <Indexer value={indexId} onChange={(e) => setIndexId(e.target.value)} />
            <Prompts onSearch={handleSearch} />
      <CustomPrompt onCustomSearch={handleCustomSearch} isLoading={loading} />
      {engineeredPrompt && (
        <div className="engineered-prompt-display">
          <p><strong>Engineered Prompt:</strong> {engineeredPrompt}</p>
        </div>
      )}
      <Results indexId={indexId} results={results} loading={loading} />
    </div>
  );
}

export default App;
