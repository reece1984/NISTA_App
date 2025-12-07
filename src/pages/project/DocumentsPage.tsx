import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useDocuments } from '../../hooks/useDocuments'
import DocumentsTabContent from '../../components/DocumentsTabContent'
import UploadDocumentsModal from '../../components/UploadDocumentsModal'
import Toast, { type ToastType } from '../../components/ui/Toast'
import { n8nApi } from '../../services/n8nApi'

export default function DocumentsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const projectId = Number(id)

  const [showUploadModal, setShowUploadModal] = useState(false)
  const [deletingDocumentId, setDeletingDocumentId] = useState<number | null>(null)
  const [runningAssessment, setRunningAssessment] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)

  // Fetch project data
  const { data: projectData, isLoading: projectLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*, assessment_templates (*)')
        .eq('id', id!)
        .single()
      if (error) throw error
      return data
    }
  })

  // Fetch documents using the hook
  const { documents, refetch, deleteDocument } = useDocuments(projectId)

  // Check if project has assessments
  const { data: assessments = [] } = useQuery({
    queryKey: ['assessments', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assessment_runs')
        .select('*')
        .eq('project_id', id!)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data || []
    }
  })

  const templateName = projectData?.assessment_templates?.name || 'Gate 0'
  const hasAssessments = assessments.length > 0
  const hasFiles = documents.length > 0

  const handleDeleteDocument = async (doc: any) => {
    try {
      setDeletingDocumentId(doc.id)
      await deleteDocument.mutateAsync(doc)
      setToast({ message: 'Document deleted successfully', type: 'success' })
    } catch (error) {
      console.error('Error deleting document:', error)
      setToast({ message: 'Failed to delete document', type: 'error' })
    } finally {
      setDeletingDocumentId(null)
    }
  }

  const handleRunAssessment = async () => {
    if (!projectData) return
    setRunningAssessment(true)

    try {
      await n8nApi.triggerAssessment({
        projectId: projectData.id,
        projectName: projectData.name || projectData.project_name,
        templateId: projectData.template_id,
        templateName: projectData.assessment_templates?.name || 'Gate 0'
      })

      setToast({ message: 'Assessment started successfully', type: 'success' })

      // Navigate to overview to see results
      setTimeout(() => {
        navigate(`/project/${id}/overview`)
      }, 2000)
    } catch (error) {
      console.error('Error running assessment:', error)
      setToast({ message: 'Failed to start assessment', type: 'error' })
    } finally {
      setRunningAssessment(false)
    }
  }

  const handleRerunAssessment = async () => {
    await handleRunAssessment()
  }

  const handleViewResults = () => {
    navigate(`/project/${id}/overview`)
  }

  const handleUploadSuccess = async () => {
    await refetch()
    setShowUploadModal(false)
    setToast({ message: 'Documents uploaded successfully', type: 'success' })
  }

  if (projectLoading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        Loading project...
      </div>
    )
  }

  if (!projectData) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        Project not found
      </div>
    )
  }

  return (
    <>
      <DocumentsTabContent
        documents={documents}
        templateName={templateName}
        projectData={projectData}
        hasAssessments={hasAssessments}
        hasFiles={hasFiles}
        runningAssessment={runningAssessment}
        onUploadClick={() => setShowUploadModal(true)}
        onDeleteDocument={handleDeleteDocument}
        deletingDocumentId={deletingDocumentId}
        onRunAssessment={handleRunAssessment}
        onRerunAssessment={handleRerunAssessment}
        onViewResults={handleViewResults}
      />

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadDocumentsModal
          projectId={projectId}
          projectName={projectData.name || projectData.project_name}
          onClose={() => setShowUploadModal(false)}
          onUploadComplete={handleUploadSuccess}
        />
      )}

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  )
}
