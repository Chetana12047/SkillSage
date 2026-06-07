// src/app/api/resume/analyze/route.ts  — NEW ROUTE
// Replaces the 22-string KNOWN_SKILLS hardcoded analyzer with Claude.
// Call this AFTER the PDF text has been extracted and saved to user.resumeText

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const RESUME_SYSTEM = `
You are an expert technical recruiter and skills extractor.
Given the text of a student's resume, extract all technical skills, tools, and technologies.
Also determine the student's experience level and write a 2-sentence summary.

OUTPUT FORMAT — respond ONLY with valid JSON, no markdown fences, no preamble:
{
  "skills": ["JavaScript", "React", "Node.js", "..."],
  "level": "Beginner | Intermediate | Advanced",
  "yearsOfExperience": "0 | 1 | 2+ | ...",
  "summary": "Two sentence professional summary of the candidate.",
  "suggestedGoals": ["Full Stack Developer", "Frontend Engineer"]
}

Rules:
- Include ALL technical skills: languages, frameworks, libraries, databases, tools, cloud, OS, methodologies
- Normalize names (e.g. "reactjs" → "React", "node" → "Node.js")
- If resume is empty or unreadable, return skills: [] and level: "Beginner"
- Never add skills that aren't evidenced in the resume text
`

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // resumeText can come from request body or from the DB
    const body = await request.json()
    let resumeText: string = body.resumeText

    if (!resumeText) {
      const user = await db.user.findUnique({
        where: { email: session.user.email },
        select: { resumeText: true },
      })
      resumeText = user?.resumeText ?? ''
    }

    if (!resumeText.trim()) {
      return NextResponse.json({ error: 'No resume text found' }, { status: 400 })
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: RESUME_SYSTEM,
      messages: [
        {
          role: 'user',
          content: `Here is the resume text to analyze:\n\n${resumeText.slice(0, 8000)}`,
        },
      ],
    })

    const rawText = response.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as Anthropic.TextBlock).text)
      .join('')

    const cleanJson = rawText.replace(/```json|```/g, '').trim()
    const analysis = JSON.parse(cleanJson)

    // Save extracted skills back to the user's profile
    await db.user.update({
      where: { email: session.user.email },
      data: {
        skills: JSON.stringify(analysis.skills),
        currentLevel: analysis.level,
      },
    })

    return NextResponse.json(analysis)

  } catch (error: any) {
    console.error('[Resume Analyze]', error)
    return NextResponse.json(
      { error: 'Resume analysis failed', detail: error.message },
      { status: 500 }
    )
  }
}