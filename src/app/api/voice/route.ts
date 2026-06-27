import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()

    const audio =
      formData.get('audio') as File

    if (!audio) {
      return NextResponse.json(
        {
          error: 'No audio uploaded',
        },
        {
          status: 400,
        }
      )
    }

    const transcription =
      await groq.audio.transcriptions.create({
        file: audio,
        model:
          'whisper-large-v3',
        response_format:
          'verbose_json',
        language: 'en',
      })

    return NextResponse.json({
      text:
        transcription.text,
    })
  } catch (error: any) {
    console.error(error)

    return NextResponse.json(
      {
        error:
          'Voice transcription failed',
      },
      {
        status: 500,
      }
    )
  }
}