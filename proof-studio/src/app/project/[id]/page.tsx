/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import EmbedSnippetCard from '@/components/EmbedSnippetCard';
import GettingStartedChecklist, { UserOnboarding } from '@/components/GettingStartedChecklist';
import VideoThumbnail from '@/components/VideoThumbnail';
import VideoPlayerModal from '@/components/VideoPlayerModal';
import Loader from '@/components/Loader';

function getAccentStyles(brandColor: string) {
  let cleanHex = brandColor || '#6366F1';
  if (!cleanHex.startsWith('#')) {
    cleanHex = '#' + cleanHex;
  }
  
  return `
    :root {
      --accent-primary: ${cleanHex} !important;
    }
  `;
}

export default function ProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [userOnboarding, setUserOnboarding] = useState<UserOnboarding | null>(null);
  const [hasRealProjects, setHasRealProjects] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [clientName, setClientName] = useState('');
  const [rawText, setRawText] = useState('');
  const [clientRole, setClientRole] = useState('');
  const [resultMetric, setResultMetric] = useState('');
  const [tone, setTone] = useState('Professional');
  const [tags, setTags] = useState('');
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);
  const [isAddingTestimonial, setIsAddingTestimonial] = useState(false);

  // Video State
  const [isVideo, setIsVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [transcript, setTranscript] = useState('');
  const [rating, setRating] = useState('');
  
  const [activeVideoUrl, setActiveVideoUrl] = useState('');
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'testimonials' | 'settings'>('testimonials');
  
  // Settings state
  const [brandName, setBrandName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [brandColor, setBrandColor] = useState('#6366F1');
  const [language, setLanguage] = useState('en');
  const [formWelcomeText, setFormWelcomeText] = useState('');
  const [formThankYouText, setFormThankYouText] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  // Filter state
  const [filterTag, setFilterTag] = useState('All');
  const [filterMetric, setFilterMetric] = useState('All');

  // CSV State
  const [isImporting, setIsImporting] = useState(false);

  // AI Case Study Modal State
  const [isCaseStudyModalOpen, setIsCaseStudyModalOpen] = useState(false);
  const [caseStudyTestimonial, setCaseStudyTestimonial] = useState<any>(null);
  const [csBusinessName, setCsBusinessName] = useState('');
  const [csBusinessRole, setCsBusinessRole] = useState('');
  const [csBusinessDesc, setCsBusinessDesc] = useState('');
  const [csTone, setCsTone] = useState('Conversational');
  const [csLength, setCsLength] = useState('Standard (2–3 minutes)');
  
  const [isGeneratingCaseStudy, setIsGeneratingCaseStudy] = useState(false);
  const [generatedCaseStudyText, setGeneratedCaseStudyText] = useState('');
  const [isEditingCaseStudy, setIsEditingCaseStudy] = useState(false);
  const [caseStudyError, setCaseStudyError] = useState('');
  const [csCopiedSuccess, setCsCopiedSuccess] = useState(false);
  const [isSavingCaseStudy, setIsSavingCaseStudy] = useState(false);
  const [showRegenerateWarning, setShowRegenerateWarning] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedName = localStorage.getItem('proofstudio_biz_name');
      const savedRole = localStorage.getItem('proofstudio_biz_role');
      const savedDesc = localStorage.getItem('proofstudio_biz_desc');
      if (savedName) setCsBusinessName(savedName);
      if (savedRole) setCsBusinessRole(savedRole);
      if (savedDesc) setCsBusinessDesc(savedDesc);
    }
  }, []);

  const openCaseStudyModal = (t: any) => {
    setCaseStudyTestimonial(t);
    setCaseStudyError('');
    setCsCopiedSuccess(false);
    setIsEditingCaseStudy(false);
    setShowRegenerateWarning(false);
    
    if (t.caseStudy) {
      setGeneratedCaseStudyText(t.caseStudy);
    } else {
      setGeneratedCaseStudyText('');
    }
    
    setIsCaseStudyModalOpen(true);
  };

  const handleGenerateCaseStudy = async () => {
    if (!caseStudyTestimonial) return;
    
    setIsGeneratingCaseStudy(true);
    setCaseStudyError('');
    setCsCopiedSuccess(false);
    
    try {
      const res = await fetch(`/api/testimonials/${caseStudyTestimonial.id}/case-study`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: csBusinessName,
          businessRole: csBusinessRole,
          businessDescription: csBusinessDesc,
          tone: csTone,
          length: csLength
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        setGeneratedCaseStudyText(data.caseStudy);
        
        // Save business info to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('proofstudio_biz_name', csBusinessName);
          localStorage.setItem('proofstudio_biz_role', csBusinessRole);
          localStorage.setItem('proofstudio_biz_desc', csBusinessDesc);
        }
        
        // Refresh project testimonials to update locally stored case study
        await fetchProject();
      } else {
        const errorData = await res.json();
        setCaseStudyError(errorData.error || 'Failed to generate case study.');
      }
    } catch (err) {
      setCaseStudyError('Network error or server unreachable.');
    } finally {
      setIsGeneratingCaseStudy(false);
      setShowRegenerateWarning(false);
    }
  };

  const handleSaveCaseStudyEdits = async () => {
    if (!caseStudyTestimonial) return;
    
    setIsSavingCaseStudy(true);
    setCaseStudyError('');
    
    try {
      const res = await fetch(`/api/testimonials/${caseStudyTestimonial.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseStudy: generatedCaseStudyText
        })
      });
      
      if (res.ok) {
        setIsEditingCaseStudy(false);
        alert('Case study changes saved successfully!');
        await fetchProject();
      } else {
        const errorData = await res.json();
        setCaseStudyError(errorData.error || 'Failed to save changes.');
      }
    } catch (err) {
      setCaseStudyError('Network error or server unreachable.');
    } finally {
      setIsSavingCaseStudy(false);
    }
  };

  const handleCopyCaseStudy = () => {
    if (!generatedCaseStudyText) return;
    navigator.clipboard.writeText(generatedCaseStudyText);
    setCsCopiedSuccess(true);
    setTimeout(() => setCsCopiedSuccess(false), 2000);
  };

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/projects/${id}`);
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setProject(data.project);
        setUserOnboarding(data.userOnboarding);
        setHasRealProjects(data.hasRealProjects);
        setBrandName(data.project.brandName || '');
        setLogoUrl(data.project.logoUrl || '');
        setBrandColor(data.project.brandColor || '#6366F1');
        setLanguage(data.project.language || 'en');
        setFormWelcomeText(data.project.formWelcomeText || '');
        setFormThankYouText(data.project.formThankYouText || '');
      }
    } catch {
      // Network error or JSON parse failure — silently stop loading
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  useEffect(() => {
    if (project?.isDemo) {
      fetch('/api/user/seen-demo', { method: 'POST' }).catch(console.error);
    }
  }, [project?.isDemo]);

  const handleAddTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingTestimonial(true);
    const res = await fetch('/api/testimonials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        projectId: id, 
        clientName, 
        rawText, 
        clientRole, 
        resultMetric, 
        tone, 
        tags, 
        isVideo, 
        videoUrl, 
        transcript,
        rating: rating ? parseInt(rating, 10) : null
      }),
    });

    if (res.ok) {
      setClientName('');
      setRawText('');
      setClientRole('');
      setResultMetric('');
      setTone('Professional');
      setRating('');
      setTags('');
      setVideoUrl('');
      setTranscript('');
      setIsVideo(false);
      await fetchProject();
    }
    setIsAddingTestimonial(false);
  };

  const handleGenerate = async (testimonialId: string) => {
    setGeneratingFor(testimonialId);
    try {
      const res = await fetch(`/api/testimonials/${testimonialId}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        await fetchProject();
        router.push(`/testimonials/${testimonialId}/content`);
      } else {
        const errorData = await res.json();
        alert(`Error generating content: ${errorData.error}`);
      }
    } catch (err) {
      alert('Network error or server unreachable');
    } finally {
      setGeneratingFor(null);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    const res = await fetch(`/api/projects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brandName, logoUrl, brandColor, language, formWelcomeText, formThankYouText }),
    });
    if (res.ok) {
      alert('Settings saved!');
      fetchProject();
    }
    setSavingSettings(false);
  };

  const handleToggleFeatured = async (testimonialId: string, isFeatured: boolean) => {
    // Optimistic UI Update
    setProject((prev: any) => {
      if (!prev) return prev;
      return {
        ...prev,
        testimonials: prev.testimonials.map((t: any) => 
          t.id === testimonialId ? { ...t, isFeatured: !isFeatured } : t
        )
      };
    });

    try {
      const res = await fetch(`/api/testimonials/${testimonialId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: !isFeatured }),
      });
      if (!res.ok) {
        // Revert on failure
        fetchProject();
      }
    } catch (err) {
      console.error(err);
      fetchProject();
    }
  };

  const handleCsvImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      
      let importedCount = 0;
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const columns = line.split(','); 
        if (columns.length >= 6) {
          const [cName, cRole, cResult, cTone, cTags, ...rest] = columns;
          const cText = rest.join(',').replace(/^"|"$/g, '');

          await fetch('/api/testimonials', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              projectId: id, 
              clientName: cName, 
              clientRole: cRole, 
              resultMetric: cResult, 
              tone: cTone || 'Professional', 
              tags: cTags,
              rawText: cText,
              source: 'csv'
            }),
          });
          importedCount++;
        }
      }
      alert(`Imported ${importedCount} testimonials`);
      setIsImporting(false);
      fetchProject();
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  if (loading) {
    return (
      <div className="container mt-8" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <svg className="animate-spin" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="3" style={{ animation: 'spin 1s linear infinite' }}><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
          <p className="text-secondary" style={{ margin: 0 }}>Loading project...</p>
        </div>
      </div>
    );
  }
  if (!project) return <div className="container mt-8 text-center"><p>Project not found.</p></div>;

  const baseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  const formUrl = `${baseUrl}/f/${id}`;
  const wallUrl = `${baseUrl}/p/${id}/wall`;
  const embedCode = `<iframe src="${wallUrl}?embed=1" width="100%" height="600px" frameBorder="0"></iframe>`;

  const allTags = Array.from(new Set(
    project.testimonials.flatMap((t: any) => (t.tags || '').split(',').map((tag: string) => tag.trim()).filter(Boolean))
  )) as string[];

  const filteredTestimonials = project.testimonials.filter((t: any) => {
    if (filterMetric === 'Has Metric' && !t.resultMetric) return false;
    if (filterTag !== 'All') {
      const tTags = (t.tags || '').split(',').map((tag: string) => tag.trim());
      if (!tTags.includes(filterTag)) return false;
    }
    return true;
  });

  return (
    <div className="container mb-8">
      <style dangerouslySetInnerHTML={{ __html: getAccentStyles(brandColor) }} />
      {/* Demo Project Callouts */}
      {project?.isDemo && !hasRealProjects && (
        <div className="card mb-6 flex items-center justify-between" style={{ borderColor: 'var(--accent-primary)', backgroundColor: 'rgba(99, 102, 241, 0.05)', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 className="text-accent" style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Ready to use ProofStudio for your own offer?</h3>
            <p className="mb-0 text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Create your first real project to start collecting testimonials and turning them into content.</p>
          </div>
          <Link href="/dashboard/new" className="btn btn-primary btn-sm" style={{ whiteSpace: 'nowrap' }}>Create my first project</Link>
        </div>
      )}

      {project?.isDemo && hasRealProjects && (
        <div className="card card-sm mb-6 flex items-center justify-between" style={{ background: 'var(--bg-subtle)', flexWrap: 'wrap', gap: '1rem' }}>
          <p className="mb-0 text-sm" style={{ color: 'var(--text-secondary)' }}>You are viewing the Demo project.</p>
          <Link href="/dashboard" className="text-accent font-semibold text-sm">Switch to your real projects &arr;</Link>
        </div>
      )}

      {/* Checklist */}
      {userOnboarding && (
        <GettingStartedChecklist onboarding={userOnboarding} projectId={id} />
      )}

      {/* Header section */}
      <div className="mb-8" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '2rem' }}>
        <div className="flex justify-between items-center mb-6">
          <Link href="/dashboard" className="btn btn-ghost btn-sm" style={{ paddingLeft: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Back to Projects
          </Link>
          <Link href="/dashboard/new" className="btn btn-primary btn-sm">+ New Project</Link>
        </div>
        <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
          <div>
            <h1 style={{ margin: 0, fontSize: '1.85rem' }}>{project.name}</h1>
            <div style={{ 
              width: '60px', 
              height: '4px', 
              background: 'var(--accent-primary)', 
              borderRadius: '2px',
              marginTop: '0.4rem',
              marginBottom: '0.6rem'
            }} />
            <p className="mb-0 text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Niche: <span className="text-accent font-medium">{project.niche}</span> <span style={{ opacity: 0.5 }}>(business, marketing, career, money/finance)</span>
            </p>
          </div>
          <div className="flex gap-2" style={{ width: 'fit-content' }}>
            <button 
              className={`btn btn-sm ${activeTab === 'testimonials' ? 'btn-primary' : 'btn-ghost'}`} 
              onClick={() => setActiveTab('testimonials')}
              style={{ borderRadius: '4px' }}
            >
              Testimonials
            </button>
            <button 
              className={`btn btn-sm ${activeTab === 'settings' ? 'btn-primary' : 'btn-ghost'}`} 
              onClick={() => setActiveTab('settings')}
              style={{ borderRadius: '4px' }}
            >
              Settings & Form
            </button>
          </div>
        </div>
      </div>

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="card" style={{ maxWidth: '640px', margin: '0 auto' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Project Settings</h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Configure your project's brand identity, custom theme, and public collection form fields.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg-subtle)', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border-subtle)', marginBottom: '2rem', overflow: 'hidden' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" style={{ flexShrink: 0 }}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
            <span className="text-xs text-muted" style={{ fontWeight: 600, textTransform: 'uppercase', marginRight: '0.25rem' }}>Collection URL:</span>
            <a href={formUrl} target="_blank" rel="noreferrer" className="text-accent text-sm" style={{ wordBreak: 'break-all', fontWeight: 500, textDecoration: 'underline' }}>{formUrl}</a>
          </div>
          
          <form onSubmit={handleSaveSettings} className="flex flex-col gap-5" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem' }}>
            <div>
              <label className="text-sm text-secondary block mb-2" style={{ fontWeight: 500 }}>Brand Name</label>
              <input type="text" className="input" value={brandName} onChange={e => setBrandName(e.target.value)} placeholder="e.g. Acme Corp" />
            </div>
            <div>
              <label className="text-sm text-secondary block mb-2" style={{ fontWeight: 500 }}>Logo URL (optional)</label>
              <input type="url" className="input" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="https://..." />
            </div>
            
            {/* Theme & Language Section */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
              <h4 style={{ fontSize: '1.05rem', marginBottom: '1rem', color: 'var(--text-primary)', fontWeight: 600 }}>Theme & Language</h4>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-sm text-secondary block mb-2" style={{ fontWeight: 500 }}>Brand Accent Color</label>
                  <div className="flex gap-2 items-center">
                    <input 
                      type="color" 
                      value={brandColor} 
                      onChange={e => setBrandColor(e.target.value)} 
                      style={{ width: '48px', height: '40px', padding: '0.1rem', cursor: 'pointer', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'transparent' }} 
                    />
                    <input 
                      type="text" 
                      className="input" 
                      value={brandColor} 
                      onChange={e => setBrandColor(e.target.value)} 
                      placeholder="#6366F1"
                      style={{ maxWidth: '140px' }} 
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-secondary block mb-2" style={{ fontWeight: 500 }}>Public Pages Language</label>
                  <select 
                    className="input" 
                    value={language} 
                    onChange={e => setLanguage(e.target.value)}
                    style={{ background: 'var(--bg-subtle)', color: 'var(--text-primary)', cursor: 'pointer' }}
                  >
                    <option value="en">English (en)</option>
                    <option value="es">Español / Spanish (es)</option>
                    <option value="hi">हिन्दी / Hindi (hi)</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
              <h4 style={{ fontSize: '1.05rem', marginBottom: '1rem', color: 'var(--text-primary)', fontWeight: 600 }}>Collection Form Content</h4>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-sm text-secondary block mb-2" style={{ fontWeight: 500 }}>Welcome Text (Shown above form)</label>
                  <textarea className="textarea" value={formWelcomeText} onChange={e => setFormWelcomeText(e.target.value)} placeholder="e.g. Thanks for working with us! Please leave a review..." />
                </div>
                <div>
                  <label className="text-sm text-secondary block mb-2" style={{ fontWeight: 500 }}>Thank You Text (Shown after submission)</label>
                  <textarea className="textarea" value={formThankYouText} onChange={e => setFormThankYouText(e.target.value)} placeholder="e.g. We received your testimonial, thank you!" />
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: '1rem', padding: '0.8rem 2.5rem' }} disabled={savingSettings}>
              {savingSettings ? 'Saving...' : 'Save Settings'}
            </button>
          </form>
        </div>
      )}

      {/* Testimonials Tab */}
      {activeTab === 'testimonials' && (
        <div className="grid-sidebar-layout">
          
          {/* LEFT COLUMN: Add Testimonial */}
          <aside className="layout-sidebar">
            <div className="card">
              <div className="mb-6">
                <span className="text-accent text-xs font-semibold uppercase tracking-wider block mb-1">Step 1</span>
                <h3 className="mb-0" style={{ fontSize: '1.25rem' }}>Add Testimonial</h3>
                <p className="text-xs mb-0 mt-1" style={{ color: 'var(--text-secondary)' }}>Paste a real client win here. Use their exact words.</p>
              </div>
              <form onSubmit={handleAddTestimonial} className="flex flex-col gap-4">
                <div>
                  <label className="text-sm text-secondary block mb-2" style={{ fontWeight: 500 }}>Testimonial Type</label>
                  <div className="flex gap-2" style={{ backgroundColor: 'var(--bg-subtle)', padding: '0.25rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                    <button type="button" className={`btn btn-sm flex-1 ${!isVideo ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setIsVideo(false)} style={{ borderRadius: '10px' }}>Text</button>
                    <button type="button" className={`btn btn-sm flex-1 ${isVideo ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setIsVideo(true)} style={{ borderRadius: '10px' }}>Video</button>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-secondary block mb-2" style={{ fontWeight: 500 }}>Client Name (Optional)</label>
                  <input type="text" className="input" value={clientName} onChange={e => setClientName(e.target.value)} placeholder="e.g. John Doe" />
                </div>
                
                {isVideo ? (
                  <>
                    <div>
                      <label className="text-sm text-secondary block mb-1" style={{ fontWeight: 500 }}>Video URL</label>
                      <div className="text-xs text-muted mb-2 italic">YouTube, Vimeo, or direct .mp4 link</div>
                      <input type="url" className="input" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} required placeholder="https://..." />
                    </div>
                    <div>
                      <label className="text-sm text-secondary block mb-1" style={{ fontWeight: 500 }}>Transcript / Summary (Optional)</label>
                      <div className="text-xs text-muted mb-2 italic">Paste spoken text to help generate content</div>
                      <textarea className="textarea" value={transcript} onChange={e => setTranscript(e.target.value)} placeholder="e.g. In this video, the client talks about..." />
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="text-sm text-secondary block mb-1" style={{ fontWeight: 500 }}>Raw Text from Client</label>
                    <div className="text-xs text-muted mb-2 italic">Paste the exact words your client used</div>
                    <textarea className="textarea" value={rawText} onChange={e => setRawText(e.target.value)} required placeholder="e.g. This course was amazing..." />
                  </div>
                )}
                
                <div>
                  <label className="text-sm text-secondary block mb-2" style={{ fontWeight: 500 }}>Client Role</label>
                  <input type="text" className="input" value={clientRole} onChange={e => setClientRole(e.target.value)} required placeholder="e.g. Freelance Designer" />
                </div>
                <div>
                  <label className="text-sm text-secondary block mb-2" style={{ fontWeight: 500 }}>Core Result / Metric</label>
                  <input type="text" className="input" value={resultMetric} onChange={e => setResultMetric(e.target.value)} placeholder="e.g. Closed $10k in 30 days" />
                </div>
                <div>
                  <label className="text-sm text-secondary block mb-2" style={{ fontWeight: 500 }}>Desired Tone</label>
                  <select className="input" value={tone} onChange={e => setTone(e.target.value)}>
                    <option value="Professional">Professional</option>
                    <option value="Conversational">Conversational</option>
                    <option value="Hype/Excited">Hype / Excited</option>
                    <option value="Analytical">Analytical</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-secondary block mb-2" style={{ fontWeight: 500 }}>Rating (Optional)</label>
                  <select className="input" value={rating} onChange={e => setRating(e.target.value)}>
                    <option value="">No rating</option>
                    <option value="1">★1</option>
                    <option value="2">★2</option>
                    <option value="3">★3</option>
                    <option value="4">★4</option>
                    <option value="5">★5</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-secondary block mb-2" style={{ fontWeight: 500 }}>Tags (comma-separated)</label>
                  <input type="text" className="input" value={tags} onChange={e => setTags(e.target.value)} placeholder="e.g. Video, B2B, Coaching" />
                </div>
                <button type="submit" className="btn btn-primary mt-2" disabled={isAddingTestimonial}>
                  {isAddingTestimonial ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Loader size={16} /> Adding...
                    </span>
                  ) : 'Add Testimonial'}
                </button>
              </form>
            </div>
          </aside>

          {/* RIGHT COLUMN: Testimonials & Wall of Proof */}
          <section className="layout-main flex flex-col gap-6">
            
            {/* Filters Row */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h3 className="mb-0" style={{ fontSize: '1.25rem' }}>Testimonials ({project.testimonials.length})</h3>
              <div className="flex items-center gap-3 flex-wrap">
                <label className="btn btn-secondary btn-sm flex items-center cursor-pointer !mb-0" style={{ gap: '0.5rem', fontWeight: 500 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  <span>Import CSV</span>
                  <input type="file" accept=".csv" onChange={handleCsvImport} disabled={isImporting} style={{ display: 'none' }} />
                </label>
                {isImporting && <span className="text-sm text-muted">Importing...</span>}
                <select className="input py-2 btn-sm" style={{ width: 'auto', padding: '0.45rem 2rem 0.45rem 1rem' }} value={filterMetric} onChange={e => setFilterMetric(e.target.value)}>
                  <option value="All">All Metrics</option>
                  <option value="Has Metric">Has Metric</option>
                </select>
                <select className="input py-2 btn-sm" style={{ width: 'auto', padding: '0.45rem 2rem 0.45rem 1rem' }} value={filterTag} onChange={e => setFilterTag(e.target.value)}>
                  <option value="All">All Tags</option>
                  {allTags.map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Wall of Proof Embed Link */}
            <div>
              <span className="text-accent text-xs font-semibold uppercase tracking-wider block mb-2">Step 2</span>
              <EmbedSnippetCard 
                title="Wall of Proof Widget"
                description={
                  <>
                    You have <span className="text-primary font-semibold">{project.testimonials.filter((t: any) => t.isFeatured).length}</span> featured testimonials.
                    <a href={wallUrl} target="_blank" rel="noreferrer" className="text-accent ml-2 hover:underline" style={{ fontWeight: 500 }}>View Public Wall &rarr;</a>
                    <br />
                    Paste this iframe into your landing page or website to display your Wall of Proof.
                  </>
                }
                code={embedCode}
              />
            </div>

            {/* Testimonials List */}
            {filteredTestimonials.length === 0 ? (
              <div className="card text-center py-12">
                <p className="mb-0 text-secondary">No testimonials match your filters.</p>
              </div>
            ) : (
              filteredTestimonials.map((t: any) => (
                <div key={t.id} className="card relative" style={{ borderLeft: t.isFeatured ? '4px solid var(--accent-primary)' : '1px solid var(--border-subtle)', transition: 'var(--transition)', overflow: 'hidden' }}>
                  
                  {/* Generating AI Overlay */}
                  {generatingFor === t.id && (
                    <div className="overlay-loader animate-in">
                      <Loader size={48} color="var(--accent-primary)" />
                      <h3 className="mt-4 mb-1 text-white text-center">Generating AI Content Pack...</h3>
                      <p className="text-sm text-white opacity-80 text-center px-4">Analyzing testimonial and writing posts. This takes ~10 seconds.</p>
                    </div>
                  )}

                  <div className="flex items-start justify-between" style={{ flexWrap: 'wrap-reverse', gap: '1rem' }}>
                    <div className="flex-1" style={{ width: '100%' }}>
                      {t.isVideo && (
                        <div className="mb-4">
                          <span className="pill pill-accent text-xs mb-2">Video Testimonial</span>
                          <div className="mt-2" style={{ aspectRatio: '16/9', backgroundColor: '#020617', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                            <VideoThumbnail 
                              videoUrl={t.videoUrl} 
                              onClick={() => {
                                setActiveVideoUrl(t.videoUrl);
                                setIsVideoPlayerOpen(true);
                              }} 
                            />
                          </div>
                          <div className="mt-2 text-xs" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                            <a href={t.videoUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline" style={{ fontWeight: 500 }}>Open/Download Video file &rarr;</a>
                          </div>
                        </div>
                      )}
                      
                      {t.rating && (
                        <div style={{ display: 'flex', gap: '3px', marginBottom: '0.75rem' }}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg 
                              key={star} 
                              width="15" 
                              height="15" 
                              viewBox="0 0 24 24" 
                              fill={star <= t.rating ? brandColor : 'none'} 
                              stroke={star <= t.rating ? brandColor : 'rgba(148, 163, 184, 0.4)'} 
                              strokeWidth="2"
                            >
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                            </svg>
                          ))}
                        </div>
                      )}
                      <p style={{ fontSize: '1.05rem', fontWeight: 500, lineHeight: 1.6, color: 'var(--text-primary)' }}>
                        {t.clientName ? `"${t.isVideo && !t.rawText ? t.transcript || 'Video testimonial' : t.rawText}"` : `"${t.isVideo && !t.rawText ? t.transcript || 'Video testimonial' : t.rawText}"`}
                      </p>
                    </div>

                    <label className={`flex items-center gap-2 text-xs cursor-pointer whitespace-nowrap px-3.5 py-2 rounded border transition-all ${
                      t.isFeatured 
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300' 
                        : 'border-subtle bg-subtle text-secondary hover:border-strong'
                    }`} style={{ border: t.isFeatured ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)', backgroundColor: t.isFeatured ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-subtle)', color: t.isFeatured ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
                      <input type="checkbox" checked={t.isFeatured} onChange={() => handleToggleFeatured(t.id, t.isFeatured)} style={{ accentColor: 'var(--accent-primary)', cursor: 'pointer' }} />
                      Feature on Wall
                    </label>
                  </div>
                  
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-6 gap-4" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
                    <div>
                      <div className="text-primary font-medium" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 600 }}>{t.clientName || 'Anonymous'}</span> 
                        {t.clientRole && <span className="text-secondary text-sm">• {t.clientRole}</span>} 
                        {t.resultMetric && <span className="pill pill-success text-xs font-semibold" style={{ textTransform: 'none' }}>{t.resultMetric}</span>}
                      </div>
                      
                      {t.tags && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {t.tags.split(',').map((tag: string) => (
                            <span key={tag} className="pill" style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem' }}>{tag.trim()}</span>
                          ))}
                        </div>
                      )}
                      <div className="text-xs text-muted mt-3" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span>Source: <span className="text-secondary">{t.source}</span></span>
                        <span className="text-muted">•</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span>Rating:</span>
                          <select 
                            value={t.rating || ''} 
                            onChange={async (e) => {
                              const newRating = e.target.value ? parseInt(e.target.value, 10) : null;
                              try {
                                const res = await fetch(`/api/testimonials/${t.id}`, {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ rating: newRating }),
                                });
                                if (res.ok) {
                                  fetchProject();
                                } else {
                                  alert('Failed to update rating');
                                }
                              } catch {
                                alert('Network error');
                              }
                            }}
                            style={{
                              background: 'var(--bg-subtle)',
                              color: 'var(--text-primary)',
                              border: '1px solid var(--border-subtle)',
                              borderRadius: '6px',
                              padding: '2px 6px',
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                              outline: 'none'
                            }}
                          >
                            <option value="">None</option>
                            <option value="1">★1</option>
                            <option value="2">★2</option>
                            <option value="3">★3</option>
                            <option value="4">★4</option>
                            <option value="5">★5</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2.5">
                      {t.contentPack ? (
                        <Link href={`/testimonials/${t.id}/content`} className="btn btn-secondary btn-sm" style={{ fontWeight: 500, width: '100%', textAlign: 'center' }}>
                          View Content Pack
                        </Link>
                      ) : (
                        <div className="flex flex-col items-end gap-1" style={{ width: '100%' }}>
                          <span className="text-accent text-xs font-semibold uppercase tracking-wider" style={{ alignSelf: 'flex-end' }}>Step 3</span>
                          <button 
                            className="btn btn-secondary btn-sm" 
                            onClick={() => handleGenerate(t.id)}
                            disabled={generatingFor === t.id}
                            style={{ fontWeight: 500, width: '100%' }}
                          >
                            Generate Content
                          </button>
                        </div>
                      )}

                      <button 
                        className="btn btn-sm flex items-center justify-center gap-1.5" 
                        onClick={() => openCaseStudyModal(t)}
                        style={{ 
                          fontWeight: 500,
                          backgroundColor: 'rgba(99, 102, 241, 0.1)', 
                          color: 'var(--accent-primary)',
                          border: '1px solid rgba(99, 102, 241, 0.3)',
                          width: '100%'
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z"/>
                        </svg>
                        AI Case Study
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </section>
        </div>
      )}
      {/* Case Study Modal */}
      {isCaseStudyModalOpen && caseStudyTestimonial && (
        <div className="modal-overlay" onClick={() => setIsCaseStudyModalOpen(false)}>
          <div className="modal-content animate-in" onClick={e => e.stopPropagation()} style={{ maxWidth: '720px' }}>
            <div className="modal-header">
              <h3 className="mb-0" style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z"/>
                </svg>
                AI Case Study Generator
              </h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setIsCaseStudyModalOpen(false)} style={{ padding: '0.25rem', borderRadius: '50%' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <div className="modal-body flex flex-col gap-6" style={{ maxHeight: 'calc(90vh - 140px)', overflowY: 'auto' }}>
              {caseStudyError && (
                <div style={{ backgroundColor: 'rgba(249, 115, 115, 0.1)', border: '1px solid var(--accent-danger)', borderRadius: '12px', padding: '1rem', color: '#ffb3b3', fontSize: '0.9rem' }}>
                  {caseStudyError}
                </div>
              )}

              {/* Loader */}
              {isGeneratingCaseStudy && (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <svg className="animate-spin" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="3" style={{ animation: 'spin 1s linear infinite' }}><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
                  <div className="text-center">
                    <h4 style={{ margin: 0, fontSize: '1.05rem' }}>Writing case study...</h4>
                    <p className="text-xs text-muted mb-0 mt-1">We are analyzing the testimonial ground truth and shaping the narrative.</p>
                  </div>
                </div>
              )}

              {!isGeneratingCaseStudy && (
                <>
                  {/* Results Screen if Case Study is already generated & we aren't showing settings/warning */}
                  {generatedCaseStudyText && !showRegenerateWarning ? (
                    <div className="flex flex-col gap-4 animate-in">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-accent uppercase tracking-wider">Generated Case Study</span>
                        <div className="flex gap-2">
                          {isEditingCaseStudy ? (
                            <>
                              <button className="btn btn-secondary btn-sm" onClick={() => { setGeneratedCaseStudyText(caseStudyTestimonial.caseStudy || ''); setIsEditingCaseStudy(false); }} disabled={isSavingCaseStudy}>
                                Cancel
                              </button>
                              <button className="btn btn-primary btn-sm" onClick={handleSaveCaseStudyEdits} disabled={isSavingCaseStudy}>
                                {isSavingCaseStudy ? 'Saving...' : 'Save'}
                              </button>
                            </>
                          ) : (
                            <>
                              <button className="btn btn-secondary btn-sm" onClick={() => setIsEditingCaseStudy(true)}>
                                Edit Text
                              </button>
                              <button className="btn btn-secondary btn-sm" onClick={handleCopyCaseStudy}>
                                {csCopiedSuccess ? 'Copied!' : 'Copy to Clipboard'}
                              </button>
                              <button className="btn btn-ghost btn-sm text-accent" onClick={() => setShowRegenerateWarning(true)}>
                                Regenerate
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {isEditingCaseStudy ? (
                        <textarea
                          className="textarea font-mono text-sm"
                          style={{ minHeight: '350px', backgroundColor: 'var(--bg-subtle)' }}
                          value={generatedCaseStudyText}
                          onChange={e => setGeneratedCaseStudyText(e.target.value)}
                        />
                      ) : (
                        <div 
                          className="font-sans text-sm p-5 border border-subtle rounded-xl scrollbar" 
                          style={{ 
                            backgroundColor: 'var(--bg-subtle)', 
                            maxHeight: '400px', 
                            overflowY: 'auto', 
                            whiteSpace: 'pre-wrap',
                            lineHeight: '1.7',
                            color: 'var(--text-primary)'
                          }}
                        >
                          {generatedCaseStudyText}
                        </div>
                      )}
                      
                      {!isEditingCaseStudy && (
                        <div className="text-xs text-muted italic flex items-center gap-1.5 mt-1">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-success)" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                          Case study is saved to this testimonial and will be stored for future use.
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Setup Form Screen */
                    <div className="flex flex-col gap-5 animate-in">
                      {showRegenerateWarning && (
                        <div className="p-4 rounded-xl flex flex-col gap-2" style={{ border: '1px solid #fbbf24', backgroundColor: 'rgba(251, 191, 36, 0.05)', color: '#fbbf24' }}>
                          <div className="flex items-center gap-2 font-semibold text-sm">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4m0 4h.01" /></svg>
                            Regenerate Case Study?
                          </div>
                          <p className="text-xs mb-0 text-secondary" style={{ color: 'rgba(251, 191, 36, 0.85)' }}>
                            Regenerating will overwrite the existing saved case study. If you made manual edits, they will be lost.
                          </p>
                          <div className="flex gap-2 mt-2">
                            <button className="btn btn-secondary btn-sm" onClick={() => setShowRegenerateWarning(false)} style={{ borderColor: 'rgba(251, 191, 36, 0.3)', color: '#fbbf24' }}>
                              Cancel
                            </button>
                            <button className="btn btn-sm btn-primary" onClick={() => setShowRegenerateWarning(false)} style={{ backgroundColor: '#fbbf24', color: '#000', boxShadow: 'none' }}>
                              I understand, configure options
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {!showRegenerateWarning && (
                        <>
                          {/* Section 1: Testimonial details (Read-only) */}
                          <div className="flex flex-col gap-3">
                            <span className="text-xs font-semibold text-muted uppercase tracking-wider">Section 1: Testimonial Context (Read-Only)</span>
                            <div className="p-4 border border-subtle rounded-xl flex flex-col gap-2" style={{ backgroundColor: 'rgba(255, 255, 255, 0.01)' }}>
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="font-semibold text-sm">{caseStudyTestimonial.clientName || 'Anonymous'} <span className="text-secondary font-normal">• {caseStudyTestimonial.clientRole}</span></span>
                                {caseStudyTestimonial.resultMetric && (
                                  <span className="pill pill-success text-xs font-semibold">{caseStudyTestimonial.resultMetric}</span>
                                )}
                              </div>
                              <p className="text-xs text-secondary italic mb-0 line-clamp-3">
                                "{caseStudyTestimonial.isVideo && !caseStudyTestimonial.rawText ? caseStudyTestimonial.transcript || 'Video testimonial' : caseStudyTestimonial.rawText}"
                              </p>
                            </div>
                          </div>

                          {/* Section 2: Your business */}
                          <div className="flex flex-col gap-4">
                            <span className="text-xs font-semibold text-muted uppercase tracking-wider">Section 2: Your Business Details</span>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-xs text-secondary block mb-1.5 font-medium">Business Name</label>
                                <input 
                                  type="text" 
                                  className="input py-2 text-sm" 
                                  placeholder="e.g. Peak Performance Consulting" 
                                  value={csBusinessName} 
                                  onChange={e => setCsBusinessName(e.target.value)}
                                  required
                                />
                              </div>
                              <div>
                                <label className="text-xs text-secondary block mb-1.5 font-medium">Your Role / Title</label>
                                <input 
                                  type="text" 
                                  className="input py-2 text-sm" 
                                  placeholder="e.g. Founder & Chief Coach" 
                                  value={csBusinessRole} 
                                  onChange={e => setCsBusinessRole(e.target.value)}
                                  required
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-xs text-secondary block mb-1.5 font-medium">Short Business Description</label>
                              <textarea 
                                className="textarea text-sm py-2" 
                                style={{ minHeight: '80px' }}
                                placeholder="Explain what service, program, or SaaS you sell and who it helps..." 
                                value={csBusinessDesc} 
                                onChange={e => setCsBusinessDesc(e.target.value)}
                                required
                              />
                            </div>
                          </div>

                          {/* Section 3: Settings */}
                          <div className="flex flex-col gap-4">
                            <span className="text-xs font-semibold text-muted uppercase tracking-wider">Section 3: Case Study Settings</span>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-xs text-secondary block mb-1.5 font-medium">Tone Selector</label>
                                <select className="input py-2 text-sm" value={csTone} onChange={e => setCsTone(e.target.value)}>
                                  <option value="Conversational">Conversational</option>
                                  <option value="Formal">Formal</option>
                                  <option value="Punchy">Punchy</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-xs text-secondary block mb-1.5 font-medium">Length Selector</label>
                                <select className="input py-2 text-sm" value={csLength} onChange={e => setCsLength(e.target.value)}>
                                  <option value="Short (1–2 minutes read)">Short (1–2 minutes read)</option>
                                  <option value="Standard (2–3 minutes)">Standard (2–3 minutes)</option>
                                  <option value="Landing-page style">Landing-page style</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
            
            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={() => setIsCaseStudyModalOpen(false)} disabled={isGeneratingCaseStudy || isSavingCaseStudy}>
                Cancel
              </button>
              
              {/* Show Generate button if not currently displaying a generated case study, or if warning is shown */}
              {(!generatedCaseStudyText || showRegenerateWarning) && !isGeneratingCaseStudy && (
                <button 
                  className="btn btn-primary btn-sm" 
                  onClick={handleGenerateCaseStudy} 
                  disabled={!csBusinessName || !csBusinessRole || !csBusinessDesc}
                >
                  Generate case study
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      <VideoPlayerModal
        videoUrl={activeVideoUrl}
        isOpen={isVideoPlayerOpen}
        onClose={() => setIsVideoPlayerOpen(false)}
      />
    </div>
  );
}
