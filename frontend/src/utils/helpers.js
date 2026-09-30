export const MOOD_LABELS = {
  1: { label: 'Very Low', emoji: '😞', color: 'text-red-500', bg: 'bg-red-50 border-red-200' },
  2: { label: 'Low', emoji: '😟', color: 'text-orange-500', bg: 'bg-orange-50 border-orange-200' },
  3: { label: 'Okay', emoji: '😐', color: 'text-yellow-500', bg: 'bg-yellow-50 border-yellow-200' },
  4: { label: 'Good', emoji: '😊', color: 'text-lime-500', bg: 'bg-lime-50 border-lime-200' },
  5: { label: 'Excellent', emoji: '😄', color: 'text-green-500', bg: 'bg-green-50 border-green-200' },
}

export function formatTime(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

export function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatRelativeDate(dateStr) {
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = now - d
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return formatDate(dateStr)
}

export function getInitials(name = '') {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function truncate(str, max = 40) {
  if (!str) return ''
  return str.length > max ? str.slice(0, max) + '…' : str
}
