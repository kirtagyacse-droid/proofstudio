'use client';

import React, { useState } from 'react';

type EmbedSnippetCardProps = {
  title: string;
  description: React.ReactNode;
  code: string;
};

export default function EmbedSnippetCard({ title, description, code }: EmbedSnippetCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card flex-col gap-4">
      <div>
        <div className="flex items-center gap-4 mb-2" style={{ flexWrap: 'wrap' }}>
          <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600 }}>{title}</h4>
          <span className="pill pill-accent text-xs">
            Embed Code
          </span>
        </div>
        <div className="text-sm text-secondary" style={{ lineHeight: 1.5 }}>
          {description}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div style={{ 
          background: 'var(--bg-subtle)', 
          border: '1px solid var(--border-subtle)', 
          borderRadius: 'var(--radius-input)', 
          padding: '1.25rem',
          overflowX: 'auto',
          boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.3)'
        }}>
          <code style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--text-primary)', whiteSpace: 'pre' }}>
            {code}
          </code>
        </div>
        
        <button 
          onClick={handleCopy} 
          className="btn btn-secondary btn-sm" 
          style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}
        >
          {copied ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              Copy Code
            </>
          )}
        </button>
      </div>
    </div>
  );
}
