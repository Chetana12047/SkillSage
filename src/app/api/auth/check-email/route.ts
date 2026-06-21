// src/app/api/auth/check-email/route.ts
// FIX: Wrapped in try/catch — previously a DB error would cause an unhandled
// rejection that silently broke the "Let's Dive In" signup step.

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ exists: false });
    }

    const user = await db.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: { id: true }, // only fetch what we need
    });

    return NextResponse.json({ exists: !!user });
  } catch (error) {
    console.error("[CHECK EMAIL]", error);
    // Return false so the signup flow can proceed; the register route
    // will catch the duplicate properly.
    return NextResponse.json({ exists: false });
  }
}
