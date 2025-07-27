import React from 'react';
import type { SearchResult } from '../../App';
import ResultCard from './ResultCard'; // Import the new component
import './Results.css';

// Updated Clip interface to match API response

interface ResultsProps {
  indexId: string;
  results: SearchResult | null;
  loading: boolean;
}

const Results: React.FC<ResultsProps> = ({ indexId, results, loading }) => {
  if (loading) {
    return <div className="results-container loading">Loading...</div>;
  }

  if (!results || !results.data || results.data.length === 0) {
    return null;
  }

  return (
    <div className="results-container">
      <h2>Results</h2>
      <div className="results-grid">
        {results.data.map((clip) => (
          <ResultCard key={`${clip.video_id}-${clip.start}`} indexId={indexId} clip={clip} />
        ))}
      </div>
    </div>
  );
};

export default Results;
