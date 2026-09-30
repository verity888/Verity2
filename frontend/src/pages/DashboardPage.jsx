import React, { useEffect, useState } from 'react'
import MoodTracker from '../components/mood/MoodTracker'
import MoodChart from '../components/mood/MoodChart'
import { moodService } from '../services/moodService'
import { MOOD_LABELS, formatDate } from '../utils/helpers'
import { useAuthContext } from '../context/AuthContext'

function StatCard({ label, value, sub }) {
  return (
    <div className="stat-card">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-[#ABABAB] mb-2">{label}</p>
      <p className="text-3xl font-bold text-[#0F0F0F] leading-none">{value}</p>
      {sub && <p className="text-xs text-[#9B9B9B] mt-1">{sub}</p>}
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuthContext()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchEntries = async () => {
    try {
      const data = await moodService.getMoodEntries()
      setEntries(data)
    } catch {
      // no-op
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEntries()
  }, [])

  const avgScore = entries.length
    ? (entries.reduce((s, e) => s + e.score, 0) / entries.length).toFixed(1)
    : '—'

  const latest = entries.length ? entries[entries.length - 1] : null
  const latestMood = latest ? MOOD_LABELS[latest.score] : null

  const streak = (() => {
    if (!entries.length) return 0
    const days = new Set(entries.map((e) => new Date(e.created_at).toDateString()))
    let count = 0
    const d = new Date()
    while (days.has(d.toDateString())) {
      count++
      d.setDate(d.getDate() - 1)
    }
    return count
  })()

  return (
    <div className="flex-1 overflow-y-auto bg-[#FAFAF8]">
      {/* Page header */}
      <div className="bg-white border-b border-[#E2E1DC] px-6 py-5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#ABABAB] mb-1">
          Wellness
        </p>
        <h1 className="font-serif text-2xl font-bold text-[#0F0F0F]">
          Mood Dashboard
        </h1>
        {user?.name && (
          <p className="text-sm text-[#6B6B6B] mt-0.5">
            {user.name.split(' ')[0]}'s emotional wellbeing overview
          </p>
        )}
      </div>

      <div className="p-6 max-w-3xl space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Total logs" value={entries.length} sub="mood entries" />
          <StatCard label="Avg mood" value={avgScore} sub="out of 5.0" />
          <StatCard label="Day streak" value={streak} sub={streak === 1 ? 'consecutive day' : 'consecutive days'} />
          <StatCard
            label="Latest mood"
            value={latestMood ? latestMood.emoji : '—'}
            sub={latestMood ? latestMood.label : 'Not yet logged'}
          />
        </div>

        {/* Log mood */}
        <MoodTracker onLogged={fetchEntries} />

        {/* Chart */}
        <div className="section-card p-6">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#ABABAB] mb-1">Trend</p>
          <h3 className="text-base font-semibold text-[#0F0F0F] mb-5">Mood over time</h3>
          {loading ? (
            <div className="flex justify-center py-10">
              <span className="w-5 h-5 border-2 border-[#FACC15] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <MoodChart entries={entries} />
          )}
        </div>

        {/* Recent entries */}
        {entries.length > 0 && (
          <div className="section-card">
            <div className="px-6 py-4 border-b border-[#E2E1DC]">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#ABABAB] mb-0.5">History</p>
              <h3 className="text-base font-semibold text-[#0F0F0F]">Recent entries</h3>
            </div>
            <div className="divide-y divide-[#F0EFEA]">
              {[...entries]
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .slice(0, 7)
                .map((entry) => {
                  const mood = MOOD_LABELS[entry.score]
                  return (
                    <div key={entry.id} className="px-6 py-3.5 flex items-center gap-4">
                      <span className="text-xl flex-shrink-0">{mood.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#0F0F0F]">{mood.label}</p>
                        {entry.note && (
                          <p className="text-xs text-[#9B9B9B] mt-0.5 truncate">{entry.note}</p>
                        )}
                      </div>
                      <span className="text-xs text-[#ABABAB] flex-shrink-0">
                        {formatDate(entry.created_at)}
                      </span>
                    </div>
                  )
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
