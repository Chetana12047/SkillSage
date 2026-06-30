import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { toFile } from "groq-sdk/uploads";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
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

    const bytes =
      await audio.arrayBuffer();

    const buffer =
      Buffer.from(bytes);

    const groqFile =
      await toFile(
        buffer,
        audio.name || "audio.webm"
      );

    const transcription =
      await groq.audio.transcriptions.create({
        file: groqFile,
        model: "whisper-large-v3",
        response_format: "verbose_json",
        language: "en",
      });

    return NextResponse.json({
      text: transcription.text,
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