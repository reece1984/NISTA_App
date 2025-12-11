import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useDocuments } from '../../hooks/useDocuments'
import DocumentsTable from '../../components/documents/DocumentsTable'
import UploadDocumentsModal from '../../components/UploadDocumentsModal'
import Toast, { type ToastType } from '../../components/ui/Toast'
import { n8nApi } from '../../services/n8nApi'
import RecommendedDocsSidebar from '../../components/documents/RecommendedDocs/RecommendedDocsSidebar'
import DocumentsHeader from '../../components/documents/DocumentsHeader'
import DocumentChatPanel from '../../components/documents/DocumentChat/DocumentChatPanel'
import { useRecommendedDocs } from '../../hooks/useRecommendedDocs'
import type { RecommendedDocument } from '../../types/recommendedDocuments'

export default function DocumentsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const projectId = Number(id)

  const [showUploadModal, setShowUploadModal] = useState(false)
  const [deletingDocumentId, setDeletingDocumentId] = useState<number | null>(null)
  const [runningAssessment, setRunningAssessment] = useState(false)
  const [assessmentProgress, setAssessmentProgress] = useState<{ current: number; total: number } | null>(null)
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [preselectedDocType, setPreselectedDocType] = useState<string | null>(null)
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

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

  // Cleanup polling interval and abort controller on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
        pollIntervalRef.current = null
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
        abortControllerRef.current = null
      }
    }
  }, [])

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

    try {
      setRunningAssessment(true)

      // Get total number of assessment criteria for this project's template
      const { count: totalCriteria } = await supabase
        .from('assessment_criteria')
        .select('*', { count: 'exact', head: true })
        .eq('template_id', projectData.template_id)

      const total = totalCriteria || 15 // Default to 15 if count fails

      // Initialize progress
      setAssessmentProgress({ current: 0, total })

      // Show loading toast with progress
      setToast({
        message: `Starting assessment of ${total} criteria...`,
        type: 'loading'
      })

      // Trigger assessment
      await n8nApi.triggerAssessment({
        projectId: projectData.id,
        projectName: projectData.name || projectData.project_name,
        templateId: projectData.template_id,
        templateName: projectData.assessment_templates?.name || 'Gate 0'
      })

      // Wait a moment for N8N to create the assessment run
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Get the most recent assessment run ID (created by N8N)
      const { data: latestRun } = await supabase
        .from('assessment_runs')
        .select('id')
        .eq('project_id', id!)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      const assessmentRunId = latestRun?.id

      if (!assessmentRunId) {
        throw new Error('Failed to find assessment run. The assessment may not have started correctly.')
      }

      // Clear any existing polling interval and abort controller
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
        pollIntervalRef.current = null
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
        abortControllerRef.current = null
      }

      // Create new AbortController for this assessment run
      abortControllerRef.current = new AbortController()
      const signal = abortControllerRef.current.signal

      // Poll for completion - check every 3 seconds for up to 10 minutes
      let pollCount = 0
      const maxPolls = 200 // 200 polls × 3 seconds = 10 minutes

      pollIntervalRef.current = setInterval(async () => {
        pollCount++

        try {
          // Check if aborted
          if (signal.aborted) {
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current)
              pollIntervalRef.current = null
            }
            return
          }

          // Count how many assessments have been completed for THIS assessment run
          const { count: completedCount } = await supabase
            .from('assessments')
            .select('*', { count: 'exact', head: true })
            .eq('project_id', id!)
            .eq('assessment_run_id', assessmentRunId)
            .abortSignal(signal)

          const completed = completedCount || 0

          // Update progress
          setAssessmentProgress({ current: completed, total })

          // Update toast with progress
          const percentage = Math.round((completed / total) * 100)
          let statusMessage = 'Analyzing documents against criteria...'
          if (percentage > 0 && percentage < 25) {
            statusMessage = 'Starting assessment...'
          } else if (percentage >= 25 && percentage < 75) {
            statusMessage = 'Analyzing criteria...'
          } else if (percentage >= 75 && percentage < 100) {
            statusMessage = 'Finalizing assessment...'
          }

          setToast({
            message: `${statusMessage} ${completed} of ${total} (${percentage}%)`,
            type: 'loading'
          })

          // Check project status
          const { data: updatedProject } = await supabase
            .from('projects')
            .select('status')
            .eq('id', id!)
            .abortSignal(signal)
            .single()

          // Check if completed
          const allCriteriaComplete = completed >= total
          if (updatedProject?.status === 'completed' || allCriteriaComplete || pollCount >= maxPolls) {
            // Clear interval and abort controller
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current)
              pollIntervalRef.current = null
            }
            if (abortControllerRef.current) {
              abortControllerRef.current.abort()
              abortControllerRef.current = null
            }

            setRunningAssessment(false)
            setAssessmentProgress(null)

            setToast({
              message: `Assessment completed! ${completed} criteria assessed.`,
              type: 'success'
            })

            // Navigate to readiness after short delay
            setTimeout(() => {
              navigate(`/project/${id}/readiness`)
            }, 1500)
          }
        } catch (error: any) {
          // Ignore abort errors
          if (error.name === 'AbortError') {
            return
          }
          console.error('Polling error:', error)
        }
      }, 3000) // Poll every 3 seconds

    } catch (error: any) {
      // Clean up polling interval and abort controller on error
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
        pollIntervalRef.current = null
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
        abortControllerRef.current = null
      }
      setRunningAssessment(false)
      setAssessmentProgress(null)
      setToast({
        message: error.message || 'Failed to start assessment',
        type: 'error'
      })
      console.error('Error running assessment:', error)
    }
  }

  const handleRerunAssessment = async () => {
    await handleRunAssessment()
  }

  const handleViewResults = () => {
    navigate(`/project/${id}/readiness`)
  }

  const handleUploadSuccess = async () => {
    await refetch()
    setShowUploadModal(false)
    setPreselectedDocType(null)
    setToast({ message: 'Documents uploaded successfully', type: 'success' })
  }

  const handleRecommendedUploadClick = (rec: RecommendedDocument) => {
    setPreselectedDocType(rec.id)
    setShowUploadModal(true)
  }

  // Calculate page count and project gate
  const pageCount = documents.reduce((sum, doc) => sum + (doc.page_count || 0), 0)
  const projectGate = projectData?.current_gate || 'gate-3'

  // Get recommendations with upload status
  const recommendations = useRecommendedDocs(projectGate, documents)

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
    <div className="flex flex-col -m-5 h-[calc(100vh-48px)]">
      {/* Main Content Area */}
      <div className="flex flex-col p-6 h-full bg-slate-100">
        {/* Page Header - aligned with content below */}
        <div className="flex-shrink-0 mb-6">
          <DocumentsHeader
            documentCount={documents.length}
            pageCount={pageCount}
            uploadedCount={recommendations?.uploadedCount || 0}
            totalRecommended={recommendations?.totalCount || 6}
            isChatOpen={isChatOpen}
            onChatToggle={() => setIsChatOpen(!isChatOpen)}
            onUploadClick={() => setShowUploadModal(true)}
          />
        </div>

        {/* Two-column layout - flexible height */}
        <div className="grid grid-cols-[280px_1fr] gap-4 flex-1 min-h-0">
          {/* Left: Recommended docs */}
          <RecommendedDocsSidebar
            projectGate={projectGate}
            documents={documents}
            onUploadClick={handleRecommendedUploadClick}
          />

          {/* Center: Documents table */}
          <div className="bg-white rounded-lg border border-slate-200 flex flex-col h-full">
            <DocumentsTable
              documents={documents.map(doc => ({
                ...doc,
                status: 'indexed' as const
              }))}
              onDeleteDocument={handleDeleteDocument}
              deletingDocumentId={deletingDocumentId}
            />
          </div>
        </div>
      </div>

      {/* Right: Chat Panel (overlay when open) */}
      {isChatOpen && (
        <DocumentChatPanel
          projectId={projectId}
          documentCount={documents.length}
          pageCount={pageCount}
          onClose={() => setIsChatOpen(false)}
        />
      )}

      {/* Upload Modal */}
      <UploadDocumentsModal
        isOpen={showUploadModal}
        projectId={projectId}
        currentDocumentCount={documents.length}
        onClose={() => {
          setShowUploadModal(false)
          setPreselectedDocType(null)
        }}
        onUploadComplete={handleUploadSuccess}
      />

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
