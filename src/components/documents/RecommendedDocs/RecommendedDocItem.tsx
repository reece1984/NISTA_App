import { Check, Plus } from 'lucide-react'
import type { RecommendedDocument } from '../../../types/recommendedDocuments'

interface RecommendedDocItemProps {
  document: RecommendedDocument
  onUploadClick: () => void
}

export default function RecommendedDocItem({ document, onUploadClick }: RecommendedDocItemProps) {
  if (document.isUploaded) {
    return (
      <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50/50 border border-green-100">
        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Check className="w-3 h-3 text-white" strokeWidth={3} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-navy">{document.name}</p>
          <p className="text-xs text-slate-500 mt-0.5">{document.description}</p>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={onUploadClick}
      className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors text-left group"
    >
      <div className="w-5 h-5 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:border-copper">
        <Plus className="w-3 h-3 text-slate-300 group-hover:text-copper" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-400 group-hover:text-navy">
          {document.name}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">{document.description}</p>
        <p className="text-xs text-copper font-medium mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
          Click to upload →
        </p>
      </div>
    </button>
  )
}
