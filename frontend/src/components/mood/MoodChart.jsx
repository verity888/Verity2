import React from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { formatDate, MOOD_LABELS } from '../../utils/helpers'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const score = payload[0].value
    const mood = MOOD_LABELS[score]
    return (
      <div className="bg-white border border-[#E2E1DC] rounded px-3 py-2 shadow-md text-xs">
        <p className="font-semibold text-[#0F0F0F]">{label}</p>
        <p className="text-[#6B6B6B] mt-0.5">
          {mood?.emoji} {mood?.label} <span className="text-[#ABABAB]">({score}/5)</span>
        </p>
      </div>
    )
  }
  return null
}

export default function MoodChart({ entries }) {
  if (!entries || entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-2 text-center">
        <p className="text-sm font-medium text-[#6B6B6B]">No data yet</p>
        <p className="text-xs text-[#ABABAB]">Log your mood to start seeing your trend.</p>
      </div>
    )
  }

  const data = entries
    .slice()
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    .slice(-14)
    .map((e) => ({
      date: formatDate(e.created_at),
      score: e.score,
    }))

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
        <CartesianGrid strokeDasharray="2 4" stroke="#F0EFEA" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: '#ABABAB', fontFamily: 'Inter, system-ui, sans-serif' }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[1, 5]}
          ticks={[1, 2, 3, 4, 5]}
          tick={{ fontSize: 10, fill: '#ABABAB', fontFamily: 'Inter, system-ui, sans-serif' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#E2E1DC', strokeWidth: 1 }} />
        <Line
          type="monotone"
          dataKey="score"
          stroke="#FACC15"
          strokeWidth={2}
          dot={{ r: 3, fill: '#FACC15', strokeWidth: 0 }}
          activeDot={{ r: 5, fill: '#CA8A04', strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
