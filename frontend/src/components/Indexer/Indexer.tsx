import React from 'react';
import './Indexer.css';

interface IndexerProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Indexer: React.FC<IndexerProps> = ({ value, onChange }) => {
  return (
    <div className="indexer-container">
      <label htmlFor="index-id-input">Index ID</label>
      <input
        id="index-id-input"
        type="text"
        placeholder="Enter your Index ID"
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

export default Indexer;
