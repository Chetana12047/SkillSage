"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"

interface GoalSettingProps {
  onGoalSet: (data: any) => void

  savedGoal?: string

  savedDuration?: string

  currentSkills?: string[]

  userId?: string
}

const goals = [
  {
    title: "AI Engineer Professional",
    description:
      "LLMs, neural networks, deployment projects.",
    priority: "Very High",
  },

  {
    title: "Data Analyst Essentials",
    description:
      "Excel, dashboards, SQL, reporting.",
    priority: "High",
  },

  {
    title: "Professional Data Science Program",
    description:
      "Python, ML, statistics, real projects.",
    priority: "Very High",
  },

  {
    title: "Cybersecurity Fundamentals",
    description:
      "Security basics, threats, networks.",
    priority: "High",
  },

  {
    title: "Ethical Hacking Mastery",
    description:
      "Pen testing, Kali Linux, SOC tools.",
    priority: "Very High",
  },

  {
    title: "Software Developer Career Track",
    description:
      "Coding, OOP, Git, projects.",
    priority: "Very High",
  },
]

const durations = [
  "3 months",
  "6 months",
  "1 year",
]

export default function GoalSetting({
  onGoalSet,
  userId,
}: GoalSettingProps) {

  const [selectedGoal, setSelectedGoal] =
    useState("")

  const [customGoal, setCustomGoal] =
    useState("")

  const [selectedDuration, setSelectedDuration] =
    useState("")

  const [loading, setLoading] =
    useState(false)

  const handleGoalSelect = (
    goal: string
  ) => {

    setSelectedGoal(goal)
    setCustomGoal(goal)
  }

  const handleGenerate =
    async () => {

      const finalGoal =
        customGoal || selectedGoal

      if (
        !finalGoal ||
        !selectedDuration
      ) {

        alert(
          "Please select goal and timeline"
        )

        return
      }

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
              goal: finalGoal,
              duration: selectedDuration,
              userId,
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
          goal:
            finalGoal,

          duration:
            selectedDuration,

          roadmap,
        })

      } catch (error) {

        console.log(
          "Roadmap Error:",
          error
        )

      } finally {

        setLoading(false)
      }
    }

  return (

    <div className="space-y-8">

      <div>

        <h2 className="text-3xl font-bold mb-2">
          Select Your Career Goal
        </h2>

        <p className="text-gray-500">
          Choose a roadmap aligned with industry demand
        </p>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

        {goals.map((goal) => (

          <div
            key={goal.title}
            onClick={() =>
              handleGoalSelect(goal.title)
            }
            className={`
              cursor-pointer
              rounded-3xl
              border
              p-6
              transition-all
              duration-300
              hover:shadow-xl
              hover:-translate-y-1
              bg-white

              ${
                selectedGoal === goal.title
                  ? "border-blue-600 ring-2 ring-blue-300"
                  : "border-gray-200"
              }
            `}
          >

            <div className="flex items-center justify-between mb-4">

              <div className="text-3xl">
                💼
              </div>

              <span
                className={`
                  px-3 py-1 rounded-full text-xs font-semibold text-white

                  ${
                    goal.priority === "Very High"
                      ? "bg-green-500"
                      : "bg-blue-500"
                  }
                `}
              >
                {goal.priority}
              </span>

            </div>

            <h3 className="text-xl font-bold mb-2">
              {goal.title}
            </h3>

            <p className="text-gray-500">
              {goal.description}
            </p>

          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl border p-6">

        <h3 className="text-xl font-bold mb-4">
          Define your own goal
        </h3>

        <div className="flex flex-col md:flex-row gap-4">

          <input
            type="text"
            placeholder="Java Full Stack Developer"
            value={customGoal}
            onChange={(e) =>
              setCustomGoal(
                e.target.value
              )
            }
            className="
              flex-1
              h-14
              rounded-xl
              border
              border-gray-300
              px-4
              outline-none
              focus:ring-2
              focus:ring-blue-500
            "
          />

          <Button
            onClick={() =>
              setSelectedGoal(customGoal)
            }
            className="h-14 px-8"
          >
            Use Goal
          </Button>

        </div>

      </div>

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

      <div className="bg-white rounded-3xl border p-8">

        <h2 className="text-2xl font-bold mb-6">
          Generate Career Roadmap
        </h2>

        <div className="bg-slate-100 rounded-2xl p-6 mb-6">

          <p className="text-lg">
            <b>Goal:</b>{" "}
            {customGoal || selectedGoal || "Not Selected"}
          </p>

          <p className="text-lg mt-2">
            <b>Timeline:</b>{" "}
            {selectedDuration || "Not Selected"}
          </p>

        </div>

        <Button
          onClick={handleGenerate}
          disabled={loading}
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