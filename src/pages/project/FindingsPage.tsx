import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { ExecutiveSummary } from '../../components/findings/ExecutiveSummary'
import { DetailedFindings } from '../../components/findings/DetailedFindings'
import ConfirmationDialog from '../../components/ui/ConfirmationDialog'
import Toast, { type ToastType } from '../../components/ui/Toast'
import ExportReportModal from '../../components/ExportReportModal'
import { n8nApi } from '../../services/n8nApi'
import { RefreshCw, Download, FileText } from 'lucide-react'

export default function FindingsPage() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const [showRerunDialog, setShowRerunDialog] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [runningAssessment, setRunningAssessment] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)
  const [summaryCollapsed, setSummaryCollapsed] = useState(false)
  const [expandedCriteria, setExpandedCriteria] = useState<number[]>([])

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

  // Auto-expand RED and AMBER criteria on initial load
  useEffect(() => {
    if (projectData?.assessments) {
      const nonGreenIds = projectData.assessments
        .filter((a: any) => a.rag_rating?.toUpperCase() !== 'GREEN')
        .map((a: any) => a.id)
      setExpandedCriteria(nonGreenIds)
    }
  }, [projectData?.assessments])

  // Handle deep linking from URL params
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const criterionId = params.get('criterion')

    if (criterionId) {
      const id = parseInt(criterionId, 10)
      // Ensure criterion is expanded
      setExpandedCriteria(prev =>
        prev.includes(id) ? prev : [...prev, id]
      )

      // Scroll to criterion after render
      setTimeout(() => {
        document.getElementById(`criterion-${id}`)?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
      }, 100)
    }
  }, [location.search])

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
    setShowExportModal(true)
  }

  const handleCriterionClick = (criterionId: number) => {
    // Ensure criterion is expanded
    if (!expandedCriteria.includes(criterionId)) {
      setExpandedCriteria([...expandedCriteria, criterionId])
    }

    // Scroll to criterion
    setTimeout(() => {
      document.getElementById(`criterion-${criterionId}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }, 100)
  }

  const handleCreateAction = (recommendation: any) => {
    console.log('Create action from recommendation:', recommendation)
    setToast({ message: 'Action creation coming soon', type: 'info' })
  }

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="text-lg text-slate-600">Loading findings...</div>
      </div>
    )
  }

  if (!projectData) {
    return (
      <div className="p-8 text-center">
        <div className="text-lg text-slate-600">Project not found</div>
      </div>
    )
  }

  if (!hasAssessments) {
    return (
      <div className="p-8 text-center">
        <p className="text-lg text-slate-600 mb-4">No assessment has been run yet</p>
        <button
          onClick={() => setShowRerunDialog(true)}
          className="px-4 py-2 bg-copper text-white rounded-lg hover:bg-[#a85d32] transition-colors"
        >
          Run First Assessment
        </button>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Findings</h1>
          <p className="text-sm text-slate-500 mt-1">
            Comprehensive analysis of {projectData.assessments.length} criteria against IPA standards
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowRerunDialog(true)}
            disabled={runningAssessment}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${runningAssessment ? 'animate-spin' : ''}`} />
            Re-run
          </button>
          <button
            onClick={handleExportExcel}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Excel
          </button>
          <button
            onClick={handleExportPDF}
            className="px-4 py-2 text-sm font-medium text-white bg-copper rounded-md hover:bg-[#a85d32] transition-colors flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Executive Summary (collapsible) */}
      <ExecutiveSummary
        assessments={projectData.assessments}
        isCollapsed={summaryCollapsed}
        onToggle={() => setSummaryCollapsed(!summaryCollapsed)}
        onCriterionClick={handleCriterionClick}
        onCreateAction={handleCreateAction}
      />

      {/* Detailed Findings */}
      <DetailedFindings
        assessments={projectData.assessments}
        expandedCriteria={expandedCriteria}
        setExpandedCriteria={setExpandedCriteria}
        onCreateAction={handleCreateAction}
      />

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

      {/* Export Report Modal */}
      <ExportReportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        project={projectData}
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
