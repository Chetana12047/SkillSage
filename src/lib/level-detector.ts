export function getUserLevel(
  skills: string[]
) {
  const lower =
    skills.map(s =>
      s.toLowerCase()
    );

  if (
    lower.includes("java") &&
    lower.includes(
      "spring boot"
    ) &&
    lower.includes("react")
  ) {
    return "Advanced";
  }

  if (
    lower.includes("java")
  ) {
    return "Intermediate";
  }

  return "Beginner";
}