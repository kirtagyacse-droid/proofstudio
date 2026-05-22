import { prisma } from './db';
import { generateContentPack } from './ai';

export async function createDemoProjectForUser(userId: string) {
  // Check if user already has a demo project created
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { createdDemoProject: true }
  });

  if (!user || user.createdDemoProject) {
    return null;
  }

  // Create Demo Project
  const project = await prisma.project.create({
    data: {
      userId,
      name: 'Demo: High-Ticket Coaching Program',
      niche: 'business / career coaching',
      isDemo: true,
      testimonials: {
        create: [
          {
            clientName: 'Jane Doe',
            clientRole: 'Online business owner',
            rawText: 'Before this program I was stuck at 3–4k/month. In 90 days I hit my first 15k month and finally feel like I run a real business.',
            resultMetric: 'From 3–4k/month to 15k/month in 90 days',
            tone: 'grateful and excited',
            tags: 'business, high-ticket, US',
            source: 'demo',
            isFeatured: true,
          },
          {
            clientName: 'John Smith',
            clientRole: 'Mid-level marketing professional',
            rawText: 'In 8 weeks I went from almost no interviews to three offers, including a 50% salary increase and fully remote.',
            resultMetric: '3 offers in 8 weeks, 50% salary increase',
            tone: 'professional and relieved',
            tags: 'career, remote, US',
            source: 'demo',
            isFeatured: true,
          }
        ]
      }
    },
    include: {
      testimonials: true
    }
  });

  // Mark user as having created the demo project
  await prisma.user.update({
    where: { id: userId },
    data: { createdDemoProject: true }
  });

  // Trigger content pack generation for the first testimonial in the background
  if (project.testimonials.length > 0) {
    const firstTestimonialId = project.testimonials[0].id;
    // Fire and forget (don't await) to not block the response
    generateContentPack(firstTestimonialId).catch(err => {
      console.error('Failed to generate demo content pack in background:', err);
    });
  }

  return project;
}
