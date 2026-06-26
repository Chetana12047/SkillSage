import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session =
      await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false },
        { status: 401 }
      );
    }

    const body = await req.json();

    const user =
      await db.user.findUnique({
        where: {
          email: session.user.email,
        },
      });

    if (!user) {
      return NextResponse.json(
        { success: false },
        { status: 404 }
      );
    }

    /* CREATE ROADMAP ENTRY */
  console.log(
  'BODY:',
  body
)

const roadmap =
  await db.roadmap.create({
    data: {
      userId: user.id,

      title: "Career Roadmap",

      goal:
        user.goal ||
        "Career Goal",

      duration:
        body.selectedDuration ||
        "3 Months",

      milestones:
        body.roadmap || [],

      recommendations:
        body.roadmap || [],
    },
  });

console.log(
  'CREATED ROADMAP:',
  roadmap
)

    /* SAVE IN USER ALSO */
    await db.user.update({
      where: {
        email: session.user.email,
      },

      data: {
        roadmapData:
          body.roadmap,

        selectedDuration:
          body.selectedDuration,

        weeklyHours:
          body.weeklyHours,
      },
    });

    return NextResponse.json({
      success: true,
      roadmap,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}