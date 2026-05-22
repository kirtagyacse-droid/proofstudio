import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession, getTestimonialForUser } from '@/lib/auth';
import { generateContentPack } from '@/lib/ai';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { testimonialId } = await req.json();
    if (!testimonialId) {
      return NextResponse.json({ error: 'Testimonial ID is required' }, { status: 400 });
    }

    // Verify testimonial and project belong to user
    const testimonialCheck = await getTestimonialForUser(testimonialId, session.userId);

    if (!testimonialCheck) {
      return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 });
    }
    
    // We need the testimonial object below, specifically niche and clientRole, resultMetric
    const testimonial = await prisma.testimonial.findUnique({
      where: { id: testimonialId },
      include: { project: true }
    });
    
    if (!testimonial) {
      return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 });
    }

    const contentPack = await generateContentPack(testimonialId);

    return NextResponse.json({ contentPack }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
