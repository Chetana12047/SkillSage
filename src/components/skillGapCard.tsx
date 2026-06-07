interface Props {
  existing: string[]
  missing: string[]
}

export default function SkillGapCard({
  existing,
  missing,
}: Props) {
  return (
    <div className="bg-white rounded-xl p-6 shadow">

      <h2 className="text-2xl font-bold mb-4">
        Skill Analysis
      </h2>

      <div className="mb-5">
        <h3 className="font-semibold text-green-600">
          Existing Skills
        </h3>

        <div className="flex flex-wrap gap-2 mt-2">
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
        <h3 className="font-semibold text-red-600">
          Missing Skills
        </h3>

        <div className="flex flex-wrap gap-2 mt-2">
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
  )
}