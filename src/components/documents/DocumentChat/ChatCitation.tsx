import { ChevronRight, FileText } from 'lucide-react'
import type { Citation } from '../../../types/documentChat'

interface ChatCitationProps {
  citation: Citation
  onClick?: () => void
}

export default function ChatCitation({ citation, onClick }: ChatCitationProps) {
  const fileExt = citation.file_name.split('.').pop()?.toLowerCase()

  const iconBgColor = fileExt === 'pdf' ? 'bg-red-100' :
                      fileExt === 'xlsx' || fileExt === 'xls' ? 'bg-green-100' :
                      fileExt === 'docx' || fileExt === 'doc' ? 'bg-blue-100' :
                      'bg-slate-100'

  const iconColor = fileExt === 'pdf' ? 'text-red-600' :
                    fileExt === 'xlsx' || fileExt === 'xls' ? 'text-green-600' :
                    fileExt === 'docx' || fileExt === 'doc' ? 'text-blue-600' :
                    'text-slate-600'

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg hover:border-copper hover:bg-copper/5 transition-colors group w-full text-left"
    >
      <div className={`w-6 h-6 ${iconBgColor} rounded flex items-center justify-center flex-shrink-0`}>
        <FileText className={`w-3 h-3 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-navy truncate">{citation.document_name}</p>
        <p className="text-xs text-slate-500">
          {citation.section && `${citation.section}, `}
          {citation.page_numbers && `Pages ${citation.page_numbers}`}
        </p>
      </div>
      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-copper transition-colors flex-shrink-0" />
    </button>
  )
}
