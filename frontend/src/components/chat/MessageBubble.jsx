import React from 'react'
import VerityFace from '../ui/VerityFace'
import { formatTime } from '../../utils/helpers'

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className="flex-shrink-0 mt-0.5">
        {isUser ? (
          <div className="w-7 h-7 rounded-full bg-[#0F0F0F] flex items-center justify-center">
            <span className="text-[10px] font-bold text-white">You</span>
          </div>
        ) : (
          <div className="w-7 h-7 rounded-full bg-[#FACC15] flex items-center justify-center overflow-hidden">
            <VerityFace size={24} />
          </div>
        )}
      </div>

      {/* Bubble */}
      <div className={`flex flex-col gap-1 max-w-[72%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={isUser ? 'bubble-user' : 'bubble-ai'}>
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
        <span className="text-[10px] text-[#ABABAB] px-0.5">
          {formatTime(message.created_at || new Date().toISOString())}
        </span>
      </div>
    </div>
  )
}
