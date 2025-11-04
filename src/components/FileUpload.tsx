import { useState, useRef } from 'react'
import { Upload, X, FileText } from 'lucide-react'
import { supabase } from '../lib/supabase'
import Button from './ui/Button'

interface FileUploadProps {
  projectId: number
  fileType: 'business_case' | 'pep' | 'risk_register'
  label: string
  onUploadSuccess: () => void
  existingFile?: {
    id: number
    fileName: string
    uploadedAt: string
  }
}

export default function FileUpload({
  projectId,
  fileType,
  label,
  onUploadSuccess,
  existingFile,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    if (file.type !== 'application/pdf') {
      return { valid: false, error: 'Only PDF files are allowed' }
    }

    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 50MB' }
    }

    return { valid: true }
  }

  const uploadFile = async (file: File) => {
    const validation = validateFile(file)
    if (!validation.valid) {
      setError(validation.error || 'Invalid file')
      return
    }

    try {
      setError('')
      setUploading(true)

      // Upload to Supabase Storage
      const fileKey = `projects/${projectId}/${fileType}_${Date.now()}.pdf`
      const { error: uploadError } = await supabase.storage
        .from('project-documents')
        .upload(fileKey, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('project-documents')
        .getPublicUrl(fileKey)

      // Save file metadata to database
      const { error: dbError } = await supabase.from('files').insert({
        projectId,
        fileName: file.name,
        fileType,
        fileUrl: publicUrl,
        fileKey,
        status: 'uploaded',
      })

      if (dbError) throw dbError

      // Trigger N8N webhook for document processing (optional - don't fail if webhook fails)
      const webhookUrl = import.meta.env.VITE_N8N_DOCUMENT_UPLOAD_WEBHOOK
      if (webhookUrl) {
        try {
          const payload = {
            identifier: 'document_upload',
            projectId,
            fileName: file.name,
            fileUrl: publicUrl,
            fileKey,
          }
          console.log('🔔 Calling N8N webhook:', webhookUrl)
          console.log('📦 Payload:', payload)

          const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })

          console.log('✅ N8N Response Status:', response.status)
          const responseData = await response.text()
          console.log('📥 N8N Response:', responseData)
        } catch (webhookError) {
          console.warn('N8N webhook failed (this is ok if N8N is not configured):', webhookError)
        }
      }

      onUploadSuccess()
    } catch (err: any) {
      setError(err.message || 'Failed to upload file')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0])
    }
  }

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0])
    }
  }

  const handleDelete = async () => {
    if (!existingFile) return

    try {
      setError('')
      setUploading(true)

      // Delete from database
      const { error: dbError } = await supabase
        .from('files')
        .delete()
        .eq('id', existingFile.id)

      if (dbError) throw dbError

      onUploadSuccess()
    } catch (err: any) {
      setError(err.message || 'Failed to delete file')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-text-primary mb-3">{label}</h3>

      {existingFile ? (
        <div className="card p-4 bg-success/5 border-success">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <FileText className="text-success flex-shrink-0" size={24} />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-text-primary break-words">
                  {existingFile.fileName}
                </p>
                <p className="text-sm text-text-secondary">
                  Uploaded {new Date(existingFile.uploadedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              disabled={uploading}
              className="flex items-center gap-1 flex-shrink-0"
            >
              <X size={16} />
              Delete
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={`card border-2 border-dashed transition-colors cursor-pointer ${
            dragActive ? 'border-primary bg-primary/5' : 'border-border'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleChange}
            className="hidden"
          />
          <div className="py-8 px-4 text-center">
            <Upload
              className={`mx-auto mb-4 ${
                dragActive ? 'text-primary' : 'text-text-secondary'
              }`}
              size={48}
            />
            <p className="text-text-primary font-medium mb-2">
              {uploading ? 'Uploading...' : 'Drop PDF here or click to browse'}
            </p>
            <p className="text-sm text-text-secondary">
              Maximum file size: 50MB
            </p>
          </div>
        </div>
      )}

      {error && <p className="mt-2 text-sm text-error">{error}</p>}
    </div>
  )
}
