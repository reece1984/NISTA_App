import { useState } from 'react'
import { Search, FileText, MoreVertical, Loader2, Trash2, ExternalLink } from 'lucide-react'
import { formatUploadDate } from '../../utils/documentUtils'

interface Document {
  id: number
  name: string
  file_name: string
  file_url: string
  file_size: number
  page_count: number
  document_type: string
  document_case: string
  uploaded_at: string
  created_at: string
  status: 'indexed' | 'indexing' | 'error'
}

interface DocumentsTableProps {
  documents: Document[]
  onDeleteDocument: (doc: Document) => void
  deletingDocumentId: number | null
}

export default function DocumentsTable({
  documents,
  onDeleteDocument,
  deletingDocumentId
}: DocumentsTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [caseFilter, setCaseFilter] = useState('all')
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)

  // Get file type icon color based on extension
  const getFileIconColor = (fileName: string | undefined) => {
    if (!fileName) return { bg: 'bg-slate-100', text: 'text-slate-600' }
    const ext = fileName.split('.').pop()?.toLowerCase()
    if (ext === 'pdf') return { bg: 'bg-red-100', text: 'text-red-600' }
    if (ext === 'xlsx' || ext === 'xls') return { bg: 'bg-green-100', text: 'text-green-600' }
    if (ext === 'docx' || ext === 'doc') return { bg: 'bg-blue-100', text: 'text-blue-600' }
    return { bg: 'bg-slate-100', text: 'text-slate-600' }
  }

  // Get case indicator color
  const getCaseColor = (docCase: string) => {
    const caseLower = docCase?.toLowerCase() || ''
    if (caseLower.includes('financial')) return 'bg-amber-500'
    if (caseLower.includes('economic')) return 'bg-emerald-500'
    if (caseLower.includes('commercial')) return 'bg-violet-500'
    if (caseLower.includes('management')) return 'bg-rose-500'
    if (caseLower.includes('strategic')) return 'bg-blue-500'
    return 'bg-slate-400'
  }

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = (doc.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                         (doc.file_name?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === 'all' || doc.document_type === typeFilter
    const matchesCase = caseFilter === 'all' || doc.document_case === caseFilter
    return matchesSearch && matchesType && matchesCase
  })

  return (
    <>
      {/* Table Filters */}
      <div className="p-2 border-b border-slate-100 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-copper/20 focus:border-copper"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-copper/20 bg-white"
          >
            <option value="all">All Types</option>
            <option value="Business Case">Business Case</option>
            <option value="Risk Register">Risk Register</option>
            <option value="Benefits Plan">Benefits Plan</option>
            <option value="Other">Other</option>
          </select>
          <select
            value={caseFilter}
            onChange={(e) => setCaseFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-copper/20 bg-white"
          >
            <option value="all">All Cases</option>
            <option value="Strategic">Strategic</option>
            <option value="Economic">Economic</option>
            <option value="Commercial">Commercial</option>
            <option value="Financial">Financial</option>
            <option value="Management">Management</option>
          </select>
        </div>
      </div>

      {/* Table - scrollable */}
      <div className="flex-1 overflow-auto min-h-0">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 text-left">
              <th className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Document</th>
              <th className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
              <th className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Case</th>
              <th className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Pages</th>
              <th className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Uploaded</th>
              <th className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
        <tbody className="divide-y divide-slate-100">
          {filteredDocuments.length > 0 ? (
            filteredDocuments.map((doc) => {
              const { bg, text } = getFileIconColor(doc.file_name)
              const isDeleting = deletingDocumentId === doc.id
              const isMenuOpen = openMenuId === doc.id

              return (
                <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-3 py-2 max-w-[280px]">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <FileText className={`w-4 h-4 ${text}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-navy truncate">{doc.name}</p>
                        <p className="text-xs text-slate-400 truncate">{doc.file_name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span className="text-sm text-slate-600">{doc.document_type || 'Other'}</span>
                  </td>
                  <td className="px-3 py-2">
                    <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
                      <span className={`w-2 h-2 rounded-full ${getCaseColor(doc.document_case)}`}></span>
                      {doc.document_case || 'Not specified'}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-sm text-slate-600">{doc.page_count || 0}</td>
                  <td className="px-3 py-2 text-sm text-slate-500">{formatUploadDate(doc.uploaded_at || doc.created_at)}</td>
                  <td className="px-3 py-2">
                    {doc.status === 'indexed' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                        Indexed
                      </span>
                    ) : doc.status === 'indexing' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Indexing
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-700 text-xs font-medium rounded-full">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                        Error
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenuId(isMenuOpen ? null : doc.id)}
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <MoreVertical className="w-5 h-5" />
                        )}
                      </button>

                      {isMenuOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setOpenMenuId(null)}
                          />
                          <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden">
                            <button
                              onClick={() => {
                                window.open(doc.file_url, '_blank')
                                setOpenMenuId(null)
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                              View Document
                            </button>
                            <button
                              onClick={() => {
                                onDeleteDocument(doc)
                                setOpenMenuId(null)
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-slate-100"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete Document
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })
          ) : (
            <tr>
              <td colSpan={7} className="px-4 py-12 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">No documents found</p>
                    <p className="text-xs text-slate-400 mt-1">Try adjusting your search or filters</p>
                  </div>
                </div>
              </td>
            </tr>
          )}
        </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="px-3 py-1.5 border-t border-slate-100 flex items-center justify-between flex-shrink-0">
        <p className="text-xs text-slate-500">Showing {filteredDocuments.length} of {documents.length} documents</p>
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-400 cursor-not-allowed"
            disabled
          >
            Previous
          </button>
          <button
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-400 cursor-not-allowed"
            disabled
          >
            Next
          </button>
        </div>
      </div>
    </>
  )
}
