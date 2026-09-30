import React from 'react'
import { useAuthContext } from '../../context/AuthContext'
import { getInitials } from '../../utils/helpers'

export default function Navbar() {
  const { user } = useAuthContext()

  return (
    <header className="h-12 bg-white border-b border-[#E2E1DC] flex items-center px-6 gap-4 flex-shrink-0">
      <div className="flex-1 min-w-0">
        <span className="text-xs font-semibold text-[#ABABAB] uppercase tracking-widest">
          Verity
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-full bg-[#FACC15] flex items-center justify-center">
          <span className="text-[10px] font-bold text-[#0F0F0F]">{getInitials(user?.name || 'U')}</span>
        </div>
        <span className="text-xs font-medium text-[#6B6B6B]">{user?.name}</span>
      </div>
    </header>
  )
}
