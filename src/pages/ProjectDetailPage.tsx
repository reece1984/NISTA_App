import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Play, Trash2, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import Button from '../components/ui/Button'
import FileUpload from '../components/FileUpload'
import AssessmentResults from '../components/AssessmentResults'
import Modal from '../components/ui/Modal'
import Toast, { type ToastType } from '../components/ui/Toast'

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [runningAssessment, setRunningAssessment] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
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
        .eq('projectId', id!)

      if (filesError && filesError.code !== 'PGRST116') {
        console.error('Files error:', filesError)
      }

      // Fetch assessments for this project
      const { data: assessments, error: assessmentsError } = await supabase
        .from('assessments')
        .select('*, assessment_criteria (*)')
        .eq('projectId', id!)

      if (assessmentsError && assessmentsError.code !== 'PGRST116') {
        console.error('Assessments error:', assessmentsError)
      }

      // Fetch project summary
      const { data: projectSummary, error: summaryError } = await supabase
        .from('project_summaries')
        .select('*')
        .eq('project_id', id!)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (summaryError && summaryError.code !== 'PGRST116') {
        console.error('Project summary error:', summaryError)
      }

      return {
        ...project,
        files: files || [],
        assessments: assessments || [],
        projectSummary: projectSummary || null,
      }
    },
    enabled: !!id,
  })

  const handleRunAssessment = async () => {
    if (!projectData || !projectData.files || projectData.files.length === 0) {
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
      await supabase
        .from('projects')
        .update({ status: 'processing' })
        .eq('id', id!)

      // Trigger N8N webhook for assessment
      const webhookUrl = import.meta.env.VITE_N8N_RUN_ASSESSMENT_WEBHOOK
      if (!webhookUrl) {
        throw new Error('Assessment webhook URL not configured')
      }

      const payload = {
        identifier: 'run_assessment',
        projectId: parseInt(id!),
        files: projectData.files.map((f: any) => ({
          fileId: f.id,
          fileName: f.fileName,
          fileType: f.fileType,
          fileUrl: f.fileUrl,
          fileKey: f.fileKey,
        })),
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

      if (!response.ok) {
        throw new Error('Failed to trigger assessment')
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
          .eq('projectId', id!)

        const completed = completedCount || 0

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

        // Check if completed or timed out
        if (updatedProject?.status === 'completed' || pollCount >= maxPolls) {
          clearInterval(pollInterval)
          setRunningAssessment(false)
          setAssessmentProgress(null)

          // Refetch all data to show results
          await refetch()

          // Update project status to completed if still processing
          if (updatedProject?.status === 'processing') {
            await supabase
              .from('projects')
              .update({ status: 'completed' })
              .eq('id', id!)
          }

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

  const files = projectData.files || []
  const businessCase = files.find((f: any) => f.fileType === 'business_case')
  const pep = files.find((f: any) => f.fileType === 'pep')
  const riskRegister = files.find((f: any) => f.fileType === 'risk_register')
  const hasFiles = files.length > 0
  const hasAssessments = projectData.assessments && projectData.assessments.length > 0

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link to="/dashboard" className="flex items-center gap-2">
                <div>
                  <div className="text-lg font-semibold text-text-primary">Gateway Success</div>
                  <div className="text-xs text-text-secondary">NISTA/PAR Assessment</div>
                </div>
              </Link>
              <Link
                to="/dashboard"
                className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors text-sm"
              >
                <ArrowLeft size={16} />
                Back
              </Link>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2"
            >
              <Trash2 size={16} />
              Delete Project
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Project Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-text-primary mb-4">
            {projectData.projectName}
          </h1>
          <div className="flex gap-6 text-text-secondary">
            {projectData.projectValue && (
              <div>
                <span className="font-medium">Value:</span> £
                {projectData.projectValue.toLocaleString()} million
              </div>
            )}
            {projectData.projectSector && (
              <div>
                <span className="font-medium">Sector:</span>{' '}
                {projectData.projectSector}
              </div>
            )}
            <div>
              <span className="font-medium">Status:</span>{' '}
              <span className="capitalize">{projectData.status}</span>
            </div>
          </div>
        </div>

        {/* Assessment Template Info */}
        {projectData.assessment_templates && (
          <section className="mb-8">
            <div className="card bg-gradient-to-r from-secondary/5 to-accent/5 border-l-4 border-secondary">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-secondary text-white">
                    Template
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    {projectData.assessment_templates.name}
                  </h3>
                  {projectData.assessment_templates.description && (
                    <p className="text-sm text-text-secondary">
                      {projectData.assessment_templates.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Document Upload Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-text-primary mb-6">
            Project Documents
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <FileUpload
              projectId={parseInt(id!)}
              fileType="business_case"
              label="Business Case"
              onUploadSuccess={refetch}
              existingFile={businessCase}
            />
            <FileUpload
              projectId={parseInt(id!)}
              fileType="pep"
              label="Project Execution Plan (PEP)"
              onUploadSuccess={refetch}
              existingFile={pep}
            />
            <FileUpload
              projectId={parseInt(id!)}
              fileType="risk_register"
              label="Risk Register"
              onUploadSuccess={refetch}
              existingFile={riskRegister}
            />
          </div>
        </section>

        {/* Run Assessment Button */}
        <section className="mb-12">
          <div className="card bg-secondary/5 border-secondary">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  Ready to assess your documents?
                </h3>
                <p className="text-text-secondary">
                  {hasFiles
                    ? 'Run the NISTA/PAR assessment to receive detailed feedback'
                    : 'Upload at least one document to run the assessment'}
                </p>
              </div>
              <Button
                variant="accent"
                size="lg"
                onClick={handleRunAssessment}
                disabled={!hasFiles || runningAssessment}
                className="flex items-center gap-2"
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
              </Button>
            </div>

            {/* Progress Bar */}
            {assessmentProgress && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-text-primary">
                    Assessment Progress
                  </span>
                  <span className="text-sm font-semibold text-secondary">
                    {assessmentProgress.current} / {assessmentProgress.total} criteria
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-secondary to-accent h-3 rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${Math.min(
                        (assessmentProgress.current / assessmentProgress.total) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-text-secondary mt-2">
                  {Math.round(
                    (assessmentProgress.current / assessmentProgress.total) * 100
                  )}% complete • This may take several minutes
                </p>
              </div>
            )}

            {assessmentError && (
              <p className="mt-4 text-error">{assessmentError}</p>
            )}
          </div>
        </section>

        {/* Project Summary */}
        {projectData.projectSummary && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-text-primary mb-6">
              Executive Summary
            </h2>
            <div className="card bg-gradient-to-br from-secondary/5 to-primary/5">
              {/* Overall Rating */}
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
                <div className="text-sm font-medium text-text-secondary">
                  Overall Assessment Rating:
                </div>
                <span
                  className={`px-4 py-2 rounded-lg font-bold text-lg ${
                    projectData.projectSummary.overall_rating === 'green'
                      ? 'bg-rag-green text-white'
                      : projectData.projectSummary.overall_rating === 'amber'
                      ? 'bg-rag-amber text-white'
                      : projectData.projectSummary.overall_rating === 'red'
                      ? 'bg-rag-red text-white'
                      : 'bg-gray-300 text-gray-700'
                  }`}
                >
                  {projectData.projectSummary.overall_rating.toUpperCase()}
                </span>
              </div>

              {/* Executive Summary */}
              {projectData.projectSummary.executive_summary && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-3">
                    Executive Summary
                  </h3>
                  <p className="text-text-secondary leading-relaxed">
                    {projectData.projectSummary.executive_summary}
                  </p>
                </div>
              )}

              {/* Key Strengths */}
              {projectData.projectSummary.key_strengths && (
                <div className="mb-6 p-4 bg-green-50 rounded-lg border-l-4 border-rag-green">
                  <h3 className="text-lg font-semibold text-rag-green mb-3">
                    Key Strengths
                  </h3>
                  <p className="text-text-secondary leading-relaxed">
                    {projectData.projectSummary.key_strengths}
                  </p>
                </div>
              )}

              {/* Critical Issues */}
              {projectData.projectSummary.critical_issues && (
                <div className="mb-6 p-4 bg-red-50 rounded-lg border-l-4 border-rag-red">
                  <h3 className="text-lg font-semibold text-rag-red mb-3">
                    Critical Issues
                  </h3>
                  <p className="text-text-secondary leading-relaxed">
                    {projectData.projectSummary.critical_issues}
                  </p>
                </div>
              )}

              {/* Overall Recommendation */}
              {projectData.projectSummary.overall_recommendation && (
                <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-secondary">
                  <h3 className="text-lg font-semibold text-secondary mb-3">
                    Overall Recommendation
                  </h3>
                  <p className="text-text-secondary leading-relaxed">
                    {projectData.projectSummary.overall_recommendation}
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Assessment Results */}
        {hasAssessments && (
          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-6">
              Detailed Assessment Results
            </h2>
            <AssessmentResults
              assessments={projectData.assessments}
              projectSummary={projectData.projectSummary}
              projectData={projectData}
            />
          </section>
        )}
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
    </div>
  )
}
