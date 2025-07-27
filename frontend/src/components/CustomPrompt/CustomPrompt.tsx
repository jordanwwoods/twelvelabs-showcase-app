import React, { useState } from 'react';
import './CustomPrompt.css';

interface CustomPromptProps {
  onCustomSearch: (prompt: string) => void;
  isLoading: boolean;
}

const CustomPrompt: React.FC<CustomPromptProps> = ({ onCustomSearch, isLoading }) => {
  const [prompt, setPrompt] = useState('');

  const handleSearchClick = () => {
    if (prompt.trim()) {
      onCustomSearch(prompt);
    }
  };

  return (
    <div className="custom-prompt-container">
      <h3>Or, create your own prompt</h3>
      <div className="custom-prompt-input-group">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., 'a person riding a bicycle'"
          className="custom-prompt-input"
          disabled={isLoading}
        />
        <button onClick={handleSearchClick} className="custom-prompt-button" disabled={isLoading}>
          {isLoading ? 'Searching...' : 'Engineer & Search'}
        </button>
      </div>
    </div>
  );
};

export default CustomPrompt;
