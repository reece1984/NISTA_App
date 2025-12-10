import { MessageSquare, Plus } from 'lucide-react'
import { cn } from '../../lib/utils'

interface DocumentsHeaderProps {
  documentCount: number
  pageCount: number
  uploadedCount: number
  totalRecommended: number
  isChatOpen: boolean
  onChatToggle: () => void
  onUploadClick: () => void
}

export default function DocumentsHeader({
  documentCount,
  pageCount,
  uploadedCount,
  totalRecommended,
  isChatOpen,
  onChatToggle,
  onUploadClick,
}: DocumentsHeaderProps) {
  return (
    <div className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Documents</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {uploadedCount} of {totalRecommended} recommended documents uploaded · {pageCount.toLocaleString()} pages indexed
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onChatToggle}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors",
              isChatOpen
                ? "border-copper bg-copper/5 text-copper"
                : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
            )}
          >
            <MessageSquare className="w-4 h-4" />
            Ask Documents
          </button>
          <button
            onClick={onUploadClick}
            className="inline-flex items-center gap-2 px-4 py-2 bg-navy hover:bg-slate-800 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Upload Document
          </button>
        </div>
      </div>
    </div>
  )
}
