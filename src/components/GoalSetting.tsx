'use client'

import { useMemo, useState } from 'react'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

import {
  Target,
  Clock,
  Code,
  Cpu,
  Shield,
  Database,
  Cloud,
  Brain,
  CheckCircle2,
} from 'lucide-react'

import { courses } from '@/lib/courses'

interface GoalSettingProps {
  onGoalSet: (data: any) => void
  currentSkills: string[]
  savedGoal?: string
  savedDuration?: string
}

const durationOptions = [
  {
    label: '3 Months',
    value: '3 months',
  },
  {
    label: '6 Months',
    value: '6 months',
  },
  {
    label: '1 Year',
    value: '1 year',
  },
]

export default function GoalSetting({
  onGoalSet,
  currentSkills,
  savedGoal,
  savedDuration,
}: GoalSettingProps) {

  const [step, setStep] = useState(1)

  const [selectedGoal, setSelectedGoal] =
    useState(savedGoal || '')

  const [customGoal, setCustomGoal] =
    useState('')

  const [selectedDuration, setSelectedDuration] =
    useState(savedDuration || '')

  const [loading, setLoading] =
    useState(false)

  const recommendedCourses =
    useMemo(() => {

      const filtered =
        courses.filter((course: any) =>
          currentSkills?.includes(
            course.skill
          )
        )

      return filtered.length
        ? filtered
        : courses.slice(0, 9)

    }, [currentSkills])

  const getIcon = (title: string) => {

    const lower =
      title.toLowerCase()

    if (
      lower.includes('ai') ||
      lower.includes('ml')
    ) {
      return (
        <Brain className="w-7 h-7 text-violet-600" />
      )
    }

    if (
      lower.includes('data')
    ) {
      return (
        <Database className="w-7 h-7 text-blue-600" />
      )
    }

    if (
      lower.includes('cloud')
    ) {
      return (
        <Cloud className="w-7 h-7 text-cyan-600" />
      )
    }

    if (
      lower.includes('cyber') ||
      lower.includes('hack')
    ) {
      return (
        <Shield className="w-7 h-7 text-red-600" />
      )
    }

    if (
      lower.includes('developer') ||
      lower.includes('full stack') ||
      lower.includes('software')
    ) {
      return (
        <Code className="w-7 h-7 text-green-600" />
      )
    }

    return (
      <Cpu className="w-7 h-7 text-orange-600" />
    )
  }

  const handleGoalSelect = (
    goal: string
  ) => {

    if (!goal.trim()) return

    setSelectedGoal(goal)
    setStep(2)
  }

  const generateRoadmap = (
    goal: string
  ) => {

    const lower =
      goal.toLowerCase()

    if (
      lower.includes('java') ||
      lower.includes('full stack')
    ) {

      return {

        title:
          'Java Full Stack Developer',

        timeline:
          selectedDuration,

        salary:
          '₹6L - ₹18L',

        roles: [
          'Java Developer',
          'Backend Developer',
          'Full Stack Engineer',
        ],

        milestones: [

          {
            level: 'Beginner',

            duration:
              'Month 1-2',

            skills: [
              'Java Basics',
              'OOP',
              'HTML',
              'CSS',
              'JavaScript',
              'Git',
            ],

            tools: [
              'VS Code',
              'GitHub',
              'IntelliJ',
            ],

            projects: [
              'Portfolio Website',
              'Student Management System',
            ],

            certifications: [
              'Java Basics Certificate',
            ],

            interview: [
              'Java OOP Questions',
              'Basic DSA',
            ],
          },

          {
            level:
              'Intermediate',

            duration:
              'Month 3-5',

            skills: [
              'Spring Boot',
              'REST APIs',
              'React',
              'MySQL',
              'JWT Auth',
            ],

            tools: [
              'Postman',
              'MySQL Workbench',
              'Render',
            ],

            projects: [
              'Full Stack Auth System',
              'E-commerce App',
            ],

            certifications: [
              'Spring Boot',
            ],

            interview: [
              'API Questions',
              'DBMS',
              'OS',
            ],
          },

          {
            level: 'Advanced',

            duration:
              'Month 6+',

            skills: [
              'Microservices',
              'Docker',
              'AWS',
              'System Design',
            ],

            tools: [
              'Docker',
              'AWS',
              'CI/CD',
            ],

            projects: [
              'Industry-Level SaaS App',
              'Scalable Backend',
            ],

            certifications: [
              'AWS Cloud',
            ],

            interview: [
              'System Design',
              'LLD',
              'Advanced DSA',
            ],
          },
        ],
      }
    }

    if (
      lower.includes('ai')
    ) {

      return {

        title: 'AI Engineer',

        timeline:
          selectedDuration,

        salary:
          '₹10L - ₹30L',

        roles: [
          'AI Engineer',
          'ML Engineer',
          'LLM Engineer',
        ],

        milestones: [

          {
            level: 'Beginner',

            duration:
              'Month 1-2',

            skills: [
              'Python',
              'NumPy',
              'Pandas',
              'Math',
            ],

            tools: [
              'Jupyter',
              'VS Code',
            ],

            projects: [
              'Data Analysis',
              'Python Automation',
            ],

            certifications: [
              'Python',
            ],

            interview: [
              'Python Basics',
            ],
          },

          {
            level:
              'Intermediate',

            duration:
              'Month 3-5',

            skills: [
              'Machine Learning',
              'Scikit Learn',
              'Visualization',
            ],

            tools: [
              'Google Colab',
              'Kaggle',
            ],

            projects: [
              'ML Prediction App',
              'Recommendation System',
            ],

            certifications: [
              'Machine Learning',
            ],

            interview: [
              'ML Algorithms',
            ],
          },

          {
            level: 'Advanced',

            duration:
              'Month 6+',

            skills: [
              'Deep Learning',
              'LLMs',
              'Transformers',
              'Deployment',
            ],

            tools: [
              'PyTorch',
              'TensorFlow',
              'HuggingFace',
            ],

            projects: [
              'AI Chatbot',
              'Custom LLM App',
            ],

            certifications: [
              'Deep Learning',
            ],

            interview: [
              'AI System Design',
            ],
          },
        ],
      }
    }

    return {

      title: goal,

      timeline:
        selectedDuration,

      salary:
        '₹5L - ₹15L',

      roles: [
        goal,
      ],

      milestones: [

        {
          level: 'Beginner',

          duration:
            'Month 1-2',

          skills: [
            'Core Fundamentals',
            'Basic Projects',
          ],

          tools: [
            'VS Code',
            'GitHub',
          ],

          projects: [
            'Starter Project',
          ],

          certifications: [
            'Foundation Certification',
          ],

          interview: [
            'Basics',
          ],
        },

        {
          level:
            'Intermediate',

          duration:
            'Month 3-5',

          skills: [
            'Advanced Skills',
            'Real Projects',
          ],

          tools: [
            'Industry Tools',
          ],

          projects: [
            'Intermediate Projects',
          ],

          certifications: [
            'Intermediate Certificate',
          ],

          interview: [
            'Problem Solving',
          ],
        },

        {
          level: 'Advanced',

          duration:
            'Month 6+',

          skills: [
            'Industry Expertise',
          ],

          tools: [
            'Cloud',
            'Deployment',
          ],

          projects: [
            'Production App',
          ],

          certifications: [
            'Professional Certificate',
          ],

          interview: [
            'Mock Interviews',
          ],
        },
      ],
    }
  }

  const handleGenerate =
    async () => {

      if (
        !selectedGoal ||
        !selectedDuration
      ) {
        return
      }

      setLoading(true)

      const roadmap =
        generateRoadmap(
          selectedGoal
        )

      setTimeout(() => {

        onGoalSet({
          goal:
            selectedGoal,
          duration:
            selectedDuration,
          roadmap,
        })

        setLoading(false)

      }, 1200)
    }

  return (

    <div className="space-y-6">

      {/* STEP INDICATOR */}

      <div className="flex items-center justify-center gap-4">

        {[1, 2, 3].map(
          (item) => (

            <div
              key={item}
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step >= item
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {item}
            </div>
          )
        )}

      </div>

      {/* STEP 1 */}

      {step === 1 && (

        <Card>

          <CardHeader>

            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Choose Your Career Goal
            </CardTitle>

            <CardDescription>
              Select predefined role or define your own
            </CardDescription>

          </CardHeader>

          <CardContent>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">

              {recommendedCourses.map(
                (course: any) => (

                  <Card
                    key={course.id}

                    onClick={() =>
                      handleGoalSelect(
                        course.title
                      )
                    }

                    className="cursor-pointer hover:scale-[1.02] transition-all duration-300 hover:shadow-xl border-2 hover:border-blue-500"
                  >

                    <CardContent className="p-5">

                      <div className="flex justify-between items-center mb-4">

                        {getIcon(
                          course.title
                        )}

                        <Badge className="bg-green-600 text-white">
                          {course.demand}
                        </Badge>

                      </div>

                      <h3 className="font-bold text-lg">
                        {course.title}
                      </h3>

                      <p className="text-gray-600 text-sm mt-2">
                        {course.description}
                      </p>

                    </CardContent>

                  </Card>
                )
              )}

            </div>

            {/* CUSTOM GOAL */}

            <div className="mt-8 border-t pt-6">

              <p className="font-medium mb-3">
                Define your own goal
              </p>

              <div className="flex gap-3">

                <Input
                  value={customGoal}

                  placeholder="Java Full Stack Developer"

                  onChange={(e) =>
                    setCustomGoal(
                      e.target.value
                    )
                  }
                />

                <Button
                  type="button"

                  disabled={
                    !customGoal.trim()
                  }

                  onClick={() =>
                    handleGoalSelect(
                      customGoal
                    )
                  }
                >
                  Use Goal
                </Button>

              </div>

            </div>

          </CardContent>

        </Card>
      )}

      {/* STEP 2 */}

      {step === 2 && (

        <Card>

          <CardHeader>

            <CardTitle>
              Select Learning Timeline
            </CardTitle>

          </CardHeader>

          <CardContent>

            <div className="grid md:grid-cols-3 gap-5">

              {durationOptions.map(
                (item) => (

                  <Card
                    key={item.value}

                    onClick={() => {
                      setSelectedDuration(
                        item.value
                      )

                      setStep(3)
                    }}

                    className="cursor-pointer hover:shadow-xl transition border-2 hover:border-green-500"
                  >

                    <CardContent className="p-6 text-center">

                      <Clock className="w-8 h-8 mx-auto text-blue-600 mb-3" />

                      <h3 className="font-bold text-lg">
                        {item.label}
                      </h3>

                    </CardContent>

                  </Card>
                )
              )}

            </div>

          </CardContent>

        </Card>
      )}

      {/* STEP 3 */}

      {step === 3 && (

        <Card>

          <CardHeader>

            <CardTitle>
              Generate Career Roadmap
            </CardTitle>

          </CardHeader>

          <CardContent className="space-y-6">

            <div className="bg-gray-100 rounded-xl p-5">

              <p>
                <b>Goal:</b>{' '}
                {selectedGoal}
              </p>

              <p>
                <b>Timeline:</b>{' '}
                {selectedDuration}
              </p>

            </div>

            <Button
              onClick={
                handleGenerate
              }

              disabled={loading}

              className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700"
            >

              {loading
                ? 'Generating Roadmap...'
                : 'Generate My Roadmap'}

            </Button>

          </CardContent>

        </Card>
      )}

    </div>
  )
}