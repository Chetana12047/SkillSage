import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

cloudinary.config({
  cloud_name:
    process.env.CLOUDINARY_CLOUD_NAME,
  api_key:
    process.env.CLOUDINARY_API_KEY,
  api_secret:
    process.env.CLOUDINARY_API_SECRET,
});

export async function POST() {
  try {
    const session =
      await getServerSession(
        authOptions
      );

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          error:
            "Unauthorized",
        },
        { status: 401 }
      );
    }

    const user =
      await db.user.findUnique({
        where: {
          email:
            session.user.email,
        },
      });

    if (!user?.resumeUrl) {
      return NextResponse.json({
        success: true,
        message:
          "No file found",
      });
    }

    const parts =
      user.resumeUrl.split("/");

    const fileName =
      parts[parts.length - 1];

    const publicId =
      "skillsage_resumes/" +
      fileName.split(".")[0];

    await cloudinary.uploader.destroy(
      publicId,
      {
        resource_type: "raw",
      }
    );

    await db.user.update({
      where: {
        email:
          session.user.email,
      },
      data: {
  resumeUrl: null,
  resumeText: "",
  skills: "",

  atsData: {
    score: 0,
    matchedSkills: [],
    missingSkills: [],
  },
},
    });

    return NextResponse.json({
      success: true,
      message:
        "File deleted successfully",
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        error:
          "Delete failed",
      },
      { status: 500 }
    );
  }
}