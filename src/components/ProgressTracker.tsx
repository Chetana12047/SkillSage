'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'

import {
  CheckCircle,
  Circle,
  Clock,
  Calendar,
  Target,
  Award,
  Plus,
  Edit,
} from 'lucide-react'

interface ProgressTrackerProps {
  roadmap: any
  roadmapId?: string
}

export default function ProgressTracker({
  roadmap,
  roadmapId,
}: ProgressTrackerProps) {
  const [weeklyProgress, setWeeklyProgress] =
    useState<any[]>([])

  const [currentWeek, setCurrentWeek] =
    useState(1)

  const [showAddGoal, setShowAddGoal] =
    useState(false)

  const [newGoal, setNewGoal] =
    useState('')

  if (!roadmap) return null

  /* LOAD DB */
  useEffect(() => {
    if (roadmapId) {
      loadProgress()
    }
  }, [roadmapId])

  const loadProgress = async () => {
  try {
    console.log('LOADING ROADMAP:', roadmapId)
    const activeRoadmapId =
  roadmapId

    console.log(
  'LOADING PROGRESS FOR:',
  roadmapId
)

const res = await fetch(
  `/api/progress?roadmapId=${activeRoadmapId}`
)
    const data = await res.json()

    console.log('LOADED DATA:', data)

    if (
      data.success &&
      data.progress.length > 0
    ) {
      const formatted =
        data.progress.map(
          (item: any) => ({
            week: item.weekNumber,
            goal: item.goal,
            completed: item.completed,
            hours: item.actualHours,
          })
        )

      setWeeklyProgress(formatted)

      const pending =
        formatted.find(
          (w: any) => !w.completed
        )

      setCurrentWeek(
        pending
          ? pending.week
          : formatted.length
      )
    } else {
      const defaultWeek = {
        week: 1,
        goal: 'Start Learning',
        completed: false,
        hours: 0,
      }

      setWeeklyProgress([defaultWeek])

    }
  } catch (error) {
    console.log(error)
  }
}

  /* SAVE WEEK */
  const saveWeek = async (
  weekNumber: number,
  data: any
) => {
  try {
    console.log('SAVING:', {
      roadmapId,
      weekNumber,
      data,
    })
    const activeRoadmapId =
  roadmapId
  console.log(
  'SAVING WEEK:',
  {
    roadmapId,
    weekNumber,
    data,
  }
)
if (!activeRoadmapId) {
  console.log(
    'NO ROADMAP ID'
  )
  return
}

    const res = await fetch(
      '/api/progress',
      {
        method: 'POST',
        headers: {
          'Content-Type':
            'application/json',
        },
        body: JSON.stringify({
          roadmapId:
  activeRoadmapId,
          weekNumber,
          ...data,
        }),
      }
    )

    const result =
      await res.json()

    console.log(
      'SAVE RESULT:',
      result
    )
  } catch (error) {
    console.log(error)
  }
}

  /* ADD HOURS */
  const addHours = async () => {
    const target =
      weeklyProgress[
        currentWeek - 1
      ]

    if (!target) return

const newHours =
  (target.hours || 0) + 2

    const updated =
      weeklyProgress.map(
        (week) =>
          week.week ===
          currentWeek
            ? {
                ...week,
                hours:
                  newHours,
              }
            : week
      )

    setWeeklyProgress(
      updated
    )

    await saveWeek(
      currentWeek,
      {
        goal: target.goal,
        actualHours:
          newHours,
        completed:
          target.completed,
      }
    )
  }

  /* MARK COMPLETE */
  const markComplete =
    async () => {
      const updated =
        weeklyProgress.map(
          (week) => ({
            ...week,
            completed: true,
            hours: 10,
          })
        )

      setWeeklyProgress(
        updated
      )

      for (const week of updated) {
        await saveWeek(
          week.week,
          {
            goal:
              week.goal,
            actualHours: 10,
            completed: true,
          }
        )
      }
    }

  /* ADD NEW WEEK FIXED */
  const addNewWeek =
    async () => {
      if (!newGoal.trim())
        return

      const nextWeek =
  Math.max(
    ...weeklyProgress.map(
      (w) => w.week
    ),
    0
  ) + 1

      const newWeekData = {
        week: nextWeek,
        goal: newGoal,
        completed: false,
        hours: 0,
      }

      /* SHOW IN UI FIRST */
      setWeeklyProgress(
        (prev) => [
          ...prev,
          newWeekData,
        ]
      )

      setNewGoal('')
      setShowAddGoal(false)

      /* SAVE IN DB */
      await saveWeek(
        nextWeek,
        {
          goal:
            newWeekData.goal,
          actualHours: 0,
          completed: false,
        }
      )
    }

  const completedWeeks =
    weeklyProgress.filter(
      (w) => w.completed
    ).length

  const totalHours =
    weeklyProgress.reduce(
      (sum, item) =>
        sum + item.hours,
      0
    )

  const overall =
    weeklyProgress.length > 0
      ? Math.round(
          (completedWeeks /
            weeklyProgress.length) *
            100
        )
      : 0

  return (
    <div className="space-y-6">
      {/* SUMMARY */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex gap-2 items-center">
            <Target className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">
                Progress
              </p>
              <p className="text-2xl font-bold">
                {overall}%
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex gap-2 items-center">
            <Calendar className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">
                Weeks Done
              </p>
              <p className="text-2xl font-bold">
                {
                  completedWeeks
                }
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex gap-2 items-center">
            <Clock className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">
                Hours
              </p>
              <p className="text-2xl font-bold">
                {totalHours}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex gap-2 items-center">
            <Award className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-sm text-gray-600">
                Milestones
              </p>
              <p className="text-2xl font-bold">
                1/3
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs
        defaultValue="weekly"
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="weekly">
            Weekly
          </TabsTrigger>

          <TabsTrigger value="milestones">
            Milestones
          </TabsTrigger>

          <TabsTrigger value="analytics">
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* WEEKLY */}
        <TabsContent value="weekly">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between">
                  <div>
                    <CardTitle>
                      Week{' '}
                      {
                        currentWeek
                      }
                    </CardTitle>

                    <CardDescription>
                      Current Focus
                    </CardDescription>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <h3 className="font-medium">
                  {
                    weeklyProgress[
                      currentWeek -
                        1
                    ]?.goal
                  }
                </h3>

                <Progress
                  value={
                    ((weeklyProgress[
                      currentWeek -
                        1
                    ]?.hours ||
                      0) /
                      10) *
                    100
                  }
                />

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      if (
                        weeklyProgress.length > 0
                      ) {
                        addHours()
                      }
                    }}
                  >
                    Log 2 Hours
                  </Button>

                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={
                      markComplete
                    }
                  >
                    Mark Complete
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* ALL WEEKS */}
            <Card>
              <CardHeader>
                <CardTitle>
                  All Weeks
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                {weeklyProgress.map(
                  (week) => (
                    <div
                      key={
                        week.week
                      }
                      className="border rounded-lg p-4 flex justify-between"
                    >
                      <div className="flex gap-3 items-center">
                        {week.completed ? (
                          <CheckCircle className="w-6 h-6 text-green-500" />
                        ) : (
                          <Circle className="w-6 h-6 text-gray-400" />
                        )}

                        <div>
                          <h4 className="font-medium">
                            Week{' '}
                            {
                              week.week
                            }
                            :{' '}
                            {
                              week.goal
                            }
                          </h4>

                          <p className="text-sm text-gray-600">
                            {
                              week.hours
                            }{' '}
                            hrs
                          </p>
                        </div>
                      </div>

                      <Badge>
                        {week.completed
                          ? 'Done'
                          : 'Pending'}
                      </Badge>
                    </div>
                  )
                )}

                {/* ADD WEEK */}
                <div className="pt-4 space-y-3">
                  {!showAddGoal ? (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() =>
                        setShowAddGoal(
                          true
                        )
                      }
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Next Week Goal
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        value={
                          newGoal
                        }
                        onChange={(
                          e
                        ) =>
                          setNewGoal(
                            e
                              .target
                              .value
                          )
                        }
                        placeholder="Enter new goal"
                        className="border rounded px-3 py-2 flex-1"
                      />

                      <Button
                        onClick={
                          addNewWeek
                        }
                      >
                        Save
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* MILESTONES */}
        <TabsContent value="milestones">
          <Card>
            <CardContent className="p-6">
              Milestone tracking active.
            </CardContent>
          </Card>
        </TabsContent>

        {/* ANALYTICS */}
        <TabsContent value="analytics">
          <Card>
            <CardContent className="p-6 space-y-3">
              <p>
                Total Hours:{' '}
                {
                  totalHours
                }
              </p>

              <p>
                Completed
                Weeks:{' '}
                {
                  completedWeeks
                }
              </p>

              <Progress
                value={
                  overall
                }
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}