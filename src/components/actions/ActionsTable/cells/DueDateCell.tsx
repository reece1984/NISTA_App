import { Calendar, AlertCircle } from 'lucide-react'
import { cn } from '../../../../lib/utils'
import { format, isToday, isTomorrow, isThisWeek } from 'date-fns'

interface DueDateCellProps {
  dueDate: string | null
  isOverdue?: boolean
}

export default function DueDateCell({ dueDate, isOverdue }: DueDateCellProps) {
  if (!dueDate) {
    return (
      <div className="flex items-center gap-1.5 text-slate-400">
        <Calendar className="w-3.5 h-3.5" />
        <span className="text-xs">No due date</span>
      </div>
    )
  }

  const date = new Date(dueDate)
  let dateText = format(date, 'MMM d, yyyy')

  // Show relative dates for soon items
  if (isToday(date)) {
    dateText = 'Today'
  } else if (isTomorrow(date)) {
    dateText = 'Tomorrow'
  } else if (isThisWeek(date)) {
    dateText = format(date, 'EEEE') // Day name
  }

  return (
    <div
      className={cn(
        'flex items-center gap-1.5',
        isOverdue ? 'text-red-600' : 'text-slate-700'
      )}
    >
      {isOverdue ? (
        <AlertCircle className="w-3.5 h-3.5" />
      ) : (
        <Calendar className="w-3.5 h-3.5" />
      )}
      <span className={cn('text-xs', isOverdue && 'font-medium')}>
        {dateText}
      </span>
    </div>
  )
}
