import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { prisma } from './db';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-key-for-dev-only');

export async function createSession(userId: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);

  const cookieStore = await cookies();
  cookieStore.set('session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });
}

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) return null;

  try {
    const { payload } = await jwtVerify(session, JWT_SECRET, {
      algorithms: ['HS256'],
    });
    const userId = (payload as { userId: string }).userId;

    // Verify the user actually exists in the database.
    // If the DB was reset or the user was deleted, treat as unauthenticated.
    try {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
      if (!user) return null;
    } catch {
      // DB error — fail safe, treat as unauthenticated
      return null;
    }

    return payload as { userId: string };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return null;
  }
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}

export async function getProjectForUser(projectId: string, userId: string, include?: any) {
  const project = await prisma.project.findUnique({
    where: { id: projectId, userId },
    include
  });
  return project;
}

export async function getTestimonialForUser(testimonialId: string, userId: string) {
  const testimonial = await prisma.testimonial.findUnique({
    where: { id: testimonialId },
    include: { project: true }
  });
  
  if (!testimonial || testimonial.project.userId !== userId) {
    return null;
  }
  
  return testimonial;
}
