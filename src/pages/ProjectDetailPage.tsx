import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Play, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import Button from '../components/ui/Button'
import FileUpload from '../components/FileUpload'
import AssessmentResults from '../components/AssessmentResults'
import Modal from '../components/ui/Modal'

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [runningAssessment, setRunningAssessment] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [assessmentError, setAssessmentError] = useState('')

  const {
    data: projectData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      // Fetch project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*')
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

      return {
        ...project,
        files: files || [],
        assessments: assessments || [],
      }
    },
    enabled: !!id,
  })

  const handleRunAssessment = async () => {
    if (!projectData || !projectData.files || projectData.files.length === 0) {
      setAssessmentError('Please upload at least one document before running assessment')
      return
    }

    try {
      setAssessmentError('')
      setRunningAssessment(true)

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

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: 'run_assessment',
          projectId: parseInt(id!),
          files: projectData.files.map((f: any) => ({
            fileId: f.id,
            fileName: f.fileName,
            fileType: f.fileType,
            fileUrl: f.fileUrl,
            fileKey: f.fileKey,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to trigger assessment')
      }

      // Poll for results (in production, you might use websockets or webhooks)
      setTimeout(() => {
        refetch()
        setRunningAssessment(false)
      }, 5000)
    } catch (err: any) {
      setAssessmentError(err.message || 'Failed to run assessment')
      setRunningAssessment(false)
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
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                  <span className="text-white font-bold text-sm">PI</span>
                </div>
                <div>
                  <div className="text-lg font-semibold text-text-primary">Programme Insights</div>
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
              <div>
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
                <Play size={20} />
                {runningAssessment ? 'Running Assessment...' : 'Run Assessment'}
              </Button>
            </div>
            {assessmentError && (
              <p className="mt-4 text-error">{assessmentError}</p>
            )}
          </div>
        </section>

        {/* Assessment Results */}
        {hasAssessments && (
          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-6">
              Assessment Results
            </h2>
            <AssessmentResults assessments={projectData.assessments} />
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
    </div>
  )
}
