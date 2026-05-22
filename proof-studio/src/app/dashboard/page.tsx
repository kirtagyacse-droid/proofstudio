'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Folder, MessageSquare, CreditCard, ArrowRight, ExternalLink } from 'lucide-react';

type Project = {
  id: string;
  name: string;
  niche: string;
  isDemo: boolean;
  _count?: {
    testimonials: number;
  };
};

export default function Dashboard() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/projects')
      .then(res => {
        if (res.status === 401) {
          router.push('/login');
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (data?.projects) setProjects(data.projects);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="container mt-8" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid var(--border-subtle)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
          <p className="text-secondary" style={{ margin: 0, fontWeight: 500 }}>Loading...</p>
        </div>
      </div>
    );
  }

  const realProjects = projects.filter(p => !p.isDemo);
  const totalTestimonials = realProjects.reduce((acc, p) => acc + (p._count?.testimonials || 0), 0);
  const totalProjects = realProjects.length;

  return (
    <div className="container">
      <div className="flex items-center justify-between mb-8" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0 }}>Dashboard</h1>
          <p className="text-secondary mb-0 mt-1">Manage your spaces and view global metrics</p>
        </div>
        <Link href="/dashboard/new" className="btn btn-primary">
          <Plus size={18} style={{ marginRight: '0.5rem' }} />
          New Project
        </Link>
      </div>

      {/* OVERVIEW SECTION */}
      <h2 className="section-label">OVERVIEW</h2>
      <div className="grid grid-cols-3 mb-8">
        <div className="card card-sm">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare size={16} color="var(--text-secondary)" />
            <span className="text-sm font-medium text-secondary">Total Testimonials</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {totalTestimonials}
          </div>
        </div>
        
        <div className="card card-sm">
          <div className="flex items-center gap-3 mb-2">
            <Folder size={16} color="var(--text-secondary)" />
            <span className="text-sm font-medium text-secondary">Active Projects</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {totalProjects}
          </div>
        </div>

        <div className="card card-sm">
          <div className="flex items-center gap-3 mb-2">
            <CreditCard size={16} color="var(--text-secondary)" />
            <span className="text-sm font-medium text-secondary">Current Plan</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Free
          </div>
        </div>
      </div>

      {/* PROJECTS SECTION */}
      <h2 className="section-label">PROJECTS</h2>
      
      {realProjects.length === 0 ? (
        <div style={{ border: '1px dashed var(--border-subtle)', borderRadius: '12px', padding: '4rem 2rem', textAlign: 'center' }}>
          <Folder size={32} color="var(--text-secondary)" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <h3 style={{ marginBottom: '0.5rem' }}>No projects yet</h3>
          <p className="text-secondary" style={{ marginBottom: '1.5rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
            Create your first project to start collecting and managing client testimonials.
          </p>
          <Link href="/dashboard/new" className="btn btn-secondary">
            Create Project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-3">
          {realProjects.map(project => (
            <Link href={`/project/${project.id}`} key={project.id} style={{ display: 'block', height: '100%' }}>
              <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: '160px' }}>
                <div className="flex justify-between items-start mb-2">
                  <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{project.name}</h3>
                  <ArrowRight size={16} color="var(--text-secondary)" />
                </div>
                <div className="text-sm text-secondary mb-4">{project.niche}</div>
                
                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                  <span className="text-xs text-secondary">
                    {project._count?.testimonials || 0} Testimonials
                  </span>
                  <span className="text-accent text-xs font-medium">Manage</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* DEMO PROJECTS */}
      {projects.some(p => p.isDemo) && (
        <div style={{ marginTop: '3rem' }}>
          <h2 className="section-label">DEMO PROJECTS</h2>
          <div className="grid grid-cols-3">
            {projects.filter(p => p.isDemo).map(project => (
              <Link href={`/project/${project.id}`} key={project.id} style={{ display: 'block', height: '100%' }}>
                <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: '160px', opacity: 0.8 }}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{project.name}</h3>
                    <ExternalLink size={16} color="var(--text-secondary)" />
                  </div>
                  <div className="text-sm text-secondary mb-4">{project.niche}</div>
                  
                  <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                    <span className="pill text-xs" style={{ backgroundColor: 'transparent', borderColor: 'var(--border-subtle)' }}>Demo</span>
                    <span className="text-accent text-xs font-medium">Explore</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
