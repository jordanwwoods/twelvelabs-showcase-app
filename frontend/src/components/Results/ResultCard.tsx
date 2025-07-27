import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Hls from 'hls.js';
import { API_BASE_URL } from '../../config';
import './ResultCard.css';

interface ResultCardProps {
  indexId: string;
  apiKey: string;
  videoId: string;
  start: number;
  end: number;
  confidence: string;
  thumbnailUrl: string;
}

const ResultCard: React.FC<ResultCardProps> = ({ indexId, apiKey, videoId, start, end, confidence, thumbnailUrl }) => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState<string>('Generating title...');
  const [explanation, setExplanation] = useState<string>('Generating summary...');
  const [error, setError] = useState<string | null>('Video is processing...');
  const [isFlipped, setIsFlipped] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let isMounted = true;
    let pollInterval: number | undefined;

    const fetchPlayableVideo = async () => {
      try {
        // The video URL doesn't need the API key as it's a direct stream URL from Twelve Labs,
        // which our backend retrieves for us.
        const response = await axios.get(`${API_BASE_URL}/api/videos/${indexId}/${videoId}`);
        if (isMounted) {
          if (response.data && response.data.hls && response.data.hls.video_url) {
            setVideoUrl(response.data.hls.video_url);
            setError(null);
            if (pollInterval) clearInterval(pollInterval);
          } else if (!pollInterval) {
            pollInterval = window.setInterval(fetchPlayableVideo, 5000);
          }
        }
      } catch (err) {
        if (isMounted) {
          if (axios.isAxiosError(err) && err.response?.status === 404) {
            if (!pollInterval) pollInterval = window.setInterval(fetchPlayableVideo, 5000);
          } else {
            setError('Failed to load video stream.');
            if (pollInterval) clearInterval(pollInterval);
          }
        }
      }
    };

    const analyzeVideo = async () => {
      try {
        // The analyze endpoint *does* need the API key.
        const response = await axios.post(`${API_BASE_URL}/api/analyze`, {
          indexId,
          videoId,
          apiKey, // Pass the API key to the backend
        });
        if (isMounted) {
          setVideoTitle(response.data.title || 'Untitled Video');
          setExplanation(response.data.summary || 'Summary could not be generated.');
        }
      } catch (err) {
        if (isMounted) {
          setVideoTitle('Untitled Video');
          setExplanation('Summary could not be generated.');
        }
        console.error('Error analyzing video:', err);
      }
    };

    fetchPlayableVideo();
    analyzeVideo();

    return () => {
      isMounted = false;
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [indexId, videoId, apiKey]);

  useEffect(() => {
    if (videoRef.current && videoUrl) {
      const videoElement = videoRef.current;
      const hls = new Hls();

      if (Hls.isSupported()) {
        hls.loadSource(videoUrl);
        hls.attachMedia(videoElement);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          videoElement.currentTime = start;
        });
      } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
        videoElement.src = videoUrl;
        videoElement.currentTime = start;
      }

      return () => {
        hls.destroy();
      };
    }
  }, [videoUrl, start]);

  const formatTime = (seconds: number) => new Date(seconds * 1000).toISOString().substr(11, 8);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className={`result-card ${isFlipped ? 'is-flipped' : ''}`}>
      <div className="card-inner">
        <div className="card-front">
          <h3 className="video-title">{videoTitle}</h3>
          <div className="video-wrapper">
            {videoUrl ? (
              <video ref={videoRef} controls width="100%" height="100%" crossOrigin="anonymous" />
            ) : (
              <div className="thumbnail-container">
                <img src={thumbnailUrl} alt="Video thumbnail" className="thumbnail-img" />
                <div className="loader-overlay">
                  {error ? <p className="error-message">{error}</p> : <div className="loader"></div>}
                </div>
              </div>
            )}
          </div>
          <div className="clip-info">
            <span>{formatTime(start)} - {formatTime(end)}</span>
            <span>Confidence: {confidence}</span>
          </div>
          <button onClick={handleFlip} className="flip-button">i</button>
        </div>
        <div className="card-back">
          <div className="metadata-content">
            <h4>Relevance Analysis</h4>
            <p>{explanation}</p>
            <h4>Clip Details</h4>
            <p><strong>Video:</strong> {videoTitle}</p>
            <p><strong>Timestamp:</strong> {formatTime(start)} - {formatTime(end)}</p>
            <p><strong>Confidence:</strong> {confidence}</p>
          </div>
          <button onClick={handleFlip} className="flip-button">↩</button>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;