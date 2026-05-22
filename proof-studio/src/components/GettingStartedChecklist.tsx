'use client';

import React from 'react';

export type UserOnboarding = {
  completedFirstTestimonial: boolean;
  completedFirstContentPack: boolean;
  viewedWall: boolean;
};

interface GettingStartedChecklistProps {
  onboarding: UserOnboarding;
  projectId: string;
}

export default function GettingStartedChecklist({ onboarding, projectId }: GettingStartedChecklistProps) {
  const { completedFirstTestimonial, completedFirstContentPack, viewedWall } = onboarding;

  const allCompleted = completedFirstTestimonial && completedFirstContentPack && viewedWall;

  if (allCompleted) {
    return null;
  }

  const steps = [
    {
      title: 'Add your first testimonial',
      description: 'Paste a real client win into the form below.',
      completed: completedFirstTestimonial,
      ctaText: 'Add testimonial',
      action: () => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }
    },
    {
      title: 'Generate your first content pack',
      description: 'Turn a testimonial into LinkedIn posts, case studies, and more.',
      completed: completedFirstContentPack,
      ctaText: 'Generate pack',
      action: () => {} 
    },
    {
      title: 'View your Wall of Proof',
      description: 'See how your social proof looks on a public page.',
      completed: viewedWall,
      ctaText: 'View wall',
      link: `/p/${projectId}/wall`
    }
  ];

  return (
    <div className="card mb-8" style={{ borderLeft: '4px solid var(--accent-primary-soft)' }}>
      <div className="mb-6">
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Getting started</h3>
        <p className="text-sm text-secondary" style={{ margin: 0 }}>
          Hit these three steps to turn client wins into content and proof.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {steps.map((step, index) => (
          <div key={index} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1.25rem',
            padding: '1.25rem',
            backgroundColor: step.completed ? 'rgba(52, 211, 153, 0.03)' : 'var(--bg-subtle)',
            borderRadius: 'var(--radius-input)',
            border: `1px solid ${step.completed ? 'rgba(52, 211, 153, 0.15)' : 'var(--border-subtle)'}`,
            transition: 'var(--transition)'
          }}>
            <div style={{ 
              width: '24px', 
              height: '24px', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexShrink: 0,
              border: step.completed ? 'none' : '2px solid var(--text-muted)',
              backgroundColor: step.completed ? 'var(--accent-success)' : 'transparent',
              color: 'white',
            }}>
              {step.completed && (
                <svg width="12" height="9" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            
            <div style={{ flexGrow: 1 }}>
              <div style={{ fontWeight: '600', fontSize: '0.95rem', color: step.completed ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                {step.title}
              </div>
              <div className="text-xs text-muted mt-1" style={{ marginBottom: 0 }}>
                {step.description}
              </div>
            </div>

            {!step.completed && (
              <div style={{ flexShrink: 0 }}>
                {step.link ? (
                  <a href={step.link} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">
                    {step.ctaText}
                  </a>
                ) : (
                  <button 
                    className="btn btn-primary btn-sm" 
                    onClick={step.title.includes('testimonial') ? step.action : undefined}
                  >
                    {step.ctaText}
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
