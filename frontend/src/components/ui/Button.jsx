import React from 'react'

const variants = {
  primary:   'bg-[#FACC15] hover:bg-[#EAB800] text-[#0F0F0F] font-semibold border border-[#FACC15]',
  secondary: 'bg-white hover:bg-[#F4F4F0] text-[#0F0F0F] font-medium border border-[#E2E1DC]',
  ghost:     'bg-transparent hover:bg-[#F4F4F0] text-[#6B6B6B] font-medium border border-transparent',
  danger:    'bg-[#DC2626] hover:bg-[#B91C1C] text-white font-semibold border border-[#DC2626]',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded',
  md: 'px-4 py-2.5 text-sm rounded',
  lg: 'px-6 py-3 text-sm rounded',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2
        transition-colors duration-100
        disabled:opacity-40 disabled:cursor-not-allowed select-none
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin flex-shrink-0" />
      )}
      {children}
    </button>
  )
}
