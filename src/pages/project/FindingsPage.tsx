import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import AssessmentSummary from '../../components/AssessmentSummary'
import AssessmentDetail from '../../components/AssessmentDetail'
import ConfirmationDialog from '../../components/ui/ConfirmationDialog'
import Toast, { type ToastType } from '../../components/ui/Toast'
import { n8nApi } from '../../services/n8nApi'
import { ChevronDown, ChevronRight } from 'lucide-react'

export default function FindingsPage() {
  const { id } = useParams<{ id: string }>()
  const [showRerunDialog, setShowRerunDialog] = useState(false)
  const [runningAssessment, setRunningAssessment] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)
  const [summaryCollapsed, setSummaryCollapsed] = useState(false)

  // Fetch project data with assessments
  const { data: projectData, isLoading, refetch } = useQuery({
    queryKey: ['project-findings', id],
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

        // Fetch evidence requirements for each criterion
        if (assessments.length > 0) {
          const criterionIds = assessments.map(a => a.criterion_id).filter(Boolean)

          if (criterionIds.length > 0) {
            const { data: evidenceReqs } = await supabase
              .from('evidence_requirements')
              .select('*')
              .in('criterion_id', criterionIds)
              .order('display_order')

            // Merge evidence requirements into each assessment
            assessments = assessments.map(assessment => ({
              ...assessment,
              evidence_requirements: evidenceReqs?.filter(
                er => er.criterion_id === assessment.criterion_id
              ) || []
            }))
          }
        }
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

  const handleExportExcel = () => {
    console.log('Export Excel')
    setToast({ message: 'Excel export coming soon', type: 'info' })
  }

  const handleExportPDF = () => {
    console.log('Export PDF')
    setToast({ message: 'PDF export coming soon', type: 'info' })
  }

  const handleGenerateActionPlan = () => {
    console.log('Generate Action Plan')
    setToast({ message: 'Action plan generation coming soon', type: 'info' })
  }

  if (isLoading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        Loading findings...
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
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ marginBottom: '1rem' }}>No assessment has been run yet</p>
        <button
          onClick={() => setShowRerunDialog(true)}
          style={{
            padding: '0.5rem 1rem',
            background: 'var(--copper)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Run First Assessment
        </button>
      </div>
    )
  }

  return (
    <div style={{ padding: '1.5rem' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{
          fontSize: '1.25rem',
          fontWeight: 600,
          color: 'var(--ink)',
          marginBottom: '0.25rem'
        }}>
          Findings
        </h1>
        <p style={{
          fontSize: '0.875rem',
          color: 'var(--text-muted)'
        }}>
          Comprehensive analysis of {projectData.assessments.length} criteria against IPA standards
        </p>
      </div>

      {/* Executive Summary Section - Collapsible */}
      <div style={{
        background: 'white',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        marginBottom: '1.5rem',
        overflow: 'hidden'
      }}>
        <button
          onClick={() => setSummaryCollapsed(!summaryCollapsed)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.5rem',
            background: summaryCollapsed ? 'var(--bg-subtle)' : 'white',
            border: 'none',
            borderBottom: summaryCollapsed ? 'none' : '1px solid var(--border)',
            cursor: 'pointer',
            transition: 'background 0.15s ease'
          }}
          onMouseEnter={(e) => {
            if (summaryCollapsed) e.currentTarget.style.background = 'var(--bg-hover)'
          }}
          onMouseLeave={(e) => {
            if (summaryCollapsed) e.currentTarget.style.background = 'var(--bg-subtle)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {summaryCollapsed ? (
              <ChevronRight size={20} style={{ color: 'var(--text-muted)' }} />
            ) : (
              <ChevronDown size={20} style={{ color: 'var(--text-muted)' }} />
            )}
            <h2 style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--ink)'
            }}>
              Executive Summary
            </h2>
          </div>
          <span style={{
            fontSize: '0.875rem',
            color: 'var(--text-muted)'
          }}>
            {summaryCollapsed ? 'Expand' : 'Collapse'}
          </span>
        </button>

        {!summaryCollapsed && (
          <div style={{ padding: '1.5rem' }}>
            <AssessmentSummary
              project={projectData}
              assessmentResults={projectData.assessments}
              onRerunAssessment={() => setShowRerunDialog(true)}
              onExportExcel={handleExportExcel}
              onExportPDF={handleExportPDF}
              onGenerateActionPlan={handleGenerateActionPlan}
              runningAssessment={runningAssessment}
            />
          </div>
        )}
      </div>

      {/* Detailed Findings Section */}
      <div style={{
        background: 'white',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '1rem 1.5rem',
          borderBottom: '1px solid var(--border)',
          background: 'white'
        }}>
          <h2 style={{
            fontSize: '1rem',
            fontWeight: 600,
            color: 'var(--ink)'
          }}>
            Detailed Findings
          </h2>
        </div>

        <div style={{ padding: '1.5rem' }}>
          <AssessmentDetail
            project={projectData}
            assessmentResults={projectData.assessments}
            onRerunAssessment={() => setShowRerunDialog(true)}
            onExportExcel={handleExportExcel}
            onExportPDF={handleExportPDF}
            runningAssessment={runningAssessment}
          />
        </div>
      </div>

      {/* Rerun Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showRerunDialog}
        title="Re-run Assessment"
        message="Are you sure you want to re-run the assessment? This will create a new assessment run with fresh analysis."
        confirmLabel="Re-run Assessment"
        cancelLabel="Cancel"
        onConfirm={handleRerunAssessment}
        onCancel={() => setShowRerunDialog(false)}
        variant="primary"
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
