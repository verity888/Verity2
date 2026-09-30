import React from 'react'

export default function Input({ label, error, id, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`field-input ${error ? 'border-red-400 focus:border-red-400 focus:shadow-none' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  )
}
