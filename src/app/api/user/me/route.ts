// src/app/api/user/me/route.ts
// FIX: Added `id` to the selected fields so the dashboard can pass userId
// to /api/roadmap/generate without requiring a separate DB query.
// Also added proper error messages for debugging.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        education: true,
        experience: true,
        skills: true,
        manualSkills: true,
        goal: true,
        resumeUrl: true,
        resumeText: true,
        currentLevel: true,
        selectedCourse: true,
        selectedDuration: true,
        activeTab: true,
        roadmapData: true,
        progressData: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("[USER ME]", error);
    return NextResponse.json({ error: "Failed to load user" }, { status: 500 });
  }
}
