import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getSession } from '@/lib/auth';
import WallTestimonialCard from '@/components/WallTestimonialCard';
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

export default async function WallOfProof({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { projectId } = await params;
  const resolvedSearchParams = (await searchParams) || {};
  const isEmbed = resolvedSearchParams?.embed === '1';

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      name: true,
      brandName: true,
      brandColor: true,
      logoUrl: true,
      userId: true,
      language: true,
      testimonials: {
        where: { isFeatured: true },
        orderBy: { id: 'desc' },
        select: {
          id: true,
          rawText: true,
          resultMetric: true,
          clientName: true,
          clientRole: true,
          allowNameDisplay: true,
          isVideo: true,
          videoUrl: true,
          transcript: true,
          rating: true
        }
      },
    },
  });

  if (!project) {
    notFound();
  }

  // Update viewedWall if session belongs to project owner
  const session = await getSession();
  if (session && session.userId === project.userId) {
    await prisma.user.update({
      where: { id: session.userId },
      data: { viewedWall: true }
    });
  }

  const { brandName, name, brandColor, logoUrl, testimonials, language } = project;
  const color = brandColor || '#6366F1'; // Use theme indigo default
  const trans = getTranslations(language);

  // Compute average rating across featured testimonials that have a rating
  const ratedTestimonials = testimonials.filter(t => typeof t.rating === 'number' && t.rating > 0);
  const totalRatedCount = ratedTestimonials.length;
  const averageRating = totalRatedCount > 0 
    ? (ratedTestimonials.reduce((sum, t) => sum + (t.rating || 0), 0) / totalRatedCount).toFixed(1)
    : null;

  return (
    <div style={{
      minHeight: isEmbed ? 'auto' : '100vh',
      backgroundColor: 'transparent', // Inherit linear gradient from body
      padding: isEmbed ? '0' : '4rem 1.5rem',
      color: 'var(--text-primary)',
      fontFamily: 'var(--font-sans)',
      position: 'relative',
      zIndex: 1
    }}>
      <style dangerouslySetInnerHTML={{ __html: getAccentStyles(color) }} />
      {/* Background glow effects on full page view */}
      {!isEmbed && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: '1200px',
          height: '600px',
          background: `radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)`,
          zIndex: -1,
          pointerEvents: 'none',
          filter: 'blur(100px)'
        }} />
      )}

      {!isEmbed && session && session.userId === project.userId && (
        <div style={{
          maxWidth: '1200px', 
          margin: '0 auto 3rem', 
          padding: '0.85rem 1.5rem',
          backgroundColor: 'var(--accent-glow)', 
          border: '1px solid var(--accent-primary-soft)',
          borderRadius: '999px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          flexWrap: 'wrap', 
          gap: '1rem',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary-soft)" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{trans.ownerMode}</span> {trans.ownerPreview}
          </div>
          <a href={`/project/${project.id}`} className="btn btn-sm btn-secondary" style={{ borderRadius: '999px', fontSize: '0.85rem' }}>
            &larr; {trans.backToDashboard}
          </a>
        </div>
      )}

      {!isEmbed && (
        <div style={{ textAlign: 'center', marginBottom: '5rem', animation: 'fadeIn 0.5s ease-out' }}>
          {logoUrl ? (
            <img src={logoUrl} alt={brandName || name} style={{ height: '72px', margin: '0 auto 1.5rem', objectFit: 'contain', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)' }} />
          ) : (
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-primary-soft) 100%)`, margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.25rem', boxShadow: `0 4px 15px var(--accent-glow)` }}>
              {(brandName || name).charAt(0).toUpperCase()}
            </div>
          )}
          <h1 style={{ 
            fontSize: 'clamp(2.2rem, 6vw, 3.75rem)', 
            fontWeight: 800, 
            lineHeight: 1.15, 
            marginBottom: '1.25rem', 
            letterSpacing: '-0.03em',
            background: 'linear-gradient(180deg, #FFFFFF 30%, #94A3B8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            {trans.wallTitlePre}
            <span style={{ 
              background: `linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-primary-soft) 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 900
            }}>{brandName || name}</span>
            {trans.wallTitlePost}
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '580px', margin: '0 auto', lineHeight: 1.6 }}>
            {trans.wallSubtitle}
          </p>
          {averageRating && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'var(--accent-glow)',
              color: 'var(--text-primary)',
              border: '1px solid var(--accent-primary-soft)',
              padding: '6px 16px',
              borderRadius: '99px',
              fontSize: '0.85rem',
              fontWeight: 600,
              marginTop: '1.5rem',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
            }}>
              <span style={{ color: 'var(--accent-primary)', fontSize: '1.1rem', lineHeight: 1 }}>★</span>
              <span>{trans.averageRating}: {averageRating} / 5.0</span>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>({totalRatedCount} {trans.testimonialsCount})</span>
            </div>
          )}
          <div style={{ height: '3px', width: '50px', borderRadius: '999px', backgroundColor: 'var(--accent-primary)', margin: '2.5rem auto 0', boxShadow: `0 0 15px var(--accent-primary)` }}></div>
        </div>
      )}

      {testimonials.length === 0 ? (
        <div className="card" style={{ maxWidth: '440px', margin: '4rem auto', textAlign: 'center', padding: '3.5rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', color: 'var(--accent-primary)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
          </div>
          <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem', fontWeight: 600 }}>{trans.noTestimonials}</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>{trans.noTestimonialsDesc}</p>
        </div>
      ) : (
        <>
          <style>{`
            .masonry-grid {
              column-count: 1;
              column-gap: 1.75rem;
              max-width: 1200px;
              margin: 0 auto;
            }
            @media (min-width: 768px) {
              .masonry-grid { column-count: ${testimonials.length === 1 ? 1 : 2}; }
            }
            @media (min-width: 1024px) {
              .masonry-grid { column-count: ${Math.min(testimonials.length, 3)}; }
            }
            .masonry-item {
              break-inside: avoid;
              margin-bottom: 1.75rem;
              max-width: 400px;
              margin-left: auto;
              margin-right: auto;
            }
          `}</style>
          <div className="masonry-grid">
            {testimonials.map((t) => (
              <div key={t.id} className="masonry-item animate-in">
                <WallTestimonialCard 
                  testimonial={{
                    id: t.id,
                    rawText: t.rawText || '',
                    resultMetric: t.resultMetric || '',
                    clientName: t.clientName || '',
                    clientRole: t.clientRole || '',
                    allowNameDisplay: t.allowNameDisplay,
                    isVideo: t.isVideo,
                    videoUrl: t.videoUrl,
                    transcript: t.transcript,
                    rating: t.rating
                  }}
                  color={color}
                  isOwner={!!(session && session.userId === project.userId)}
                  lang={language}
                />
              </div>
            ))}
          </div>
        </>
      )}

      {!project.logoUrl && (
        <div style={{ textAlign: 'center', marginTop: '4rem', paddingBottom: '2rem' }}>
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
