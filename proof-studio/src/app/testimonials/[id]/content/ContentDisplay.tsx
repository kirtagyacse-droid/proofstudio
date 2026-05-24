'use client';

import React, { useState } from 'react';

export default function ContentDisplay({ 
  linkedinPosts, caseStudyOutline, landingBlock, shortVideoScript 
}: { 
  linkedinPosts: string[], caseStudyOutline: string, landingBlock: string, shortVideoScript: string 
}) {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const renderCopyBtn = (text: string, id: string) => (
    <button 
      onClick={() => copyToClipboard(text, id)}
      className="btn"
      style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
    >
      {copied === id ? 'Copied!' : 'Copy'}
    </button>
  );

  return (
    <div className="flex flex-col gap-8">
      {/* LinkedIn Posts */}
      <section>
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 style={{ margin: 0 }}>LinkedIn Posts</h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, fontStyle: 'italic' }}>
            Tip: Post one of these per week. Tag your client in the comments to boost reach.
          </p>
        </div>
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          {linkedinPosts.map((post, i) => (
            <div key={i} className="card flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h4 style={{ margin: 0, color: 'var(--primary)' }}>Option {i + 1}</h4>
                {renderCopyBtn(post, `li-${i}`)}
              </div>
              <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.95rem', color: 'var(--text-color)', lineHeight: 1.6 }}>
                {post}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="content-display-grid">
        {/* Case Study */}
        <section>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 style={{ margin: 0 }}>Mini Case Study</h3>
              {renderCopyBtn(caseStudyOutline, "cs")}
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, fontStyle: 'italic' }}>
              Tip: Expand this outline into a full blog post or a YouTube video script.
            </p>
          </div>
          <div className="card h-full" style={{ whiteSpace: 'pre-wrap', fontSize: '0.95rem', lineHeight: 1.6 }}>
            {caseStudyOutline}
          </div>
        </section>

        {/* Landing Block */}
        <section>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 style={{ margin: 0 }}>Landing Page Section</h3>
              {renderCopyBtn(landingBlock, "lb")}
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, fontStyle: 'italic' }}>
              Tip: Drop this right below your main call-to-action to maximize conversions.
            </p>
          </div>
          <div className="card h-full" style={{ whiteSpace: 'pre-wrap', fontSize: '0.95rem', lineHeight: 1.6 }}>
            {landingBlock}
          </div>
        </section>
      </div>

      {/* Video Script */}
      <section>
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 style={{ margin: 0 }}>Short-Form Video Script</h3>
            {renderCopyBtn(shortVideoScript, "vs")}
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, fontStyle: 'italic' }}>
            Tip: Record this in a talking-head style. Add bold text overlays for the hook.
          </p>
        </div>
        <div className="card" style={{ whiteSpace: 'pre-wrap', fontSize: '0.95rem', lineHeight: 1.6 }}>
          {shortVideoScript}
        </div>
      </section>
    </div>
  );
}
