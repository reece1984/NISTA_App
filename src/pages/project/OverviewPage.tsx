import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { DashboardOverview } from '../../components/dashboard/DashboardOverview'
import ProjectOverview from '../../components/ProjectOverview'
import ConfirmationDialog from '../../components/ui/ConfirmationDialog'
import Toast, { type ToastType } from '../../components/ui/Toast'
import { AssessmentEmptyState } from '../../components/assessment/AssessmentEmptyState'
import { n8nApi } from '../../services/n8nApi'
import { useDocuments } from '../../hooks/useDocuments'

export default function OverviewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [showRerunDialog, setShowRerunDialog] = useState(false)
  const [runningAssessment, setRunningAssessment] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)

  // Fetch documents
  const { documents, isLoading: documentsLoading } = useDocuments(Number(id))

  // Fetch project data
  const { data: project, isLoading: projectLoading, refetch } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*, assessment_templates (*)')
        .eq('id', id!)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!id
  })

  // Fetch assessments from most recent run
  const { data: assessments = [], isLoading: assessmentsLoading } = useQuery({
    queryKey: ['assessments', id],
    queryFn: async () => {
      // Get most recent assessment run
      const { data: assessmentRuns } = await supabase
        .from('assessment_runs')
        .select('id')
        .eq('project_id', id!)
        .order('created_at', { ascending: false })
        .limit(1)

      const assessmentRunId = assessmentRuns?.[0]?.id || null

      if (!assessmentRunId) return []

      const { data, error } = await supabase
        .from('assessments')
        .select('*, assessment_criteria (*)')
        .eq('project_id', id!)
        .eq('assessment_run_id', assessmentRunId)

      if (error) throw error
      return data || []
    },
    enabled: !!id
  })

  const handleRerunAssessment = async () => {
    if (!project) return
    setShowRerunDialog(false)
    setRunningAssessment(true)

    try {
      await n8nApi.triggerAssessment({
        projectId: project.id,
        projectName: project.name || project.project_name,
        templateId: project.template_id,
        templateName: project.assessment_templates?.name || 'Gate 0'
      })

      setToast({ message: 'Assessment re-run started successfully', type: 'success' })

      // Refresh data after a delay
      setTimeout(() => {
        refetch()
        setRunningAssessment(false)
      }, 3000)
    } catch (error) {
      console.error('Error re-running assessment:', error)
      setToast({ message: 'Failed to re-run assessment', type: 'error' })
      setRunningAssessment(false)
    }
  }

  // Get latest assessment
  const latestAssessment = assessments[0]
  const hasAssessments = assessments && assessments.length > 0

  if (projectLoading || assessmentsLoading || documentsLoading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        Loading project overview...
      </div>
    )
  }

  if (!project) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        Project not found
      </div>
    )
  }

  // Show empty states if no assessments
  if (!hasAssessments) {
    // Show "no documents" state if no documents uploaded
    if (documents.length === 0) {
      return (
        <div style={{ padding: '2rem' }}>
          <AssessmentEmptyState
            variant="no-documents"
            onUpload={() => navigate(`/project/${id}/documents`)}
          />
        </div>
      )
    }

    // Show "ready to assess" state if documents exist but no assessment
    return (
      <div style={{ padding: '2rem' }}>
        <AssessmentEmptyState
          variant="ready-to-assess"
          documentCount={documents.length}
          onRunAssessment={handleRerunAssessment}
        />
      </div>
    )
  }

  return (
    <>
      <div className="bg-slate-100 min-h-screen">
        <DashboardOverview
          project={project}
          assessments={assessments}
          onRerunAssessment={() => setShowRerunDialog(true)}
          runningAssessment={runningAssessment}
        />
      </div>

      {/* Rerun Confirmation Dialog */}
      {showRerunDialog && (
        <ConfirmationDialog
          isOpen={showRerunDialog}
          onClose={() => setShowRerunDialog(false)}
          onConfirm={handleRerunAssessment}
          title="Re-run Assessment?"
          message="This will create a new assessment run using the latest documents. Previous assessment results will be archived for comparison. Do you want to continue?"
          confirmText="Re-run Assessment"
          confirmVariant="primary"
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
