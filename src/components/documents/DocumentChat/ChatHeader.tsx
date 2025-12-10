import { MessageSquare, X } from 'lucide-react'

interface ChatHeaderProps {
  documentCount: number
  pageCount: number
  onClose: () => void
}

export default function ChatHeader({ documentCount, pageCount, onClose }: ChatHeaderProps) {
  return (
    <div className="px-4 py-3 border-b border-slate-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-copper/10 rounded-xl flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-copper" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-navy">Ask Your Documents</h3>
            <p className="text-xs text-slate-500">{documentCount} documents · {pageCount} pages</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
