import React, { useState, useRef, useEffect } from 'react'
import { useChatContext } from '../../context/ChatContext'
import { chatService } from '../../services/chatService'

const IconSend = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <path d="M2 7.5h11M8.5 3 13 7.5 8.5 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export default function ChatInput({ conversationId, onConversationCreated }) {
  const [value, setValue] = useState('')
  const { dispatch, sending } = useChatContext()
  const textareaRef = useRef(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 136) + 'px'
    }
  }, [value])

  const handleSubmit = async (e) => {
    e?.preventDefault()
    const content = value.trim()
    if (!content || sending) return

    setValue('')

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

    const tempId = Date.now()
    dispatch({
      type: 'ADD_MESSAGE',
      payload: { tempId, role: 'user', content, created_at: new Date().toISOString() },
    })
    dispatch({ type: 'SET_SENDING', payload: true })

    try {
      const res = await chatService.sendMessage(convId, content)
      dispatch({ type: 'SET_MESSAGES', payload: res.messages || [] })
    } catch {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to send message. Please try again.' })
    } finally {
      dispatch({ type: 'SET_SENDING', payload: false })
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="px-6 py-4 border-t border-[#E2E1DC] bg-white flex-shrink-0">
      <form onSubmit={handleSubmit} className="flex items-end gap-3">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Message Verity…"
          disabled={sending}
          className="
            flex-1 field-input resize-none
            min-h-[40px] py-2.5
          "
          style={{ lineHeight: '1.5' }}
        />
        <button
          type="submit"
          disabled={!value.trim() || sending}
          className="
            flex-shrink-0 w-9 h-9 rounded bg-[#0F0F0F] hover:bg-[#2A2A2A]
            flex items-center justify-center text-white
            disabled:opacity-30 disabled:cursor-not-allowed transition-colors
            mb-0.5
          "
          aria-label="Send message"
        >
          <IconSend />
        </button>
      </form>
      <p className="text-[10px] text-[#C4C3BC] text-center mt-2">
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  )
}
