import { cn } from '../../../../lib/utils'
import type { ActionStatus } from '../../../../types/actions'

interface StatusBadgeProps {
  status: ActionStatus
}

const statusConfig = {
  not_started: {
    label: 'Not Started',
    className: 'bg-slate-100 text-slate-700 border-slate-200'
  },
  in_progress: {
    label: 'In Progress',
    className: 'bg-amber-50 text-amber-700 border-amber-200'
  },
  completed: {
    label: 'Completed',
    className: 'bg-green-50 text-green-700 border-green-200'
  },
  blocked: {
    label: 'Blocked',
    className: 'bg-purple-50 text-purple-700 border-purple-200'
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-slate-100 text-slate-500 border-slate-200'
  },
  wont_fix: {
    label: "Won't Fix",
    className: 'bg-slate-100 text-slate-500 border-slate-200'
  }
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.not_started

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-1 text-xs font-medium rounded border',
        config.className
      )}
    >
      {config.label}
    </span>
  )
}
