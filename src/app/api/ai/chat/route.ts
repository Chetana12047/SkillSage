// src/app/api/ai/chat/route.ts
// CONTEXT-AWARE: Loads resumeText, projects, skill gaps, roadmap — full student context.
// This is effectively RAG without a vector DB — we inject the full resume as context.

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

function buildRichSystemPrompt(user: any): string {
  const skills = user.skills?.split(",").map((s: string) => s.trim()).filter(Boolean) ?? [];
  const pd = user.progressData as any ?? {};
  const ra = pd?.resumeAnalysis ?? {};

  // Build roadmap summary if available
  let roadmapSummary = "No roadmap generated yet.";
  if (user.roadmapData) {
    const rd = user.roadmapData as any;
    const phases = rd.milestones?.map((m: any, i: number) =>
      `  Phase ${i + 1}: ${m.level} (${m.duration})`
    ).join("\n") ?? "";
    roadmapSummary = `Title: ${rd.title}
Timeline: ${rd.timeline}
Readiness: ${rd.readinessPercent}%
Missing Skills: ${rd.missingSkills?.join(", ") || "None"}
Phases:\n${phases}`;
  }

  // Build projects summary from resume analysis
  let projectsSummary = "No projects detected from resume.";
  if (ra.projects?.length > 0) {
    projectsSummary = ra.projects.map((p: any) =>
      typeof p === "string" ? `• ${p}` : `• ${p.name} (${(p.tech || []).join(", ")}): ${p.description || ""}`
    ).join("\n");
  }

  // Build progress summary
  let progressSummary = "No progress tracked yet.";
  const completedPhases = pd?.completedPhases;
  if (completedPhases && Object.keys(completedPhases).length > 0) {
    progressSummary = `Completed phases: ${Object.keys(completedPhases).join(", ")}`;
  }

  return `You are SkillSage AI — a highly personalized career mentor.
You have complete knowledge of this student's resume, skills, projects, roadmap, and progress.
You answer like a mentor who has READ their resume and KNOWS their background.

════════════════════════════════════════
STUDENT PROFILE
════════════════════════════════════════
Name: ${user.name || "Student"}
Career Goal: ${user.goal || "Not set yet"}
Experience: ${user.experience || ra.experience || "Not specified"}
Education: ${user.education || ra.education || "Not specified"}

TECHNICAL SKILLS (${skills.length} detected from resume):
${skills.length > 0 ? skills.join(", ") : "No skills detected yet — ask them to upload their resume"}

PROJECTS FROM RESUME:
${projectsSummary}

CANDIDATE STRENGTHS:
${ra.strengths?.join(", ") || "Not analyzed yet"}

RESUME SUMMARY:
${ra.summary || "No resume uploaded yet"}

════════════════════════════════════════
CURRENT ROADMAP
════════════════════════════════════════
${roadmapSummary}

════════════════════════════════════════
LEARNING PROGRESS
════════════════════════════════════════
${progressSummary}

════════════════════════════════════════
RESUME TEXT (for deep context)
════════════════════════════════════════
${user.resumeText?.slice(0, 2000) || "No resume uploaded — encourage them to upload their resume for personalized guidance."}

════════════════════════════════════════
YOUR BEHAVIOR RULES
════════════════════════════════════════
- Answer like you READ this student's actual resume
- When asked about their skills, reference the specific ones detected above
- When suggesting projects, reference or build upon their existing projects
- When suggesting what to learn next, base it on their skill gaps in the roadmap
- If they ask "what should I learn next?", look at their roadmap's missing skills
- If they ask "review my resume" or "what are my skills?", refer to the extracted data above
- Never give generic advice — always personalize to this specific student
- Keep answers concise (max 4-5 sentences for conversational answers, more for technical explanations)
- If resume is not uploaded, gently guide them to upload it for better personalization
- Motivate, guide, and be practical — like a senior engineer mentoring a junior`;
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GROQ_API_KEY missing" }, { status: 500 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, conversationHistory = [] } = await request.json();
    if (!message?.trim()) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    // Load FULL user context including resumeText and progressData (which has richAnalysis)
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        goal: true,
        skills: true,
        manualSkills: true,
        experience: true,
        education: true,
        currentLevel: true,
        resumeText: true,
        selectedCourse: true,
        roadmapData: true,
        progressData: true,
      },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const systemPrompt = buildRichSystemPrompt(user);

    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory.slice(-8).map((m: any) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      })),
      { role: "user", content: message },
    ];

    const groqRes = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    const groqData = await groqRes.json();
    if (!groqRes.ok) {
      return NextResponse.json(
        { error: "Groq error: " + (groqData?.error?.message || groqRes.status) },
        { status: 500 }
      );
    }

    const assistantMessage = groqData.choices?.[0]?.message?.content ?? "Sorry, I could not generate a response.";

    // Save to chat history (non-fatal)
    try {
      await db.chatMessage.createMany({
        data: [
          { userId: user.id, role: "user", content: message },
          { userId: user.id, role: "assistant", content: assistantMessage },
        ],
      });
    } catch {}

    return NextResponse.json({ message: assistantMessage });
  } catch (error: any) {
    console.error("[Chat] Unexpected error:", error);
    return NextResponse.json({ error: "AI response failed", detail: error.message }, { status: 500 });
  }
}