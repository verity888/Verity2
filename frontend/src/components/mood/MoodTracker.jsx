import React, { useState } from 'react'
import { moodService } from '../../services/moodService'
import { MOOD_LABELS } from '../../utils/helpers'
import Button from '../ui/Button'

export default function MoodTracker({ onLogged }) {
  const [selected, setSelected] = useState(null)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async () => {
    if (!selected) return
    setLoading(true)
    try {
      await moodService.logMood(selected, note)
      setSuccess(true)
      setNote('')
      setSelected(null)
      onLogged?.()
      setTimeout(() => setSuccess(false), 3000)
    } catch {
      // silent fail
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="section-card">
      <div className="px-6 py-4 border-b border-[#E2E1DC]">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#ABABAB] mb-0.5">
          Check in
        </p>
        <h3 className="text-base font-semibold text-[#0F0F0F]">How are you feeling?</h3>
        <p className="text-sm text-[#6B6B6B] mt-0.5">Select a mood to log your emotional state.</p>
      </div>

      <div className="px-6 py-5 space-y-5">
        {/* Mood grid */}
        <div className="flex items-stretch gap-2">
          {Object.entries(MOOD_LABELS).map(([score, { emoji, label }]) => (
            <button
              key={score}
              onClick={() => setSelected(Number(score))}
              className={`
                flex-1 flex flex-col items-center gap-1.5 py-3 rounded border transition-colors
                ${selected === Number(score)
                  ? 'border-[#FACC15] bg-[#FFFBEB]'
                  : 'border-[#E2E1DC] bg-white hover:border-[#C4C3BC] hover:bg-[#FAFAF8]'
                }
              `}
            >
              <span className="text-xl">{emoji}</span>
              <span className="text-[10px] font-medium text-[#6B6B6B]">{label}</span>
            </button>
          ))}
        </div>

        {/* Note */}
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a note (optional)"
          rows={2}
          className="field-input resize-none"
        />

        {success && (
          <div className="flex items-center gap-2 border border-green-200 bg-green-50 rounded px-3 py-2.5">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0">
              <circle cx="7" cy="7" r="6" stroke="#16A34A" strokeWidth="1.5"/>
              <path d="M4.5 7l2 2 3-3" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p className="text-xs text-green-700">Mood logged.</p>
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={!selected}
          loading={loading}
          className="w-full"
        >
          Log mood
        </Button>
      </div>
    </div>
  )
}
