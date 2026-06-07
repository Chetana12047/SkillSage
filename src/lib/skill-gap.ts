import { careerDatabase } from "./career-data";

export function analyzeSkillGap(
  currentSkills: string[],
  goal: string
) {
  let role: any = null;

  const lowerGoal =
    goal.toLowerCase();

  for (const key in careerDatabase) {
    if (
      lowerGoal.includes(key)
    ) {
      role =
        careerDatabase[key];
      break;
    }
  }

  if (!role) {
    return {
      missingSkills: [],
      matchedSkills: [],
    };
  }

  const requiredSkills =
    role.skills || [];

  const matchedSkills =
    requiredSkills.filter(
      (skill: string) =>
        currentSkills.some(
          (s) =>
            s.toLowerCase() ===
            skill.toLowerCase()
        )
    );

  const missingSkills =
    requiredSkills.filter(
      (skill: string) =>
        !matchedSkills.includes(
          skill
        )
    );

  return {
    matchedSkills,
    missingSkills,
  };
}