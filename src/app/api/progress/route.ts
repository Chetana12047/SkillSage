import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/* GET */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await db.user.findUnique({
      where: {
        email: session.user.email,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const { searchParams } = new URL(request.url)

    const roadmapId =
      searchParams.get('roadmapId')

    const progress =
      await db.progress.findMany({
        where: {
          userId: user.id,
          ...(roadmapId && {
            roadmapId,
          }),
        },
        orderBy: {
          weekNumber: 'asc',
        },
      })

    return NextResponse.json({
      success: true,
      progress,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed' },
      { status: 500 }
    )
  }
}

/* POST */
export async function POST(
  request: NextRequest
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await db.user.findUnique({
      where: {
        email: session.user.email,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const body = await request.json()

console.log('PROGRESS BODY:', body)

const {
  roadmapId,
  weekNumber,
  goal,
  actualHours,
  completed,
  notes,
} = body
if (!roadmapId) {
  return NextResponse.json(
    { error: 'roadmapId missing' },
    { status: 400 }
  )
}

    const progress =
      await db.progress.upsert({
        where: {
          userId_roadmapId_weekNumber:
            {
              userId: user.id,
              roadmapId,
              weekNumber,
            },
        },

        update: {
          goal,
          actualHours:
            actualHours || 0,
          completed:
            completed || false,
          notes: notes || '',
        },

        create: {
          userId: user.id,
          roadmapId,
          weekNumber,
          goal,
          targetHours: 10,
          actualHours:
            actualHours || 0,
          completed:
            completed || false,
          notes: notes || '',
        },
      })

    return NextResponse.json({
      success: true,
      progress,
    })
  } catch (error) {
    console.log(error)

    return NextResponse.json(
      { error: 'Failed' },
      { status: 500 }
    )
  }
}