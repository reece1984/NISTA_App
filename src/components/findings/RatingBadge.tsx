interface RatingBadgeProps {
  rating: 'RED' | 'AMBER' | 'GREEN'
  size?: 'small' | 'medium' | 'large'
}

export default function RatingBadge({ rating, size = 'small' }: RatingBadgeProps) {
  const sizeClasses = {
    small: 'text-xs px-2 py-0.5',
    medium: 'text-sm px-3 py-1',
    large: 'text-base px-4 py-1.5'
  }

  const colorClasses = {
    RED: 'bg-red-100 text-red-700 border-red-300',
    AMBER: 'bg-amber-100 text-amber-700 border-amber-300',
    GREEN: 'bg-green-100 text-green-700 border-green-300'
  }

  return (
    <span className={`inline-flex items-center justify-center border rounded font-semibold uppercase ${sizeClasses[size]} ${colorClasses[rating]}`}>
      {rating}
    </span>
  )
}
