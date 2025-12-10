import { AlertCircle } from 'lucide-react'
import { cn } from '../../../../lib/utils'
import type { ActionPriority } from '../../../../types/actions'

interface PriorityBadgeProps {
  priority: ActionPriority
}

const priorityConfig = {
  critical: {
    label: 'Critical',
    className: 'bg-red-50 text-red-700 border-red-200',
    iconColor: 'text-red-500'
  },
  high: {
    label: 'High',
    className: 'bg-orange-50 text-orange-700 border-orange-200',
    iconColor: 'text-orange-500'
  },
  medium: {
    label: 'Medium',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
    iconColor: 'text-amber-500'
  },
  low: {
    label: 'Low',
    className: 'bg-slate-100 text-slate-600 border-slate-200',
    iconColor: 'text-slate-400'
  }
}

export default function PriorityBadge({ priority }: PriorityBadgeProps) {
  const config = priorityConfig[priority] || priorityConfig.medium

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded border',
        config.className
      )}
    >
      <AlertCircle className={cn('w-3 h-3', config.iconColor)} />
      {config.label}
    </span>
  )
}
