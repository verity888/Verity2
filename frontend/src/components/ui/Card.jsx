import React from 'react'

export default function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`bg-white rounded-2xl border border-neutral-100 shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
