export function generateATSScore(
  userSkills: string[],
  careerGoal: string
) {

  const goalSkillsMap: Record<
    string,
    string[]
  > = {

    "AI Engineer Professional": [
      "Python",
      "Machine Learning",
      "Deep Learning",
      "TensorFlow",
      "PyTorch",
      "LLMs",
      "NLP",
      "SQL",
      "Data Structures",
      "Problem Solving",
    ],

    "Frontend Developer": [
      "HTML",
      "CSS",
      "JavaScript",
      "React",
      "Next.js",
      "TypeScript",
    ],

    "Backend Developer": [
      "Node.js",
      "Express.js",
      "MongoDB",
      "SQL",
      "REST APIs",
    ],

    "Full Stack Developer": [
      "HTML",
      "CSS",
      "JavaScript",
      "React",
      "Next.js",
      "Node.js",
      "MongoDB",
      "SQL",
    ],
  };

  const requiredSkills =
    goalSkillsMap[
      careerGoal.trim()
    ] || [];

  /* MATCHED */

  const matchedSkills =
    userSkills.filter(
      (userSkill) =>
        requiredSkills.some(
          (requiredSkill) =>
            requiredSkill
              .toLowerCase()
              .trim() ===
            userSkill
              .toLowerCase()
              .trim()
        )
    );

  /* MISSING */

  const missingSkills =
    requiredSkills.filter(
      (requiredSkill) =>
        !userSkills.some(
          (userSkill) =>
            userSkill
              .toLowerCase()
              .trim() ===
            requiredSkill
              .toLowerCase()
              .trim()
        )
    );

  /* SCORE */

  const score =
    requiredSkills.length === 0
      ? 0
      : Math.round(
          (matchedSkills.length /
            requiredSkills.length) *
            100
        );

  return {
    score,
    matchedSkills,
    missingSkills,
  };
}