import { GoogleGenAI, Type } from '@google/genai';
import { prisma } from './db';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function generateContentPack(testimonialId: string) {
  const testimonial = await prisma.testimonial.findUnique({
    where: { id: testimonialId },
    include: { project: true, contentPack: true },
  });

  if (!testimonial) {
    throw new Error('Testimonial not found');
  }

  const systemInstruction = `You are a world-class, 7-figure direct-response copywriter for high-ticket coaches and course creators (specifically in the business, marketing, career, and money niches targeting US/Global markets).
Your writing style is highly personal, authoritative, punchy, and completely devoid of generic AI fluff or corporate jargon (e.g., never use phrases like "unlock your potential," "in today's fast-paced world," or "supercharge").
You focus heavily on tangible results, emotional resonance, and actionable insights. You strictly follow formatting constraints.
CRITICAL: Do NOT output any raw HTML tags (like <h1>, <br>). Only output plain text. Use standard markdown for formatting.`;

  const textToAnalyze = testimonial.transcript || testimonial.rawText || '';

  const userPrompt = `I have a new client testimonial. Turn this into a highly engaging content pack.

**Context:**
- Project Niche: ${testimonial.project.niche}
- Client Role/Avatar: ${testimonial.clientRole}
- Quantified Result Metric: ${testimonial.resultMetric}
- Testimonial Tone: ${testimonial.tone}
- Raw Testimonial / Transcript: "${textToAnalyze}"

**Instructions:**
Generate a JSON response with the following exact keys:

1. linkedinPosts: An array of exactly 3 strings (LinkedIn post drafts).
   - Post 1: Focus on the "Before & After" transformation story.
   - Post 2: Focus on a specific, counter-intuitive lesson or framework that led to the result.
   - Post 3: A direct, hard-hitting promotional post using the Result Metric as the primary hook.
   - Constraint: At least one of these posts MUST prominently feature the exact Quantified Result Metric. Keep formatting native to LinkedIn (short paragraphs, hook-driven).

2. caseStudyOutline: A string containing a mini case-study outline. Use the structure: [Background] -> [The Real Problem] -> [The Approach] -> [The Quantified Result].

3. landingBlock: A string containing high-converting copy for a landing page section. Must include a punchy, benefit-driven headline, a 2-3 sentence summary, and a strong call to action.

4. shortVideoScript: A string containing a script for a 30-60 second short-form video (TikTok/Reels/Shorts). Include a 3-second visual hook instruction, followed by the spoken script.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: userPrompt,
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          linkedinPosts: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          caseStudyOutline: { type: Type.STRING },
          landingBlock: { type: Type.STRING },
          shortVideoScript: { type: Type.STRING },
        },
        required: ['linkedinPosts', 'caseStudyOutline', 'landingBlock', 'shortVideoScript'],
      },
    }
  });

  if (!response.text) {
    throw new Error('No content generated');
  }

  const generatedData = JSON.parse(response.text);

  // Save to DB
  const contentPack = await prisma.contentPack.upsert({
    where: { testimonialId },
    update: {
      linkedinPosts: JSON.stringify(generatedData.linkedinPosts),
      caseStudyOutline: generatedData.caseStudyOutline,
      landingBlock: generatedData.landingBlock,
      shortVideoScript: generatedData.shortVideoScript,
    },
    create: {
      testimonialId,
      linkedinPosts: JSON.stringify(generatedData.linkedinPosts),
      caseStudyOutline: generatedData.caseStudyOutline,
      landingBlock: generatedData.landingBlock,
      shortVideoScript: generatedData.shortVideoScript,
    },
  });

  return contentPack;
}

export async function generateCaseStudy({
  testimonialId,
  businessName,
  businessRole,
  businessDescription,
  tone,
  length,
}: {
  testimonialId: string;
  businessName: string;
  businessRole: string;
  businessDescription: string;
  tone: string;
  length: string;
}) {
  const testimonial = await prisma.testimonial.findUnique({
    where: { id: testimonialId },
    include: { project: true },
  });

  if (!testimonial) {
    throw new Error('Testimonial not found');
  }

  const systemInstruction = `You are a world-class, 7-figure direct-response copywriter for B2B services, SaaS, and high-ticket coaching programs.
Your writing style is highly personal, authoritative, punchy, and completely devoid of generic AI fluff or corporate jargon (e.g., never use phrases like "unlock your potential," "in today's fast-paced world," or "supercharge").
You focus heavily on tangible results, emotional resonance, and actionable insights. You strictly follow formatting constraints.
CRITICAL: Do NOT output any raw HTML tags (like <h1>, <br>). Only output plain text. Use standard markdown for formatting.`;

  const textToAnalyze = testimonial.transcript || testimonial.rawText || '';

  // Determine length instruction
  let lengthInstruction = '';
  if (length === 'Short (1–2 minutes read)') {
    lengthInstruction = 'Write a concise case study suitable for a 1-2 minutes quick read (around 200-350 words).';
  } else if (length === 'Standard (2–3 minutes)') {
    lengthInstruction = 'Write a standard case study suitable for a 2-3 minutes deep read (around 400-600 words).';
  } else if (length === 'Landing-page style') {
    lengthInstruction = 'Write a highly structured, scannable, punchy landing-page style case study with short bold headlines and bullet points (around 250-400 words).';
  } else {
    lengthInstruction = `Length should be: ${length}.`;
  }

  const userPrompt = `You are tasked with writing a polished, high-converting client case study using a client testimonial as the absolute ground truth.

**About the Business generating this Case Study:**
- Business Name: ${businessName}
- Business Role/Title: ${businessRole}
- Business Description: ${businessDescription}

**About the Client & Testimonial (Ground Truth):**
- Client Name: ${testimonial.clientName || 'Anonymous'}
- Client Role: ${testimonial.clientRole}
- Core Result Metric: ${testimonial.resultMetric || 'None'}
- Associated Tags: ${testimonial.tags || 'None'}
- Raw Testimonial / Transcript: "${textToAnalyze}"

**Settings:**
- Tone: ${tone}
- Length/Style: ${lengthInstruction}

**Strict Writing Rules:**
1. Use the testimonial text as the absolute ground truth.
2. DO NOT invent, hallucinate, or fabricate any numbers, metrics, or facts that are not explicitly present in the testimonial. If a metric is missing, write "[metric TBD]" instead of fabricating numbers.
3. Incorporate the business description and business name to shape the narrative of how they helped the client.
4. Structure the output into the following sections exactly:
   - **Title**: A hook-driven, compelling headline.
   - **Background**: The client's context, role, and initial situation before working with us.
   - **Challenge**: The obstacles, pain points, or problems the client was facing.
   - **Solution**: How our business (${businessName}) stepped in and solved the problem (relying on the testimonial context).
   - **Results**: The concrete outcomes and metrics achieved (strictly using the metrics from the testimonial, or "[metric TBD]" if none).
   - **Call-to-Action**: A brief closing urging similar businesses/clients to get in touch.

Generate only the markdown formatted case study text.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: userPrompt,
    config: {
      systemInstruction: systemInstruction,
    }
  });

  if (!response.text) {
    throw new Error('No content generated');
  }

  return response.text.trim();
}

