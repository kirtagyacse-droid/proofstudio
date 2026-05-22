import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.hashedPassword);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    await createSession(user.id);
    
    // Find if user has a demo project and hasn't seen it yet
    let demoProjectId = null;
    if (!user.hasSeenDemo && user.createdDemoProject) {
      const demoProject = await prisma.project.findFirst({
        where: { userId: user.id, isDemo: true }
      });
      if (demoProject) {
        demoProjectId = demoProject.id;
      }
    }

    return NextResponse.json({ 
      message: 'Logged in successfully',
      hasSeenDemo: user.hasSeenDemo,
      demoProjectId
    }, { status: 200 });
  } catch (error) {
    console.error("Login Route Error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
