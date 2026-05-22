'use client';

import { useState } from 'react';
import { getVideoThumbnail, getEmbedUrl } from '@/lib/videoUtils';

interface VideoThumbnailProps {
  videoUrl: string;
  onClick: () => void;
}

export default function VideoThumbnail({ videoUrl, onClick }: VideoThumbnailProps) {
  const thumbnailUrl = getVideoThumbnail(videoUrl);
  const { type, embedUrl } = getEmbedUrl(videoUrl);
  const [mediaError, setMediaError] = useState(false);

  const handleContainerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick();
  };

  return (
    <div 
      onClick={handleContainerClick}
      className="video-thumbnail-wrapper group"
      style={{
        position: 'relative',
        cursor: 'pointer',
        overflow: 'hidden',
        borderRadius: '8px',
        aspectRatio: '16/9',
        backgroundColor: '#111',
      }}
    >
      <style jsx>{`
        .video-thumbnail-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .play-button {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 48px;
          height: 48px;
          background-color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 12px rgba(0,0,0,0.5);
          transition: transform 0.15s ease;
          z-index: 10;
        }
        .video-thumbnail-wrapper:hover .play-button {
          transform: translate(-50%, -50%) scale(1.1);
        }
        .play-icon {
          width: 20px;
          height: 20px;
          fill: black;
          margin-left: 4px; /* visually center the triangle */
        }
      `}</style>

      {/* Play button overlay */}
      <div className="play-button">
        <svg viewBox="0 0 24 24" className="play-icon">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
      </div>

      {thumbnailUrl && !mediaError ? (
        // Thumbnail Image
        <img 
          src={thumbnailUrl} 
          alt="Video thumbnail" 
          onError={() => setMediaError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: '8px',
          }}
        />
      ) : type === 'direct' && !mediaError ? (
        // Render a muted video element to naturally capture the first frame
        <video 
          src={embedUrl}
          preload="metadata"
          muted
          playsInline
          onError={() => setMediaError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: '8px',
          }}
        />
      ) : (
        // Dark placeholder
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#111',
        }}>
          {/* We don't render a separate SVG here because the white play-button is always visible */}
        </div>
      )}
    </div>
  );
}
