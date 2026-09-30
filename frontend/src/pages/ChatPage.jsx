import React, { useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ChatWindow from '../components/chat/ChatWindow'
import ChatInput from '../components/chat/ChatInput'
import { useChatContext } from '../context/ChatContext'
import { chatService } from '../services/chatService'

export default function ChatPage() {
  const { conversationId } = useParams()
  const { dispatch, activeConversationId } = useChatContext()
  const navigate = useNavigate()
  const navigateRef = useRef(navigate)
  navigateRef.current = navigate

  useEffect(() => {
    async function loadConversations() {
      try {
        const convs = await chatService.getConversations()
        dispatch({ type: 'SET_CONVERSATIONS', payload: convs })
      } catch {
        // no-op
      }
    }
    loadConversations()
  }, [dispatch])

  useEffect(() => {
    if (!conversationId) {
      dispatch({ type: 'CLEAR_MESSAGES' })
      return
    }
    if (conversationId === String(activeConversationId)) return

    dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: conversationId })
    dispatch({ type: 'SET_LOADING', payload: true })

    async function loadMessages() {
      try {
        const msgs = await chatService.getMessages(conversationId)
        dispatch({ type: 'SET_MESSAGES', payload: msgs })
      } catch {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }
    loadMessages()
  }, [conversationId, dispatch, activeConversationId])

  const handleConversationCreated = (newId) => {
    navigateRef.current(`/chat/${newId}`, { replace: true })
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Page header */}
      <div className="flex-shrink-0 h-12 px-6 flex items-center border-b border-[#E2E1DC]">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-[#ABABAB]">
          {conversationId ? 'Conversation' : 'New conversation'}
        </h2>
      </div>

      <ChatWindow
        conversationId={conversationId}
        onConversationCreated={handleConversationCreated}
      />

      <ChatInput
        conversationId={conversationId}
        onConversationCreated={handleConversationCreated}
      />
    </div>
  )
}
