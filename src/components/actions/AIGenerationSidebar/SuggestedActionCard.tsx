import { User, Calendar, Edit2, X, Check } from 'lucide-react'
import { format } from 'date-fns'
import type { SuggestedAction } from '../../../types/actions'
import { cn } from '../../../lib/utils'

interface SuggestedActionCardProps {
  action: SuggestedAction
  onApprove: () => void
  onReject: () => void
}

const priorityConfig = {
  critical: { label: 'Critical', className: 'bg-red-500/20 text-red-300' },
  high: { label: 'High', className: 'bg-orange-500/20 text-orange-300' },
  medium: { label: 'Medium', className: 'bg-amber-500/20 text-amber-300' },
  low: { label: 'Low', className: 'bg-slate-500/20 text-slate-300' }
}

const ragConfig = {
  RED: { label: 'RED', className: 'bg-red-500/30 text-red-300' },
  AMBER: { label: 'AMBER', className: 'bg-amber-500/30 text-amber-300' },
  GREEN: { label: 'GREEN', className: 'bg-green-500/30 text-green-300' }
}

export default function SuggestedActionCard({
  action,
  onApprove,
  onReject
}: SuggestedActionCardProps) {
  const priority = priorityConfig[action.priority]
  const rag = ragConfig[action.criterion_rag]

  return (
    <div className="bg-white/10 rounded-xl p-4 border border-white/10 hover:bg-white/[0.12] transition-colors">
      {/* Header: Priority + Criterion + Impact */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={cn('px-2 py-0.5 text-[10px] font-bold rounded uppercase', priority.className)}>
            {priority.label}
          </span>
          <span className="text-xs text-white/40">•</span>
          <span className="text-xs text-white/40">{action.criterion_code}</span>
        </div>
        <span className="text-sm font-semibold text-green-400">+{action.estimated_impact}%</span>
      </div>

      {/* Title */}
      <h4 className="text-sm font-semibold text-white mb-1">{action.title}</h4>

      {/* Description */}
      <p className="text-xs text-white/50 mb-3 line-clamp-2">{action.description}</p>

      {/* Linked Criterion */}
      <div className="flex items-center gap-2 mb-3 px-2 py-1.5 bg-red-500/10 rounded-lg">
        <span className={cn('px-1.5 py-0.5 text-[9px] font-bold rounded', rag.className)}>
          {rag.label}
        </span>
        <span className="text-[11px] text-white/60 truncate">{action.criterion_name}</span>
      </div>

      {/* Meta Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-[11px] text-white/40">
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" />
            Unassigned
          </span>
          {action.suggested_due_date && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {format(new Date(action.suggested_due_date), 'MMM d, yyyy')}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          <button
            title="Edit"
            className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={onReject}
            title="Reject"
            className="p-1.5 text-red-400/60 hover:text-red-400 hover:bg-white/10 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <button
            onClick={onApprove}
            title="Approve"
            className="p-1.5 text-green-400/60 hover:text-green-400 hover:bg-white/10 rounded transition-colors"
          >
            <Check className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
