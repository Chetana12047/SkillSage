import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();

    await db.user.update({
      where: {
        email: session?.user?.email!,
      },
      data: {
        roadmapData: body.roadmap,
        selectedDuration: body.selectedDuration,
        weeklyHours: body.weeklyHours,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch {
    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}