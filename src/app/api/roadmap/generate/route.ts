// src/app/api/roadmap/generate/route.ts
// Uses Groq (FREE — 14,400 req/day, no credit card needed)
// Get free key at: https://console.groq.com

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile"; // free on Groq

const SYSTEM_PROMPT = `You are SkillSage, an expert career roadmap generator for engineering students in India.
Given a student's career goal, current skills, and timeline, generate a personalised learning roadmap.

Respond ONLY with a single valid JSON object — no markdown fences, no explanation, just raw JSON.

Required shape:
{
  "title": "Career title",
  "timeline": "3 months",
  "salaryRange": "₹6 – ₹18 LPA",
  "readinessPercent": 30,
  "jobRoles": ["role1", "role2"],
  "currentSkills": ["skills student already has"],
  "missingSkills": ["skills student still needs"],
  "milestones": [
    {
      "phase": "Phase 1: Foundation",
      "duration": "4 weeks",
      "skills": ["Skill A", "Skill B"],
      "tools": ["Tool X"],
      "projects": ["Build a concrete project"],
      "resources": ["FreeCodeCamp", "MDN Docs"],
      "certifications": ["Cert name (Coursera)"],
      "interviewPrep": ["Topic 1", "Topic 2"]
    }
  ]
}

Rules:
- 3 months = 2-3 phases, 6 months = 3-4 phases, 1 year = 4-6 phases
- currentSkills = only skills the student already has
- missingSkills = skills they still need for the goal
- Projects must be concrete and completable within the phase duration
- Resources must be real and free/affordable`;

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error("[Roadmap] GROQ_API_KEY is not set in .env.local");
      return NextResponse.json(
        { error: "GROQ_API_KEY is missing. Add it to .env.local and restart." },
        { status: 500 }
      );
    }

    const { goal, duration, userId } = await request.json();
    if (!goal || !duration) {
      return NextResponse.json({ error: "goal and duration are required" }, { status: 400 });
    }

    // Load user skills + resume from DB
    let allSkills: string[] = [];
    let resumeSnippet = "";
    let experience = "College student / Fresher";

    if (userId) {
      try {
        const user = await db.user.findUnique({
          where: { id: userId },
          select: { skills: true, manualSkills: true, resumeText: true, experience: true },
        });
        if (user) {
          const s1 = user.skills?.split(",").map((s) => s.trim()).filter(Boolean) ?? [];
          const s2 = user.manualSkills?.split(",").map((s) => s.trim()).filter(Boolean) ?? [];
          allSkills = [...new Set([...s1, ...s2])];
          resumeSnippet = user.resumeText?.slice(0, 800) ?? "";
          experience = user.experience || "College student / Fresher";
        }
      } catch (e) {
        console.warn("[Roadmap] DB lookup failed:", e);
      }
    }

    const userMessage = `Career goal: ${goal}
Timeline: ${duration}
Current skills: ${allSkills.length > 0 ? allSkills.join(", ") : "None listed yet"}
Experience: ${experience}
Resume excerpt: ${resumeSnippet || "No resume uploaded yet"}

Generate the personalised roadmap JSON now.`;

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
        max_tokens: 2048,
      }),
    });

    const groqData = await groqRes.json();

    if (!groqRes.ok) {
      console.error("[Roadmap] Groq API error:", JSON.stringify(groqData));
      return NextResponse.json(
        { error: "Groq API error: " + (groqData?.error?.message || groqRes.status) },
        { status: 500 }
      );
    }

    const rawText = groqData.choices?.[0]?.message?.content ?? "";
    if (!rawText) {
      return NextResponse.json({ error: "Empty response from AI" }, { status: 500 });
    }

    const cleanJson = rawText.replace(/```json\n?|```/g, "").trim();

    let roadmap: any;
    try {
      roadmap = JSON.parse(cleanJson);
    } catch {
      console.error("[Roadmap] JSON parse failed. Raw:", rawText.slice(0, 300));
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

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
              jobRoles: roadmap.jobRoles ?? [],
              salaryRange: roadmap.salaryRange ?? "",
              missingSkills: roadmap.missingSkills ?? [],
            },
          },
        });
        await db.user.update({
          where: { id: userId },
          data: { roadmapData: roadmap, goal, selectedCourse: goal, selectedDuration: duration },
        });
      } catch (e) {
        console.warn("[Roadmap] DB save failed (non-fatal):", e);
      }
    }

    return NextResponse.json(roadmap);
  } catch (error: any) {
    console.error("[Roadmap] Unexpected error:", error);
    return NextResponse.json({ error: "Roadmap generation failed", detail: error.message }, { status: 500 });
  }
}