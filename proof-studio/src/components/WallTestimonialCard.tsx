'use client';

import { useState } from 'react';
import { getTranslations } from '@/lib/translations';
import VideoThumbnail from './VideoThumbnail';
import VideoPlayerModal from './VideoPlayerModal';

type Testimonial = {
  id: string;
  rawText: string;
  resultMetric: string;
  clientName: string;
  clientRole: string;
  allowNameDisplay: boolean;
  isVideo?: boolean;
  videoUrl?: string | null;
  transcript?: string | null;
  rating?: number | null;
};

export default function WallTestimonialCard({
  testimonial: t,
  color,
  isOwner,
  lang,
}: {
  testimonial: Testimonial;
  color: string;
  isOwner: boolean;
  lang?: string;
}) {
  const trans = getTranslations(lang);
  const [removed, setRemoved] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState('');
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const handleRemove = async () => {
    setRemoving(true);
    setError('');
    try {
      const res = await fetch(`/api/testimonials/${t.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: false }),
      });
      if (res.ok) {
        setRemoved(true);
      } else {
        setError('Failed to remove');
        setRemoving(false);
      }
    } catch {
      setError('Network error');
      setRemoving(false);
    }
  };

  if (removed) return null;

  return (
    <>
      <style>{`
        .cute-card {
          background-color: var(--bg-elevated);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-card);
          padding: 1.75rem;
          box-shadow: var(--shadow-card);
          transition: var(--transition);
          display: flex;
          flex-direction: column;
          position: relative;
          color: var(--text-primary);
        }
        .cute-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, rgba(255, 255, 255, 0.08), transparent);
          pointer-events: none;
        }
        .cute-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 30px 60px rgba(10, 15, 30, 0.9), 0 0 20px rgba(99, 102, 241, 0.05);
          border-color: var(--accent-color, rgba(99, 102, 241, 0.35));
        }
        .cute-remove-btn {
          background: rgba(249, 115, 115, 0.1);
          border: 1px solid rgba(249, 115, 115, 0.2);
          color: var(--accent-danger);
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: var(--transition);
          font-weight: bold;
          font-size: 0.75rem;
        }
        .cute-remove-btn:hover {
          background: var(--accent-danger);
          color: #fff;
          box-shadow: 0 0 10px rgba(249, 115, 115, 0.4);
        }
      `}</style>
      <div
        className="cute-card"
        style={{ '--accent-color': color, borderTop: `4px solid ${color}` } as React.CSSProperties}
      >
        {isOwner && (
          <div style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 10 }}>
            <button onClick={handleRemove} disabled={removing} title="Remove from wall" className="cute-remove-btn">
              {removing ? '...' : '✕'}
            </button>
            {error && <span style={{ color: 'var(--accent-danger)', fontSize: '11px', display: 'block', marginTop: '4px', fontWeight: 500 }}>{error}</span>}
          </div>
        )}

        {t.rating && (
          <div style={{ display: 'flex', gap: '3px', marginBottom: '1.25rem' }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <svg 
                key={star} 
                width="15" 
                height="15" 
                viewBox="0 0 24 24" 
                fill={star <= t.rating ? color : 'none'} 
                stroke={star <= t.rating ? color : 'rgba(148, 163, 184, 0.4)'} 
                strokeWidth="2"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            ))}
          </div>
        )}

        {t.isVideo && t.videoUrl && (
          <div style={{ 
            marginBottom: '1.25rem', 
            borderRadius: '12px', 
            overflow: 'hidden', 
            aspectRatio: '16/9', 
            backgroundColor: '#020617', 
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            border: '1px solid var(--border-subtle)'
          }}>
            <VideoThumbnail
              videoUrl={t.videoUrl}
              onClick={() => setIsVideoModalOpen(true)}
            />
          </div>
        )}

        <div style={{ flexGrow: 1, marginBottom: '1.5rem' }}>
          <p style={{
            fontSize: '0.95rem',
            lineHeight: '1.65',
            color: 'var(--text-primary)',
            paddingLeft: '12px',
            borderLeft: `2.5px solid ${t.isVideo ? 'transparent' : 'rgba(99, 102, 241, 0.4)'}`,
            fontStyle: 'italic',
            fontWeight: 400
          }}>
            "{t.isVideo && !t.rawText ? t.transcript || trans.videoTestimonial : t.rawText}"
          </p>
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
          {t.resultMetric && (
            <div style={{
              display: 'inline-block',
              backgroundColor: 'rgba(52, 211, 153, 0.08)',
              color: 'var(--accent-success)',
              border: '1px solid rgba(52, 211, 153, 0.25)',
              fontWeight: 600,
              padding: '3px 10px',
              borderRadius: '99px',
              fontSize: '0.7rem',
              marginBottom: '1rem'
            }}>
              {trans.resultLabel}: {t.resultMetric}
            </div>
          )}
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '38px', height: '38px', borderRadius: '50%',
              background: `linear-gradient(135deg, ${color} 0%, rgba(99,102,241,0.5) 100%)`, 
              color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 'bold', fontSize: '0.95rem', 
              boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
            }}>
              {(t.clientName || 'A')[0].toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                {t.allowNameDisplay ? t.clientName || trans.clientDefault : trans.anonymous}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t.clientRole}</div>
            </div>
          </div>
        </div>
      </div>
      {t.isVideo && t.videoUrl && (
        <VideoPlayerModal
          videoUrl={t.videoUrl}
          isOpen={isVideoModalOpen}
          onClose={() => setIsVideoModalOpen(false)}
        />
      )}
    </>
  );
}
