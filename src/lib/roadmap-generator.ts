import { careerDatabase } from "./career-data"
import { analyzeSkillGap } from "./skill-gap"

export function generateRoadmap(
  goal: string,
  timeline: string,
  currentSkills: string[] = []
) {
  const lowerGoal = goal.toLowerCase()

  let careerPath: any = null

  for (const key in careerDatabase) {
    if (lowerGoal.includes(key)) {
      careerPath = careerDatabase[key]
      break
    }
  }

  if (!careerPath) {
    return null
  }

  const gapAnalysis =
    analyzeSkillGap(
      currentSkills,
      goal
    )

  const missingSkills =
    gapAnalysis.missingSkills

  const matchedSkills =
    gapAnalysis.matchedSkills

  const milestones =
    createAdaptiveRoadmap(
      missingSkills,
      timeline
    )

  return {
    title: careerPath.title,

    timeline,

    salary:
      careerPath.salary,

    roles:
      careerPath.roles,

    currentSkills:
      matchedSkills,

    missingSkills,

    readiness:
      Math.round(
        (matchedSkills.length /
          careerPath.skills.length) *
          100
      ),

    milestones
  }
}
function createAdaptiveRoadmap(
  missingSkills: string[],
  timeline: string
) {
  const months =
    timeline === "1 year"
      ? 12
      : timeline === "6 months"
      ? 6
      : 3

  const roadmap: any[] = []

  const skillsPerPhase =
    Math.max(
      1,
      Math.ceil(
        missingSkills.length /
          months
      )
    )

  let phase = 1

  for (
    let i = 0;
    i < missingSkills.length;
    i += skillsPerPhase
  ) {
    roadmap.push({
      title:
        "Phase " + phase,

      skills:
        missingSkills.slice(
          i,
          i + skillsPerPhase
        ),

      projects: [],

      certifications: [],

      interviewPrep: []
    })

    phase++
  }

  return roadmap
}