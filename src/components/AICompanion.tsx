'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  MessageCircle,
  Send,
  Minimize2,
  Maximize2,
  Bot,
  User,
  X,
  RefreshCw,
} from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface AICompanionProps {
  isMinimized?: boolean
}

export default function AICompanion({ isMinimized = false }: AICompanionProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimizedState, setIsMinimizedState] = useState(isMinimized)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        "Hi! I'm your SkillSage AI mentor. I've read your resume and know your goals. Ask me anything — what to learn next, how to prepare for interviews, or how your projects compare to what companies expect.",
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    const text = inputMessage.trim()
    if (!text || isLoading) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInputMessage('')
    setIsLoading(true)
    setError('')

    // Build conversation history for context (last 8 messages)
    const history = messages.slice(-8).map((m) => ({
      role: m.role,
      content: m.content,
    }))

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          conversationHistory: history,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}`)
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message || 'Sorry, I could not generate a response.',
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMsg])
    } catch (err: any) {
      console.error('[AICompanion]', err)
      setError(err.message || 'Failed to get a response. Please try again.')
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const clearChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        role: 'assistant',
        content:
          "Chat cleared! What would you like to work on?",
        timestamp: new Date(),
      },
    ])
    setError('')
  }

  if (isMinimizedState) {
    return (
      <Button
        onClick={() => setIsMinimizedState(false)}
        className="fixed bottom-4 right-4 w-14 h-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 z-50"
      >
        <MessageCircle className="w-6 h-6" />
      </Button>
    )
  }

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${
        isOpen ? 'w-96 h-[600px]' : 'w-80 h-16'
      }`}
    >
      <Card className="h-full shadow-xl flex flex-col overflow-hidden">
        {/* ── Header ── */}
        <CardHeader
          className="p-3 bg-blue-600 text-white cursor-pointer flex-shrink-0"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <CardTitle className="text-sm font-semibold">SkillSage AI Mentor</CardTitle>
            </div>
            <div className="flex items-center gap-1">
              {isOpen && (
                <button
                  onClick={(e) => { e.stopPropagation(); clearChat(); }}
                  className="p-1 hover:bg-blue-500 rounded"
                  title="Clear chat"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); setIsMinimizedState(true); }}
                className="p-1 hover:bg-blue-500 rounded"
                title="Minimize"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
                className="p-1 hover:bg-blue-500 rounded"
              >
                {isOpen ? <Maximize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </CardHeader>

        {isOpen && (
          <>
            {/* ── Messages ── */}
            <CardContent className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-sm'
                        : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <div className="flex gap-2 justify-start">
                  <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex gap-1 items-center">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="text-xs text-red-500 bg-red-50 rounded-xl px-3 py-2 flex items-center gap-2">
                  <X className="w-3 h-3" />
                  {error}
                </div>
              )}

              <div ref={messagesEndRef} />
            </CardContent>

            {/* ── Input ── */}
            <div className="p-3 border-t flex gap-2 flex-shrink-0">
              <Input
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask your AI mentor..."
                disabled={isLoading}
                className="flex-1 rounded-xl text-sm"
              />
              <Button
                onClick={handleSend}
                disabled={isLoading || !inputMessage.trim()}
                size="icon"
                className="bg-blue-600 hover:bg-blue-700 rounded-xl flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}
