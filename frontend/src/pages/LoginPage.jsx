import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail } from 'lucide-react'
import { useAuthContext } from '../context/AuthContext'
import { authService } from '../services/authService'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import VerityFace from '../components/ui/VerityFace'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 2FA state
  const [step, setStep] = useState(1) // 1 = credentials, 2 = OTP
  const [userId, setUserId] = useState(null)
  const [otpHint, setOtpHint] = useState('')
  const [otp, setOtp] = useState('')

  const { login } = useAuthContext()
  const navigate = useNavigate()

  // Step 1: submit username + password
  const handleCredentials = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await authService.login(username, password)
      if (data.requiresOTP) {
        // 2FA enabled — show OTP step
        setUserId(data.userId)
        setOtpHint(data.message || 'A verification code has been sent to your email.')
        setStep(2)
      } else {
        // 2FA disabled — token returned directly
        login(data.user, data.token)
        navigate('/chat')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid username or password.')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: submit OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await authService.verify2FA(userId, otp)
      login(data.user, data.token)
      navigate('/chat')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired verification code.')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    setStep(1)
    setOtp('')
    setError('')
    setUserId(null)
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
            A space to<br />think out loud.
          </h2>
          <p className="text-sm text-[#9B9B9B] leading-relaxed max-w-xs">
            Verity listens without judgment and helps you make sense of what you're feeling.
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
          {step === 1 ? (
            <>
              <h1 className="font-serif text-3xl font-bold text-[#0F0F0F] mb-1">Sign in</h1>
              <p className="text-sm text-[#6B6B6B] mb-8">Welcome back. Enter your details to continue.</p>

              <form onSubmit={handleCredentials} className="space-y-5">
                <Input
                  id="username"
                  label="Username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="your_username"
                  required
                  autoComplete="username"
                  autoFocus
                />

                <div className="relative">
                  <Input
                    id="password"
                    label="Password"
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
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
                  Continue
                </Button>
              </form>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#F4F4F0] mb-5">
                <Mail size={18} className="text-[#0F0F0F]" />
              </div>
              <h1 className="font-serif text-3xl font-bold text-[#0F0F0F] mb-1">Check your email</h1>
              <p className="text-sm text-[#6B6B6B] mb-8">{otpHint}</p>

              <form onSubmit={handleVerifyOTP} className="space-y-5">
                <div>
                  <label htmlFor="otp" className="block text-xs font-semibold text-[#3B3B3B] mb-1.5 uppercase tracking-wide">
                    Verification code
                  </label>
                  <input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    required
                    autoFocus
                    autoComplete="one-time-code"
                    className="w-full border border-[#E2E1DC] rounded-md px-3 py-2.5 text-center text-2xl font-bold tracking-[0.4em] text-[#0F0F0F] bg-white placeholder-[#CECDC8] focus:outline-none focus:ring-2 focus:ring-[#0F0F0F] focus:border-transparent transition-all"
                  />
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
                  Verify & sign in
                </Button>

                <button
                  type="button"
                  onClick={handleBack}
                  className="w-full text-sm text-[#6B6B6B] hover:text-[#0F0F0F] transition-colors"
                >
                  ← Use a different account
                </button>
              </form>
            </>
          )}

          <div className="mt-8 pt-6 border-t border-[#E2E1DC]">
            <p className="text-sm text-[#6B6B6B]">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-[#0F0F0F] hover:text-[#CA8A04] transition-colors">
                Create one
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
