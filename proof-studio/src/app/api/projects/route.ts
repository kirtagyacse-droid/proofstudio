import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const projects = await prisma.project.findMany({
      where: { userId: session.userId },
      orderBy: { id: 'desc' },
      include: {
        _count: {
          select: { testimonials: true }
        }
      }
    });
    return NextResponse.json({ projects });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, niche } = await req.json();
    if (!name || !niche) {
      return NextResponse.json({ error: 'Name and niche are required' }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        name,
        niche,
        userId: session.userId,
      },
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
