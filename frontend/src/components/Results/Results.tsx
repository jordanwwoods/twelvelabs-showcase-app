import React from 'react';
import './Results.css';
import ResultCard from './ResultCard';
import type { SearchResult } from '../../types';

interface ResultsProps {
  indexId: string;
  apiKey: string;
  results: SearchResult | null;
  loading: boolean;
}

const Results: React.FC<ResultsProps> = ({ indexId, apiKey, results, loading }) => {
  if (loading) {
    return <div className="loading-spinner"></div>;
  }

  if (!results || results.data.length === 0) {
    return <div className="no-results"></div>;
  }

  return (
    <div className="results-grid">
      {results.data.map((result, i) => (
        <ResultCard
          key={`${result.video_id}-${i}`}
          indexId={indexId}
          apiKey={apiKey}
          videoId={result.video_id}
          start={result.start}
          end={result.end}
          confidence={result.confidence}
          thumbnailUrl={result.thumbnail_url}
        />
      ))}
    </div>
  );
};

export default Results;