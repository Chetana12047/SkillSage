'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import Image from 'next/image'

export default function ProfilePage() {
  const router = useRouter()

  const [user, setUser] =
    useState<any>(null)

  const [msg, setMsg] =
    useState('')

  const [msgType, setMsgType] =
    useState('success')

  const [uploading, setUploading] =
    useState(false)

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
  const res = await fetch('/api/user/me')
  const data = await res.json()
  if (res.ok) {
    setUser(data)
  } else {
    // Session expired or unauthorized — redirect to login
    router.replace('/login')
  }
}

  const calculateProgress = () => {
    if (!user) return 0

    let progress = 0

    if (
      user.resumeUrl ||
      user.education ||
      user.experience ||
      user.manualSkills
    ) {
      progress = 15
    }

    if (user.goal) {
      progress = 30
    }

    return progress
  }

  const progress =
    calculateProgress()

  const updateProfile =
    async () => {
      const res = await fetch(
        '/api/user/update',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify(user),
        }
      )

      if (res.ok) {
        setMsg(
          'Profile updated successfully'
        )
        setMsgType('success')
      } else {
        setMsg('Update failed')
        setMsgType('error')
      }
    }

  const uploadResume =
    async (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      const file =
        e.target.files?.[0]

      if (!file) return

      if (
        file.type !==
        'application/pdf'
      ) {
        setMsg(
          'Only PDF allowed'
        )
        return
      }

      if (
        file.size >
        1024 * 1024
      ) {
        setMsg(
          'Max size is 1MB'
        )
        return
      }

      setUploading(true)

      const formData =
        new FormData()

      formData.append(
        'resume',
        file
      )

      const res = await fetch(
        '/api/resume/upload',
        {
          method: 'POST',
          body: formData,
        }
      )

      const data =
        await res.json()

      setUploading(false)

      if (res.ok) {
        setUser({
          ...user,
          resumeUrl:
            data.url,
        })

        setMsg(
          'Resume uploaded successfully'
        )
      } else {
        setMsg(
          data.error ||
            'Upload failed'
        )
      }
    }

  const removeResume =
    async () => {
      const res = await fetch(
        '/api/resume/delete',
        {
          method: 'POST',
        }
      )

      if (res.ok) {
        setUser({
          ...user,
          resumeUrl: '',
        })

        setMsg(
          'Resume removed successfully'
        )
      } else {
        setMsg(
          'Remove failed'
        )
      }
    }

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center text-xl font-semibold">
        Loading...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground px-6 py-8 transition-colors duration-300">

      {/* TOP */}
      <div className="max-w-5xl mx-auto flex items-center mb-7">

        <div className="w-[20%] flex justify-center pl-6">
          <Image
            src="/logo.png"
            alt="SkillSage"
            width={95}
            height={95}
          />
        </div>

        <div className="w-[80%] flex flex-col items-center justify-center pr-28">
          <h2 className="italic text-[26px] font-semibold text-blue-500">
            🚀 Growth is built through consistency.
          </h2>

          <p className="mt-2 text-muted-foreground text-lg">
            Build your future one smart step at a time!
          </p>
        </div>
      </div>

      {/* CARD */}
      <div className="max-w-5xl mx-auto bg-card border border-border rounded-3xl shadow-xl p-7">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-foreground">
            My Profile
          </h1>

          <div className="flex gap-3">
            <button
              onClick={() =>
                router.replace(
                  '/dashboard'
                )
              }
              className="px-5 py-2 rounded-2xl border border-border bg-background text-foreground"
            >
              Back
            </button>

            <button
              onClick={() =>
                signOut({
                  callbackUrl:
                    '/',
                })
              }
              className="px-5 py-2 rounded-2xl bg-black text-white dark:bg-white dark:text-black"
            >
              Logout
            </button>
          </div>
        </div>

        {/* PROGRESS */}
        <div className="mb-7">
          <div className="flex justify-between mb-2 font-semibold text-sm">
            <span>
              Student Growth Progress
            </span>

            <span className="text-blue-500">
              {progress}%
            </span>
          </div>

          <div className="h-3 bg-muted rounded-full">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </div>

        {/* FORM */}
        <div className="grid md:grid-cols-2 gap-4">

          <InputField
            label="Full Name"
            value={user.name || ''}
            onChange={(v: string) =>
              setUser({
                ...user,
                name: v,
              })
            }
          />

          <InputField
            label="Email"
            value={user.email || ''}
            disabled
          />

          <InputField
            label="Experience Level"
            value={
              user.experience ||
              ''
            }
            onChange={(v: string) =>
              setUser({
                ...user,
                experience: v,
              })
            }
          />

          <InputField
            label="Education"
            value={
              user.education ||
              ''
            }
            onChange={(v: string) =>
              setUser({
                ...user,
                education: v,
              })
            }
          />
        </div>

        {/* SKILLS */}
        <div className="mt-5">
          <label className="font-semibold text-lg">
            Skills
          </label>

          <textarea
            rows={4}
            value={
              user.manualSkills ||
              ''
            }
            onChange={(e) =>
              setUser({
                ...user,
                manualSkills:
                  e.target.value,
              })
            }
            className="mt-2 w-full rounded-2xl border border-border p-4 bg-background text-foreground"
          />
        </div>

        {/* EXTRA */}
        <div className="grid md:grid-cols-3 gap-4 mt-5">

          <InputField
            label="10th %"
            value={
              user.tenthMarks ||
              ''
            }
            onChange={(v: string) =>
              setUser({
                ...user,
                tenthMarks: v,
              })
            }
          />

          <InputField
            label="12th %"
            value={
              user.twelfthMarks ||
              ''
            }
            onChange={(v: string) =>
              setUser({
                ...user,
                twelfthMarks: v,
              })
            }
          />

          <InputField
            label="Overall CGPA"
            value={
              user.cgpa || ''
            }
            onChange={(v: string) =>
              setUser({
                ...user,
                cgpa: v,
              })
            }
          />
        </div>

        {/* RESUME */}
        <div className="mt-6">
          <h3 className="font-semibold text-lg mb-2">
            Resume
          </h3>

          {user.resumeUrl ? (
            <div className="flex items-center gap-4 flex-wrap">
              <a
                href={
                  user.resumeUrl
                }
                target="_blank"
                className="text-blue-500 underline"
              >
                View Uploaded Resume
              </a>

              <button
                onClick={
                  removeResume
                }
                className="px-4 py-2 rounded-xl bg-red-500 text-white"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4 flex-wrap">
              <p className="text-muted-foreground">
                No Resume Uploaded
              </p>

              <label className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black cursor-pointer">
                Browse Files

                <input
                  type="file"
                  accept=".pdf"
                  onChange={
                    uploadResume
                  }
                  className="hidden"
                />
              </label>
            </div>
          )}

          {uploading && (
            <p className="mt-2 text-blue-500">
              Uploading...
            </p>
          )}
        </div>

        {/* JOINED */}
        <div className="mt-5">
          <h3 className="font-semibold text-lg">
            Joined On
          </h3>

          <p className="text-muted-foreground">
            {new Date(
              user.createdAt
            ).toLocaleDateString()}
          </p>
        </div>

        {/* BUTTON */}
        <div className="mt-7">
          <button
            onClick={
              updateProfile
            }
            className="px-7 py-3 rounded-2xl bg-black text-white dark:bg-white dark:text-black"
          >
            Update Profile
          </button>
        </div>

        {msg && (
          <p
            className={`mt-4 font-medium ${
              msgType === 'success'
                ? 'text-green-500'
                : 'text-red-500'
            }`}
          >
            {msg}
          </p>
        )}
      </div>
    </div>
  )
}

function InputField({
  label,
  value,
  onChange,
  disabled = false,
}: any) {
  return (
    <div>
      <label className="font-semibold text-lg">
        {label}
      </label>

      <input
        value={value}
        disabled={disabled}
        onChange={(e) =>
          onChange &&
          onChange(
            e.target.value
          )
        }
        className="mt-2 w-full h-12 rounded-2xl border border-border px-4 bg-background text-foreground"
      />
    </div>
  )
}