interface ReadinessDonutProps {
  percentage: number
  rating: 'RED' | 'AMBER' | 'GREEN'
  size?: number // default 100px
}

const getRatingColor = (rating: 'RED' | 'AMBER' | 'GREEN') => {
  switch (rating) {
    case 'RED': return '#dc2626'
    case 'AMBER': return '#f59e0b'
    case 'GREEN': return '#16a34a'
    default: return '#64748b'
  }
}

export default function ReadinessDonut({ percentage, rating, size = 100 }: ReadinessDonutProps) {
  const radius = (size * 0.4) // 40% of size for radius
  const strokeWidth = size * 0.12 // 12% of size for stroke
  const normalizedRadius = radius - strokeWidth / 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="readiness-donut" style={{ width: size, height: size, position: 'relative' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={normalizedRadius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={normalizedRadius}
          fill="none"
          stroke={getRatingColor(rating)}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{
            transition: 'stroke-dashoffset 0.5s ease'
          }}
        />
      </svg>
      {/* Center text */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center'
        }}
      >
        <div style={{ fontSize: size * 0.18, fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>
          {percentage}%
        </div>
        <div style={{ fontSize: size * 0.11, color: '#64748b', marginTop: size * 0.03 }}>
          Ready
        </div>
      </div>
    </div>
  )
}
