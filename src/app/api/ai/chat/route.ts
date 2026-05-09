import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest
) {

  try {

    const body =
      await request.json()

    const message =
      body.message.toLowerCase()

    let reply =
      'I can help you with career guidance, coding, roadmap, projects, and placements.'

    if (
      message.includes('java')
    ) {

      reply =
        'For Java Full Stack, focus on Java, Spring Boot, React, MySQL, REST APIs, and projects.'

    } else if (
      message.includes('resume')
    ) {

      reply =
        'Keep your resume one page, add projects, skills, internships, and achievements.'

    } else if (
      message.includes('project')
    ) {

      reply =
        'Build 2-3 strong full stack projects with authentication, APIs, database, and deployment.'

    } else if (
      message.includes('placement')
    ) {

      reply =
        'Practice DSA, aptitude, communication, and mock interviews consistently.'

    } else if (
      message.includes('roadmap')
    ) {

      reply =
        'Your roadmap should include fundamentals, projects, advanced development, and interview preparation.'

    } else if (
      message.includes('hello')
    ) {

      reply =
        'Hello Sonam 👋 How can I help you today?'

    }

    return NextResponse.json({
      reply,
    })

  } catch (error) {

    return NextResponse.json({
      reply:
        'AI could not respond.',
    })
  }
}