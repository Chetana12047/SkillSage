interface Props {
  score: number;
  level: string;
}

export default function ReadinessScore({
  score,
  level,
}: Props) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow border">

      <h2 className="text-2xl font-bold mb-4">
        Job Readiness
      </h2>

      <div className="flex items-center gap-8">

        <div className="relative w-32 h-32">

          <div className="w-32 h-32 rounded-full border-8 border-blue-200 flex items-center justify-center">

            <div className="text-center">

              <div className="text-3xl font-bold">
                {score}%
              </div>

              <div className="text-xs text-gray-500">
                Ready
              </div>

            </div>

          </div>

        </div>

        <div>

          <h3 className="text-xl font-semibold">
            Current Level
          </h3>

          <p className="text-blue-600 font-bold text-lg">
            {level}
          </p>

        </div>

      </div>

    </div>
  );
}