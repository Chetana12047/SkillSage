// src/app/api/auth/register/route.ts
// FIX: Returns `userId` in response so the client can pass it directly
// to other APIs without a separate /api/user/me round-trip.
// Also tightens validation and surfaces real error messages for debugging.

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { name, email, password, education, experience, skills, goal } = body;

    // ── Validation ──────────────────────────────────────────────────────────
    if (!name?.trim() || !email?.trim() || !password) {
      return NextResponse.json(
        { message: "Name, email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // ── Duplicate check ─────────────────────────────────────────────────────
    const existing = await db.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json(
        { message: "An account with this email already exists. Please login." },
        { status: 400 }
      );
    }

    // ── Create user ─────────────────────────────────────────────────────────
    const hashedPassword = await bcrypt.hash(password, 10);
    const safeSkills = Array.isArray(skills) ? skills : [];

    const user = await db.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        education: education || "",
        experience: experience || "",
        skills: safeSkills.join(", "),
        manualSkills: safeSkills.join(", "),
        goal: goal || "",
      },
    });

    return NextResponse.json(
      { message: "Account created successfully", userId: user.id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[REGISTER ERROR]", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
