export function generateATSScore(
  userSkills: string[],
  careerGoal: string
) {

  const lowerGoal =
    careerGoal.toLowerCase();

  let requiredSkills: string[] = [];

  /* AI / ML */

  if (
    lowerGoal.includes("ai") ||
    lowerGoal.includes("machine learning") ||
    lowerGoal.includes("data science")
  ) {
    requiredSkills = [
      "Python",
      "Machine Learning",
      "Deep Learning",
      "TensorFlow",
      "PyTorch",
      "SQL",
      "NLP",
      "Data Structures",
    ];
  }

  /* FRONTEND */

  else if (
    lowerGoal.includes("frontend")
  ) {
    requiredSkills = [
      "HTML",
      "CSS",
      "JavaScript",
      "React",
      "Next.js",
      "TypeScript",
    ];
  }

  /* BACKEND */

  else if (
    lowerGoal.includes("backend")
  ) {
    requiredSkills = [
      "Node.js",
      "Express.js",
      "MongoDB",
      "SQL",
      "REST APIs",
    ];
  }

  /* FULL STACK / SOFTWARE */

  else if (
    lowerGoal.includes("full stack") ||
    lowerGoal.includes("software")
  ) {
    requiredSkills = [
      "HTML",
      "CSS",
      "JavaScript",
      "React",
      "Node.js",
      "SQL",
      "Git",
      "Problem Solving",
    ];
  }

  /* DATA ANALYST */

  else if (
    lowerGoal.includes("data analyst")
  ) {
    requiredSkills = [
      "Python",
      "SQL",
      "Excel",
      "Power BI",
      "Statistics",
      "Data Visualization",
    ];
  }

  /* DEFAULT */

  else {
    requiredSkills = [
      "Problem Solving",
      "Communication",
      "Git",
    ];
  }

  /* MATCHED */

  const matchedSkills =
    requiredSkills.filter(
      (requiredSkill) =>
        userSkills.some(
          (userSkill) =>
            userSkill
              .toLowerCase()
              .trim()
              .includes(
                requiredSkill
                  .toLowerCase()
                  .trim()
              )
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
              .trim()
              .includes(
                requiredSkill
                  .toLowerCase()
                  .trim()
              )
        )
    );

  /* SCORE */

  const score =
    Math.round(
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