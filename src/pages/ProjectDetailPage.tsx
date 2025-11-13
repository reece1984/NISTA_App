import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Play, Trash2, Loader2, ClipboardList, Eye, Upload, LayoutGrid, FileText, BarChart3, Target, Activity } from 'lucide-react'
import { supabase } from '../lib/supabase'
import Button from '../components/ui/Button'
import AssessmentResults from '../components/AssessmentResults'
import Modal from '../components/ui/Modal'
import Toast, { type ToastType } from '../components/ui/Toast'
import TemplateDetailSheet from '../components/TemplateDetailSheet'
import DocumentGuidancePanel from '../components/DocumentGuidancePanel'
import DocumentsList from '../components/DocumentsList'
import UploadDocumentsModal from '../components/UploadDocumentsModal'
import { useDocuments } from '../hooks/useDocuments'

type TabType = 'overview' | 'documents' | 'assessment' | 'actions'

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [runningAssessment, setRunningAssessment] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showCriteriaSheet, setShowCriteriaSheet] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [deletingDocumentId, setDeletingDocumentId] = useState<number | null>(null)
  const [assessmentError, setAssessmentError] = useState('')
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)
  const [assessmentProgress, setAssessmentProgress] = useState<{ current: number; total: number } | null>(null)

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

      // Fetch assessments for this project
      const { data: assessments, error: assessmentsError } = await supabase
        .from('assessments')
        .select('*, assessment_criteria (*)')
        .eq('project_id', id!)

      if (assessmentsError && assessmentsError.code !== 'PGRST116') {
        console.error('Assessments error:', assessmentsError)
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

      // Fetch the most recent assessment run ID
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

      return {
        ...project,
        files: files || [],
        assessments: assessments || [],
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

      let response
      try {
        response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })
      } catch (fetchError: any) {
        console.error('❌ Fetch error:', fetchError)
        throw new Error(`Failed to connect to N8N: ${fetchError.message}. Check that N8N is running and the webhook URL is correct.`)
      }

      console.log('✅ N8N Response Status:', response.status)
      const responseData = await response.text()
      console.log('📥 N8N Response:', responseData)

      if (!response.ok) {
        throw new Error(`N8N webhook failed with status ${response.status}: ${responseData}`)
      }

      // Poll for completion - check every 3 seconds for up to 10 minutes (for 50 criteria)
      let pollCount = 0
      const maxPolls = 200 // 200 polls × 3 seconds = 10 minutes

      const pollInterval = setInterval(async () => {
        pollCount++

        // Count how many assessments have been completed for this project
        const { count: completedCount } = await supabase
          .from('assessments')
          .select('*', { count: 'exact', head: true })
          .eq('project_id', id!)

        const completed = completedCount || 0

        console.log(`📊 Poll ${pollCount}: ${completed}/${total} assessments completed`)

        // Update progress
        setAssessmentProgress({ current: completed, total })

        // Update toast with progress
        const percentage = Math.round((completed / total) * 100)
        setToast({
          message: `Assessing criteria... ${completed} of ${total} (${percentage}%)`,
          type: 'loading'
        })

        // Check project status
        const { data: updatedProject } = await supabase
          .from('projects')
          .select('status')
          .eq('id', id!)
          .single()

        console.log(`🔍 Project status: ${updatedProject?.status}, All complete: ${completed >= total}`)

        // Check if completed (either status is 'completed', all criteria done, or timed out)
        const allCriteriaComplete = completed >= total
        if (updatedProject?.status === 'completed' || allCriteriaComplete || pollCount >= maxPolls) {
          console.log('✅ Assessment complete! Stopping polling...')
          clearInterval(pollInterval)
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
      }, 3000) // Poll every 3 seconds

    } catch (err: any) {
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
      const { error } = await supabase.from('projects').delete().eq('id', id!)

      if (error) throw error

      navigate('/dashboard')
    } catch (err: any) {
      console.error('Error deleting project:', err)
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
          <Link to="/dashboard">
            <Button variant="primary">Back to Dashboard</Button>
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
    { id: 'assessment' as TabType, label: 'Assessment', icon: BarChart3, badge: hasAssessments ? projectData.assessments.length : undefined },
    { id: 'actions' as TabType, label: 'Actions', icon: Target },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link to="/dashboard" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Target className="text-white" size={22} />
                </div>
                <div>
                  <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Gateway Success
                  </div>
                  <div className="text-xs text-slate-600 font-medium">NISTA/PAR Assessment</div>
                </div>
              </Link>
              <nav className="hidden md:flex items-center gap-1 ml-4">
                <Link
                  to="/dashboard"
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                >
                  Dashboard
                </Link>
                <Link
                  to="/criteria"
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all flex items-center gap-2"
                >
                  <ClipboardList size={16} />
                  Criteria
                </Link>
              </nav>
              <Link
                to="/dashboard"
                className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors text-sm md:hidden font-medium"
              >
                <ArrowLeft size={16} />
                Back
              </Link>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all shadow-sm hover:shadow-md"
            >
              <Trash2 size={16} />
              <span className="hidden sm:inline">Delete Project</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Project Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            {projectData.project_name}
          </h1>
          <div className="flex flex-wrap gap-4 text-slate-700">
            {projectData.project_value && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-emerald-600 font-bold text-xs">£</span>
                </div>
                <span>
                  <span className="font-semibold text-slate-900">
                    £{projectData.project_value.toLocaleString()}M
                  </span>
                  {' '}value
                </span>
              </div>
            )}
            {projectData.project_sector && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <LayoutGrid className="text-blue-600" size={14} />
                </div>
                <span>{projectData.project_sector}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Activity className="text-indigo-600" size={14} />
              </div>
              <span>
                <span className="font-semibold text-slate-900 capitalize">{projectData.status}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-slate-200 bg-white/50 backdrop-blur-sm rounded-t-2xl">
            <div className="flex gap-1 p-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all
                      ${activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }
                    `}
                  >
                    <Icon size={18} />
                    <span>{tab.label}</span>
                    {tab.badge !== undefined && tab.badge > 0 && (
                      <span className={`
                        px-2 py-0.5 rounded-full text-xs font-bold min-w-[20px] text-center
                        ${activeTab === tab.id
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-200 text-slate-700'
                        }
                      `}>
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
        <div className="bg-white rounded-b-2xl rounded-tr-2xl shadow-sm border border-slate-200/50 min-h-[500px]">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="p-8">
              {/* Assessment Template Info */}
              {projectData.assessment_templates && (
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">Assessment Template</h2>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-l-4 border-blue-600 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-bold bg-blue-600 text-white shadow-sm">
                          Template
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-900 mb-2">
                          {projectData.assessment_templates.name}
                        </h3>
                        {projectData.assessment_templates.description && (
                          <p className="text-sm text-slate-700 mb-3 leading-relaxed">
                            {projectData.assessment_templates.description}
                          </p>
                        )}
                        <button
                          onClick={() => setShowCriteriaSheet(true)}
                          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 transition-colors font-semibold"
                        >
                          <Eye size={16} />
                          View Template Criteria
                        </button>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Project Summary */}
              {projectData.projectSummary && (
                <section>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">
                    Executive Summary
                  </h2>
                  <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-6 border border-slate-200">
                    {/* Overall Rating */}
                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-200">
                      <div className="text-sm font-medium text-slate-600">
                        Overall Assessment Rating:
                      </div>
                      <span
                        className={`px-6 py-3 rounded-xl font-bold text-lg shadow-lg ${
                          projectData.projectSummary.overall_rating === 'green'
                            ? 'bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-emerald-500/30'
                            : projectData.projectSummary.overall_rating === 'amber'
                            ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-amber-500/30'
                            : projectData.projectSummary.overall_rating === 'red'
                            ? 'bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-red-500/30'
                            : 'bg-slate-300 text-slate-700'
                        }`}
                      >
                        {projectData.projectSummary.overall_rating.toUpperCase()}
                      </span>
                    </div>

                    {/* Executive Summary */}
                    {projectData.projectSummary.executive_summary && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-slate-900 mb-3">
                          Executive Summary
                        </h3>
                        <p className="text-slate-700 leading-relaxed">
                          {projectData.projectSummary.executive_summary}
                        </p>
                      </div>
                    )}

                    {/* Key Strengths */}
                    {projectData.projectSummary.key_strengths && (
                      <div className="mb-6 p-5 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border-l-4 border-emerald-500">
                        <h3 className="text-lg font-semibold text-emerald-700 mb-3">
                          Key Strengths
                        </h3>
                        <p className="text-slate-700 leading-relaxed">
                          {projectData.projectSummary.key_strengths}
                        </p>
                      </div>
                    )}

                    {/* Critical Issues */}
                    {projectData.projectSummary.critical_issues && (
                      <div className="mb-6 p-5 bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border-l-4 border-red-500">
                        <h3 className="text-lg font-semibold text-red-700 mb-3">
                          Critical Issues
                        </h3>
                        <p className="text-slate-700 leading-relaxed">
                          {projectData.projectSummary.critical_issues}
                        </p>
                      </div>
                    )}

                    {/* Overall Recommendation */}
                    {projectData.projectSummary.overall_recommendation && (
                      <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-l-4 border-blue-500">
                        <h3 className="text-lg font-semibold text-blue-700 mb-3">
                          Overall Recommendation
                        </h3>
                        <p className="text-slate-700 leading-relaxed">
                          {projectData.projectSummary.overall_recommendation}
                        </p>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {!projectData.projectSummary && (
                <div className="text-center py-16 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border-2 border-dashed border-slate-300">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="text-blue-600" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    No Assessment Yet
                  </h3>
                  <p className="text-slate-600 mb-6 max-w-md mx-auto">
                    Upload documents and run an assessment to see your executive summary
                  </p>
                  <button
                    onClick={() => setActiveTab('documents')}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all hover:shadow-lg shadow-blue-500/30"
                  >
                    <FileText size={18} />
                    Go to Documents
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Project Documents ({documents.length})
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    Upload up to 50 PDF documents for comprehensive assessment
                  </p>
                </div>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all hover:shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={documents.length >= 50}
                >
                  <Upload size={18} />
                  Add Documents
                </button>
              </div>

              {/* Document Guidance Panel */}
              <DocumentGuidancePanel templateCode={templateCode} templateName={templateName} />

              {/* Documents List */}
              <DocumentsList
                documents={documents}
                onDelete={handleDeleteDocument}
                deletingId={deletingDocumentId}
                onUploadClick={() => setShowUploadModal(true)}
              />

              {/* Run Assessment CTA */}
              <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      Ready to assess your documents?
                    </h3>
                    <p className="text-slate-700">
                      {hasFiles
                        ? 'Run the NISTA/PAR assessment to receive detailed feedback'
                        : 'Upload at least one document to run the assessment'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab('assessment')
                      setTimeout(() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }, 100)
                    }}
                    disabled={!hasFiles}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all hover:shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Play size={18} />
                    Go to Assessment
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Assessment Tab */}
          {activeTab === 'assessment' && (
            <div className="p-8">
              {/* Run Assessment Section */}
              <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 border-2 border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">
                      Ready to assess your documents?
                    </h3>
                    <p className="text-slate-700">
                      {hasFiles
                        ? 'Run the NISTA/PAR assessment to receive detailed feedback'
                        : 'Upload at least one document to run the assessment'}
                    </p>
                  </div>
                  <button
                    onClick={handleRunAssessment}
                    disabled={!hasFiles || runningAssessment}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all hover:shadow-xl shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {runningAssessment ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Running Assessment...
                      </>
                    ) : (
                      <>
                        <Play size={20} />
                        Run Assessment
                      </>
                    )}
                  </button>
                </div>

                {/* Progress Bar */}
                {assessmentProgress && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-900">
                        Assessment Progress
                      </span>
                      <span className="text-sm font-semibold text-blue-600">
                        {assessmentProgress.current} / {assessmentProgress.total} criteria
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 h-3 rounded-full transition-all duration-500 ease-out"
                        style={{
                          width: `${Math.min(
                            (assessmentProgress.current / assessmentProgress.total) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-slate-600 mt-2">
                      {Math.round(
                        (assessmentProgress.current / assessmentProgress.total) * 100
                      )}% complete • This may take several minutes
                    </p>
                  </div>
                )}

                {assessmentError && (
                  <p className="mt-4 text-red-600 font-medium">{assessmentError}</p>
                )}
              </div>

              {/* Assessment Results */}
              {hasAssessments ? (
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">
                    Detailed Assessment Results
                  </h2>
                  <AssessmentResults
                    assessments={projectData.assessments}
                    projectSummary={projectData.projectSummary}
                    projectData={projectData}
                    assessmentRunId={projectData.assessmentRunId}
                  />
                </div>
              ) : (
                <div className="text-center py-16 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border-2 border-dashed border-slate-300">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="text-blue-600" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    No Assessment Results Yet
                  </h3>
                  <p className="text-slate-600 max-w-md mx-auto">
                    Upload documents and run an assessment to see detailed results here
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Actions Tab */}
          {activeTab === 'actions' && (
            <div className="p-8">
              {hasAssessments ? (
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">Action Plan</h2>
                  <p className="text-slate-600 mb-6">
                    View and manage actions generated from your assessment results.
                  </p>
                  <AssessmentResults
                    assessments={projectData.assessments}
                    projectSummary={projectData.projectSummary}
                    projectData={projectData}
                    assessmentRunId={projectData.assessmentRunId}
                  />
                </div>
              ) : (
                <div className="text-center py-16 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border-2 border-dashed border-slate-300">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Target className="text-blue-600" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    No Actions Yet
                  </h3>
                  <p className="text-slate-600 mb-6 max-w-md mx-auto">
                    Complete an assessment first to generate an action plan
                  </p>
                  <button
                    onClick={() => setActiveTab('assessment')}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all hover:shadow-lg shadow-blue-500/30"
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
            className="flex-1"
          >
            Delete Project
          </Button>
        </div>
      </Modal>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Template Criteria Sheet */}
      {projectData.assessment_templates && (
        <TemplateDetailSheet
          isOpen={showCriteriaSheet}
          onClose={() => setShowCriteriaSheet(false)}
          templateId={projectData.assessment_templates.id}
          templateName={projectData.assessment_templates.name}
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
    </div>
  )
}
