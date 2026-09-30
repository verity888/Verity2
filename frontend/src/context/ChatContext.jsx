import React, { createContext, useContext, useReducer } from 'react'

const ChatContext = createContext(null)

const initialState = {
  conversations: [],
  activeConversationId: null,
  messages: [],
  loading: false,
  sending: false,
  error: null,
}

function chatReducer(state, action) {
  switch (action.type) {
    case 'SET_CONVERSATIONS':
      return { ...state, conversations: action.payload }
    case 'ADD_CONVERSATION':
      return { ...state, conversations: [action.payload, ...state.conversations] }
    case 'SET_ACTIVE_CONVERSATION':
      return { ...state, activeConversationId: action.payload, messages: [] }
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload, loading: false }
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_SENDING':
      return { ...state, sending: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false, sending: false }
    case 'CLEAR_MESSAGES':
      return { ...state, messages: [], activeConversationId: null }
    default:
      return state
  }
}

export function ChatProvider({ children }) {
  const [state, dispatch] = useReducer(chatReducer, initialState)

  return (
    <ChatContext.Provider value={{ ...state, dispatch }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChatContext() {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChatContext must be used within ChatProvider')
  return ctx
}
