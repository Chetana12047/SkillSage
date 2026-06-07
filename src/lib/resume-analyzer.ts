const KNOWN_SKILLS = [
  "Java",
  "Spring Boot",
  "React",
  "Next.js",
  "TypeScript",
  "JavaScript",
  "HTML",
  "CSS",
  "MySQL",
  "SQL",
  "Git",
  "GitHub",
  "Docker",
  "AWS",
  "Hibernate",
  "JWT",
  "REST API",
  "Node.js",
  "Python",
  "Postman",
  "Prisma",
  "SQLite",
];

export function analyzeResume(
  resumeText: string
) {
  const skills =
    KNOWN_SKILLS.filter(
      (skill) =>
        resumeText
          .toLowerCase()
          .includes(
            skill.toLowerCase()
          )
    );

  let level = "Beginner";

  if (
    skills.includes("Java") &&
    skills.includes("Spring Boot") &&
    skills.includes("React")
  ) {
    level = "Advanced";
  } else if (
    skills.includes("Java")
  ) {
    level = "Intermediate";
  }

  return {
    skills,
    level,
  };
}