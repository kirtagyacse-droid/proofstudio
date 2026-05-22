'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ContentPackView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [testimonial, setTestimonial] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/testimonials/${id}`)
      .then(res => {
        if (res.status === 401) {
          router.push('/login');
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (data) setTestimonial(data.testimonial);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id, router]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) return <div className="container mt-8">Loading content pack...</div>;
  if (!testimonial || !testimonial.contentPack) return <div className="container mt-8">Content pack not found.</div>;

  const pack = testimonial.contentPack;
  const posts = JSON.parse(pack.linkedinPosts);

  return (
    <div className="container">
      <div className="flex gap-4 items-center mb-8">
        <Link href={`/project/${testimonial.projectId}`} className="btn" style={{ padding: '0.5rem 1rem' }}>
          &larr; Back to Project
        </Link>
        <h2 style={{ margin: 0 }}>Content Pack</h2>
      </div>

      <div className="grid grid-cols-2">
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 style={{ margin: 0 }}>LinkedIn Posts</h3>
          </div>
          <div className="flex flex-col gap-4">
            {posts.map((post: string, idx: number) => (
              <div key={idx} style={{ background: 'var(--bg)', padding: '1rem', borderRadius: 'var(--radius)', position: 'relative' }}>
                <p style={{ margin: 0, whiteSpace: 'pre-wrap', color: 'var(--text-main)', fontSize: '0.95rem' }}>{post}</p>
                <button 
                  className="btn" 
                  style={{ position: 'absolute', top: '10px', right: '10px', padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
                  onClick={() => handleCopy(post, `post-${idx}`)}
                >
                  {copied === `post-${idx}` ? 'Copied!' : 'Copy'}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h3 style={{ margin: 0 }}>Landing Page Block</h3>
              <button className="btn" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }} onClick={() => handleCopy(pack.landingBlock, 'landing')}>
                {copied === 'landing' ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div style={{ background: 'var(--bg)', padding: '1rem', borderRadius: 'var(--radius)' }}>
              <p style={{ margin: 0, whiteSpace: 'pre-wrap', color: 'var(--text-main)', fontSize: '0.95rem' }}>{pack.landingBlock}</p>
            </div>
          </div>

          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h3 style={{ margin: 0 }}>Short Video Script</h3>
              <button className="btn" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }} onClick={() => handleCopy(pack.shortVideoScript, 'video')}>
                {copied === 'video' ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div style={{ background: 'var(--bg)', padding: '1rem', borderRadius: 'var(--radius)' }}>
              <p style={{ margin: 0, whiteSpace: 'pre-wrap', color: 'var(--text-main)', fontSize: '0.95rem' }}>{pack.shortVideoScript}</p>
            </div>
          </div>

          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h3 style={{ margin: 0 }}>Case Study Outline</h3>
              <button className="btn" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }} onClick={() => handleCopy(pack.caseStudyOutline, 'case')}>
                {copied === 'case' ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div style={{ background: 'var(--bg)', padding: '1rem', borderRadius: 'var(--radius)' }}>
              <p style={{ margin: 0, whiteSpace: 'pre-wrap', color: 'var(--text-main)', fontSize: '0.95rem' }}>{pack.caseStudyOutline}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
