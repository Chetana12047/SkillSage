'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import {
  useRouter,
  useSearchParams,
} from 'next/navigation'

import { Progress } from '@/components/ui/progress'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'

import ResumeUpload from '@/components/ResumeUpload'
import GoalSetting from '@/components/GoalSetting'
import RoadmapDisplay from '@/components/RoadmapDisplay'
import ProgressTracker from '@/components/ProgressTracker'
import AICompanion from '@/components/AICompanion'
import { ModeToggle } from "@/components/toggle-mode"

const emptyUserData = {
  resume: null,
  resumeUrl: '',
  manualSkills: '',
  skills: [],
  field: '',
  goal: '',
  goalLocked: false,
  selectedCourse: '',
  selectedDuration: '',
  weeklyHours: '',
  roadmap: null,
  progress: [],
  activeTab: 'upload',
  duration: '',
  currentSkills: [],
  roadmapId: null,
  userId: null,
  experience: 'College Student',
  education: '',
  atsData: null,
}

export default function Home() {
  const { data: session, status } =
    useSession()

  const router = useRouter()
  const searchParams =
    useSearchParams()

  const currentTab =
    searchParams.get('tab') ||
    'upload'

  const [activeTab, setActiveTab] =
    useState(currentTab)

  const [showAI, setShowAI] =
    useState(false)

  const [userData, setUserData] =
    useState<any>(emptyUserData)
    console.log(
  'TRACKER ROADMAP ID:',
  userData.roadmapId
)

  /* URL TAB CHANGE SYNC */
  useEffect(() => {
    const tab =
      searchParams.get('tab') ||
      'upload'

    setActiveTab(tab)
  }, [searchParams])

  /* LOAD USER DATA */
  useEffect(() => {
    const loadUser = async () => {
      if (
        status ===
        'unauthenticated'
      ) {
        setUserData(
          emptyUserData
        )
        return
      }

      if (
        !session?.user?.email
      )
        return

      try {
        const res =
          await fetch(
            '/api/user/me'
          )

        const data =
          await res.json()

        if (res.ok) {
          const skillsArray =
            typeof data.skills ===
            'string'
              ? data.skills
                  .split(',')
                  .map(
                    (
                      item: string
                    ) =>
                      item.trim()
                  )
                  .filter(
                    Boolean
                  )
              : []

          setUserData({
            ...emptyUserData,

            userId:
              data.id ||
              session?.user?.id ||
              null,

            resumeUrl:
              data.resumeUrl ||
              '',

            manualSkills:
              data.manualSkills ||
              '',

            skills:
              skillsArray,

            currentSkills:
              skillsArray,

            goal:
              data.goal ||
              '',

            goalLocked:
              Boolean(data.goal),

            selectedCourse:
              data.selectedCourse ||
              '',

            selectedDuration:
              data.selectedDuration ||
              '',

            weeklyHours:
              data.weeklyHours ||
              '',

            roadmap:
              data.roadmapData ||
              null,

            progress:
              data.progressData ||
              [],
              
              atsData:
              data.atsData || null,

            activeTab:
              data.activeTab ||
              'upload',

            experience:
              data.experience ||
              'College Student',

            education:
              data.education ||
              '',
              atsData:
             data.atsData || null,

            roadmapId:
            data.roadmapId ||
            data.roadmaps?.[0]?.id ||
            null,
          })
        }
      } catch (error) {
        console.log(error)
      }
    }

    loadUser()
  }, [session, status])

  /* MAIN TAB NAVIGATION */
  const moveTab =
    async (
      tab: string
    ) => {
      setActiveTab(tab)

      router.push(
        `/dashboard?tab=${tab}`
      )

      await fetch(
        '/api/user/save-tab',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            activeTab:
              tab,
          }),
        }
      )
    }

  /* RESUME */
  const handleResumeUpload =
  async (data: any) => {

    setUserData(
      (prev: any) => ({
        ...prev,
        ...data,
      })
    )

    /* SAVE TO DB */

    await fetch(
      '/api/user/update',
      {
        method: 'POST',

        headers: {
          'Content-Type':
            'application/json',
        },

        body: JSON.stringify({
          manualSkills:
            data.manualSkills,

          experience:
            data.experience,

          atsData:
            data.atsData,

          skills:
            data.skills,
        }),
      }
    )

    moveTab('goal')
  }
  /* GOAL + ROADMAP */
  const handleGoalSet =
    async (
      goalData: any
    ) => {
      const res = await fetch(
  '/api/user/save-roadmap',
  {
    method: 'POST',
    headers: {
      'Content-Type':
        'application/json',
    },
    body: JSON.stringify({
      roadmap:
        goalData.roadmap,
      selectedDuration:
        goalData.duration,
      weeklyHours:
        goalData.weeklyHours,
    }),
  }
)

const savedData =
  await res.json()
  console.log(
  'SAVE ROADMAP RESPONSE:',
  savedData
)

      setUserData(
  (prev: any) => ({
    ...prev,
    ...goalData,

    roadmap:
      goalData.roadmap,

    roadmapId:
      savedData.roadmap?.id ||
      prev.roadmapId,
  })
)

      moveTab('roadmap')
    }

  /* CHANGE GOAL — unlock it and send the user back to step 1 */
  const handleChangeGoal =
    () => {
      setUserData(
        (prev: any) => ({
          ...prev,
          goalLocked: false,
        })
      )

      moveTab('upload')
    }

  /* RESET */
  const handleResumeReset =
    async () => {
      await fetch(
        '/api/resume/delete',
        {
          method: 'POST',
        }
      )

      setUserData(
        (prev: any) => ({
          ...prev,
          resume: null,
          resumeUrl:
            '',
        })
      )
    }

  /* LOGOUT */
  const handleLogout =
    async () => {
      setUserData(
        emptyUserData
      )

      await signOut({
        callbackUrl: '/',
      })
    }

  return (
    <div className="min-h-screen bg-background text-foreground">
      
      {/* NAVBAR */}
      <nav className="w-full bg-background border-b border-border px-8 py-3 flex items-center justify-between shadow-sm">
        
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="SkillSage"
            width={42}
            height={42}
            className="rounded-xl"
          />

          <h1 className="text-3xl font-bold text-foreground">
            SkillSage
          </h1>
        </div>

        <div className="flex items-center gap-3">

          <ModeToggle />

          {!session ? (
            <>
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl border border-border bg-background text-foreground hover:bg-muted transition"
              >
                Login
              </Link>

              <Link
                href="/signup"
                className="px-5 py-2 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/my-courses"
                className="px-4 py-2 rounded-xl border border-border bg-background text-foreground hover:bg-muted transition"
              >
                My Courses
              </Link>

              <Link
                href="/counselor"
                className="px-4 py-2 rounded-xl border border-border bg-background text-foreground hover:bg-muted transition"
              >
                Career Counselor
              </Link>

              <Link
                href="/profile"
                className="px-4 py-2 rounded-xl bg-muted text-foreground font-medium hover:bg-accent transition"
              >
                {session.user?.name || 'Profile'}
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-8 py-8">
        
        <div className="mb-8">
          <Progress
            value={
              activeTab ===
              'upload'
                ? 25
                : activeTab ===
                  'goal'
                ? 50
                : activeTab ===
                  'roadmap'
                ? 75
                : 100
            }
          />
        </div>

        <Tabs
          value={activeTab}
          onValueChange={
            moveTab
          }
        >
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="upload">
              Upload Resume
            </TabsTrigger>

            <TabsTrigger value="goal">
              Set Goal
            </TabsTrigger>

            <TabsTrigger value="roadmap">
              Your Roadmap
            </TabsTrigger>

            <TabsTrigger value="progress">
              Progress
            </TabsTrigger>
          </TabsList>

          {/* UPLOAD */}
          <TabsContent value="upload">
            <ResumeUpload
              onUpload={
                handleResumeUpload
              }
              savedData={
                userData
              }
              onReset={
                handleResumeReset
              }
            />
          </TabsContent>

          {/* GOAL */}
          <TabsContent value="goal">
            <GoalSetting
              onGoalSet={
                handleGoalSet
              }
              currentSkills={
                userData.currentSkills
              }
              userId={
                userData.userId
              }
              goal={
                userData.goal
              }
              onChangeGoal={
                handleChangeGoal
              }
              savedDuration={
                userData.selectedDuration
              }
              savedWeeklyHours={
                userData.weeklyHours
              }
            />
          </TabsContent>

          {/* ROADMAP */}
          <TabsContent value="roadmap">
            {userData.roadmap ? (
              <RoadmapDisplay
                roadmap={
                  userData.roadmap
                }
                onStartLearning={() =>
                  moveTab(
                    'progress'
                  )
                }
              />
            ) : (
              <p className="text-center text-muted-foreground py-10">
                No roadmap generated yet.
              </p>
            )}
          </TabsContent>
          

          {/* PROGRESS */}
          <TabsContent value="progress">
            {userData.roadmap ? (
              
              <ProgressTracker
                roadmap={
                  userData.roadmap
                }
                roadmapId={
                  userData.roadmapId
                }
              />
            ) : (
              <p className="text-center text-muted-foreground py-10">
                Generate roadmap first.
              </p>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* AI */}
      {showAI && (
        <div className="fixed bottom-4 right-4 z-50">
          <AICompanion />
        </div>
      )}
    </div>
  )
}