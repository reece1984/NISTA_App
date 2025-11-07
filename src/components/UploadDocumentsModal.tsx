import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, X, Loader2, AlertCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useDocumentTypes } from '../hooks/useDocumentTypes'
import Modal from './ui/Modal'
import Button from './ui/Button'

interface FileWithType extends File {
  id: string
  selectedType: string | null
  uploading: boolean
  error: string | null
}

interface UploadDocumentsModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: number
  currentDocumentCount: number
  onUploadComplete: () => void
}

export default function UploadDocumentsModal({
  isOpen,
  onClose,
  projectId,
  currentDocumentCount,
  onUploadComplete,
}: UploadDocumentsModalProps) {
  const [fileQueue, setFileQueue] = useState<FileWithType[]>([])
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const { data: documentTypesData, isLoading: loadingTypes } = useDocumentTypes()

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      // Check max files limit
      if (currentDocumentCount + fileQueue.length + acceptedFiles.length > 50) {
        setToast({
          message: `Maximum 50 documents per project. You can upload ${50 - currentDocumentCount - fileQueue.length} more.`,
          type: 'error',
        })
        return
      }

      // Handle rejected files
      if (rejectedFiles.length > 0) {
        const reasons = rejectedFiles.map((f) => {
          if (f.errors[0]?.code === 'file-too-large') {
            return `${f.file.name}: File too large (max 50MB)`
          }
          if (f.errors[0]?.code === 'file-invalid-type') {
            return `${f.file.name}: Only PDF files allowed`
          }
          return `${f.file.name}: Invalid file`
        })
        setToast({
          message: reasons.join(', '),
          type: 'error',
        })
      }

      // Add accepted files to queue
      const newFiles: FileWithType[] = acceptedFiles.map((file) => {
        const fileWithType = file as FileWithType
        fileWithType.id = Math.random().toString(36).substring(7)
        fileWithType.selectedType = null
        fileWithType.uploading = false
        fileWithType.error = null
        return fileWithType
      })

      setFileQueue((prev) => [...prev, ...newFiles])
    },
    [currentDocumentCount, fileQueue.length]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: true,
  })

  const updateFileType = (fileId: string, documentType: string) => {
    setFileQueue((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, selectedType: documentType } : f))
    )
  }

  const removeFile = (fileId: string) => {
    setFileQueue((prev) => prev.filter((f) => f.id !== fileId))
  }

  const clearAll = () => {
    setFileQueue([])
  }

  const uploadFile = async (file: FileWithType) => {
    if (!file.selectedType) {
      return
    }

    // Mark as uploading
    setFileQueue((prev) =>
      prev.map((f) => (f.id === file.id ? { ...f, uploading: true, error: null } : f))
    )

    try {
      // Get document category
      const typeData = documentTypesData?.types.find((t) => t.name === file.selectedType)
      if (!typeData) {
        throw new Error('Document type not found')
      }

      // Get next display order
      const { data: maxOrderData } = await supabase
        .from('files')
        .select('display_order')
        .eq('projectId', projectId)
        .order('display_order', { ascending: false })
        .limit(1)
        .maybeSingle()

      const nextDisplayOrder = (maxOrderData?.display_order || 0) + 1

      // Upload to storage
      const timestamp = Date.now()
      const filePath = `projects/${projectId}/${timestamp}_${file.name}`

      const { error: storageError } = await supabase.storage
        .from('project-documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (storageError) throw storageError

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('project-documents').getPublicUrl(filePath)

      // Insert file record
      const { data: fileRecord, error: dbError } = await supabase
        .from('files')
        .insert({
          projectId: projectId,
          fileName: file.name,
          fileType: file.selectedType,
          fileUrl: publicUrl,
          fileKey: filePath,
          document_type: file.selectedType,
          document_category: typeData.category,
          display_order: nextDisplayOrder,
          status: 'uploaded',
        })
        .select()
        .single()

      if (dbError) {
        console.error('Database insert error:', dbError)
        throw new Error(dbError.message || 'Failed to save file to database')
      }

      // Trigger N8N webhook
      const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL || import.meta.env.VITE_N8N_RUN_ASSESSMENT_WEBHOOK
      if (webhookUrl) {
        try {
          await fetch(webhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              identifier: 'document_upload',
              fileId: fileRecord.id,
              projectId: projectId,
              fileName: file.name,
              fileUrl: publicUrl,
              fileKey: filePath,
            }),
          })
        } catch (webhookError) {
          console.error('Webhook error:', webhookError)
          // Don't throw - file is uploaded, webhook failure is not critical
        }
      }

      // Remove from queue
      setFileQueue((prev) => prev.filter((f) => f.id !== file.id))
      setToast({
        message: `${file.name} uploaded successfully`,
        type: 'success',
      })
    } catch (error: any) {
      console.error('Upload error:', error)
      setFileQueue((prev) =>
        prev.map((f) =>
          f.id === file.id
            ? { ...f, uploading: false, error: error.message || 'Upload failed' }
            : f
        )
      )
      setToast({
        message: `Failed to upload ${file.name}: ${error.message}`,
        type: 'error',
      })
    }
  }

  const uploadAll = async () => {
    const filesToUpload = fileQueue.filter((f) => f.selectedType && !f.uploading)

    for (const file of filesToUpload) {
      await uploadFile(file)
    }

    // Refresh documents list
    onUploadComplete()

    // Close modal if all uploads successful
    if (fileQueue.length === 0) {
      onClose()
    }
  }

  const allFilesHaveTypes = fileQueue.every((f) => f.selectedType)
  const canUploadAll = fileQueue.length > 0 && allFilesHaveTypes && !fileQueue.some((f) => f.uploading)

  const handleClose = () => {
    if (fileQueue.some((f) => f.uploading)) {
      if (confirm('Files are still uploading. Are you sure you want to close?')) {
        onClose()
        setFileQueue([])
      }
    } else {
      onClose()
      setFileQueue([])
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Upload Project Documents" size="lg">
      <div className="space-y-6">
        {/* Subtitle */}
        <p className="text-sm text-text-secondary">
          Add PDF documents for assessment (max 50 files, 50MB each)
        </p>

        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-secondary bg-secondary/5'
              : 'border-border hover:border-secondary hover:bg-gray-50'
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
              <Upload size={24} className="text-secondary" />
            </div>
            <div>
              <p className="text-base font-medium text-text-primary mb-1">
                {isDragActive ? 'Drop files here' : 'Drag and drop PDF files here'}
              </p>
              <p className="text-sm text-text-secondary">or click to browse</p>
            </div>
            <p className="text-xs text-text-secondary">
              Maximum 50 files • 50MB per file • PDF only
            </p>
          </div>
        </div>

        {/* File Queue */}
        {fileQueue.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text-primary">
                Files ready to upload ({fileQueue.length})
              </h3>
              <button
                onClick={clearAll}
                disabled={fileQueue.some((f) => f.uploading)}
                className="text-sm text-error hover:text-error/80 transition-colors disabled:opacity-50"
              >
                Clear all
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {fileQueue.map((file) => (
                <div key={file.id} className="border border-border rounded-lg p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <FileText size={20} className="text-rag-red flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                    {!file.uploading && (
                      <button
                        onClick={() => removeFile(file.id)}
                        className="flex-shrink-0 p-1 hover:bg-gray-100 rounded"
                      >
                        <X size={16} className="text-text-secondary" />
                      </button>
                    )}
                  </div>

                  {/* Document Type Selector */}
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-text-secondary mb-1">
                      Document Type *
                    </label>
                    <select
                      value={file.selectedType || ''}
                      onChange={(e) => updateFileType(file.id, e.target.value)}
                      disabled={file.uploading || loadingTypes}
                      className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:border-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">Select document type...</option>
                      {documentTypesData?.grouped &&
                        Object.entries(documentTypesData.grouped).map(([category, types]) => (
                          <optgroup key={category} label={category}>
                            {types.map((type) => (
                              <option key={type.id} value={type.name}>
                                {type.name}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                    </select>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-2">
                    {file.uploading ? (
                      <span className="text-xs text-blue-600 flex items-center gap-1">
                        <Loader2 size={14} className="animate-spin" />
                        Uploading...
                      </span>
                    ) : file.error ? (
                      <span className="text-xs text-error flex items-center gap-1">
                        <AlertCircle size={14} />
                        {file.error}
                      </span>
                    ) : file.selectedType ? (
                      <span className="text-xs text-rag-green">Ready to upload</span>
                    ) : (
                      <span className="text-xs text-text-secondary">
                        Select document type to continue
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <Button variant="secondary" onClick={handleClose}>
            {fileQueue.length > 0 ? 'Close' : 'Cancel'}
          </Button>
          <Button
            variant="primary"
            onClick={uploadAll}
            disabled={!canUploadAll}
            className="flex items-center gap-2"
          >
            {fileQueue.some((f) => f.uploading) ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={18} />
                Upload All ({fileQueue.length})
              </>
            )}
          </Button>
        </div>

        {/* Toast notification */}
        {toast && (
          <div
            className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg ${
              toast.type === 'success'
                ? 'bg-rag-green text-white'
                : 'bg-error text-white'
            }`}
          >
            {toast.message}
          </div>
        )}
      </div>
    </Modal>
  )
}
