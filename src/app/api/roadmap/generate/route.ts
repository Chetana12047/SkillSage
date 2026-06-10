// src/app/api/roadmap/generate/route.ts
// Groq-powered roadmap generator.
// JSON field names match EXACTLY what RoadmapDisplay.tsx and Journey.tsx read:
//   roadmap.salary        (NOT salaryRange)
//   roadmap.roles         (NOT jobRoles)
//   milestone.level       (NOT phase)
//   milestone.interview   (NOT interviewPrep)

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

const SYSTEM_PROMPT = `You are SkillSage, an expert career roadmap generator for engineering students in India.
Given a student's career goal, current skills, and timeline, generate a personalised learning roadmap.

Respond ONLY with a single valid JSON object. No markdown fences. No explanation. Just raw JSON.

EXACT required shape (use these exact field names, no variations):
{
  "title": "string — career title e.g. Java Full Stack Developer",
  "timeline": "string — e.g. 3 months",
  "salary": "string — e.g. ₹6 – ₹18 LPA",
  "readinessPercent": number between 0 and 100,
  "roles": ["Job Role 1", "Job Role 2", "Job Role 3"],
  "currentSkills": ["skill the student already has"],
  "missingSkills": ["skill the student still needs to learn"],
  "milestones": [
    {
      "level": "string — phase name e.g. Phase 1: Core Java & OOP",
      "duration": "string — e.g. 4 weeks",
      "skills": ["Skill A", "Skill B", "Skill C"],
      "tools": ["Tool 1", "Tool 2"],
      "projects": ["Concrete project description"],
      "certifications": ["Certification name (Platform)"],
      "interview": ["Interview topic 1", "Interview topic 2"]
    }
  ]
}

Rules:
- 3 months = 2 to 3 milestones, 6 months = 3 to 4 milestones, 1 year = 4 to 6 milestones
- "currentSkills" must only contain skills the student ALREADY has from their resume/profile
- "missingSkills" = skills required for the goal but not yet known
- Projects must be concrete, buildable things (not vague descriptions)
- Certifications should be real and obtainable (Coursera, Udemy, Google, AWS etc.)
- Interview topics should be specific technical subjects to study
- CRITICAL: use field name "salary" not "salaryRange", "roles" not "jobRoles", "level" not "phase", "interview" not "interviewPrep"`;

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error("[Roadmap] GROQ_API_KEY is not set in .env.local");
      return NextResponse.json(
        { error: "GROQ_API_KEY is missing. Add it to .env.local and restart the server." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { goal, duration, userId } = body;

    if (!goal || !duration) {
      return NextResponse.json(
        { error: "goal and duration are required" },
        { status: 400 }
      );
    }

    // Load user's skills and resume from DB
    let allSkills: string[] = [];
    let resumeSnippet = "";
    let experience = "College student / Fresher";

    if (userId) {
      try {
        const user = await db.user.findUnique({
          where: { id: userId },
          select: {
            skills: true,
            manualSkills: true,
            resumeText: true,
            experience: true,
          },
        });

        if (user) {
          const s1 = user.skills?.split(",").map((s) => s.trim()).filter(Boolean) ?? [];
          const s2 = user.manualSkills?.split(",").map((s) => s.trim()).filter(Boolean) ?? [];
          allSkills = [...new Set([...s1, ...s2])];
          resumeSnippet = user.resumeText?.slice(0, 800) ?? "";
          experience = user.experience || "College student / Fresher";
        }
      } catch (dbErr) {
        console.warn("[Roadmap] DB user lookup failed:", dbErr);
      }
    }

    const userMessage = `Generate a career roadmap with these details:

Career goal: ${goal}
Timeline: ${duration}
Student's current skills: ${allSkills.length > 0 ? allSkills.join(", ") : "None listed yet"}
Experience level: ${experience}
Resume summary: ${resumeSnippet || "No resume uploaded yet"}

Return ONLY the JSON object. No extra text.`;

    console.log(`[Roadmap] Generating for goal="${goal}" duration="${duration}" userId="${userId}"`);

    const groqRes = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        temperature: 0.4,
        max_tokens: 2500,
      }),
    });

    const groqData = await groqRes.json();

    if (!groqRes.ok) {
      const errMsg = groqData?.error?.message || `HTTP ${groqRes.status}`;
      console.error("[Roadmap] Groq API error:", errMsg);
      return NextResponse.json(
        { error: "AI API error: " + errMsg },
        { status: 500 }
      );
    }

    const rawText: string = groqData.choices?.[0]?.message?.content ?? "";

    if (!rawText.trim()) {
      console.error("[Roadmap] Groq returned empty content");
      return NextResponse.json({ error: "AI returned empty response" }, { status: 500 });
    }

    // Strip any accidental markdown fences
    const cleanJson = rawText.replace(/```json\n?|```/g, "").trim();

    let roadmap: any;
    try {
      roadmap = JSON.parse(cleanJson);
    } catch (parseErr) {
      console.error("[Roadmap] JSON parse failed. Raw response:", rawText.slice(0, 500));
      return NextResponse.json(
        { error: "Failed to parse AI response as JSON. Raw: " + rawText.slice(0, 200) },
        { status: 500 }
      );
    }

    // Defensive: normalise any alternate field names AI might still use
    if (!roadmap.salary && roadmap.salaryRange) roadmap.salary = roadmap.salaryRange;
    if (!roadmap.roles && roadmap.jobRoles) roadmap.roles = roadmap.jobRoles;
    if (roadmap.milestones) {
      roadmap.milestones = roadmap.milestones.map((m: any) => ({
        ...m,
        level: m.level || m.phase || m.title || "Phase",
        interview: m.interview || m.interviewPrep || [],
      }));
    }

    console.log("[Roadmap] Successfully generated:", roadmap.title, "with", roadmap.milestones?.length, "milestones");

    // Save to DB (non-fatal)
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
            },
          },
        });

        await db.user.update({
          where: { id: userId },
          data: {
            roadmapData: roadmap,
            goal,
            selectedCourse: goal,
            selectedDuration: duration,
          },
        });

        console.log("[Roadmap] Saved to DB for userId:", userId);
      } catch (dbErr) {
        console.warn("[Roadmap] DB save failed (non-fatal):", dbErr);
      }
    }

    return NextResponse.json(roadmap);

  } catch (error: any) {
    console.error("[Roadmap] Unexpected error:", error);
    return NextResponse.json(
      { error: "Roadmap generation failed", detail: error.message },
      { status: 500 }
    );
  }
}