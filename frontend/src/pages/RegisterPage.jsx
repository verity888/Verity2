import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuthContext } from '../context/AuthContext'
import { authService } from '../services/authService'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import VerityFace from '../components/ui/VerityFace'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuthContext()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (username.length < 3) {
      setError('Username must be at least 3 characters.')
      return
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Username may only contain letters, numbers and underscores.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    try {
      const data = await authService.register(name, username, email, password)
      login(data.user, data.token)
      navigate('/chat')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] grid grid-cols-1 lg:grid-cols-2">
      {/* Left panel — brand */}
      <div className="hidden lg:flex flex-col justify-between px-16 py-12 bg-[#0F0F0F]">
        <div className="flex items-center gap-2.5">
          <VerityFace size={28} />
          <span className="text-sm font-bold tracking-tight text-white">Verity</span>
        </div>
        <div>
          <h2 className="font-serif text-4xl font-bold text-white leading-tight mb-4">
            Begin your<br />wellness journey.
          </h2>
          <p className="text-sm text-[#9B9B9B] leading-relaxed max-w-xs">
            Create a free account and start talking with Verity whenever you need support.
          </p>
        </div>
        <p className="text-xs text-[#4B4B4B]">© {new Date().getFullYear()} Verity</p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-col justify-center px-8 md:px-16 py-12">
        {/* Mobile logo */}
        <div className="flex items-center gap-2 mb-10 lg:hidden">
          <VerityFace size={28} />
          <span className="text-sm font-bold tracking-tight text-[#0F0F0F]">Verity</span>
        </div>

        <div className="max-w-sm w-full">
          <h1 className="font-serif text-3xl font-bold text-[#0F0F0F] mb-1">Create account</h1>
          <p className="text-sm text-[#6B6B6B] mb-8">It's free. No credit card required.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              id="name"
              label="Full name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your first name"
              required
              autoComplete="given-name"
            />
            <Input
              id="username"
              label="Username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              placeholder="e.g. john_doe"
              required
              autoComplete="username"
            />
            <Input
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
            <div className="relative">
              <Input
                id="password"
                label="Password"
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPw((p) => !p)}
                className="absolute right-3 top-7 text-[#9B9B9B] hover:text-[#6B6B6B] transition-colors"
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 border border-red-200 bg-red-50 rounded px-3 py-2.5">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0">
                  <circle cx="7" cy="7" r="6" stroke="#DC2626" strokeWidth="1.5"/>
                  <path d="M7 4.5v3M7 9.5h.01" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Create account
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#E2E1DC]">
            <p className="text-sm text-[#6B6B6B]">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-[#0F0F0F] hover:text-[#CA8A04] transition-colors">
                Sign in
              </Link>
            </p>
            <p className="mt-2 text-xs text-[#ABABAB]">
              <Link to="/" className="hover:text-[#6B6B6B] transition-colors">← Back to home</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
