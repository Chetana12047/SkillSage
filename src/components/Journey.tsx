interface Props {
  roadmap: any;
}

export default function RoadmapJourney({
  roadmap,
}: Props) {
  if (!roadmap) return null;

  return (
    <div className="bg-white rounded-2xl p-8 shadow border">
      <h2 className="text-3xl font-bold mb-8">
        Career Journey
      </h2>

      <div className="space-y-6">
        {roadmap.milestones?.map(
          (
            milestone: any,
            index: number
          ) => (
            <div
              key={index}
              className="flex items-center gap-5"
            >
              <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-bold">
                {index + 1}
              </div>

              <div className="flex-1 border rounded-xl p-5 bg-gray-50">
                <h3 className="font-bold text-lg">
                  {milestone.level}
                </h3>

                <p className="text-gray-500">
                  {milestone.duration}
                </p>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}