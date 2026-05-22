'use client';

import { useEffect, useState, use } from 'react';
import Image from 'next/image';
import { getTranslations } from '@/lib/translations';

function getAccentStyles(brandColor: string) {
  let cleanHex = brandColor || '#6366F1';
  if (!cleanHex.startsWith('#')) {
    cleanHex = '#' + cleanHex;
  }
  
  let r = 99, g = 102, b = 241;
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(cleanHex);
  if (match) {
    r = parseInt(match[1], 16);
    g = parseInt(match[2], 16);
    b = parseInt(match[3], 16);
  } else {
    const shortMatch = /^#?([a-f\d])([a-f\d])([a-f\d])$/i.exec(cleanHex);
    if (shortMatch) {
      r = parseInt(shortMatch[1] + shortMatch[1], 16);
      g = parseInt(shortMatch[2] + shortMatch[2], 16);
      b = parseInt(shortMatch[3] + shortMatch[3], 16);
    }
  }

  const rs = Math.round(r * 0.8 + 255 * 0.2);
  const gs = Math.round(g * 0.8 + 255 * 0.2);
  const bs = Math.round(b * 0.8 + 255 * 0.2);
  const softColor = `rgb(${rs}, ${gs}, ${bs})`;
  
  return `
    :root {
      --accent-primary: ${cleanHex} !important;
      --accent-primary-soft: ${softColor} !important;
      --accent-glow: rgba(${r}, ${g}, ${b}, 0.15) !important;
    }
  `;
}

export default function PublicForm({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [clientName, setClientName] = useState('');
  const [clientRole, setClientRole] = useState('');
  const [rawText, setRawText] = useState('');
  const [resultMetric, setResultMetric] = useState('');
  const [allowNameDisplay, setAllowNameDisplay] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(`/api/f/${projectId}`);
        if (res.ok) {
          const data = await res.json();
          setProject(data.project);
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchProject();
  }, [projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const t = getTranslations(project?.language);
    try {
      const res = await fetch(`/api/f/${projectId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName,
          clientRole,
          rawText,
          resultMetric,
          allowNameDisplay
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        alert(t.failedToSubmit);
      }
    } catch (err) {
      alert(t.networkError);
    }
    setSubmitting(false);
  };

  if (loading) return <div className="container mt-8" style={{ textAlign: 'center' }}>Loading...</div>;
  if (!project) return <div className="container mt-8" style={{ textAlign: 'center' }}>Form not found or unavailable.</div>;

  const brandColor = project.brandColor || '#6366F1';
  const t = getTranslations(project.language);

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, var(--bg-page-start) 0%, var(--bg-page-end) 100%)', 
      color: 'var(--text-primary)',
      padding: '4rem 1rem', 
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1
    }}>
      <style dangerouslySetInnerHTML={{ __html: getAccentStyles(brandColor) }} />
      {/* Background glow based on project brandColor */}
      <div style={{
        position: 'absolute',
        top: '30%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px',
        height: '600px',
        background: `radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)`,
        zIndex: -1,
        pointerEvents: 'none',
        filter: 'blur(80px)'
      }} />

      <div className="card animate-in" style={{ 
        maxWidth: '580px', 
        width: '100%', 
        margin: '0 auto', 
        borderTop: `6px solid var(--accent-primary)`,
        boxShadow: 'var(--shadow-card), 0 0 40px var(--accent-glow)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          {project.logoUrl ? (
            <img 
              src={project.logoUrl} 
              alt={project.brandName || project.name} 
              style={{ maxHeight: '72px', maxWidth: '100%', objectFit: 'contain', margin: '0 auto 1.25rem auto', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }} 
            />
          ) : (
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '12px', 
              background: `linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-primary-soft) 100%)`, 
              margin: '0 auto 1.25rem auto', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontWeight: 800, 
              fontSize: '1.25rem', 
              boxShadow: `0 4px 15px var(--accent-glow)` 
            }}>
              {(project.brandName || project.name).charAt(0).toUpperCase()}
            </div>
          )}
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
            {project.brandName || project.name}
          </h1>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem', animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ 
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(52, 211, 153, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              color: 'var(--accent-success)',
              fontSize: '2rem',
              fontWeight: 'bold',
              boxShadow: '0 0 20px rgba(52, 211, 153, 0.1)'
            }}>
              ✓
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.75rem' }}>{t.successHeader}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
              {project.formThankYouText || t.formThankYouTextDefault}
            </p>
          </div>
        ) : (
          <>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', textAlign: 'center', fontSize: '0.95rem', lineHeight: 1.5 }}>
              {project.formWelcomeText || t.formWelcomeTextDefault}
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{t.clientNameLabel}</label>
                <input 
                  type="text" 
                  className="input" 
                  value={clientName} 
                  onChange={e => setClientName(e.target.value)} 
                  placeholder="e.g. Jane Doe"
                  required 
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{t.clientRoleLabel}</label>
                <input 
                  type="text" 
                  className="input" 
                  value={clientRole} 
                  onChange={e => setClientRole(e.target.value)} 
                  placeholder="e.g. Founder, CEO"
                  required 
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{t.testimonialLabel}</label>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.65rem', lineHeight: 1.4 }}>{t.testimonialHint}</div>
                <textarea 
                  className="textarea" 
                  value={rawText} 
                  onChange={e => setRawText(e.target.value)} 
                  placeholder="..."
                  style={{ minHeight: '130px' }}
                  required 
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{t.metricLabel}</label>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.65rem', lineHeight: 1.4 }}>{t.metricHint}</div>
                <input 
                  type="text" 
                  className="input" 
                  value={resultMetric} 
                  onChange={e => setResultMetric(e.target.value)} 
                  placeholder="e.g. Saved 10 hours a week"
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
                <input 
                  type="checkbox" 
                  id="allowName" 
                  checked={allowNameDisplay} 
                  onChange={e => setAllowNameDisplay(e.target.checked)} 
                  style={{
                    accentColor: 'var(--accent-primary)',
                    width: '18px',
                    height: '18px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                />
                <label htmlFor="allowName" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', cursor: 'pointer', userSelect: 'none' }}>
                  {t.consentLabel}
                </label>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ 
                  background: `linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-primary-soft) 100%)`, 
                  color: '#fff', 
                  border: 'none', 
                  marginTop: '0.75rem', 
                  padding: '0.85rem 1.5rem',
                  boxShadow: `0 4px 14px var(--accent-glow)`,
                  fontWeight: 600
                }}
                disabled={submitting}
              >
                {submitting ? t.submitting : t.submitButton}
              </button>
            </form>
          </>
        )}
      </div>

      {!project.logoUrl && (
        <div style={{ position: 'absolute', bottom: '1.5rem', width: '100%', textAlign: 'center' }}>
          <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem', opacity: 0.7, transition: 'opacity 0.2s' }} onMouseOver={e => e.currentTarget.style.opacity = '1'} onMouseOut={e => e.currentTarget.style.opacity = '0.7'}>
            <span>Powered by</span>
            <Image src="/logo-icon.png" alt="ProofStudio" width={20} height={20} />
            <span style={{ fontWeight: 600 }}>ProofStudio</span>
          </a>
        </div>
      )}
    </div>
  );
}
