interface Props {
  skills: string[];
  existing: string[];
  missing: string[];
}

export default function SkillAnalysisCard({
  skills,
  existing,
  missing,
}: Props) {
  return (
    <div className="bg-white rounded-xl p-6 shadow">

      <h2 className="text-2xl font-bold mb-6">
        Resume Intelligence
      </h2>

      <div className="mb-6">
        <h3 className="font-semibold mb-2">
          Extracted Skills
        </h3>

        <div className="flex flex-wrap gap-2">
          {skills.map(skill => (
            <span
              key={skill}
              className="px-3 py-1 bg-blue-100 rounded-full"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold text-green-600 mb-2">
          Strong Areas
        </h3>

        <div className="flex flex-wrap gap-2">
          {existing.map(skill => (
            <span
              key={skill}
              className="px-3 py-1 bg-green-100 rounded-full"
            >
              ✓ {skill}
            </span>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-red-600 mb-2">
          Missing Skills
        </h3>

        <div className="flex flex-wrap gap-2">
          {missing.map(skill => (
            <span
              key={skill}
              className="px-3 py-1 bg-red-100 rounded-full"
            >
              ✗ {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}