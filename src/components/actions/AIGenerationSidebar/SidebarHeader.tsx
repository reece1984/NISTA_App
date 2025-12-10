import { Check, X } from 'lucide-react'

interface SidebarHeaderProps {
  onClose: () => void
}

export default function SidebarHeader({ onClose }: SidebarHeaderProps) {
  return (
    <div className="p-5 border-b border-white/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
            <Check className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Draft Action Plan</h2>
            <p className="text-xs text-white/50">Review and approve actions</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
