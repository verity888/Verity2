import React, { useEffect, useRef, useState } from 'react'
import MessageBubble from './MessageBubble'
import { useChatContext } from '../../context/ChatContext'
import { chatService } from '../../services/chatService'
import VerityFace from '../ui/VerityFace'

const QUICK_PROMPTS = [
  "I'm feeling anxious today",
  "I need someone to talk to",
  "Help me calm down",
]

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 mt-1 w-7 h-7 rounded-full bg-[#FACC15] flex items-center justify-center overflow-hidden">
        <VerityFace size={24} />
      </div>
      <div className="bubble-ai flex items-center gap-1.5 py-3.5">
        <span className="typing-dot w-1.5 h-1.5 rounded-full bg-[#9B9B9B] block" />
        <span className="typing-dot w-1.5 h-1.5 rounded-full bg-[#9B9B9B] block" />
        <span className="typing-dot w-1.5 h-1.5 rounded-full bg-[#9B9B9B] block" />
      </div>
    </div>
  )
}

// Small status pill shown in the chat header area
function GeminiStatusPill({ status }) {
  if (!status) return null
  const connected = status === 'connected'
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
      connected
        ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]'
        : 'bg-[#FEFCE8] border-[#FEF08A] text-[#854D0E]'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${connected ? 'bg-[#22C55E]' : 'bg-[#EAB308]'}`} />
      {connected ? 'Gemini connected' : 'Setup required'}
    </div>
  )
}

export default function ChatWindow({ conversationId, onConversationCreated }) {
  const { messages, sending, loading, dispatch } = useChatContext()
  const bottomRef = useRef(null)
  const [geminiStatus, setGeminiStatus] = useState(null)

  // Fetch Gemini connection status for this user
  useEffect(() => {
    chatService.getGeminiStatus()
      .then((data) => setGeminiStatus(data.status))
      .catch(() => setGeminiStatus('pending_key'))
  }, [messages]) // re-check after each message exchange (key might have just been validated)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending])

  const handleQuickPrompt = async (text) => {
    if (sending) return

    let convId = conversationId
    if (!convId) {
      try {
        const conv = await chatService.createConversation()
        dispatch({ type: 'ADD_CONVERSATION', payload: conv })
        dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: conv.id })
        convId = conv.id
        onConversationCreated?.(conv.id)
      } catch {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to start conversation.' })
        return
      }
    }

    dispatch({
      type: 'ADD_MESSAGE',
      payload: { tempId: Date.now(), role: 'user', content: text, created_at: new Date().toISOString() },
    })
    dispatch({ type: 'SET_SENDING', payload: true })

    try {
      const res = await chatService.sendMessage(convId, text)
      dispatch({ type: 'SET_MESSAGES', payload: res.messages || [] })
    } catch {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to send message.' })
    } finally {
      dispatch({ type: 'SET_SENDING', payload: false })
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <span className="w-5 h-5 border-2 border-[#FACC15] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (messages.length === 0 && !sending) {
    const isPending = !geminiStatus || geminiStatus === 'pending_key'
    return (
      <div className="flex-1 flex flex-col items-start justify-end px-6 pb-8 gap-3">
        {/* Gemini status indicator */}
        <GeminiStatusPill status={geminiStatus} />

        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-full bg-[#FACC15] flex items-center justify-center overflow-hidden flex-shrink-0">
            <VerityFace size={28} />
          </div>
          <span className="text-sm font-semibold text-[#0F0F0F]">Verity</span>
        </div>

        {isPending ? (
          // Onboarding state — guide user to provide Gemini key
          <>
            <div className="bubble-ai">
              <p>Hi — I'm Verity. To activate the AI engine, I need your Google Gemini API key.</p>
              <p className="mt-2 text-[#6B6B6B]">
                Get one free in about 30 seconds at{' '}
                <a
                  href="https://ai.google.dev"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#0F0F0F] underline underline-offset-2"
                >
                  ai.google.dev
                </a>
                {' '}— it starts with <code className="bg-[#F4F4F4] px-1 py-0.5 rounded text-xs">AIzaSy</code>.
                Paste it below to connect.
              </p>
            </div>
          </>
        ) : (
          // Connected state — normal greeting + quick prompts
          <>
            <div className="bubble-ai">
              <p>Hi — I'm Verity. I'm here to listen and support you.</p>
              <p className="mt-2 text-[#6B6B6B]">Share what's on your mind whenever you're ready.</p>
            </div>
            <div className="flex flex-wrap gap-2 mt-1">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleQuickPrompt(prompt)}
                  disabled={sending}
                  className="px-3 py-1.5 text-xs font-medium border border-[#E2E1DC] bg-white hover:border-[#FACC15] hover:bg-[#FFFBEB] text-[#6B6B6B] hover:text-[#0F0F0F] rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
      {/* Status pill in active conversation header */}
      {geminiStatus && (
        <div className="flex justify-end">
          <GeminiStatusPill status={geminiStatus} />
        </div>
      )}
      {messages.map((msg) => (
        <MessageBubble key={msg.id || msg.tempId} message={msg} />
      ))}
      {sending && <TypingIndicator />}
      <div ref={bottomRef} />
    </div>
  )
}
