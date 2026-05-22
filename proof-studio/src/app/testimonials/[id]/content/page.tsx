import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ContentDisplay from './ContentDisplay';
import { getSession, getTestimonialForUser } from '@/lib/auth';

export default async function ContentPackPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) {
    notFound();
  }

  const testimonialCheck = await getTestimonialForUser(id, session.userId);
  if (!testimonialCheck) {
    notFound();
  }

  const testimonial = await prisma.testimonial.findUnique({
    where: { id },
    include: { contentPack: true, project: true },
  });

  if (!testimonial || !testimonial.contentPack) {
    notFound();
  }

  const linkedinPosts = JSON.parse(testimonial.contentPack.linkedinPosts);

  return (
    <div className="container">
      <div className="flex gap-4 items-center mb-8">
        <Link href={`/project/${testimonial.projectId}`} className="btn" style={{ padding: '0.5rem 1rem' }}>
          &larr; Back to Project
        </Link>
        <h2 style={{ margin: 0 }}>Content Pack for {testimonial.clientRole}</h2>
      </div>

      <ContentDisplay 
        linkedinPosts={linkedinPosts}
        caseStudyOutline={testimonial.contentPack.caseStudyOutline}
        landingBlock={testimonial.contentPack.landingBlock}
        shortVideoScript={testimonial.contentPack.shortVideoScript}
      />
    </div>
  );
}
