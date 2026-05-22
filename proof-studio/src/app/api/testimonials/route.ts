import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession, getProjectForUser } from '@/lib/auth';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { projectId, rawText, clientRole, resultMetric, tone, tags, source, clientName, isVideo, videoUrl, transcript, rating } = await req.json();

    if (!projectId || !clientRole || !tone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    if (!isVideo && !rawText) {
      return NextResponse.json({ error: 'Text testimonials require rawText' }, { status: 400 });
    }

    let parsedRating: number | null = null;
    if (rating !== undefined && rating !== null && rating !== '') {
      parsedRating = Number(rating);
      if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
        return NextResponse.json({ error: 'Rating must be an integer between 1 and 5' }, { status: 400 });
      }
    }

    // Verify project belongs to user
    const project = await getProjectForUser(projectId, session.userId);

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const testimonial = await prisma.testimonial.create({
      data: {
        rawText: rawText || null,
        clientRole,
        resultMetric: resultMetric || '',
        tone,
        rating: parsedRating,
        projectId,
        tags: tags || '',
        source: source || 'manual',
        clientName: clientName || null,
        isVideo: isVideo || false,
        videoUrl: videoUrl || null,
        transcript: transcript || null,
      },
    });

    // Mark as completed for onboarding checklist
    await prisma.user.update({
      where: { id: session.userId },
      data: { completedFirstTestimonial: true }
    });

    return NextResponse.json({ testimonial }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
