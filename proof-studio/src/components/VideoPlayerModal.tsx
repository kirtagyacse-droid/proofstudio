'use client';

import { useEffect, useRef } from 'react';
import { getEmbedUrl } from '@/lib/videoUtils';

interface VideoPlayerModalProps {
  videoUrl: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function VideoPlayerModal({ videoUrl, isOpen, onClose }: VideoPlayerModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const { type, embedUrl } = getEmbedUrl(videoUrl);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  return (
    <div 
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="video-modal-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(2, 6, 23, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.25s ease-out'
      }}
    >
      <style jsx>{`
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .video-modal-card {
          position: relative;
          width: 100%;
          max-width: 900px;
          background-color: var(--bg-elevated, #0b1020);
          border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.1));
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
          animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .close-button {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: var(--text-primary, #F9FAFB);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 1.2rem;
          transition: var(--transition, all 0.2s ease);
          z-index: 50;
        }
        .close-button:hover {
          background: var(--accent-danger, #F97373);
          color: #ffffff;
          transform: rotate(90deg);
        }
        .video-aspect-container {
          position: relative;
          width: 100%;
          padding-top: 56.25%; /* 16:9 Aspect Ratio */
          background-color: #000000;
        }
        .video-content {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: none;
        }
        .fallback-content {
          padding: 60px 24px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
      `}</style>

      <div className="video-modal-card">
        {/* Close Button */}
        <button onClick={onClose} className="close-button" aria-label="Close modal">
          ✕
        </button>

        {(type === 'youtube' || type === 'loom') && (
          <div className="video-aspect-container">
            <iframe 
              className="video-content"
              src={embedUrl}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ aspectRatio: '16/9', border: 'none', borderRadius: '8px' }}
            />
          </div>
        )}

        {type === 'direct' && (
          <div className="video-aspect-container">
            <video 
              className="video-content"
              controls 
              autoPlay 
              style={{ width: '100%', borderRadius: '8px' }}
            >
              <source src={embedUrl} />
              Your browser does not support this video format.
            </video>
          </div>
        )}

        {type === 'unknown' && (
          <div className="fallback-content">
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary, #9CA3AF)',
              marginBottom: '8px'
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>External Video Link</h3>
            <p style={{ maxWidth: '400px', fontSize: '0.9rem', color: 'var(--text-secondary, #9CA3AF)', margin: '0 auto 12px' }}>
              Cannot embed this video directly.
            </p>
            <a 
              href={videoUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-primary"
              style={{ borderRadius: '12px', fontSize: '0.9rem', display: 'inline-flex', gap: '8px' }}
            >
              Open video in new tab &rarr;
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
