import { parseResume } from "@/lib/resume-parser";
import { analyzeResume } from "@/lib/resume-analyzer";
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

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(
      authOptions
    );

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData =
      await req.formData();

    const file =
      formData.get(
        "resume"
      ) as File;

    if (!file) {
      return NextResponse.json(
        {
          error:
            "No file selected",
        },
        { status: 400 }
      );
    }

    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (
      !allowed.includes(
        file.type
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Only PDF, DOC, DOCX allowed",
        },
        { status: 400 }
      );
    }

    if (
      file.size >
      2 *
        1024 *
        1024
    ) {
      return NextResponse.json(
        {
          error:
            "Max file size is 2MB",
        },
        { status: 400 }
      );
    }

    /* ---------- FIND USER ---------- */

    const existingUser =
      await db.user.findUnique({
        where: {
          email:
            session.user.email,
        },
      });

    /* ---------- DELETE OLD FILE FIRST ---------- */

    if (
      existingUser?.resumeUrl
    ) {
      try {
        const parts =
          existingUser.resumeUrl.split(
            "/"
          );

        const fileName =
          parts[
            parts.length - 1
          ];

        const publicId =
          "skillsage_resumes/" +
          fileName.split(
            "."
          )[0];

        await cloudinary.uploader.destroy(
          publicId,
          {
            resource_type:
              "auto",
          }
        );
      } catch (err) {
        console.log(
          "Old file delete skipped"
        );
      }
    }

    /* ---------- UPLOAD NEW ---------- */

    const bytes =
      await file.arrayBuffer();

    const buffer =
      Buffer.from(bytes);

    const uploadRes: any =
      await new Promise(
        (
          resolve,
          reject
        ) => {
          cloudinary.uploader
            .upload_stream(
              {
                resource_type:
                  "raw",
                folder:
                  "skillsage_resumes",
              },
              (
                error,
                result
              ) => {
                if (
                  error
                )
                  reject(
                    error
                  );
                else
                  resolve(
                    result
                  );
              }
            )
            .end(buffer);
        }
      );

      /* ---------- ANALYZE RESUME ---------- */

      let resumeText = "";
      let detectedSkills: string[] = [];
      let currentLevel = "Beginner";

      try {
        resumeText =
          await parseResume(buffer);

        const analysis =
          analyzeResume(
            resumeText
          );

        detectedSkills =
          analysis.skills;

        currentLevel =
          analysis.level;

      } catch (err) {
        console.log(
          "Resume parsing failed:",
          err
        );
      }

      /* ---------- SAVE DB ---------- */

      const user =
        await db.user.update({
          where: {
            email:
              session.user.email,
          },
          data: {
            resumeUrl:
              uploadRes.secure_url,

            resumeText,

            skills:
            detectedSkills.join(","),

            currentLevel,
          },
        });

      return NextResponse.json({
        success: true,

        url:
          uploadRes.secure_url,

        publicId:
          uploadRes.public_id,

        skills:
          detectedSkills,

        level:
          currentLevel,

        user,
      });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        error:
          "Upload failed",
      },
      { status: 500 }
    );
  }
}