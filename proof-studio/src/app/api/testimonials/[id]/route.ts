import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession, getTestimonialForUser } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const testimonial = await getTestimonialForUser(id, session.userId);

    if (!testimonial) {
      return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 });
    }
    
    // We still want to include contentPack if the client needs it.
    // getTestimonialForUser doesn't include contentPack, so we query again or modify helper.
    // Since we verified ownership, we can now fetch it with everything safely.
    const fullTestimonial = await prisma.testimonial.findUnique({
      where: { id },
      include: { contentPack: true, project: true }
    });

    return NextResponse.json({ testimonial: fullTestimonial });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const { isFeatured, tags, clientName, clientRole, rawText, resultMetric, caseStudy, rating } = await req.json();

    const testimonialCheck = await getTestimonialForUser(id, session.userId);
    if (!testimonialCheck) {
      return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 });
    }

    let parsedRating: number | null = null;
    let updateRating = false;
    if (rating !== undefined) {
      updateRating = true;
      if (rating === null || rating === '') {
        parsedRating = null;
      } else {
        parsedRating = Number(rating);
        if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
          return NextResponse.json({ error: 'Rating must be an integer between 1 and 5' }, { status: 400 });
        }
      }
    }

    const updated = await prisma.testimonial.update({
      where: { id },
      data: {
        ...(isFeatured !== undefined && { isFeatured }),
        ...(tags !== undefined && { tags }),
        ...(clientName !== undefined && { clientName }),
        ...(clientRole !== undefined && { clientRole }),
        ...(rawText !== undefined && { rawText }),
        ...(resultMetric !== undefined && { resultMetric }),
        ...(caseStudy !== undefined && { caseStudy }),
        ...(updateRating && { rating: parsedRating }),
      }
    });

    return NextResponse.json({ testimonial: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const testimonialCheck = await getTestimonialForUser(id, session.userId);
    
    if (!testimonialCheck) {
      return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 });
    }

    await prisma.testimonial.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
