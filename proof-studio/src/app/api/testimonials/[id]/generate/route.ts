import { NextRequest, NextResponse } from 'next/server';
import { generateContentPack } from '@/lib/ai';
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

    const contentPack = await generateContentPack(testimonialId);

    // Mark as completed for onboarding checklist
    await prisma.user.update({
      where: { id: session.userId },
      data: { completedFirstContentPack: true }
    });

    return NextResponse.json(contentPack);
  } catch (error: any) {
    console.error('Error generating content pack:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
