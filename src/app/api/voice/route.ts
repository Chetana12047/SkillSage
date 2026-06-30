import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const audio =
      formData.get("audio") as File;

    if (!audio) {
      return NextResponse.json(
        {
          error: "No audio uploaded",
        },
        {
          status: 400,
        }
      );
    }

    /* CONVERT FILE */

    const bytes =
      await audio.arrayBuffer();

    const buffer =
      Buffer.from(bytes);

    /* TEMP FILE */

    const tempPath = path.join(
      process.cwd(),
      `temp-${Date.now()}.webm`
    );

    fs.writeFileSync(
      tempPath,
      buffer
    );

    /* SEND TO GROQ */

    const transcription =
      await groq.audio.transcriptions.create({
        file:
          fs.createReadStream(
            tempPath
          ),
        model:
          "whisper-large-v3",
        response_format:
          "verbose_json",
        language: "en",
      });

    /* CLEANUP */

    fs.unlinkSync(tempPath);

    return NextResponse.json({
      text:
        transcription.text,
    });

  } catch (error: any) {

    console.error(error);

    return NextResponse.json(
      {
        error:
          "Voice transcription failed",
      },
      {
        status: 500,
      }
    );
  }
}