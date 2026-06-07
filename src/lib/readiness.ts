export function calculateReadiness(
  existingSkills: string[],
  totalSkills: number
) {
  if (!totalSkills) return 0;

  return Math.round(
    (existingSkills.length /
      totalSkills) *
      100
  );
}