'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  text: string
  type: 'user' | 'bot'
}

export default function GlobalChatbot() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    {
      text: '👋 Hi! I am your SkillSage AI Mentor. Ask me anything about career, roadmap, coding, projects, placement, or learning.',
      type: 'bot',
    },
  ])

  // Keep conversation history for multi-turn memory
  const historyRef = useRef<{ role: string; content: string }[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()

    setMessages((prev) => [...prev, { text: userMessage, type: 'user' }])
    setInput('')
    setLoading(true)

    // Add to history before sending
    historyRef.current = [
      ...historyRef.current,
      { role: 'user', content: userMessage },
    ]

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory: historyRef.current.slice(-10),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || data.error || 'Request failed')
      }

      // FIXED: route returns { message } — not { response: { content } }
      const botReply = data.message || 'AI could not respond.'

      setMessages((prev) => [...prev, { text: botReply, type: 'bot' }])

      // Add assistant reply to history
      historyRef.current = [
        ...historyRef.current,
        { role: 'assistant', content: botReply },
      ]
    } catch (error: any) {
      console.error('Chat error:', error)
      setMessages((prev) => [
        ...prev,
        {
          text: `⚠️ ${error.message || 'Something went wrong. Check that GEMINI_API_KEY is set in .env.local and restart the server.'}`,
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
        onClick={() => setOpen(!open)}
        className="fixed bottom-5 right-5 z-50 px-5 py-3 rounded-full bg-blue-600 text-white shadow-xl hover:bg-blue-700 transition-colors"
      >
        AI Guide
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-20 right-5 z-50 w-[380px] h-[600px] bg-white rounded-3xl shadow-2xl border flex flex-col overflow-hidden">

          {/* Header */}
          <div className="p-4 border-b flex justify-between items-center bg-white">
            <h2 className="font-bold text-blue-600 text-lg">SkillSage AI</h2>
            <button onClick={() => setOpen(false)} className="text-2xl text-gray-500 hover:text-gray-800">×</button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap ${
                    msg.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border text-gray-800'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border px-4 py-3 rounded-2xl w-fit text-sm text-gray-500">
                  <span className="animate-pulse">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t flex gap-2 bg-white">
            <input
              type="text"
              placeholder="Ask anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') sendMessage() }}
              className="flex-1 border rounded-xl px-4 py-2 outline-none text-sm"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl disabled:opacity-50 hover:bg-blue-700 transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  )
}