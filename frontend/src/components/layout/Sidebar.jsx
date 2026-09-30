import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import VerityFace from '../ui/VerityFace'
import { useAuthContext } from '../../context/AuthContext'
import { useChatContext } from '../../context/ChatContext'
import { chatService } from '../../services/chatService'
import { truncate, formatRelativeDate, getInitials } from '../../utils/helpers'

// Minimal SVG icons — no Lucide sparkle/star glyphs
const IconChat = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M2 3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H5.5L2.5 14V11H3a1 1 0 0 1-1-1V3Z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round"/>
  </svg>
)

const IconChart = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M2 12h2V7H2v5ZM7 12h2V4H7v8ZM12 12h2V9h-2v3Z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" strokeLinecap="round"/>
    <path d="M1 13h14" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
  </svg>
)

const IconPlus = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

const IconLogout = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M5.5 12H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h2.5M9.5 10l2.5-3-2.5-3M12 7H5.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const IconSettings = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="2.25" stroke="currentColor" strokeWidth="1.25"/>
    <path d="M8 1.5v1.25M8 13.25V14.5M14.5 8h-1.25M2.75 8H1.5M12.36 3.64l-.88.88M4.52 11.48l-.88.88M12.36 12.36l-.88-.88M4.52 4.52l-.88-.88" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
  </svg>
)

const IconChevronLeft = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M7.5 2.5 4 6l3.5 3.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const IconChevronRight = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M4.5 2.5 8 6l-3.5 3.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuthContext()
  const { conversations, dispatch } = useChatContext()
  const navigate = useNavigate()

  const handleNewChat = async () => {
    try {
      const conv = await chatService.createConversation()
      dispatch({ type: 'ADD_CONVERSATION', payload: conv })
      dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: conv.id })
      navigate(`/chat/${conv.id}`)
    } catch {
      navigate('/chat')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside
      className={`
        flex flex-col h-full bg-white border-r border-[#E2E1DC]
        transition-all duration-200 ease-in-out flex-shrink-0
        ${collapsed ? 'w-14' : 'w-56'}
      `}
    >
      {/* Logo — two layouts to avoid overflow at w-14 */}
      {collapsed ? (
        <div className="flex flex-col items-center gap-2 px-3 py-3 border-b border-[#E2E1DC]">
          <VerityFace size={24} />
          <button
            onClick={onToggle}
            className="w-5 h-5 flex items-center justify-center text-[#ABABAB] hover:text-[#6B6B6B] transition-colors"
            aria-label="Expand sidebar"
          >
            <IconChevronRight />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 px-3 py-4 border-b border-[#E2E1DC]">
          <div className="flex-shrink-0">
            <VerityFace size={28} />
          </div>
          <span className="flex-1 text-sm font-bold tracking-tight text-[#0F0F0F] min-w-0 truncate">
            Verity
          </span>
          <button
            onClick={onToggle}
            className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-[#ABABAB] hover:text-[#6B6B6B] transition-colors"
            aria-label="Collapse sidebar"
          >
            <IconChevronLeft />
          </button>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto space-y-0.5">
        {/* New chat */}
        <button
          onClick={handleNewChat}
          className={`
            w-full flex items-center gap-2.5 px-2.5 py-2 mb-2 rounded text-xs font-semibold
            bg-[#FACC15] hover:bg-[#EAB800] text-[#0F0F0F] transition-colors
            ${collapsed ? 'justify-center' : ''}
          `}
        >
          <IconPlus />
          {!collapsed && <span>New chat</span>}
        </button>

        <NavLink
          to="/chat"
          end
          className={({ isActive }) =>
            `nav-item ${isActive ? 'active' : ''} ${collapsed ? 'justify-center' : ''}`
          }
          title="Chat"
        >
          <IconChat />
          {!collapsed && <span>Chat</span>}
        </NavLink>

        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `nav-item ${isActive ? 'active' : ''} ${collapsed ? 'justify-center' : ''}`
          }
          title="Dashboard"
        >
          <IconChart />
          {!collapsed && <span>Dashboard</span>}
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `nav-item ${isActive ? 'active' : ''} ${collapsed ? 'justify-center' : ''}`
          }
          title="Settings"
        >
          <IconSettings />
          {!collapsed && <span>Settings</span>}
        </NavLink>

        {/* Recent conversations */}
        {!collapsed && conversations.length > 0 && (
          <div className="pt-4">
            <p className="px-2.5 text-[10px] font-semibold uppercase tracking-widest text-[#ABABAB] mb-1">
              Recent
            </p>
            {conversations.slice(0, 10).map((conv) => (
              <NavLink
                key={conv.id}
                to={`/chat/${conv.id}`}
                className={({ isActive }) =>
                  `nav-item ${isActive ? 'active' : ''}`
                }
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs">
                    {truncate(conv.title || 'New conversation', 26)}
                  </p>
                  <p className="text-[10px] text-[#ABABAB] mt-0.5">
                    {formatRelativeDate(conv.updated_at || conv.created_at)}
                  </p>
                </div>
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      {/* User footer */}
      <div className="px-2 py-3 border-t border-[#E2E1DC]">
        <div className={`flex items-center gap-2.5 px-1.5 py-1.5 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-7 h-7 rounded-full bg-[#FACC15] flex items-center justify-center flex-shrink-0">
            <span className="text-[10px] font-bold text-[#0F0F0F]">
              {getInitials(user?.name || 'U')}
            </span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#0F0F0F] truncate">{user?.name}</p>
              <p className="text-[10px] text-[#9B9B9B] truncate">{user?.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            title="Sign out"
            className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-[#ABABAB] hover:text-[#DC2626] transition-colors"
          >
            <IconLogout />
          </button>
        </div>
      </div>
    </aside>
  )
}
