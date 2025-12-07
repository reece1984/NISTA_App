import { useState } from 'react'
import { Outlet, useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { RefreshCw, Download, Trash2, DollarSign, Truck } from 'lucide-react'
import { supabase } from '../lib/supabase'
import Modal from './ui/Modal'
import Button from './ui/Button'
import Toast, { type ToastType } from './ui/Toast'

export default function ProjectLayout() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingProject, setDeletingProject] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)

  // Fetch project data for header
  const { data: projectData } = useQuery({
    queryKey: ['project-header', id],
    queryFn: async () => {
      const { data: project, error } = await supabase
        .from('projects')
        .select('*, assessment_templates (*)')
        .eq('id', id!)
        .single()

      if (error) throw error
      return project
    },
    enabled: !!id
  })

  const handleDeleteProject = async () => {
    try {
      setDeletingProject(true)
      setShowDeleteModal(false)

      setToast({
        message: 'Deleting project and related data...',
        type: 'loading'
      })

      const projectId = parseInt(id!)

      // Delete in correct order to avoid foreign key violations
      await supabase.from('actions').delete().eq('project_id', projectId)
      await supabase.from('assessments').delete().eq('project_id', projectId)
      await supabase.from('assessment_runs').delete().eq('project_id', projectId)
      await supabase.from('project_summaries').delete().eq('project_id', projectId)
      await supabase.from('files').delete().eq('project_id', projectId)

      const { error: projectError } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)

      if (projectError) {
        setToast({
          message: `Failed to delete project: ${projectError.message}`,
          type: 'error'
        })
        return
      }

      setToast({
        message: 'Project deleted successfully',
        type: 'success'
      })

      setTimeout(() => {
        navigate('/projects')
      }, 750)

    } catch (err: any) {
      setDeletingProject(false)
      setToast({
        message: `An unexpected error occurred: ${err.message}`,
        type: 'error'
      })
    }
  }

  const handleRerunAssessment = () => {
    // Navigate to documents tab and trigger rerun from there
    navigate(`/project/${id}/documents`)
    // TODO: Implement rerun trigger
  }

  const handleExport = () => {
    window.print()
  }

  if (!projectData) {
    return null
  }

  return (
    <>
      {/* Compact Project Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 1.5rem',
        background: 'var(--white)',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          minWidth: 0
        }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.1rem',
            fontWeight: 600,
            color: 'var(--ink)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            margin: 0
          }}>
            {projectData.project_name}
          </h1>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            flexShrink: 0
          }}>
            <span style={{
              padding: '0.25rem 0.6rem',
              background: 'var(--ink)',
              borderRadius: '100px',
              fontSize: '0.7rem',
              fontWeight: 600,
              color: 'var(--white)'
            }}>
              {projectData.assessment_templates?.name || 'Gate 0'}
            </span>
            <span style={{
              width: '1px',
              height: '16px',
              background: 'var(--border)'
            }}></span>
            {projectData.project_value && (
              <span style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.8rem',
                color: 'var(--text-muted)'
              }}>
                <DollarSign size={14} style={{ opacity: 0.6 }} />
                £{projectData.project_value.toLocaleString()}M
              </span>
            )}
            {projectData.project_sector && (
              <span style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.8rem',
                color: 'var(--text-muted)'
              }}>
                <Truck size={14} style={{ opacity: 0.6 }} />
                {projectData.project_sector}
              </span>
            )}
          </div>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <button
            onClick={handleRerunAssessment}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.4rem 0.75rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              border: 'none',
              background: 'transparent',
              color: 'var(--text-muted)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--gray-100)'
              e.currentTarget.style.color = 'var(--ink)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = 'var(--text-muted)'
            }}
          >
            <RefreshCw size={14} />
            Re-run
          </button>
          <button
            onClick={handleExport}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.4rem 0.75rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              border: 'none',
              background: 'transparent',
              color: 'var(--text-muted)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--gray-100)'
              e.currentTarget.style.color = 'var(--ink)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = 'var(--text-muted)'
            }}
          >
            <Download size={14} />
            Export
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.4rem 0.75rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              border: 'none',
              background: 'transparent',
              color: 'var(--red)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--red-bg)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent'
            }}
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </header>

      {/* Scrollable Content Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1.25rem 1.5rem',
        background: 'var(--gray-50)'
      }}>
        <Outlet />
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Project"
        size="sm"
      >
        <p className="text-text-secondary mb-6">
          Are you sure you want to delete this project? This action cannot be undone.
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

      {/* Toast Notification */}
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
