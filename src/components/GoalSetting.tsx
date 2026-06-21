"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

interface GoalSettingProps {
  onGoalSet: (data: any) => void

  goal?: string

  onChangeGoal?: () => void

  savedDuration?: string

  savedWeeklyHours?: string

  currentSkills?: string[]

  userId?: string
}

const durations = [
  "3 months",
  "6 months",
  "1 year",
]

const weeklyHourOptions = [
  { value: "1-3 hrs/week", label: "1–3 hrs/week", desc: "Light pace, around other commitments" },
  { value: "4-7 hrs/week", label: "4–7 hrs/week", desc: "Steady, a few hours most days" },
  { value: "8-15 hrs/week", label: "8–15 hrs/week", desc: "Focused, several hours daily" },
  { value: "15+ hrs/week", label: "15+ hrs/week", desc: "Intensive, near full-time effort" },
]

export default function GoalSetting({
  onGoalSet,
  goal,
  onChangeGoal,
  savedDuration,
  savedWeeklyHours,
  currentSkills,
  userId,
}: GoalSettingProps) {

  const [selectedDuration, setSelectedDuration] =
    useState(savedDuration || "")

  const [selectedWeeklyHours, setSelectedWeeklyHours] =
    useState(savedWeeklyHours || "")

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState("")

  const handleGenerate =
    async () => {

      if (
        !goal ||
        !selectedDuration ||
        !selectedWeeklyHours
      ) {

        setError(
          !goal
            ? "No career goal found — please set one on the Upload Resume step first."
            : "Please select a timeline and weekly time commitment."
        )

        return
      }

      setError("")

      try {

        setLoading(true)

        const response =
          await fetch(
            "/api/roadmap/generate",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
              goal,
              duration: selectedDuration,
              weeklyHours: selectedWeeklyHours,
              userId,
              currentSkills,
            }),
            }
          )

        if (!response.ok) {

          throw new Error(
            "Failed to generate roadmap"
          )
        }

        const roadmap =
          await response.json()

        onGoalSet({
          goal,

          duration:
            selectedDuration,

          weeklyHours:
            selectedWeeklyHours,

          roadmap,
        })

      } catch (error) {

        console.log(
          "Roadmap Error:",
          error
        )

        setError(
          "Something went wrong generating your roadmap. Please try again."
        )

      } finally {

        setLoading(false)
      }
    }

  return (

    <div className="space-y-8">

      <div>

        <h2 className="text-3xl font-bold mb-2">
          Plan Your Timeline
        </h2>

        <p className="text-gray-500">
          Your goal is already set — now tell us your pace so we can build the right roadmap
        </p>

      </div>

      {/* ── Locked-in goal, carried over from Upload Resume step ── */}
      <div className="bg-white rounded-3xl border p-6">

        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-semibold text-gray-500">
            Your Career Goal
          </h3>

          {onChangeGoal && (
            <button
              type="button"
              onClick={onChangeGoal}
              className="text-sm text-blue-600 font-medium hover:underline"
            >
              Change
            </button>
          )}
        </div>

        {goal ? (
          <div className="flex items-center gap-3 mt-2 p-4 rounded-xl bg-gray-50 border">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <span className="text-xl font-bold">
              {goal}
            </span>
          </div>
        ) : (
          <div className="mt-2 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
            No goal found yet.{" "}
            {onChangeGoal ? (
              <button
                type="button"
                onClick={onChangeGoal}
                className="font-medium underline"
              >
                Go back and set one
              </button>
            ) : (
              "Please set one on the Upload Resume step."
            )}
          </div>
        )}

      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-3xl border p-6">

        <h3 className="text-xl font-bold mb-6">
          Select Timeline
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {durations.map((duration) => (

            <div
              key={duration}
              onClick={() =>
                setSelectedDuration(duration)
              }
              className={`
                cursor-pointer
                rounded-2xl
                border
                p-6
                text-center
                transition-all
                duration-300
                hover:shadow-lg

                ${
                  selectedDuration === duration
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 bg-white"
                }
              `}
            >

              <div className="text-3xl mb-3">
                ⏳
              </div>

              <h4 className="text-xl font-bold">
                {duration}
              </h4>

            </div>
          ))}
        </div>

      </div>

      <div className="bg-white rounded-3xl border p-6">

        <h3 className="text-xl font-bold mb-1">
          Weekly Time Commitment
        </h3>

        <p className="text-gray-500 mb-6">
          How much time can you realistically dedicate each week?
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {weeklyHourOptions.map((opt) => (

            <div
              key={opt.value}
              onClick={() =>
                setSelectedWeeklyHours(opt.value)
              }
              className={`
                cursor-pointer
                rounded-2xl
                border
                p-5
                transition-all
                duration-300
                hover:shadow-lg

                ${
                  selectedWeeklyHours === opt.value
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 bg-white"
                }
              `}
            >

              <div className="flex items-center justify-between">
                <h4 className="text-lg font-bold">
                  {opt.label}
                </h4>

                {selectedWeeklyHours === opt.value && (
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                )}
              </div>

              <p className="text-sm text-gray-500 mt-1">
                {opt.desc}
              </p>

            </div>
          ))}
        </div>

      </div>

      <div className="bg-white rounded-3xl border p-8">

        <h2 className="text-2xl font-bold mb-6">
          Generate Career Roadmap
        </h2>

        <div className="bg-slate-100 rounded-2xl p-6 mb-6 space-y-2">

          <p className="text-lg">
            <b>Goal:</b>{" "}
            {goal || "Not set"}
          </p>

          <p className="text-lg">
            <b>Timeline:</b>{" "}
            {selectedDuration || "Not Selected"}
          </p>

          <p className="text-lg">
            <b>Weekly Commitment:</b>{" "}
            {selectedWeeklyHours || "Not Selected"}
          </p>

        </div>

        <Button
          onClick={handleGenerate}
          disabled={loading || !goal}
          className="
            w-full
            h-14
            text-lg
            bg-blue-600
            hover:bg-blue-700
            rounded-xl
          "
        >

          {
            loading
              ? "Generating..."
              : "Generate My Roadmap"
          }

        </Button>

      </div>

    </div>
  )
}