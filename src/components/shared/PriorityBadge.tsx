import { cn } from '../../lib/utils'

interface PriorityBadgeProps {
  priority: 'low' | 'medium' | 'high' | 'critical'
  className?: string
}

const priorityConfig = {
  critical: {
    color: 'bg-red-600 text-white',
    label: 'Critical'
  },
  high: {
    color: 'bg-orange-500 text-white',
    label: 'High'
  },
  medium: {
    color: 'bg-yellow-400 text-gray-900',
    label: 'Medium'
  },
  low: {
    color: 'bg-slate-400 text-white',
    label: 'Low'
  }
}

export default function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = priorityConfig[priority]

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
