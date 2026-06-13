'use client'

import RoadmapJourney from "./Journey";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle2, Clock, Briefcase, IndianRupee,
  Trophy, BookOpen, Code2, User, AlertCircle, TrendingUp,
} from 'lucide-react'

interface Props {
  roadmap: any
  onStartLearning?: () => void
}

export default function RoadmapDisplay({ roadmap, onStartLearning }: Props) {
  if (!roadmap) return null

  const readiness = roadmap.readinessPercent ?? 0
  const readinessColor = readiness >= 70 ? '#22c55e' : readiness >= 40 ? '#eab308' : '#ef4444'
  const readinessBg = readiness >= 70 ? 'bg-green-500' : readiness >= 40 ? 'bg-yellow-500' : 'bg-red-500'

  return (
    <div className="space-y-8 animate-in fade-in duration-700">

      {/* ── HEADER ────────────────────────────────────────────── */}
      <Card className="border-2 border-blue-100 shadow-lg">
        <CardContent className="p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">{roadmap.title}</h1>
              <p className="text-gray-600 mt-3 text-lg">Personalized AI-generated career roadmap</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Badge className="bg-blue-600 text-white text-sm px-4 py-2">
                <Clock className="w-4 h-4 mr-2" />{roadmap.timeline}
              </Badge>
              <Badge className="bg-green-600 text-white text-sm px-4 py-2">
                <IndianRupee className="w-4 h-4 mr-2" />{roadmap.salary}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── PERSONAL NOTE — Key differentiator ───────────────── */}
      {roadmap.personalNote && (
        <Card className="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-blue-900 dark:text-blue-100 text-lg mb-2">
                  Your Personalized Assessment
                </h3>
                <p className="text-blue-800 dark:text-blue-200 text-base leading-relaxed">
                  {roadmap.personalNote}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── READINESS + CURRENT SKILLS ────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Readiness Score */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-lg">Your Readiness Score</h3>
            </div>
            <div className="flex items-center gap-5">
              {/* Circular progress */}
              <div className="relative w-24 h-24 flex-shrink-0">
                <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none" stroke="#e5e7eb" strokeWidth="3.5"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={readinessColor}
                    strokeWidth="3.5"
                    strokeDasharray={`${readiness}, 100`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold">{readiness}%</span>
                </div>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-base mb-1">
                  {readiness >= 70 ? "Well prepared!" : readiness >= 40 ? "Good foundation" : "Starting fresh"}
                </p>
                <p className="text-gray-500 text-sm">
                  {readiness >= 70
                    ? "You already have most skills. Focus on the gaps."
                    : readiness >= 40
                    ? "You have key fundamentals. Time to build on them."
                    : "Great time to build strong foundations from scratch."}
                </p>
                <div className="mt-3 h-2 rounded-full bg-gray-200 w-full">
                  <div
                    className={`h-2 rounded-full ${readinessBg} transition-all duration-700`}
                    style={{ width: `${readiness}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Skills from Resume */}
        {roadmap.currentSkills?.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <h3 className="font-bold text-lg">Skills You Already Have</h3>
                <Badge className="bg-green-100 text-green-800 text-xs">{roadmap.currentSkills.length}</Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {roadmap.currentSkills.map((skill: string, i: number) => (
                  <Badge key={i} className="bg-green-50 text-green-800 border border-green-200 px-3 py-1">
                    ✓ {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ── SKILL GAPS ────────────────────────────────────────── */}
      {roadmap.missingSkills?.length > 0 && (
        <Card className="border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              <h3 className="font-bold text-lg">Skills to Build for Your Goal</h3>
              <Badge className="bg-orange-100 text-orange-700 text-xs">
                {roadmap.missingSkills.length} gaps identified
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {roadmap.missingSkills.map((skill: string, i: number) => (
                <Badge key={i} className="bg-orange-50 text-orange-800 border border-orange-200 px-3 py-1">
                  + {skill}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-3">
              Your roadmap below covers each of these gaps phase by phase.
            </p>
          </CardContent>
        </Card>
      )}

      {/* ── CAREER JOURNEY (existing component) ──────────────── */}
      <RoadmapJourney roadmap={roadmap} />

      {/* ── TARGET JOB ROLES ─────────────────────────────────── */}
      {roadmap.roles?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-600" />
              Target Job Roles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {roadmap.roles.map((role: string, i: number) => (
                <Badge key={i} className="px-4 py-2 text-sm bg-gray-900 text-white">{role}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── DETAILED MILESTONE CARDS ──────────────────────────── */}
      <div className="space-y-8">
        {roadmap.milestones?.map((milestone: any, index: number) => (
          <Card key={index} className="overflow-hidden border-l-[6px] border-blue-600 shadow-md">

            <CardHeader className="bg-blue-50 dark:bg-blue-950">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-2xl">{milestone.level}</CardTitle>
                  <p className="text-gray-500 mt-1 text-sm">{milestone.duration}</p>
                  {/* Why this phase matters for THIS student */}
                  {milestone.why && (
                    <p className="text-blue-700 dark:text-blue-300 mt-3 text-sm italic bg-blue-100 dark:bg-blue-900 px-3 py-2 rounded-lg">
                      💡 {milestone.why}
                    </p>
                  )}
                </div>
                <Badge className="bg-blue-600 text-white px-4 py-2 self-start flex-shrink-0">
                  Phase {index + 1}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-8">

              {/* Skills */}
              {milestone.skills?.length > 0 && (
                <div>
                  <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
                    <Code2 className="w-5 h-5 text-blue-600" />
                    Skills to Learn
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {milestone.skills.map((skill: string, i: number) => (
                      <Badge key={i} className="bg-gray-100 text-black border px-3 py-1">{skill}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Tools */}
              {milestone.tools?.length > 0 && (
                <div>
                  <h3 className="font-bold text-lg mb-4">Tools & Technologies</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {milestone.tools.map((tool: string, i: number) => (
                      <div key={i} className="border rounded-xl p-4 bg-gray-50 dark:bg-gray-900 font-medium text-sm">{tool}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {milestone.projects?.length > 0 && (
                <div>
                  <h3 className="font-bold text-lg mb-4">Real-World Projects</h3>
                  <div className="space-y-3">
                    {milestone.projects.map((project: string, i: number) => (
                      <div key={i} className="flex items-start gap-3 border rounded-xl p-4 bg-white dark:bg-gray-900">
                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <p className="font-medium text-sm">{project}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {milestone.certifications?.length > 0 && (
                <div>
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-600" />
                    Recommended Certifications
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {milestone.certifications.map((cert: string, i: number) => (
                      <Badge key={i} className="bg-yellow-50 text-yellow-900 border border-yellow-200 px-3 py-1">{cert}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Interview Prep */}
              {milestone.interview?.length > 0 && (
                <div>
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                    Interview Preparation Topics
                  </h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {milestone.interview.map((item: string, i: number) => (
                      <div key={i} className="bg-purple-50 dark:bg-purple-950 border border-purple-100 rounded-xl p-4 text-sm">{item}</div>
                    ))}
                  </div>
                </div>
              )}

            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── START LEARNING CTA ────────────────────────────────── */}
      {onStartLearning && (
        <div className="flex justify-center pt-4 pb-8">
          <button
            onClick={onStartLearning}
            className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 rounded-xl font-semibold text-lg transition shadow-lg"
          >
            Start Learning Journey →
          </button>
        </div>
      )}
    </div>
  )
}