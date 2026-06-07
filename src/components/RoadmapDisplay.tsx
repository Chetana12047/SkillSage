'use client'

import RoadmapJourney from "./Journey";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { Badge } from '@/components/ui/badge'

import {
  CheckCircle2,
  Clock,
  Briefcase,
  IndianRupee,
  Trophy,
  BookOpen,
  Code2,
} from 'lucide-react'


interface Props {
  roadmap: any
  onStartLearning?: () => void
}

export default function RoadmapDisplay({
  roadmap,
  onStartLearning,
}: Props) {

  if (!roadmap) {
    return null
  }

  return (

    <div className="space-y-8 animate-in fade-in duration-700">

      {/* HEADER */}

      <Card className="border-2 border-blue-100 shadow-lg">

        <CardContent className="p-8">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

            <div>

              <h1 className="text-4xl font-bold text-gray-900">
                {roadmap.title}
              </h1>

              <p className="text-gray-600 mt-3 text-lg">
                Personalized AI-generated career roadmap
              </p>

            </div>

            <div className="flex flex-wrap gap-3">

              <Badge className="bg-blue-600 text-white text-sm px-4 py-2">
                <Clock className="w-4 h-4 mr-2" />
                {roadmap.timeline}
              </Badge>

              <Badge className="bg-green-600 text-white text-sm px-4 py-2">
                <IndianRupee className="w-4 h-4 mr-2" />
                {roadmap.salary}
              </Badge>

            </div>

          </div>

        </CardContent>

      </Card>

      <RoadmapJourney
        roadmap={roadmap}
      />
  
      {/* JOB ROLES */}

      <Card>

        <CardHeader>

          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-600" />
            Target Job Roles
          </CardTitle>

        </CardHeader>

        <CardContent>

          <div className="flex flex-wrap gap-3">

            {roadmap.roles?.map(
              (
                role: string,
                index: number
              ) => (

                <Badge
                  key={index}
                  className="px-4 py-2 text-sm bg-gray-900 text-white"
                >
                  {role}
                </Badge>
              )
            )}

          </div>

        </CardContent>

      </Card>

      {/* ROADMAP STEPS */}

      <div className="space-y-8">

        {roadmap.milestones?.map(
          (
            milestone: any,
            index: number
          ) => (

            <Card
              key={index}
              className="overflow-hidden border-l-[8px] border-blue-600 shadow-md"
            >

              <CardHeader className="bg-blue-50">

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                  <div>

                    <CardTitle className="text-2xl">
                      {milestone.level}
                    </CardTitle>

                    <p className="text-gray-600 mt-1">
                      {milestone.duration}
                    </p>

                  </div>

                  <Badge className="bg-blue-600 text-white px-4 py-2">
                    Phase {index + 1}
                  </Badge>

                </div>

              </CardHeader>

              <CardContent className="p-6 space-y-8">

                {/* SKILLS */}

                <div>

                  <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
                    <Code2 className="w-5 h-5 text-blue-600" />
                    Required Skills
                  </h3>

                  <div className="flex flex-wrap gap-3">

                    {milestone.skills?.map(
                      (
                        skill: string,
                        i: number
                      ) => (

                        <Badge
                          key={i}
                          className="bg-gray-100 text-black border px-3 py-1"
                        >
                          {skill}
                        </Badge>
                      )
                    )}

                  </div>

                </div>

                {/* TOOLS */}

                <div>

                  <h3 className="font-bold text-lg mb-4">
                    Tools & Technologies
                  </h3>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">

                    {milestone.tools?.map(
                      (
                        tool: string,
                        i: number
                      ) => (

                        <div
                          key={i}
                          className="border rounded-xl p-4 bg-gray-50"
                        >
                          {tool}
                        </div>
                      )
                    )}

                  </div>

                </div>

                {/* PROJECTS */}

                <div>

                  <h3 className="font-bold text-lg mb-4">
                    Real-World Projects
                  </h3>

                  <div className="space-y-3">

                    {milestone.projects?.map(
                      (
                        project: string,
                        i: number
                      ) => (

                        <div
                          key={i}
                          className="flex items-start gap-3 border rounded-xl p-4"
                        >

                          <CheckCircle2 className="w-5 h-5 text-green-600 mt-1" />

                          <div>
                            <p className="font-medium">
                              {project}
                            </p>
                          </div>

                        </div>
                      )
                    )}

                  </div>

                </div>

                {/* CERTIFICATIONS */}

                <div>

                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-600" />
                    Recommended Certifications
                  </h3>

                  <div className="flex flex-wrap gap-3">

                    {milestone.certifications?.map(
                      (
                        cert: string,
                        i: number
                      ) => (

                        <Badge
                          key={i}
                          className="bg-yellow-100 text-black border"
                        >
                          {cert}
                        </Badge>
                      )
                    )}

                  </div>

                </div>

                {/* INTERVIEW */}

                <div>

                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                    Interview Preparation
                  </h3>

                  <div className="space-y-3">

                    {milestone.interview?.map(
                      (
                        item: string,
                        i: number
                      ) => (

                        <div
                          key={i}
                          className="bg-purple-50 border rounded-xl p-4"
                        >
                          {item}
                        </div>
                      )
                    )}

                  </div>

                </div>

              </CardContent>

            </Card>
          )
        )}

      </div>

      {onStartLearning && (
        <div className="flex justify-center pt-6">
          <button
            onClick={onStartLearning}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold transition"
          >
            Start Learning Journey
          </button>
        </div>
      )}
    </div>
  )
}