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
    <div className="bg-white rounded-lg border border-slate-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-2 border-b border-slate-100 flex-shrink-0">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Recommended For
        </h3>
        <p className="text-sm font-semibold text-navy">
          {recommendations.gateName}
        </p>
      </div>

      {/* Checklist - scrollable */}
      <div className="flex-1 overflow-y-auto px-2 py-1.5 min-h-0">
        <div className="space-y-1">
          {recommendations.documents.map(doc => (
            <RecommendedDocItem
              key={doc.id}
              document={doc}
              onUploadClick={() => onUploadClick(doc)}
            />
          ))}
        </div>
      </div>

      {/* Progress Footer */}
      <div className="flex-shrink-0">
        <UploadProgress
          uploaded={recommendations.uploadedCount}
          total={recommendations.totalCount}
          percent={recommendations.progressPercent}
        />
      </div>
    </div>
  )
}
