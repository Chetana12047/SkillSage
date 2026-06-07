// src/app/api/ai/chat/route.ts
// Uses Groq (FREE — 14,400 req/day, no credit card)
// Get free key at: https://console.groq.com

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { buildSkillSagePrompt } from "@/lib/prompt";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GROQ_API_KEY is missing. Add it to .env.local and restart." },
        { status: 500 }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, conversationHistory = [] } = await request.json();
    if (!message?.trim()) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    // Load user context from DB
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
        selectedCourse: true,
        roadmapData: true,
        progressData: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Build personalised system prompt using existing prompt.ts
    const systemPrompt = buildSkillSagePrompt(
      {
        name: user.name,
        email: user.email,
        goal: user.goal,
        skills: user.skills ? user.skills.split(",").map((s) => s.trim()) : [],
        experience: user.experience,
        education: user.education,
        selectedCourse: user.selectedCourse
          ? (() => { try { return JSON.parse(user.selectedCourse!); } catch { return user.selectedCourse; } })()
          : null,
        roadmapData: user.roadmapData,
        progressData: user.progressData,
      },
      message
    );

    // Build messages array with conversation history
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
      console.error("[Chat] Groq error:", JSON.stringify(groqData));
      return NextResponse.json(
        { error: "Groq API error: " + (groqData?.error?.message || groqRes.status) },
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