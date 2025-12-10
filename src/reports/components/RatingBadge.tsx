interface RatingBadgeProps {
  rating: 'RED' | 'AMBER' | 'GREEN'
  size?: 'small' | 'medium' | 'large'
}

export default function RatingBadge({ rating, size = 'small' }: RatingBadgeProps) {
  const sizeClasses = {
    small: 'text-[9pt] px-2 py-0.5',
    medium: 'text-[10pt] px-3 py-1',
    large: 'text-[11pt] px-4 py-1.5'
  }

  const colorClasses = {
    RED: 'bg-red-50 text-red-700 border-red-200',
    AMBER: 'bg-amber-50 text-amber-700 border-amber-200',
    GREEN: 'bg-green-50 text-green-700 border-green-200'
  }

  return (
    <span className={`rating-badge ${sizeClasses[size]} ${colorClasses[rating]} inline-block border rounded font-bold`}>
      {rating}
    </span>
  )
}
