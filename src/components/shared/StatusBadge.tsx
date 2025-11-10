import { cn } from '../../lib/utils'

interface StatusBadgeProps {
  status: 'not_started' | 'in_progress' | 'completed' | 'wont_fix'
  className?: string
}

const statusConfig = {
  not_started: {
    color: 'bg-gray-200 text-gray-700',
    label: 'Not Started'
  },
  in_progress: {
    color: 'bg-blue-500 text-white',
    label: 'In Progress'
  },
  completed: {
    color: 'bg-green-500 text-white',
    label: 'Completed'
  },
  wont_fix: {
    color: 'bg-gray-500 text-white',
    label: "Won't Fix"
  }
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
        config.color,
        className
      )}
    >
      {config.label}
    </span>
  )
}
