import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import VerityFace from './VerityFace'

const STEPS = [
  {
    title: 'Welcome to Verity',
    icon: null, // uses VerityFace
    body: (
      <>
        <p className="text-sm text-[#6B6B6B] leading-relaxed mb-3">
          Verity is your private, always-available mental health companion — built on
          honesty, empathy, and genuine support.
        </p>
        <p className="text-sm text-[#6B6B6B] leading-relaxed">
          This quick guide will have you up and running in under two minutes.
        </p>
      </>
    ),
  },
  {
    title: 'Connect an AI provider',
    icon: '⚙️',
    body: (
      <>
        <p className="text-sm text-[#6B6B6B] leading-relaxed mb-3">
          Verity uses your own API key so your conversations stay private and you stay
          in control of costs.
        </p>
        <ol className="space-y-2 text-sm text-[#6B6B6B]">
          <li className="flex gap-2"><span className="font-bold text-[#CA8A04] shrink-0">1.</span>Click <span className="font-semibold text-[#0F0F0F]">Settings</span> (gear icon in the sidebar).</li>
          <li className="flex gap-2"><span className="font-bold text-[#CA8A04] shrink-0">2.</span>Choose a provider: <span className="font-semibold text-[#0F0F0F]">Gemini</span>, <span className="font-semibold text-[#0F0F0F]">OpenAI</span>, <span className="font-semibold text-[#0F0F0F]">Anthropic</span>, or <span className="font-semibold text-[#0F0F0F]">OpenRouter</span>.</li>
          <li className="flex gap-2"><span className="font-bold text-[#CA8A04] shrink-0">3.</span>Paste your API key and click <span className="font-semibold text-[#0F0F0F]">Save settings</span>.</li>
        </ol>
        <div className="mt-4 bg-[#FFFBEB] border border-[#FDE68A] rounded px-3 py-2.5 text-xs text-[#92400E]">
          <span className="font-semibold">Tip:</span> Don't have a key? OpenRouter offers free-tier models at{' '}
          <a href="https://openrouter.ai" target="_blank" rel="noreferrer" className="underline">openrouter.ai</a>.
          Google Gemini also has a generous free tier at{' '}
          <a href="https://ai.google.dev" target="_blank" rel="noreferrer" className="underline">ai.google.dev</a>.
        </div>
      </>
    ),
  },
  {
    title: 'Start a conversation',
    icon: '💬',
    body: (
      <>
        <p className="text-sm text-[#6B6B6B] leading-relaxed mb-3">
          Once your key is saved, head to <span className="font-semibold text-[#0F0F0F]">Chat</span> in the sidebar.
          Start a new conversation and talk about whatever is on your mind.
        </p>
        <p className="text-sm text-[#6B6B6B] leading-relaxed mb-3">
          Verity listens without judgment and responds with care. You can have as many
          separate conversations as you like — each one is saved automatically.
        </p>
        <p className="text-sm text-[#6B6B6B] leading-relaxed">
          If a model is unavailable or your quota runs out, Verity automatically tries the
          next best option so the conversation continues uninterrupted.
        </p>
      </>
    ),
  },
  {
    title: 'Track your mood',
    icon: '📈',
    body: (
      <>
        <p className="text-sm text-[#6B6B6B] leading-relaxed mb-3">
          Visit the <span className="font-semibold text-[#0F0F0F]">Dashboard</span> to log how you are feeling each day
          on a scale of 1–10 and add an optional note.
        </p>
        <p className="text-sm text-[#6B6B6B] leading-relaxed">
          Over time you will see a chart of your emotional patterns — a quiet, honest
          picture of your wellbeing that belongs only to you.
        </p>
      </>
    ),
  },
  {
    title: "You're all set",
    icon: '✓',
    body: (
      <>
        <p className="text-sm text-[#6B6B6B] leading-relaxed mb-3">
          Verity is here whenever you need it — at 2 am, between meetings, or in those
          moments when you just need someone to talk to.
        </p>
        <p className="text-sm text-[#6B6B6B] leading-relaxed">
          Remember: truth and support go hand in hand. Verity won't just tell you what
          you want to hear — it will help you find your footing, at your own pace.
        </p>
      </>
    ),
  },
]

export default function OnboardingModal({ onClose }) {
  const [step, setStep] = useState(0)
  const navigate = useNavigate()
  const isLast = step === STEPS.length - 1
  const current = STEPS[step]

  const handleFinish = () => {
    localStorage.setItem('verity_onboarded', '1')
    onClose()
    navigate('/settings')
  }

  const handleSkip = () => {
    localStorage.setItem('verity_onboarded', '1')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleSkip}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden">

        {/* Progress bar */}
        <div className="h-1 bg-[#F3F3F0]">
          <div
            className="h-1 bg-[#FACC15] transition-all duration-300"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-[#E2E1DC] flex items-center gap-3">
          {step === 0 ? (
            <VerityFace size={32} />
          ) : (
            <span className="text-2xl leading-none">{current.icon}</span>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-[#0F0F0F] leading-tight">{current.title}</h2>
            <p className="text-xs text-[#ABABAB] mt-0.5">Step {step + 1} of {STEPS.length}</p>
          </div>
          <button
            onClick={handleSkip}
            className="text-xs text-[#ABABAB] hover:text-[#6B6B6B] transition-colors shrink-0"
          >
            Skip
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">{current.body}</div>

        {/* Footer */}
        <div className="px-6 pb-6 flex items-center justify-between">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="px-4 py-2 text-sm text-[#6B6B6B] hover:text-[#0F0F0F] transition-colors disabled:opacity-0"
          >
            ← Back
          </button>

          {/* Step dots */}
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${i === step ? 'bg-[#0F0F0F]' : 'bg-[#E2E1DC]'}`}
              />
            ))}
          </div>

          {isLast ? (
            <button
              onClick={handleFinish}
              className="px-4 py-2 bg-[#FACC15] hover:bg-[#EAB800] text-[#0F0F0F] text-sm font-semibold rounded transition-colors"
            >
              Go to Settings →
            </button>
          ) : (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="px-4 py-2 bg-[#0F0F0F] hover:bg-[#2A2A2A] text-white text-sm font-semibold rounded transition-colors"
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
