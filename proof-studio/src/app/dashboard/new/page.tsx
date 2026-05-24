'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Loader from '@/components/Loader';

export default function NewProject() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [niche, setNiche] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, niche }),
    });

    if (res.ok) {
      router.push('/dashboard');
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || 'Failed to create project');
      setSaving(false);
    }
  };

  return (
    <div className="container">
      <div className="flex gap-4 items-center mb-8">
        <Link href="/dashboard" className="btn" style={{ padding: '0.5rem 1rem' }}>
          &larr; Back
        </Link>
        <h2 style={{ margin: 0 }}>Create New Project</h2>
      </div>

      <div className="card" style={{ maxWidth: '600px' }}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Project Name</label>
            <input 
              type="text" 
              className="input" 
              placeholder="e.g. Sales Mastery Course"
              value={name} 
              onChange={e => setName(e.target.value)} 
              required 
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Niche / Target Audience</label>
            <input 
              type="text" 
              className="input" 
              placeholder="e.g. B2B Sales Professionals"
              value={niche} 
              onChange={e => setNiche(e.target.value)} 
              required 
            />
          </div>
          
          {error && <div style={{ color: 'var(--danger)', fontSize: '0.9rem' }}>{error}</div>}
          
          <button type="submit" className="btn btn-primary mt-4" disabled={saving}>
            {saving ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Loader size={16} /> Creating...
              </span>
            ) : 'Create Project'}
          </button>
        </form>
      </div>
    </div>
  );
}
