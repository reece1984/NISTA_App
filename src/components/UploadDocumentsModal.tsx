import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, X, Loader2, AlertCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useDocumentTypes } from '../hooks/useDocumentTypes'
import Modal from './ui/Modal'
import Button from './ui/Button'

interface FileQueueItem {
  id: string
  file: File
  selectedType: string | null
  uploading: boolean
  error: string | null
  progress: number
  uploadStartTime: number | null
  estimatedTimeRemaining: number | null
  processingStatus: 'uploading' | 'processing' | 'complete'
  fileRecordId: number | null
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
  const [fileQueue, setFileQueue] = useState<FileQueueItem[]>([])
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
      const newFiles: FileQueueItem[] = acceptedFiles.map((file) => ({
        id: Math.random().toString(36).substring(7),
        file: file,
        selectedType: null,
        uploading: false,
        error: null,
        progress: 0,
        uploadStartTime: null,
        estimatedTimeRemaining: null,
        processingStatus: 'uploading' as const,
        fileRecordId: null,
      }))

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

  const uploadFile = async (queueItem: FileQueueItem) => {
    const file = queueItem.file

    if (!queueItem.selectedType) {
      return
    }

    // Mark as uploading
    const startTime = Date.now()
    setFileQueue((prev) =>
      prev.map((f) => (f.id === queueItem.id ? { ...f, uploading: true, error: null, progress: 0, uploadStartTime: startTime, estimatedTimeRemaining: null, processingStatus: 'uploading' } : f))
    )

    try {
      // Get document category
      const typeData = documentTypesData?.types.find((t) => t.name === queueItem.selectedType)
      if (!typeData) {
        throw new Error('Document type not found')
      }

      // Get next display order
      const { data: maxOrderData } = await supabase
        .from('files')
        .select('display_order')
        .eq('project_id', projectId)
        .order('display_order', { ascending: false })
        .limit(1)
        .maybeSingle()

      const nextDisplayOrder = (maxOrderData?.display_order || 0) + 1

      // Upload to storage with progress tracking
      const timestamp = Date.now()
      const filePath = `projects/${projectId}/${timestamp}_${file.name}`

      // Create XMLHttpRequest for upload with progress tracking
      const xhr = new XMLHttpRequest()

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100
          const elapsed = Date.now() - startTime
          const uploadSpeed = e.loaded / elapsed // bytes per ms
          const remaining = e.total - e.loaded
          const estimatedMs = remaining / uploadSpeed

          setFileQueue((prev) =>
            prev.map((f) =>
              f.id === queueItem.id
                ? { ...f, progress: Math.round(percentComplete), estimatedTimeRemaining: Math.round(estimatedMs / 1000) }
                : f
            )
          )
        }
      })

      // Get signed upload URL from Supabase
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('project-documents')
        .createSignedUploadUrl(filePath)

      if (uploadError) throw uploadError

      // Upload file using XMLHttpRequest for progress tracking
      await new Promise<void>((resolve, reject) => {
        xhr.open('PUT', uploadData.signedUrl)
        xhr.setRequestHeader('Content-Type', file.type || 'application/pdf')
        xhr.setRequestHeader('Cache-Control', '3600')

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve()
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`))
          }
        }

        xhr.onerror = () => reject(new Error('Network error during upload'))
        xhr.send(file)
      })

      // Update progress to 50% (upload complete, now processing)
      setFileQueue((prev) =>
        prev.map((f) =>
          f.id === queueItem.id
            ? { ...f, progress: 50, estimatedTimeRemaining: null, processingStatus: 'processing' }
            : f
        )
      )

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('project-documents').getPublicUrl(filePath)

      // Insert file record with 'processing' status initially
      const { data: fileRecord, error: dbError } = await supabase
        .from('files')
        .insert({
          project_id: projectId,
          file_name: file.name,
          file_type: queueItem.selectedType,
          file_url: publicUrl,
          file_key: filePath,
          document_type: queueItem.selectedType,
          document_category: typeData.category,
          display_order: nextDisplayOrder,
          status: 'processing',
          error_message: null,
        })
        .select()
        .single()

      if (dbError) {
        console.error('Database insert error:', dbError)
        throw new Error(dbError.message || 'Failed to save file to database')
      }

      // Store fileRecordId for polling
      setFileQueue((prev) =>
        prev.map((f) =>
          f.id === queueItem.id
            ? { ...f, fileRecordId: fileRecord.id }
            : f
        )
      )

      // Trigger N8N webhook for document processing
      const webhookUrl = import.meta.env.VITE_N8N_DOCUMENT_UPLOAD_WEBHOOK
      if (!webhookUrl) {
        throw new Error('N8N webhook URL not configured. Please add VITE_N8N_DOCUMENT_UPLOAD_WEBHOOK to your environment variables.')
      }

      const payload = {
        identifier: 'document_upload',
        file_id: fileRecord.id,
        project_id: projectId,
        file_name: file.name,
        file_url: publicUrl,
        file_key: filePath,
      }

      console.log('🔔 Triggering N8N webhook for fileId:', fileRecord.id, 'fileName:', file.name)
      console.log('📦 Webhook URL:', webhookUrl)
      console.log('📦 Payload:', payload)

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      console.log('✅ N8N Response Status:', response.status, 'for fileId:', fileRecord.id)

      if (!response.ok) {
        const responseText = await response.text()
        console.error('❌ N8N webhook error:', responseText)
        throw new Error(`Webhook failed with status ${response.status}: ${responseText}`)
      }

      const responseData = await response.json()
      console.log('📥 N8N Response:', responseData)

      // Poll document_embeddings table for processing status
      const pollInterval = setInterval(async () => {
        try {
          // Check if embeddings have been created for this file
          const { data: embeddings, error: pollError } = await supabase
            .from('document_embeddings')
            .select('id')
            .eq('file_id', fileRecord.id)

          if (pollError) {
            console.error('Poll error:', pollError)
            return
          }

          const embeddingCount = embeddings?.length || 0
          console.log(`📊 File ${fileRecord.id} has ${embeddingCount} embeddings`)

          // Update progress based on embedding count
          if (embeddingCount > 0) {
            // Processing complete - embeddings exist
            clearInterval(pollInterval)

            // Update file status to embedded
            await supabase
              .from('files')
              .update({
                status: 'embedded',
                chunks_count: embeddingCount
              })
              .eq('id', fileRecord.id)

            setFileQueue((prev) => {
              const newQueue = prev.filter((f) => f.id !== queueItem.id)

              // If queue is now empty, close modal after a short delay
              if (newQueue.length === 0) {
                setTimeout(() => {
                  onUploadComplete()
                  onClose()
                }, 1500)
              }

              return newQueue
            })

            setToast({
              message: `${file.name} uploaded and embedded successfully (${embeddingCount} chunks)`,
              type: 'success',
            })
          } else {
            // Still processing - update progress from 50% to 90%
            setFileQueue((prev) =>
              prev.map((f) =>
                f.id === queueItem.id
                  ? { ...f, progress: Math.min(90, 50 + Math.floor((Date.now() - startTime) / 2000)) }
                  : f
              )
            )
          }
        } catch (error) {
          console.error('Polling error:', error)
          clearInterval(pollInterval)
        }
      }, 3000) // Poll every 3 seconds

      // Timeout after 5 minutes
      setTimeout(() => {
        clearInterval(pollInterval)
        setFileQueue((prev) =>
          prev.map((f) =>
            f.id === queueItem.id && f.processingStatus === 'processing'
              ? { ...f, uploading: false, error: 'Processing timeout - please check document status' }
              : f
          )
        )
      }, 300000) // 5 minutes
    } catch (error: any) {
      console.error('Upload error:', error)
      const errorMessage = error.message || 'Upload failed'

      // If we have a file record ID, update its status to 'failed'
      if (queueItem.fileRecordId) {
        await supabase
          .from('files')
          .update({
            status: 'failed',
            error_message: errorMessage,
          })
          .eq('id', queueItem.fileRecordId)
      }

      setFileQueue((prev) =>
        prev.map((f) =>
          f.id === queueItem.id
            ? { ...f, uploading: false, error: errorMessage }
            : f
        )
      )
      setToast({
        message: `Failed to upload ${file.name}: ${errorMessage}`,
        type: 'error',
      })
    }
  }

  const uploadAll = async () => {
    const filesToUpload = fileQueue.filter((f) => f.selectedType && !f.uploading)

    for (const file of filesToUpload) {
      await uploadFile(file)
    }

    // Modal will auto-close when last file is removed from queue
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
              {fileQueue.map((queueItem) => (
                <div key={queueItem.id} className="border border-border rounded-lg p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <FileText size={20} className="text-rag-red flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {queueItem.file.name}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {(queueItem.file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                    {!queueItem.uploading && (
                      <button
                        onClick={() => removeFile(queueItem.id)}
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
                      value={queueItem.selectedType || ''}
                      onChange={(e) => updateFileType(queueItem.id, e.target.value)}
                      disabled={queueItem.uploading || loadingTypes}
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

                  {/* Status and Progress */}
                  <div className="space-y-2">
                    {queueItem.uploading ? (
                      <>
                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full bg-blue-600 transition-all duration-300 ease-out"
                            style={{ width: `${queueItem.progress}%` }}
                          />
                        </div>

                        {/* Progress Text */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-blue-600 flex items-center gap-1">
                            <Loader2 size={14} className="animate-spin" />
                            {queueItem.processingStatus === 'uploading' && queueItem.progress < 50
                              ? `Uploading... ${queueItem.progress}%`
                              : `Processing & embedding... ${queueItem.progress}%`
                            }
                          </span>
                          {queueItem.estimatedTimeRemaining !== null && queueItem.estimatedTimeRemaining > 0 && queueItem.processingStatus === 'uploading' && (
                            <span className="text-xs text-text-secondary">
                              {queueItem.estimatedTimeRemaining < 60
                                ? `${queueItem.estimatedTimeRemaining} seconds remaining`
                                : `${Math.ceil(queueItem.estimatedTimeRemaining / 60)} minutes remaining`}
                            </span>
                          )}
                          {queueItem.processingStatus === 'processing' && (
                            <span className="text-xs text-text-secondary">
                              This may take 1-2 minutes
                            </span>
                          )}
                        </div>
                      </>
                    ) : queueItem.error ? (
                      <span className="text-xs text-error flex items-center gap-1">
                        <AlertCircle size={14} />
                        {queueItem.error}
                      </span>
                    ) : queueItem.selectedType ? (
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
