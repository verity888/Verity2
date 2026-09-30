import React, { createContext, useContext, useReducer, useEffect } from 'react'

const AuthContext = createContext(null)

const initialState = {
  user: null,
  token: null,
  loading: true,
  error: null,
}

function authReducer(state, action) {
  switch (action.type) {
    case 'INIT_DONE':
      return { ...state, loading: false }
    case 'LOGIN_SUCCESS':
      return { ...state, user: action.payload.user, token: action.payload.token, error: null, loading: false }
    case 'LOGOUT':
      return { ...initialState, loading: false }
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }
    case 'CLEAR_ERROR':
      return { ...state, error: null }
    default:
      return state
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    const token = localStorage.getItem('verity_token')
    const userRaw = localStorage.getItem('verity_user')
    if (token && userRaw) {
      try {
        const user = JSON.parse(userRaw)
        dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } })
      } catch {
        dispatch({ type: 'INIT_DONE' })
      }
    } else {
      dispatch({ type: 'INIT_DONE' })
    }
  }, [])

  const login = (user, token) => {
    localStorage.setItem('verity_token', token)
    localStorage.setItem('verity_user', JSON.stringify(user))
    dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } })
  }

  const logout = () => {
    localStorage.removeItem('verity_token')
    localStorage.removeItem('verity_user')
    dispatch({ type: 'LOGOUT' })
  }

  const setError = (error) => dispatch({ type: 'SET_ERROR', payload: error })
  const clearError = () => dispatch({ type: 'CLEAR_ERROR' })

  return (
    <AuthContext.Provider value={{ ...state, login, logout, setError, clearError }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider')
  return ctx
}
