import { CareerPath } from "./types";

export function detectLevel(
  skills: string[]
) {
  const lowerSkills =
    skills.map((s) =>
      s.toLowerCase()
    );

  if (
    lowerSkills.includes("java") &&
    lowerSkills.includes(
      "spring boot"
    ) &&
    lowerSkills.includes(
      "react"
    )
  ) {
    return "advanced";
  }

  if (
    lowerSkills.includes("java")
  ) {
    return "intermediate";
  }

  return "beginner";
}

export const javaFullStack: CareerPath =
  {
    title:
      "Java Full Stack Developer",

    roles: [
      "Java Developer",
      "Backend Developer",
      "Full Stack Developer",
    ],

    salary:
      "₹6 LPA - ₹18 LPA",

    skills: [
      "Java",
      "OOP",
      "Collections",
      "Exception Handling",
      "Spring Boot",
      "REST APIs",
      "Hibernate",
      "MySQL",
      "React",
      "Git",
      "GitHub",
      "JWT",
      "Docker",
      "AWS",
      "Microservices",
      "CI/CD",
      "System Design",
      "DSA"
    ],

    phases: {
      threeMonths: [
        {
          level:
            "Foundation",

          duration:
            "Month 1",

          skills: [
            "Java Basics",
            "OOP",
            "HTML",
            "CSS",
            "JavaScript",
          ],

          tools: [
            "VS Code",
            "Git",
            "GitHub",
          ],

          projects: [
            "Portfolio Website",
            "Student Management System",
          ],

          certifications: [
            "Java Basics Certificate",
          ],

          interview: [
            "Java Fundamentals",
            "OOP Concepts",
          ],
        },

        {
          level:
            "Backend",

          duration:
            "Month 2",

          skills: [
            "Spring Boot",
            "REST APIs",
            "MySQL",
          ],

          tools: [
            "Postman",
            "MySQL",
          ],

          projects: [
            "CRUD Application",
          ],

          certifications: [
            "Spring Boot Basics",
          ],

          interview: [
            "API Questions",
            "Database Questions",
          ],
        },

        {
          level:
            "Placement Ready",

          duration:
            "Month 3",

          skills: [
            "JWT",
            "Deployment",
            "DSA",
          ],

          tools: [
            "Render",
            "Railway",
          ],

          projects: [
            "Full Stack Job Portal",
          ],

          certifications: [
            "Full Stack Certificate",
          ],

          interview: [
            "DSA",
            "Spring Boot",
          ],
        },
      ],

      sixMonths: [
        {
          level:
            "Java Foundation",

          duration:
            "Month 1-2",

          skills: [
            "Core Java",
            "OOP",
            "Collections",
            "Exception Handling",
          ],

          tools: [
            "Git",
            "GitHub",
          ],

          projects: [
            "Library Management System",
          ],

          certifications: [
            "Java Certification",
          ],

          interview: [
            "Java Core",
          ],
        },

        {
          level:
            "Backend Development",

          duration:
            "Month 3-4",

          skills: [
            "Spring Boot",
            "REST APIs",
            "Hibernate",
            "MySQL",
          ],

          tools: [
            "Postman",
          ],

          projects: [
            "E-Commerce Backend",
          ],

          certifications: [
            "Spring Boot",
          ],

          interview: [
            "Spring",
            "SQL",
          ],
        },

        {
          level:
            "Job Ready",

          duration:
            "Month 5-6",

          skills: [
            "JWT",
            "Docker",
            "AWS Basics",
            "DSA",
          ],

          tools: [
            "Docker",
            "AWS",
          ],

          projects: [
            "Job Portal",
          ],

          certifications: [
            "AWS Cloud Practitioner",
          ],

          interview: [
            "DSA",
            "System Design",
          ],
        },
      ],

      oneYear: [
        {
          level:
            "Foundation",

          duration:
            "Quarter 1",

          skills: [
            "Java",
            "OOP",
            "DSA",
          ],

          tools: [
            "Git",
          ],

          projects: [
            "Java Projects",
          ],

          certifications: [
            "Java",
          ],

          interview: [
            "Core Java",
          ],
        },

        {
          level:
            "Backend Mastery",

          duration:
            "Quarter 2",

          skills: [
            "Spring Boot",
            "Hibernate",
            "Microservices",
          ],

          tools: [
            "Postman",
          ],

          projects: [
            "Microservice App",
          ],

          certifications: [
            "Spring",
          ],

          interview: [
            "Spring Boot",
          ],
        },

        {
          level:
            "Cloud & DevOps",

          duration:
            "Quarter 3",

          skills: [
            "Docker",
            "AWS",
            "CI/CD",
          ],

          tools: [
            "Docker",
            "AWS",
            "GitHub Actions",
          ],

          projects: [
            "Cloud Deployment Project",
          ],

          certifications: [
            "AWS",
          ],

          interview: [
            "Cloud",
          ],
        },

        {
          level:
            "Industry Ready",

          duration:
            "Quarter 4",

          skills: [
            "System Design",
            "Advanced DSA",
          ],

          tools: [
            "Jira",
          ],

          projects: [
            "Production Scale App",
          ],

          certifications: [
            "Professional Certificate",
          ],

          interview: [
            "System Design",
            "LLD",
            "HLD",
          ],
        },
      ],
    },
  };