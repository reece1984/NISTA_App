import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import AssessmentSummary from '../../components/AssessmentSummary'
import ConfirmationDialog from '../../components/ui/ConfirmationDialog'
import Toast, { type ToastType } from '../../components/ui/Toast'
import { n8nApi } from '../../services/n8nApi'
import { FileText } from 'lucide-react'

export default function SummaryPage() {
  const { id } = useParams<{ id: string }>()
  const [showRerunDialog, setShowRerunDialog] = useState(false)
  const [runningAssessment, setRunningAssessment] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)

  // Fetch project data with assessments
  const { data: projectData, isLoading, refetch } = useQuery({
    queryKey: ['project-summary', id],
    queryFn: async () => {
      // Fetch project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*, assessment_templates (*)')
        .eq('id', id!)
        .single()

      if (projectError) throw projectError

      // Fetch the most recent assessment run
      const { data: assessmentRuns } = await supabase
        .from('assessment_runs')
        .select('id')
        .eq('project_id', id!)
        .order('created_at', { ascending: false })
        .limit(1)

      const assessmentRunId = assessmentRuns?.[0]?.id || null

      // Fetch assessments from the most recent run
      let assessments: any[] = []
      if (assessmentRunId) {
        const { data: assessmentsData } = await supabase
          .from('assessments')
          .select('*, assessment_criteria (*)')
          .eq('project_id', id!)
          .eq('assessment_run_id', assessmentRunId)

        assessments = assessmentsData || []
      }

      return {
        ...project,
        assessments
      }
    }
  })

  const hasAssessments = projectData?.assessments && projectData.assessments.length > 0

  const handleRerunAssessment = async () => {
    if (!projectData) return
    setShowRerunDialog(false)
    setRunningAssessment(true)

    try {
      await n8nApi.triggerAssessment({
        projectId: projectData.id,
        projectName: projectData.name || projectData.project_name,
        templateId: projectData.template_id,
        templateName: projectData.assessment_templates?.name || 'Gate 0'
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

  if (isLoading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        Loading assessment summary...
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

  if (!hasAssessments) {
    return (
      <div style={{
        padding: '4rem 2rem',
        textAlign: 'center',
        background: 'var(--white)',
        borderRadius: '12px',
        margin: '2rem',
        border: '1px solid var(--border)'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          margin: '0 auto 1.5rem',
          background: 'var(--gray-100)',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)'
        }}>
          <FileText size={32} />
        </div>
        <h3 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.25rem',
          fontWeight: 600,
          color: 'var(--ink)',
          marginBottom: '0.5rem'
        }}>
          No assessment results yet
        </h3>
        <p style={{
          fontSize: '0.95rem',
          color: 'var(--text-muted)',
          maxWidth: '400px',
          margin: '0 auto'
        }}>
          Run an assessment from the Documents tab to see summary results here
        </p>
      </div>
    )
  }

  return (
    <>
      <div style={{ padding: '2rem' }}>
        <AssessmentSummary
          project={projectData}
          assessmentResults={projectData.assessments || []}
          onRerunAssessment={() => setShowRerunDialog(true)}
          runningAssessment={runningAssessment}
          onExportExcel={() => {
            setToast({ message: 'Excel export coming soon', type: 'info' })
          }}
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
