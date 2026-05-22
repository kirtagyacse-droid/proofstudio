import { NextRequest, NextResponse } from 'next/server';
import { generateCaseStudy } from '@/lib/ai';
import { getSession, getTestimonialForUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: testimonialId } = await params;

    // Verify ownership
    const testimonialCheck = await getTestimonialForUser(testimonialId, session.userId);
    if (!testimonialCheck) {
      return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 });
    }

    const body = await req.json();
    const { businessName, businessRole, businessDescription, tone, length } = body;

    if (!businessName || !businessRole || !businessDescription || !tone || !length) {
      return NextResponse.json({ error: 'Missing required configuration fields' }, { status: 400 });
    }

    const caseStudyText = await generateCaseStudy({
      testimonialId,
      businessName,
      businessRole,
      businessDescription,
      tone,
      length,
    });

    // Save to the database
    await prisma.testimonial.update({
      where: { id: testimonialId },
      data: {
        caseStudy: caseStudyText,
      },
    });

    return NextResponse.json({ caseStudy: caseStudyText });
  } catch (error: any) {
    console.error('Error generating case study:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
