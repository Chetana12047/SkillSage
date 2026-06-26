// src/app/api/resume/upload/route.ts
// FIXED: Uses Groq AI to extract skills instead of 22-string hardcoded list.
// Returns skills, level, summary, suggestedGoals to the frontend.

import { parseResume } from "@/lib/resume-parser";
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

async function extractSkillsWithAI(resumeText: string) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || !resumeText?.trim()) return null;

  const prompt = `You are a technical recruiter. Extract ALL information from this resume.
Respond ONLY with valid JSON — no markdown fences, no explanation.

{
  "skills": ["every single technical skill, tool, framework, language, database, cloud service"],
  "level": "Beginner | Intermediate | Advanced",
  "experience": "Fresher | Less than 1 year | 1-2 years | 2+ years",
  "education": "Degree - College - Year",
  "projects": [
    {"name": "Project Name", "tech": ["tech1", "tech2"], "description": "one line"}
  ],
  "summary": "2-sentence summary mentioning specific skills and projects found",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "suggestedGoals": ["Best career goal for this candidate", "Second best goal"]
}

Rules:
- Extract EVERY technical skill — be thorough, include everything
- Normalize: "reactjs" → "React", "nodejs" → "Node.js", "springboot" → "Spring Boot"
- If a skill appears in projects section, include it
- suggestedGoals should be realistic given the skills found
- summary must mention specific skills/projects from the resume, not generic text

Resume:
${resumeText.slice(0, 5000)}`;

  try {
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
        max_tokens: 1500,
      }),
    });

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content ?? "";
    const clean = raw.replace(/```json\n?|```/g, "").trim();
    const parsed = JSON.parse(clean);
    console.log("[Resume AI] Extracted", parsed.skills?.length, "skills:", parsed.skills?.slice(0, 5), "...");
    return parsed;
  } catch (err) {
    console.error("[Resume AI] Failed:", err);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("resume") as File;

    if (!file) return NextResponse.json({ error: "No file selected" }, { status: 400 });

    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: "Only PDF, DOC, DOCX allowed" }, { status: 400 });
    }
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "Max file size is 2MB" }, { status: 400 });
    }

    const existingUser = await db.user.findUnique({ where: { email: session.user.email } });

    // Delete old Cloudinary file
    if (existingUser?.resumeUrl) {
      try {
        const parts = existingUser.resumeUrl.split("/");
        const publicId = "skillsage_resumes/" + parts[parts.length - 1].split(".")[0];
        await cloudinary.uploader.destroy(publicId, { resource_type: "auto" });
      } catch {}
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const uploadRes: any = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ resource_type: "auto", folder: "skillsage_resumes" }, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        })
        .end(buffer);
    });

    // Parse PDF → text
    let resumeText = "";
    try {
      resumeText = await parseResume(buffer);
      console.log("[Resume] Parsed", resumeText.length, "characters of text");
    } catch (err) {
      console.error("[Resume] PDF parse failed:", err);
    }

    // ── AI extraction ──────────────────────────────────────────
    const analysis = await extractSkillsWithAI(resumeText);

    const detectedSkills: string[] = analysis?.skills ?? [];
    const currentLevel: string = analysis?.level ?? "Beginner";
    const experience: string = analysis?.experience ?? existingUser?.experience ?? "Fresher";
    const education: string = analysis?.education ?? existingUser?.education ?? "";

    // Store rich analysis in progressData (Json field — no schema change needed)
    const richAnalysis = {
      resumeAnalysis: {
        projects: analysis?.projects ?? [],
        strengths: analysis?.strengths ?? [],
        summary: analysis?.summary ?? "",
        suggestedGoals: analysis?.suggestedGoals ?? [],
        education,
        experience,
        extractedAt: new Date().toISOString(),
      }
    };

    // Save to DB
    const user = await db.user.update({
      where: { email: session.user.email },
      data: {
        resumeUrl: uploadRes.secure_url,
        resumeText,
        skills: detectedSkills.join(","),
        currentLevel,
        education,
        experience,
        progressData: {
          ...(existingUser?.progressData as any ?? {}),
          ...richAnalysis,
        },
      },
    });

    // Return EVERYTHING the frontend needs
    return NextResponse.json({
      success: true,
      url: uploadRes.secure_url,
      skills: detectedSkills,            // array — used by ResumeUpload to show badges
      level: currentLevel,
      summary: analysis?.summary ?? "",
      suggestedGoals: analysis?.suggestedGoals ?? [],
      projects: analysis?.projects ?? [],
      education,
      experience,
      user,
    });

  } catch (error: any) {
    console.error("[Resume Upload]", error);
    return NextResponse.json({ error: "Upload failed", detail: error.message }, { status: 500 });
  }
}