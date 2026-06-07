import { NextRequest, NextResponse } from "next/server";
import { generateRoadmap } from "@/lib/roadmap-generator";
import { db } from "@/lib/db";

export async function POST(
  request: NextRequest
) {
  try {
    const {
      goal,
      duration,
      userId,
    } = await request.json();

    let currentSkills: string[] = [];

    if (userId) {
      const user =
        await db.user.findUnique({
          where: {
            id: userId,
          },
        });

      if (user?.skills) {
        try {
          currentSkills =
            JSON.parse(
              user.skills
            );
        } catch {
          currentSkills = [];
        }
      }
    }

    const roadmap =
      generateRoadmap(
        goal,
        duration,
        currentSkills
      );

    return NextResponse.json(
      roadmap
    );

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        error:
          "Failed to generate roadmap",
      },
      {
        status: 500,
      }
    );
  }
}