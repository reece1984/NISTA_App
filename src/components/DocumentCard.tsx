import { useState } from 'react'
import { FileText, Trash2, ExternalLink, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import type { ProjectDocument } from '../hooks/useDocuments'
import Button from './ui/Button'
import Modal from './ui/Modal'

interface DocumentCardProps {
  document: ProjectDocument
  onDelete: (document: ProjectDocument) => void
  deleting: boolean
}

export default function DocumentCard({ document, onDelete, deleting }: DocumentCardProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (seconds < 60) return 'Just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`
    return date.toLocaleDateString()
  }

  const getStatusBadge = () => {
    const status = document.status?.toLowerCase()

    if (status === 'completed' || status === 'processed') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-rag-green/10 text-rag-green border border-rag-green/30">
          <CheckCircle size={12} />
          Processed
        </span>
      )
    }

    if (status === 'processing') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
          <Loader2 size={12} className="animate-spin" />
          Processing
        </span>
      )
    }

    if (status === 'uploaded' || status === 'uploading') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
          <Loader2 size={12} className="animate-spin" />
          Uploading
        </span>
      )
    }

    if (status === 'error' || status === 'failed') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-rag-red/10 text-rag-red border border-rag-red/30">
          <AlertCircle size={12} />
          Error
        </span>
      )
    }

    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
        Pending
      </span>
    )
  }

  const handleDelete = () => {
    onDelete(document)
    setShowDeleteModal(false)
  }

  return (
    <>
      <div className="card hover:shadow-md transition-shadow">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-lg bg-rag-red/10 flex items-center justify-center">
              <FileText size={20} className="text-rag-red" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-text-primary mb-2 truncate">
              {document.file_name}
            </h3>

            <div className="flex flex-wrap items-center gap-3 text-sm text-text-secondary mb-2">
              {document.document_type && (
                <span className="px-2 py-0.5 rounded-md bg-secondary/10 text-secondary font-medium">
                  {document.document_type}
                </span>
              )}
              <span>Uploaded {formatRelativeTime(document.uploaded_at)}</span>
            </div>

            <div className="flex items-center gap-2">
              {getStatusBadge()}
            </div>
          </div>

          <div className="flex-shrink-0 flex items-center gap-2">
            {document.file_url && (
              <a
                href={document.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="View document"
              >
                <ExternalLink size={18} className="text-text-secondary" />
              </a>
            )}
            <button
              onClick={() => setShowDeleteModal(true)}
              disabled={deleting}
              className="p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              title="Delete document"
            >
              {deleting ? (
                <Loader2 size={18} className="text-error animate-spin" />
              ) : (
                <Trash2 size={18} className="text-error" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Document?"
        size="sm"
      >
        <p className="text-text-secondary mb-6">
          Are you sure you want to delete <strong>{document.file_name}</strong>? This will remove all
          embeddings and cannot be undone.
        </p>
        <div className="flex gap-4">
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)} className="flex-1">
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} className="flex-1" disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </Modal>
    </>
  )
}
