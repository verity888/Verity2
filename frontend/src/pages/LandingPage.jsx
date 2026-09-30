import React from 'react'
import { Link } from 'react-router-dom'
import VerityFace from '../components/ui/VerityFace'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col">

      {/* Top bar */}
      <header className="flex items-center px-8 py-5 border-b border-[#E2E1DC]">
        <div className="flex items-center gap-2.5">
          <VerityFace size={30} />
          <span className="text-sm font-bold tracking-tight text-[#0F0F0F]">Verity</span>
        </div>
        <nav className="ml-auto flex items-center gap-1">
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-medium text-[#6B6B6B] hover:text-[#0F0F0F] transition-colors"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 text-sm font-semibold bg-[#FACC15] hover:bg-[#EAB800] text-[#0F0F0F] rounded transition-colors"
          >
            Get started
          </Link>
        </nav>
      </header>

      <main className="flex-1 flex flex-col">

        {/* Editorial hero — asymmetric two-column */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 min-h-0">

          {/* Left: editorial copy */}
          <div className="flex flex-col justify-center px-8 md:px-16 py-20 border-r border-[#E2E1DC]">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#6B6B6B] mb-6">
              Mental wellness support
            </p>
            <h1 className="font-serif text-5xl md:text-6xl font-bold text-[#0F0F0F] leading-[1.08] mb-6">
              When it's hardest,<br />
              <em className="not-italic text-[#CA8A04]">truth holds.</em>
            </h1>
            <p className="text-base text-[#6B6B6B] leading-relaxed max-w-sm mb-5">
              In your darkest, most difficult moments — when everything feels uncertain and
              overwhelming — what you need most is not comfort that fades, but{' '}
              <span className="font-semibold text-[#0F0F0F]">
                honest truth and genuine support
              </span>{' '}
              that stays.
            </p>
            <p className="text-base text-[#6B6B6B] leading-relaxed max-w-sm mb-10">
              Verity is an empathetic AI companion built on that belief — always present,
              always honest, always on your side.
            </p>
            <div className="flex items-center gap-3">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0F0F0F] hover:bg-[#2A2A2A] text-white text-sm font-semibold rounded transition-colors"
              >
                Start for free
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-[#6B6B6B] hover:text-[#0F0F0F] transition-colors"
              >
                Sign in →
              </Link>
            </div>
          </div>

          {/* Right: feature list */}
          <div className="flex flex-col justify-center px-8 md:px-16 py-20">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#6B6B6B] mb-8">
              What Verity offers
            </p>
            <div className="space-y-0 divide-y divide-[#E2E1DC]">
              {[
                {
                  n: '01',
                  title: 'Empathetic AI conversation',
                  desc: "Talk freely about what's on your mind. Verity listens, reflects, and responds with care — available 24 hours a day.",
                },
                {
                  n: '02',
                  title: 'Gentle guidance, at your pace',
                  desc: 'When things feel heavy, Verity can offer a quiet starting point — simple reflections and perspectives to help you find your footing, entirely on your own terms.',
                },
                {
                  n: '03',
                  title: 'Mood tracking & patterns',
                  desc: 'Log how you feel each day and visualise emotional trends over time. Understand yourself through data.',
                },
                {
                  n: '04',
                  title: 'Private by design',
                  desc: 'Your conversations are yours. No advertising, no data selling. Simple, honest privacy.',
                },
              ].map((f) => (
                <div key={f.n} className="py-6 grid grid-cols-[40px_1fr] gap-4">
                  <span className="text-xs font-semibold text-[#C4C3BC] pt-0.5">{f.n}</span>
                  <div>
                    <p className="text-sm font-semibold text-[#0F0F0F] mb-1">{f.title}</p>
                    <p className="text-sm text-[#6B6B6B] leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Etymology banner — between hero/CTA and mission */}
        <div className="border-y border-[#E2E1DC] bg-[#FFFBEB] px-8 md:px-16 py-6">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#CA8A04] mb-2">
              Etymology
            </p>
            <p className="text-sm text-[#6B6B6B] leading-relaxed">
              <span className="font-bold text-[#0F0F0F]">ver·i·ty</span>
              {' '}<span className="italic text-[#ABABAB]">/ˈvɛrɪti/</span>
              {' '}— from Latin{' '}
              <span className="italic font-medium text-[#0F0F0F]">veritas</span>{' '}
              ("truth"), from{' '}
              <span className="italic font-medium text-[#0F0F0F]">verus</span>{' '}
              ("true"); via Old French{' '}
              <span className="italic font-medium text-[#0F0F0F]">verité</span>.
              First recorded in Middle English c. 14th century.{' '}
              <span className="font-semibold text-[#0F0F0F]">
                Meaning: a true principle or belief; the quality of being real or genuine; truth itself.
              </span>
            </p>
          </div>
        </div>

        {/* Company mission & motives */}
        <div className="border-t border-[#E2E1DC] px-8 md:px-16 py-16 bg-[#0F0F0F]">
          <div className="max-w-5xl mx-auto">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#CA8A04] mb-10">
              Our mission
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div>
                <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wide">
                  Why we exist
                </h3>
                <p className="text-sm text-[#ABABAB] leading-relaxed">
                  Mental health support is still out of reach for most people — too expensive,
                  too stigmatised, and unavailable precisely when you need it most. We believe
                  everyone deserves honest, compassionate support at any hour of the day.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wide">
                  Our commitment
                </h3>
                <p className="text-sm text-[#ABABAB] leading-relaxed">
                  We believe lasting wellbeing grows from clarity and understanding — not
                  from empty agreement. Verity gently helps you see things as they are,
                  so you can move forward with confidence. Truth, offered with care, is
                  the quiet foundation beneath every honest conversation.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wide">
                  Our values
                </h3>
                <ul className="text-sm text-[#ABABAB] space-y-2">
                  {[
                    'Truth over comfort',
                    'Empathy without judgement',
                    'Privacy as a right',
                    'Accessible to everyone',
                    'Present when it matters most',
                  ].map((v) => (
                    <li key={v} className="flex items-start gap-2">
                      <span className="text-[#CA8A04] mt-0.5 shrink-0">→</span>
                      {v}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

      </main>

      <footer className="px-8 py-5 border-t border-[#1A1A1A] bg-[#0F0F0F] flex items-center justify-between">
        <span className="text-xs text-[#5A5A5A]">© {new Date().getFullYear()} Verity</span>
        <span className="text-xs text-[#5A5A5A]">Truth in every conversation</span>
      </footer>
    </div>
  )
}
