import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession, getProjectForUser } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const project = await getProjectForUser(id, session.userId, {
      testimonials: {
        include: { contentPack: true },
        orderBy: { id: 'desc' }
      },
      user: {
        select: {
          completedFirstTestimonial: true,
          completedFirstContentPack: true,
          viewedWall: true,
        }
      }
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const hasRealProjects = await prisma.project.count({
      where: { userId: session.userId, isDemo: false }
    }) > 0;

    const { user, ...projectData } = project;

    return NextResponse.json({ 
      project: projectData,
      userOnboarding: user,
      hasRealProjects
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const data = await req.json();
    const { brandName, logoUrl, brandColor, language, formWelcomeText, formThankYouText } = data;

    const projectCheck = await getProjectForUser(id, session.userId);
    if (!projectCheck) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        brandName,
        logoUrl,
        brandColor,
        language,
        formWelcomeText,
        formThankYouText,
      }
    });
    return NextResponse.json({ project });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const projectCheck = await getProjectForUser(id, session.userId);
    if (!projectCheck) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    await prisma.project.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
