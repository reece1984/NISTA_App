import { useState, useMemo } from 'react'
import { Search, FileText, Upload } from 'lucide-react'
import type { ProjectDocument } from '../hooks/useDocuments'
import DocumentCard from './DocumentCard'
import Button from './ui/Button'

interface DocumentsListProps {
  documents: ProjectDocument[]
  onDelete: (document: ProjectDocument) => void
  deletingId: number | null
  onUploadClick: () => void
}

export default function DocumentsList({
  documents,
  onDelete,
  deletingId,
  onUploadClick,
}: DocumentsListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Get unique document types for filter
  const documentTypes = useMemo(() => {
    const types = new Set<string>()
    documents.forEach((doc) => {
      if (doc.document_type) {
        types.add(doc.document_type)
      }
    })
    return Array.from(types).sort()
  }, [documents])

  // Filter documents
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchesSearch =
          doc.fileName.toLowerCase().includes(query) ||
          doc.document_type?.toLowerCase().includes(query) ||
          doc.document_category?.toLowerCase().includes(query)
        if (!matchesSearch) return false
      }

      // Type filter
      if (typeFilter !== 'all' && doc.document_type !== typeFilter) {
        return false
      }

      // Status filter
      if (statusFilter !== 'all') {
        const docStatus = doc.status?.toLowerCase()
        if (statusFilter === 'processed' && docStatus !== 'completed' && docStatus !== 'processed') {
          return false
        }
        if (statusFilter === 'processing' && docStatus !== 'processing' && docStatus !== 'uploaded') {
          return false
        }
        if (statusFilter === 'error' && docStatus !== 'error' && docStatus !== 'failed') {
          return false
        }
      }

      return true
    })
  }, [documents, searchQuery, typeFilter, statusFilter])

  const hasActiveFilters = searchQuery || typeFilter !== 'all' || statusFilter !== 'all'

  const clearFilters = () => {
    setSearchQuery('')
    setTypeFilter('all')
    setStatusFilter('all')
  }

  // Empty state when no documents uploaded
  if (documents.length === 0) {
    return (
      <div className="card text-center py-12">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center">
            <FileText size={32} className="text-secondary" />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-text-primary mb-2">No documents uploaded yet</h3>
        <p className="text-text-secondary mb-6">
          Upload project documents to begin your assessment
        </p>
        <Button variant="primary" onClick={onUploadClick} className="inline-flex items-center gap-2">
          <Upload size={18} />
          Upload First Document
        </Button>
      </div>
    )
  }

  return (
    <div>
      {/* Header with filters */}
      <div className="mb-6 space-y-4">
        {/* Search bar */}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary"
            size={18}
          />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-card text-text-primary placeholder-text-secondary focus:outline-none focus:border-secondary transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          {/* Type filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-border bg-card text-text-primary focus:outline-none focus:border-secondary transition-colors"
          >
            <option value="all">All Types</option>
            {documentTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-border bg-card text-text-primary focus:outline-none focus:border-secondary transition-colors"
          >
            <option value="all">All Status</option>
            <option value="processed">Processed</option>
            <option value="processing">Processing</option>
            <option value="error">Error</option>
          </select>

          {/* Clear filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-sm text-secondary hover:text-secondary/80 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Documents count */}
      <div className="mb-4 text-sm text-text-secondary">
        {filteredDocuments.length === documents.length ? (
          <span>{documents.length} {documents.length === 1 ? 'document' : 'documents'}</span>
        ) : (
          <span>
            {filteredDocuments.length} of {documents.length} documents
          </span>
        )}
      </div>

      {/* Documents grid */}
      {filteredDocuments.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-text-secondary mb-4">No documents found matching your filters.</p>
          <button
            onClick={clearFilters}
            className="text-secondary hover:text-secondary/80 font-medium"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDocuments.map((document) => (
            <DocumentCard
              key={document.id}
              document={document}
              onDelete={onDelete}
              deleting={deletingId === document.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}
