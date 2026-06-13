// src/app/api/roadmap/generate/route.ts
// PERSONALIZED: Uses full resume text + extracted projects + skills gaps.
// Every roadmap is unique to the person — not a template.

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GROQ_API_KEY missing in .env.local" }, { status: 500 });
    }

    const { goal, duration, userId } = await request.json();
    if (!goal || !duration) {
      return NextResponse.json({ error: "goal and duration required" }, { status: 400 });
    }

    // ── Load FULL user profile ──────────────────────────────────────────────
    let skillsFromDB: string[] = [];
    let manualSkills: string[] = [];
    let resumeText = "";
    let experience = "Fresher";
    let education = "";
    let richAnalysis: any = {};

    if (userId) {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: {
          skills: true,
          manualSkills: true,
          resumeText: true,
          experience: true,
          education: true,
          currentLevel: true,
          progressData: true,
        },
      });

      if (user) {
        skillsFromDB = user.skills?.split(",").map((s) => s.trim()).filter(Boolean) ?? [];
        manualSkills = user.manualSkills?.split(",").map((s) => s.trim()).filter(Boolean) ?? [];
        resumeText = user.resumeText ?? "";
        experience = user.experience || "Fresher";
        education = user.education || "";

        // Extract rich analysis stored during resume upload
        const pd = user.progressData as any;
        richAnalysis = pd?.resumeAnalysis ?? {};
      }
    }

    const allSkills = [...new Set([...skillsFromDB, ...manualSkills])];
    const hasResume = resumeText.trim().length > 100;
    const hasProjects = richAnalysis?.projects?.length > 0;

    // ── Build rich personal context ─────────────────────────────────────────
    const projectsText = hasProjects
      ? richAnalysis.projects.map((p: any) =>
          typeof p === "string" ? p : `${p.name} (${(p.tech || []).join(", ")}): ${p.description || ""}`
        ).join("\n  • ")
      : "None detected";

    const systemPrompt = `You are SkillSage, a senior technical career mentor for engineering students in India.

You create DEEPLY PERSONALIZED career roadmaps — not generic templates.
You have the student's actual resume, real projects, and detected skills.

Your roadmap must:
1. Start from WHERE THIS STUDENT IS RIGHT NOW — only teach what they don't know
2. Reference their ACTUAL projects and suggest improvements or extensions
3. Focus milestones on their SPECIFIC skill gaps for the goal
4. Be realistic for their experience level (${experience})
5. Sound like advice from a mentor who READ their resume — not a generic AI

EXACT JSON shape required (use these exact field names — no variations):
{
  "title": "goal title",
  "timeline": "${duration}",
  "salary": "e.g. ₹6 – ₹18 LPA",
  "readinessPercent": <0-100 integer>,
  "roles": ["Job Role 1", "Job Role 2", "Job Role 3"],
  "personalNote": "3-4 sentences SPECIFICALLY for this student. Mention their actual skills by name, reference one of their real projects, acknowledge what they've already built, and explain what gap this roadmap fills.",
  "currentSkills": ["skills they already have relevant to the goal — from their actual resume"],
  "missingSkills": ["specific skills they need but don't have yet"],
  "milestones": [
    {
      "level": "Phase N: Descriptive Name",
      "duration": "e.g. 3 weeks",
      "why": "1 sentence: why THIS specific student needs this phase based on their background",
      "skills": ["Skill to learn"],
      "tools": ["Tool to use"],
      "projects": ["Project that extends or improves on their existing work — be specific"],
      "certifications": ["Real cert (Platform)"],
      "interview": ["Interview topic 1", "Interview topic 2"]
    }
  ]
}

FIELD NAME RULES — CRITICAL:
- "salary" NOT "salaryRange"
- "roles" NOT "jobRoles"  
- "level" NOT "phase" or "title"
- "interview" NOT "interviewPrep"

Milestone count: 3 months = 2-3, 6 months = 3-4, 1 year = 4-6
Respond ONLY with raw JSON. No markdown. No explanation.`;

    const userMessage = `STUDENT PROFILE:
Goal: ${goal}
Timeline: ${duration}
Experience: ${experience}
Education: ${education || "Not specified"}
Current Skills (from resume): ${allSkills.length > 0 ? allSkills.join(", ") : "None detected yet"}
Skill Level: ${richAnalysis?.level || "Beginner"}

PROJECTS FOUND IN RESUME:
  • ${projectsText}

CANDIDATE SUMMARY:
${richAnalysis?.summary || "No summary available"}

STRENGTHS IDENTIFIED:
${richAnalysis?.strengths?.join(", ") || "Not analyzed yet"}

${hasResume ? `FULL RESUME TEXT (use this to understand the student deeply):
${resumeText.slice(0, 3000)}` : "NOTE: No resume uploaded. Generate roadmap based on skills listed. Mention in personalNote that uploading a resume will make this even more personalized."}

Generate a personalized roadmap. The personalNote MUST mention at least one specific skill or project from their profile.`;

    console.log(`[Roadmap] Generating for goal="${goal}" | skills=${allSkills.length} | hasResume=${hasResume} | projects=${richAnalysis?.projects?.length ?? 0}`);

    const groqRes = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: 0.5,
        max_tokens: 3000,
      }),
    });

    const groqData = await groqRes.json();
    if (!groqRes.ok) {
      return NextResponse.json(
        { error: "AI API error: " + (groqData?.error?.message || groqRes.status) },
        { status: 500 }
      );
    }

    const rawText: string = groqData.choices?.[0]?.message?.content ?? "";
    if (!rawText.trim()) {
      return NextResponse.json({ error: "AI returned empty response" }, { status: 500 });
    }

    const cleanJson = rawText.replace(/```json\n?|```/g, "").trim();

    let roadmap: any;
    try {
      roadmap = JSON.parse(cleanJson);
    } catch {
      console.error("[Roadmap] JSON parse failed:", rawText.slice(0, 300));
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

    // Defensive field normalizer
    if (!roadmap.salary && roadmap.salaryRange) roadmap.salary = roadmap.salaryRange;
    if (!roadmap.roles && roadmap.jobRoles) roadmap.roles = roadmap.jobRoles;
    if (roadmap.milestones) {
      roadmap.milestones = roadmap.milestones.map((m: any) => ({
        ...m,
        level: m.level || m.phase || m.title || "Phase",
        interview: m.interview || m.interviewPrep || [],
        why: m.why || "",
      }));
    }

    console.log(`[Roadmap] ✓ "${roadmap.title}" | ${roadmap.milestones?.length} phases | readiness: ${roadmap.readinessPercent}%`);

    // Save to DB
    if (userId) {
      try {
        await db.roadmap.create({
          data: {
            userId,
            title: roadmap.title,
            goal,
            duration,
            milestones: roadmap.milestones,
            recommendations: {
              roles: roadmap.roles ?? [],
              salary: roadmap.salary ?? "",
              missingSkills: roadmap.missingSkills ?? [],
              personalNote: roadmap.personalNote ?? "",
            },
          },
        });
        await db.user.update({
          where: { id: userId },
          data: { roadmapData: roadmap, goal, selectedCourse: goal, selectedDuration: duration },
        });
      } catch (dbErr) {
        console.warn("[Roadmap] DB save non-fatal:", dbErr);
      }
    }

    return NextResponse.json(roadmap);
  } catch (error: any) {
    console.error("[Roadmap] Unexpected error:", error);
    return NextResponse.json({ error: "Roadmap generation failed", detail: error.message }, { status: 500 });
  }
}