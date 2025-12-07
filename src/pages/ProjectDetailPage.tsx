import { useState, useRef, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Play, Trash2, Loader2, ClipboardList, Eye, Upload, LayoutGrid, FileText, BarChart3, Target, Activity, Sparkles, FileBarChart, RefreshCw } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Button from '../components/ui/Button'
import AssessmentResults from '../components/AssessmentResults'
import AssessmentSummary from '../components/AssessmentSummary'
import AssessmentDetail from '../components/AssessmentDetail'
import Modal from '../components/ui/Modal'
import Toast, { type ToastType } from '../components/ui/Toast'
import ConfirmationDialog from '../components/ui/ConfirmationDialog'
import DocumentGuidancePanel from '../components/DocumentGuidancePanel'
import DocumentsList from '../components/DocumentsList'
import DocumentsTabContent from '../components/DocumentsTabContent'
import UploadDocumentsModal from '../components/UploadDocumentsModal'
import ProjectOverview from '../components/ProjectOverview'
import { useDocuments } from '../hooks/useDocuments'
import { useActions } from '../hooks/useActions'
import { n8nApi } from '../services/n8nApi'
import ActionTableView from '../components/ActionPlan/ActionTableView'
import ActionDetailModal from '../components/ActionPlan/ActionDetailModal'

type TabType = 'overview' | 'documents' | 'assessment-summary' | 'assessment-detail' | 'actions'

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [runningAssessment, setRunningAssessment] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showRerunConfirmDialog, setShowRerunConfirmDialog] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [deletingDocumentId, setDeletingDocumentId] = useState<number | null>(null)
  const [deletingProject, setDeletingProject] = useState(false)
  const [assessmentError, setAssessmentError] = useState('')
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)
  const [assessmentProgress, setAssessmentProgress] = useState<{ current: number; total: number } | null>(null)
  const [selectedActionId, setSelectedActionId] = useState<number | null>(null)
  const [openActionPlanWorkspace, setOpenActionPlanWorkspace] = useState(false)
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const {
    data: projectData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      // Fetch project with template information
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*, assessment_templates (*)')
        .eq('id', id!)
        .single()

      if (projectError) throw projectError

      // Fetch files for this project
      const { data: files, error: filesError } = await supabase
        .from('files')
        .select('*')
        .eq('project_id', id!)

      if (filesError && filesError.code !== 'PGRST116') {
        console.error('Files error:', filesError)
      }

      // Fetch the most recent assessment run ID FIRST
      const { data: assessmentRuns, error: runError } = await supabase
        .from('assessment_runs')
        .select('id')
        .eq('project_id', id!)
        .order('created_at', { ascending: false })
        .limit(1)

      if (runError && runError.code !== 'PGRST116') {
        console.error('Assessment runs error:', runError)
      }

      const assessmentRunId = assessmentRuns?.[0]?.id || null

      // Fetch assessments for this project - ONLY FROM THE MOST RECENT RUN
      let assessments: any[] = []
      if (assessmentRunId) {
        const { data: assessmentsData, error: assessmentsError } = await supabase
          .from('assessments')
          .select('*, assessment_criteria (*)')
          .eq('project_id', id!)
          .eq('assessment_run_id', assessmentRunId)

        if (assessmentsError && assessmentsError.code !== 'PGRST116') {
          console.error('Assessments error:', assessmentsError)
        }
        assessments = assessmentsData || []
      }

      // Fetch project summary (most recent one)
      const { data: projectSummaries, error: summaryError } = await supabase
        .from('project_summaries')
        .select('*')
        .eq('project_id', id!)
        .order('created_at', { ascending: false })
        .limit(1)

      if (summaryError && summaryError.code !== 'PGRST116') {
        console.error('Project summary error:', summaryError)
      }

      const projectSummary = projectSummaries?.[0] || null

      return {
        ...project,
        files: files || [],
        assessments: assessments,
        projectSummary: projectSummary || null,
        assessmentRunId,
      }
    },
    enabled: !!id,
  })

  // Use documents hook for multi-document management
  const {
    documents,
    deleteDocument,
    refetch: refetchDocuments,
  } = useDocuments(parseInt(id!))

  // Use actions hook for action plan management
  const {
    actions,
    isLoading: actionsLoading,
    bulkUpdate,
    refetch: refetchActions,
  } = useActions({ projectId: parseInt(id!) })

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

  const handleDeleteDocument = async (document: any) => {
    setDeletingDocumentId(document.id)
    try {
      await deleteDocument.mutateAsync(document)
      setToast({
        message: 'Document deleted successfully',
        type: 'success',
      })
    } catch (error: any) {
      setToast({
        message: `Failed to delete document: ${error.message}`,
        type: 'error',
      })
    } finally {
      setDeletingDocumentId(null)
    }
  }

  const handleRunAssessment = async () => {
    if (!documents || documents.length === 0) {
      setAssessmentError('Please upload at least one document before running assessment')
      setToast({
        message: 'Please upload at least one document before running assessment',
        type: 'error'
      })
      return
    }

    try {
      setAssessmentError('')
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

      // Update project status to processing
      // Note: N8N workflow will delete old assessments before inserting new ones
      await supabase
        .from('projects')
        .update({ status: 'processing' })
        .eq('id', id!)

      // Trigger N8N webhook for assessment
      const webhookUrl = import.meta.env.VITE_N8N_RUN_ASSESSMENT_WEBHOOK
      if (!webhookUrl) {
        throw new Error('Assessment webhook URL not configured. Please add VITE_N8N_RUN_ASSESSMENT_WEBHOOK to your environment variables.')
      }

      const payload = {
        identifier: 'run_assessment',
        projectId: parseInt(id!),
        files: documents.map((f: any) => ({
          fileId: f.id,
          fileName: f.file_name,
          fileType: f.file_type,
          fileUrl: f.file_url,
          fileKey: f.file_key,
        })),
      }

      console.log('🔔 Calling N8N webhook:', webhookUrl)
      console.log('📦 Payload:', payload)

      // Fire-and-forget webhook call with extended timeout
      // We don't need to wait for the full N8N response since polling handles progress tracking
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout just to verify webhook received

      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        console.log('✅ N8N Response Status:', response.status)

        if (!response.ok) {
          const responseData = await response.text()
          console.error('❌ N8N webhook error:', responseData)
          throw new Error(`N8N webhook failed with status ${response.status}: ${responseData}`)
        }

        console.log('📥 N8N webhook triggered successfully')
      } catch (fetchError: any) {
        clearTimeout(timeoutId)

        // If it's an abort error (timeout), continue anyway since N8N likely received the request
        if (fetchError.name === 'AbortError') {
          console.warn('⏱️ Webhook request timed out after 30s, but N8N may still be processing. Continuing with polling...')
        } else {
          console.error('❌ Fetch error:', fetchError)
          throw new Error(`Failed to connect to N8N: ${fetchError.message}. Check that N8N is running and the webhook URL is correct.`)
        }
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

      // Poll for completion - check every 3 seconds for up to 10 minutes (for 50 criteria)
      let pollCount = 0
      const maxPolls = 200 // 200 polls × 3 seconds = 10 minutes

      pollIntervalRef.current = setInterval(async () => {
        pollCount++

        try {
          // Check if aborted
          if (signal.aborted) {
            console.log('⏹️ Polling aborted')
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current)
              pollIntervalRef.current = null
            }
            return
          }

          // Count how many assessments have been completed for this project
          const { count: completedCount } = await supabase
            .from('assessments')
            .select('*', { count: 'exact', head: true })
            .eq('project_id', id!)
            .abortSignal(signal)

          const completed = completedCount || 0

          console.log(`📊 Poll ${pollCount}: ${completed}/${total} assessments completed`)

          // Update progress
          setAssessmentProgress({ current: completed, total })

          // Update toast with progress and more descriptive messaging
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

          console.log(`🔍 Project status: ${updatedProject?.status}, All complete: ${completed >= total}`)

          // Check if completed (either status is 'completed', all criteria done, or timed out)
          const allCriteriaComplete = completed >= total
          if (updatedProject?.status === 'completed' || allCriteriaComplete || pollCount >= maxPolls) {
            console.log('✅ Assessment complete! Stopping polling...')

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

            // Update project status to completed if still processing
            if (updatedProject?.status === 'processing') {
              const { error: updateError } = await supabase
                .from('projects')
                .update({ status: 'completed', updated_at: new Date().toISOString() })
                .eq('id', id!)

              if (updateError) {
                console.error('Failed to update project status:', updateError)
              } else {
                console.log('✅ Project status updated to completed')
              }
            }

            // Refetch all data to show results
            await refetch()

            setToast({
              message: `Assessment completed! ${completed} criteria assessed.`,
              type: 'success'
            })
          }
        } catch (error: any) {
          // Ignore abort errors
          if (error.name === 'AbortError') {
            console.log('⏹️ Request aborted')
            return
          }

          // Log other errors but continue polling
          console.error('Polling error:', error)
        }
      }, 3000) // Poll every 3 seconds

    } catch (err: any) {
      // Clean up polling interval and abort controller on error
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
        pollIntervalRef.current = null
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
        abortControllerRef.current = null
      }
      setAssessmentError(err.message || 'Failed to run assessment')
      setRunningAssessment(false)
      setAssessmentProgress(null)
      setToast({
        message: err.message || 'Failed to run assessment',
        type: 'error'
      })
    }
  }

  const handleDeleteProject = async () => {
    try {
      setDeletingProject(true)
      setShowDeleteModal(false) // Close modal immediately for better UX

      // Show loading toast
      setToast({
        message: 'Deleting project and related data...',
        type: 'loading'
      })

      // Parse the project ID as integer to ensure correct type
      const projectId = parseInt(id!)

      // We need to delete related tables in the correct order
      // to avoid foreign key constraint violations
      let deletionSteps = []
      let hasErrors = false

      // Step 1: Delete actions (if they exist)
      try {
        const { error: actionsError } = await supabase
          .from('actions')
          .delete()
          .eq('project_id', projectId)

        if (actionsError && actionsError.code !== 'PGRST116') {
          console.error('Error deleting actions:', actionsError)
          deletionSteps.push({ table: 'actions', error: actionsError.message })
          // Continue anyway - some tables might not exist
        } else {
          deletionSteps.push({ table: 'actions', success: true })
        }
      } catch (e) {
        console.error('Exception deleting actions:', e)
      }

      // Step 2: Delete assessments (main problematic table based on error)
      try {
        const { error: assessmentsError } = await supabase
          .from('assessments')
          .delete()
          .eq('project_id', projectId)

        if (assessmentsError && assessmentsError.code !== 'PGRST116') {
          console.error('Error deleting assessments:', assessmentsError)
          deletionSteps.push({ table: 'assessments', error: assessmentsError.message })
          hasErrors = true // This is critical
        } else {
          deletionSteps.push({ table: 'assessments', success: true })
        }
      } catch (e) {
        console.error('Exception deleting assessments:', e)
        hasErrors = true
      }

      // Step 3: Delete assessment_runs
      try {
        const { error: runsError } = await supabase
          .from('assessment_runs')
          .delete()
          .eq('project_id', projectId)

        if (runsError && runsError.code !== 'PGRST116') {
          console.error('Error deleting assessment_runs:', runsError)
          deletionSteps.push({ table: 'assessment_runs', error: runsError.message })
        } else {
          deletionSteps.push({ table: 'assessment_runs', success: true })
        }
      } catch (e) {
        console.error('Exception deleting assessment_runs:', e)
      }

      // Step 4: Delete project_summaries
      try {
        const { error: summariesError } = await supabase
          .from('project_summaries')
          .delete()
          .eq('project_id', projectId)

        if (summariesError && summariesError.code !== 'PGRST116') {
          console.error('Error deleting project_summaries:', summariesError)
          deletionSteps.push({ table: 'project_summaries', error: summariesError.message })
        } else {
          deletionSteps.push({ table: 'project_summaries', success: true })
        }
      } catch (e) {
        console.error('Exception deleting project_summaries:', e)
      }

      // Step 5: Delete files
      try {
        const { error: filesError } = await supabase
          .from('files')
          .delete()
          .eq('project_id', projectId)

        if (filesError && filesError.code !== 'PGRST116') {
          console.error('Error deleting files:', filesError)
          deletionSteps.push({ table: 'files', error: filesError.message })
        } else {
          deletionSteps.push({ table: 'files', success: true })
        }
      } catch (e) {
        console.error('Exception deleting files:', e)
      }

      // Log what we've done so far
      console.log('Deletion steps completed:', deletionSteps)

      // Step 6: Finally, try to delete the project
      const { error: projectError } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)

      if (projectError) {
        console.error('Error deleting project:', projectError)
        setDeletingProject(false)

        // Check if it's a foreign key constraint
        if (projectError.code === '23503' || projectError.message?.includes('foreign key constraint')) {
          // Parse which table is causing the issue
          const match = projectError.message?.match(/"([^"]+)"/g)
          const tableName = match ? match[1]?.replace(/"/g, '') : 'related data'

          setToast({
            message: `Cannot delete project: ${tableName} still contains related data. Please try refreshing the page and trying again.`,
            type: 'error'
          })
        } else {
          setToast({
            message: `Failed to delete project: ${projectError.message || 'Unknown error'}`,
            type: 'error'
          })
        }
        return
      }

      // Success - navigate to dashboard
      setToast({
        message: 'Project deleted successfully',
        type: 'success'
      })

      // Small delay to show success message before navigation
      setTimeout(() => {
        navigate('/projects')
      }, 750)

    } catch (err: any) {
      console.error('Unexpected error during deletion:', err)
      setDeletingProject(false)
      setToast({
        message: `An unexpected error occurred: ${err.message || 'Please try again'}`,
        type: 'error'
      })
    }
  }

  const handleRerunAssessmentClick = () => {
    setShowRerunConfirmDialog(true)
  }

  const handleConfirmRerun = async () => {
    setShowRerunConfirmDialog(false)
    await handleRunAssessment()
  }

  const handleDeleteAllActions = async () => {
    if (!actions || actions.length === 0) return

    const confirmed = window.confirm(
      `Are you sure you want to permanently delete all ${actions.length} actions? This action cannot be undone.`
    )

    if (!confirmed) return

    try {
      const actionIds = actions.map((action: any) => action.id)
      await n8nApi.bulkDeleteActions(actionIds)

      setToast({
        message: `Successfully deleted ${actions.length} actions`,
        type: 'success'
      })

      // Refetch actions to update the UI
      refetchActions()
    } catch (error) {
      console.error('Error deleting actions:', error)
      setToast({
        message: 'Failed to delete actions. Please try again.',
        type: 'error'
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg text-text-secondary">Loading project...</div>
      </div>
    )
  }

  if (!projectData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-text-secondary mb-4">Project not found</p>
          <Link to="/projects">
            <Button variant="primary">Back to Projects</Button>
          </Link>
        </div>
      </div>
    )
  }

  const hasFiles = documents.length > 0
  const hasAssessments = projectData.assessments && projectData.assessments.length > 0

  // Get template code for document guidance
  const templateCode = projectData.assessment_templates?.code || null
  const templateName = projectData.assessment_templates?.name || null

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: LayoutGrid },
    { id: 'documents' as TabType, label: 'Documents', icon: FileText, badge: documents.length },
    { id: 'assessment-summary' as TabType, label: 'Assessment Summary', icon: BarChart3, badge: hasAssessments ? projectData.assessments.length : undefined },
    { id: 'assessment-detail' as TabType, label: 'Assessment Detail', icon: FileBarChart, badge: hasAssessments ? projectData.assessments.length : undefined },
    { id: 'actions' as TabType, label: 'Actions', icon: Target, badge: actions.length > 0 ? actions.length : undefined },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header style={{
        background: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{
          maxWidth: '1600px',
          margin: '0 auto',
          padding: '1rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <a href="https://www.programmeinsights.co.uk" style={{ textDecoration: 'none' }}>
              <div>
                <div style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: '#0a1628',
                  fontFamily: 'var(--font-display)'
                }}>
                  Gateway<span style={{ color: '#c17f4e' }}>Success</span>
                </div>
                <div style={{
                  fontSize: '0.7rem',
                  color: '#6b7280',
                  fontWeight: 500,
                  fontFamily: 'var(--font-body)',
                  letterSpacing: '0.025em'
                }}>
                  NISTA/PAR Assessment
                </div>
              </div>
            </a>
            <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link
                to="/projects"
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#6b7280',
                  textDecoration: 'none',
                  borderRadius: '0.375rem',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = '#0a1628'
                  e.currentTarget.style.background = '#f3f4f6'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = '#6b7280'
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                Projects
              </Link>
              <Link
                to="/criteria"
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#6b7280',
                  textDecoration: 'none',
                  borderRadius: '0.375rem',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = '#0a1628'
                  e.currentTarget.style.background = '#f3f4f6'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = '#6b7280'
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                <ClipboardList size={16} />
                Criteria
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Project Header */}
        <div className="mb-6">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <h1 className="text-4xl font-bold text-text-primary">
              {projectData.project_name}
            </h1>
            <button
              onClick={() => setShowDeleteModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: '#dc2626',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                fontWeight: 600,
                fontSize: '0.875rem',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#b91c1c'
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#dc2626'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <Trash2 size={16} />
              <span className="hidden sm:inline">Delete Project</span>
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <span style={{
              display: 'inline-block',
              padding: '0.25rem 0.75rem',
              background: '#0a1628',
              color: 'white',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.025em'
            }}>
              {projectData.assessment_templates?.name || 'Gate 0'}
            </span>
          </div>
          <div className="flex flex-wrap gap-4 text-text-secondary">
            {projectData.project_value && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-success/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-success font-bold text-xs">£</span>
                </div>
                <span>
                  <span className="font-semibold text-text-primary">
                    £{projectData.project_value.toLocaleString()}M
                  </span>
                  {' '}value
                </span>
              </div>
            )}
            {projectData.project_sector && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <LayoutGrid className="text-accent" size={14} />
                </div>
                <span>{projectData.project_sector}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Activity className="text-primary" size={14} />
              </div>
              <span>
                <span className="font-semibold text-text-primary capitalize">{projectData.status}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div style={{
            borderBottom: '1px solid #e5e7eb',
            background: '#ffffff'
          }}>
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              padding: '0 0.5rem'
            }}>
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem 1rem',
                      fontWeight: 500,
                      fontSize: '0.875rem',
                      transition: 'all 0.2s',
                      position: 'relative',
                      border: 'none',
                      borderRadius: '0.375rem 0.375rem 0 0',
                      marginBottom: '-1px',
                      cursor: 'pointer',
                      background: isActive ? '#f9fafb' : 'transparent',
                      color: isActive ? '#0a1628' : '#6b7280',
                      borderTop: isActive ? '1px solid #e5e7eb' : '1px solid transparent',
                      borderLeft: isActive ? '1px solid #e5e7eb' : '1px solid transparent',
                      borderRight: isActive ? '1px solid #e5e7eb' : '1px solid transparent',
                      borderBottom: isActive ? '1px solid #f9fafb' : 'none'
                    }}
                    onMouseEnter={e => {
                      if (!isActive) {
                        e.currentTarget.style.color = '#0a1628'
                        e.currentTarget.style.background = '#f3f4f6'
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isActive) {
                        e.currentTarget.style.color = '#6b7280'
                        e.currentTarget.style.background = 'transparent'
                      }
                    }}
                  >
                    <Icon size={18} />
                    <span>{tab.label}</span>
                    {tab.badge !== undefined && tab.badge > 0 && (
                      <span style={{
                        padding: '0.125rem 0.5rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        minWidth: '20px',
                        textAlign: 'center',
                        background: '#f3f4f6',
                        color: '#0a1628'
                      }}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-card rounded-b-2xl rounded-tr-2xl shadow-sm border border-border min-h-[500px]">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div style={{ background: 'var(--gray-50)', minHeight: '600px' }}>
              <ProjectOverview
                project={{
                  ...projectData,
                  template_name: projectData.assessment_templates?.name,
                  documents: documents
                }}
                assessmentResults={projectData.assessments || []}
                latestAssessment={projectData.assessmentRunId ? {
                  id: projectData.assessmentRunId,
                  created_at: projectData.assessments?.[0]?.created_at || new Date().toISOString()
                } : null}
              />
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <DocumentsTabContent
              documents={documents}
              templateName={templateName || 'Gate 0'}
              projectData={projectData}
              hasAssessments={hasAssessments}
              hasFiles={hasFiles}
              runningAssessment={runningAssessment}
              onUploadClick={() => setShowUploadModal(true)}
              onDeleteDocument={handleDeleteDocument}
              deletingDocumentId={deletingDocumentId}
              onRunAssessment={handleRunAssessment}
              onRerunAssessment={handleRerunAssessmentClick}
              onViewResults={() => {
                setActiveTab('assessment-summary')
                setTimeout(() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }, 100)
              }}
            />
          )}

          {/* Assessment Summary Tab */}
          {activeTab === 'assessment-summary' && (
            <div style={{ padding: '2rem' }}>
              {/* Assessment Summary Dashboard */}
              {hasAssessments ? (
                <AssessmentSummary
                  project={projectData}
                  assessmentResults={projectData.assessments || []}
                  onRerunAssessment={handleRerunAssessmentClick}
                  onExportExcel={() => {
                    // TODO: Implement Excel export
                    setToast({
                      type: 'info',
                      message: 'Excel export feature coming soon'
                    })
                  }}
                  onExportPDF={() => {
                    // TODO: Implement PDF export
                    window.print() // For now, use browser print
                  }}
                  onGenerateActionPlan={() => {
                    setActiveTab('actions')
                  }}
                  runningAssessment={runningAssessment}
                />
              ) : (
                <div className="text-center py-16 bg-white rounded-lg border-2 border-dashed border-border">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="text-text-secondary" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-text-primary mb-2">
                    No Assessment Results Yet
                  </h3>
                  <p className="text-text-secondary max-w-md mx-auto mb-6">
                    {hasFiles
                      ? 'Your documents are ready. Run an assessment to analyze them against NISTA/PAR criteria.'
                      : 'Upload documents in the Documents tab, then run an assessment to see results here.'}
                  </p>

                  {/* Progress Bar - shown when assessment is running */}
                  {runningAssessment && assessmentProgress && (
                    <div className="max-w-2xl mx-auto mb-6">
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-blue-600 flex items-center gap-2">
                              <Loader2 size={16} className="animate-spin" />
                              Assessing criteria...
                            </span>
                            <span className="text-sm font-semibold text-gray-700">
                              {assessmentProgress.current} of {assessmentProgress.total}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-out"
                              style={{
                                width: `${Math.round((assessmentProgress.current / assessmentProgress.total) * 100)}%`
                              }}
                            />
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 text-center">
                          This may take 2-5 minutes depending on document size
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    {hasFiles ? (
                      <button
                        onClick={handleRunAssessment}
                        disabled={runningAssessment}
                        className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {runningAssessment ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            Running Assessment...
                          </>
                        ) : (
                          <>
                            <Play size={18} />
                            Run Assessment
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={() => setActiveTab('documents')}
                        className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-sm hover:shadow-md"
                      >
                        Go to Documents
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Assessment Detail Tab */}
          {activeTab === 'assessment-detail' && (
            <div className="p-0">
              {hasAssessments ? (
                <AssessmentDetail
                  project={projectData}
                  assessmentResults={projectData.assessments}
                  onRerunAssessment={handleRerunAssessmentClick}
                  runningAssessment={runningAssessment}
                />
              ) : (
                <div className="p-8">
                  <div className="text-center py-16 bg-card rounded-xl border-2 border-dashed border-border">
                    <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <ClipboardList className="text-accent" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-text-primary mb-2">
                      No Assessment Results Yet
                    </h3>
                    <p className="text-text-secondary max-w-md mx-auto">
                      Upload documents and run an assessment to see detailed criteria here
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions Tab */}
          {activeTab === 'actions' && (
            <div className="p-8">
              {actionsLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="animate-spin text-accent" size={32} />
                  <span className="ml-3 text-text-secondary">Loading actions...</span>
                </div>
              ) : actions.length > 0 ? (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-text-primary mb-2">
                        Action Plan ({actions.length})
                      </h2>
                      <p className="text-text-secondary">
                        Track and manage actions from your assessment
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          setActiveTab('assessment-summary')
                          setOpenActionPlanWorkspace(true)
                        }}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 transition-all"
                        title="Generate action plan"
                      >
                        <Sparkles size={16} />
                        Generate Plan
                      </button>
                      <button
                        onClick={handleDeleteAllActions}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-all"
                        title="Delete all actions"
                      >
                        <Trash2 size={16} />
                        Delete All
                      </button>
                    </div>
                  </div>

                  {/* Action Table View */}
                  <ActionTableView
                    projectId={parseInt(id!)}
                    onActionClick={setSelectedActionId}
                  />
                </div>
              ) : hasAssessments ? (
                <div className="text-center py-20 bg-card rounded-xl border-2 border-dashed border-border">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <Target className="text-orange-600" size={36} />
                  </div>
                  <h3 className="text-2xl font-bold text-text-primary mb-3">
                    No Actions Yet
                  </h3>
                  <p className="text-text-secondary mb-2 max-w-lg mx-auto text-base">
                    Your assessment has identified areas for improvement.
                  </p>
                  <p className="text-text-secondary mb-8 max-w-lg mx-auto text-base">
                    Generate an AI-powered action plan to address the weaknesses and strengthen your project.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => {
                        setActiveTab('assessment-summary')
                        setOpenActionPlanWorkspace(true)
                      }}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all hover:shadow-lg shadow-blue-500/30"
                    >
                      <Sparkles size={20} />
                      Generate Action Plan
                    </button>
                    <button
                      onClick={() => setActiveTab('assessment-summary')}
                      className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 px-6 py-3 rounded-xl font-semibold transition-all hover:shadow-md"
                    >
                      <BarChart3 size={20} />
                      View Assessment
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 bg-card rounded-xl border-2 border-dashed border-border">
                  <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Target className="text-accent" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-text-primary mb-2">
                    No Actions Yet
                  </h3>
                  <p className="text-text-secondary mb-6 max-w-md mx-auto">
                    Complete an assessment first to generate an action plan
                  </p>
                  <button
                    onClick={() => setActiveTab('assessment-summary')}
                    className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-xl font-semibold transition-all hover:shadow-lg shadow-accent/30"
                  >
                    <BarChart3 size={18} />
                    Go to Assessment
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Project"
        size="sm"
      >
        <p className="text-text-secondary mb-6">
          Are you sure you want to delete this project? This action cannot be
          undone.
        </p>
        <div className="flex gap-4">
          <Button
            variant="secondary"
            onClick={() => setShowDeleteModal(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteProject}
            disabled={deletingProject}
            className="flex-1"
          >
            {deletingProject ? 'Deleting...' : 'Delete Project'}
          </Button>
        </div>
      </Modal>

      {/* Re-run Assessment Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showRerunConfirmDialog}
        onClose={() => setShowRerunConfirmDialog(false)}
        onConfirm={handleConfirmRerun}
        title="Re-run Assessment?"
        message="This will create a new assessment using your latest uploaded documents. Previous assessment results will be archived for comparison. Do you want to continue?"
        confirmText="Re-run Assessment"
        confirmVariant="primary"
        isLoading={runningAssessment}
        icon={
          <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
            <RefreshCw className="text-accent" size={24} />
          </div>
        }
      />

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Upload Documents Modal */}
      <UploadDocumentsModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        projectId={parseInt(id!)}
        currentDocumentCount={documents.length}
        onUploadComplete={() => {
          refetchDocuments()
          refetch()
        }}
      />

      {/* Action Detail Modal */}
      {selectedActionId && (
        <ActionDetailModal
          actionId={selectedActionId}
          onClose={() => setSelectedActionId(null)}
        />
      )}
    </div>
  )
}
