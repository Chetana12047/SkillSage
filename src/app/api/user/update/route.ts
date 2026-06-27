import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
  req: NextRequest
) {
  try {
    const session =
      await getServerSession(
        authOptions
      );

    if (
      !session?.user?.email
    ) {
      return NextResponse.json(
        {
          error:
            "Unauthorized",
        },
        { status: 401 }
      );
    }

    const body =
      await req.json();

    const updatedUser =
      await db.user.update({
        where: {
          email:
            session.user.email,
        },

        data: {
          name:
            body.name || "",

          experience:
            body.experience ||
            "",

          education:
            body.education ||
            "",

          manualSkills:
            body.manualSkills ||
            "",

          tenthMarks:
            body.tenthMarks ||
            "",

          twelfthMarks:
            body.twelfthMarks ||
            "",

          cgpa:
            body.cgpa || "",
            skills:
            Array.isArray(
              body.skills
            )
              ? body.skills.join(',')
              : "",

            atsData:
              body.atsData || null,
                    },
                  });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        error:
          "Update failed",
      },
      { status: 500 }
    );
  }
}