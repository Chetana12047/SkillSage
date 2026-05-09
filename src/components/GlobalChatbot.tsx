'use client'

import { useState } from 'react'

interface Message {
  text: string
  type: 'user' | 'bot'
}

export default function GlobalChatbot() {
  const [open, setOpen] = useState(false)

  const [loading, setLoading] =
    useState(false)

  const [input, setInput] =
    useState('')

  const [messages, setMessages] =
    useState<Message[]>([
      {
        text:
          '👋 Hi! I am your SkillSage AI Mentor. Ask me anything about career, roadmap, coding, projects, placement, or learning.',
        type: 'bot',
      },
    ])

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage = input

    setMessages((prev) => [
      ...prev,
      {
        text: userMessage,
        type: 'user',
      },
    ])

    setInput('')
    setLoading(true)

    try {
      const response =
        await fetch('/api/ai/chat', {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            message: userMessage,
          }),
        })

      const data =
        await response.json()

      setMessages((prev) => [
        ...prev,
        {
          text:
            data?.response
              ?.content ||
            'AI could not respond.',
          type: 'bot',
        },
      ])
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          text:
            '⚠️ Something went wrong while talking to AI.',
          type: 'bot',
        },
      ])
    }

    setLoading(false)
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() =>
          setOpen(!open)
        }
        className="fixed bottom-5 right-5 z-50 px-5 py-3 rounded-full bg-blue-600 text-white shadow-xl"
      >
        AI Guide
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-20 right-5 z-50 w-[380px] h-[600px] bg-white rounded-3xl shadow-2xl border flex flex-col overflow-hidden">

          {/* Header */}
          <div className="p-4 border-b flex justify-between items-center bg-white">
            <h2 className="font-bold text-blue-600 text-lg">
              SkillSage AI
            </h2>

            <button
              onClick={() =>
                setOpen(false)
              }
              className="text-2xl"
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">

            {messages.map(
              (msg, i) => (
                <div
                  key={i}
                  className={`flex ${
                    msg.type ===
                    'user'
                      ? 'justify-end'
                      : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap ${
                      msg.type ===
                      'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              )
            )}

            {loading && (
              <div className="bg-white border px-4 py-3 rounded-2xl w-fit text-sm">
                Thinking...
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t flex gap-2 bg-white">
            <input
              type="text"
              placeholder="Ask anything..."
              value={input}
              onChange={(e) =>
                setInput(
                  e.target.value
                )
              }
              onKeyDown={(e) => {
                if (
                  e.key ===
                  'Enter'
                ) {
                  sendMessage()
                }
              }}
              className="flex-1 border rounded-xl px-4 py-2 outline-none"
            />

            <button
              onClick={
                sendMessage
              }
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  )
}