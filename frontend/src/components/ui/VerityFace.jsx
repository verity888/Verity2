/**
 * VerityFace — exact replica of the classic flat yellow smiley:
 * solid yellow circle, two plain black dot eyes, simple curved smile.
 * No gradients, no shine, no shadows.
 */
export default function VerityFace({ size = 32, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Yellow face */}
      <circle cx="50" cy="50" r="50" fill="#FACC15" />

      {/* Left eye */}
      <circle cx="35" cy="38" r="6.5" fill="#1C1917" />

      {/* Right eye */}
      <circle cx="65" cy="38" r="6.5" fill="#1C1917" />

      {/* Smile — simple arc */}
      <path
        d="M 28 58 Q 50 80 72 58"
        stroke="#1C1917"
        strokeWidth="5.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}
