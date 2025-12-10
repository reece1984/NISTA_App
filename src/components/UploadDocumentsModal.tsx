import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, X, Loader2, AlertCircle, Check } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useDocumentTypes } from '../hooks/useDocumentTypes'

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

            // Mark as complete
            setFileQueue((prev) =>
              prev.map((f) =>
                f.id === queueItem.id
                  ? { ...f, progress: 100, processingStatus: 'complete', uploading: false }
                  : f
              )
            )

            setToast({
              message: `${file.name} uploaded and embedded successfully (${embeddingCount} chunks)`,
              type: 'success',
            })

            // Remove from queue after a short delay
            setTimeout(() => {
              setFileQueue((prev) => {
                const newQueue = prev.filter((f) => f.id !== queueItem.id)

                // If queue is now empty, close modal after a short delay
                if (newQueue.length === 0) {
                  setTimeout(() => {
                    onUploadComplete()
                    onClose()
                  }, 1000)
                }

                return newQueue
              })
            }, 2000)
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
  const isUploading = fileQueue.some((f) => f.uploading)

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

  // Calculate total size
  const totalSize = fileQueue.reduce((acc, f) => acc + f.file.size, 0)
  const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(1)

  if (!isOpen) return null

  return (
    <>
      {/* Modal Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50"
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden pointer-events-auto">

          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-navy">Upload Documents</h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Add project documentation for AI-powered assessment
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 -mr-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">

            {/* Dropzone */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all group ${
                isDragActive
                  ? 'border-copper bg-gradient-to-b from-amber-50/50 to-orange-50/30'
                  : 'border-slate-200 bg-gradient-to-b from-slate-50 to-slate-100/50 hover:border-copper/50 hover:bg-amber-50/30'
              }`}
            >
              <input {...getInputProps()} />
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileText className="w-7 h-7 text-copper" />
              </div>
              <p className="text-sm font-medium text-slate-700 mb-1">
                {isDragActive ? (
                  'Drop files here'
                ) : (
                  <>
                    Drop PDF files here or <span className="text-copper hover:text-copper-light">browse</span>
                  </>
                )}
              </p>
              <p className="text-xs text-slate-400">
                Up to 50 files · 50MB each · PDF format
              </p>
            </div>

            {/* File List */}
            {fileQueue.length > 0 && (
              <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
                {fileQueue.map((queueItem) => {
                  const isComplete = queueItem.processingStatus === 'complete'
                  const isPending = !queueItem.uploading && !isComplete && !queueItem.error

                  return (
                    <div
                      key={queueItem.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all animate-in slide-in-from-top-2 duration-200 ${
                        isComplete
                          ? 'bg-green-50/50 border-green-100'
                          : 'bg-slate-50 border-slate-100'
                      }`}
                    >
                      {/* PDF Icon */}
                      <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-red-500" />
                      </div>

                      {/* File Info & Progress */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate">
                          {queueItem.file.name}
                        </p>

                        {/* Pending State */}
                        {isPending && !queueItem.selectedType && (
                          <p className="text-xs text-slate-400">
                            {(queueItem.file.size / (1024 * 1024)).toFixed(2)} MB · Select document type
                          </p>
                        )}

                        {/* Ready to Upload */}
                        {isPending && queueItem.selectedType && (
                          <p className="text-xs text-slate-400">
                            {(queueItem.file.size / (1024 * 1024)).toFixed(2)} MB · Ready to upload
                          </p>
                        )}

                        {/* Uploading Progress */}
                        {queueItem.uploading && !isComplete && (
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-copper to-copper-light transition-all duration-300"
                                style={{ width: `${queueItem.progress}%` }}
                              />
                            </div>
                            <span className="text-xs text-copper font-medium">{queueItem.progress}%</span>
                          </div>
                        )}

                        {/* Complete State */}
                        {isComplete && (
                          <p className="text-xs text-green-600">Uploaded · Processing for assessment</p>
                        )}

                        {/* Error State */}
                        {queueItem.error && (
                          <p className="text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {queueItem.error}
                          </p>
                        )}

                        {/* Document Type Selector */}
                        {!queueItem.uploading && !isComplete && !queueItem.selectedType && (
                          <div className="mt-2">
                            <select
                              value={queueItem.selectedType || ''}
                              onChange={(e) => updateFileType(queueItem.id, e.target.value)}
                              disabled={loadingTypes}
                              className="w-full px-2 py-1 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-copper transition-colors"
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
                        )}
                      </div>

                      {/* Status Icon */}
                      {!queueItem.uploading && !isComplete && (
                        <button
                          onClick={() => removeFile(queueItem.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}

                      {queueItem.uploading && !isComplete && (
                        <div className="w-8 h-8 flex items-center justify-center">
                          <Loader2 className="w-4 h-4 text-copper animate-spin" />
                        </div>
                      )}

                      {isComplete && (
                        <div className="w-8 h-8 flex items-center justify-center">
                          <Check className="w-5 h-5 text-green-500" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Upload Summary */}
            {fileQueue.length > 0 && (
              <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                <span>{fileQueue.length} file{fileQueue.length !== 1 ? 's' : ''} · {totalSizeMB} MB total</span>
                <button
                  onClick={clearAll}
                  disabled={isUploading}
                  className="text-copper hover:text-copper-light font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Clear all
                </button>
              </div>
            )}

          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            {fileQueue.length > 0 && (
              <button
                onClick={uploadAll}
                disabled={!canUploadAll}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload All
                  </>
                )}
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed bottom-4 right-4 z-[60] px-4 py-3 rounded-lg shadow-lg ${
            toast.type === 'success'
              ? 'bg-rag-green text-white'
              : 'bg-error text-white'
          }`}
        >
          {toast.message}
        </div>
      )}
    </>
  )
}
