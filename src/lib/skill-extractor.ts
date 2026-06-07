export const KNOWN_SKILLS = [
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
  "DSA",
  "Postman",
  "Prisma",
  "SQLite",
]

export function extractSkills(
  text: string
) {
  return KNOWN_SKILLS.filter(
    skill =>
      text
        .toLowerCase()
        .includes(skill.toLowerCase())
  )
}