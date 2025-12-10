import { ClipboardCheck } from 'lucide-react'
import { useRecommendedDocs } from '../../../hooks/useRecommendedDocs'
import RecommendedDocItem from './RecommendedDocItem'
import UploadProgress from './UploadProgress'
import type { Document } from '../../../types/document'
import type { RecommendedDocument } from '../../../types/recommendedDocuments'

interface RecommendedDocsSidebarProps {
  projectGate: string
  documents: Document[]
  onUploadClick: (recommendedDoc: RecommendedDocument) => void
}

export default function RecommendedDocsSidebar({
  projectGate,
  documents,
  onUploadClick
}: RecommendedDocsSidebarProps) {
  const recommendations = useRecommendedDocs(projectGate, documents)

  if (!recommendations) return null

  return (
    <div className="w-[260px] border-r border-slate-200 bg-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <ClipboardCheck className="w-3.5 h-3.5" />
          Recommended for
        </div>
        <p className="text-base font-bold text-navy mt-1">
          {recommendations.gateName}
        </p>
      </div>

      {/* Checklist */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {recommendations.documents.map(doc => (
          <RecommendedDocItem
            key={doc.id}
            document={doc}
            onUploadClick={() => onUploadClick(doc)}
          />
        ))}
      </div>

      {/* Progress Footer */}
      <UploadProgress
        uploaded={recommendations.uploadedCount}
        total={recommendations.totalCount}
        percent={recommendations.progressPercent}
      />
    </div>
  )
}
