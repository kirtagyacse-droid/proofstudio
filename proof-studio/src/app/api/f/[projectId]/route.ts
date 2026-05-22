import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        name: true,
        brandName: true,
        logoUrl: true,
        brandColor: true,
        language: true,
        formWelcomeText: true,
        formThankYouText: true,
      }
    });

    if (!project) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ project });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    const data = await req.json();
    
    // Validate project exists
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const { clientName, clientRole, rawText, resultMetric, allowNameDisplay, rating } = data;

    let parsedRating: number | null = null;
    if (rating !== undefined && rating !== null && rating !== '') {
      parsedRating = Number(rating);
      if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
        return NextResponse.json({ error: 'Rating must be an integer between 1 and 5' }, { status: 400 });
      }
    }

    const testimonial = await prisma.testimonial.create({
      data: {
        projectId,
        clientName,
        clientRole: clientRole || 'Client',
        rawText,
        resultMetric: resultMetric || '',
        tone: 'Professional', // Default tone since public users don't pick it
        rating: parsedRating,
        allowNameDisplay: !!allowNameDisplay,
        source: 'form',
      }
    });

    return NextResponse.json({ testimonial }, { status: 201 });
  } catch (error) {
    console.error('Error submitting form:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
