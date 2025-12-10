import { Plus } from 'lucide-react'

interface SidebarFooterProps {
  onDismissAll: () => void
  onApproveAll: () => void
  actionsCount: number
}

export default function SidebarFooter({
  onDismissAll,
  onApproveAll,
  actionsCount
}: SidebarFooterProps) {
  return (
    <div className="p-5 border-t border-white/10 bg-navy-light">
      <div className="flex items-center gap-3 mb-3">
        <button className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
          <Plus className="w-4 h-4" />
          Add Manual Action
        </button>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onDismissAll}
          className="flex-1 px-4 py-2.5 text-sm font-medium text-white/70 hover:text-white border border-white/10 hover:border-white/20 rounded-lg transition-colors"
        >
          Dismiss All
        </button>
        <button
          onClick={onApproveAll}
          className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors shadow-lg"
        >
          Approve All ({actionsCount})
        </button>
      </div>
    </div>
  )
}
