import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Plus, LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase, type Project } from '../lib/supabase'
import Button from '../components/ui/Button'
import CreateProjectModal from '../components/CreateProjectModal'

export default function DashboardPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const { user, signOut } = useAuth()

  const { data: projects, isLoading, refetch } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('createdAt', { ascending: false })

      if (error) throw error
      return data as Project[]
    },
  })

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      draft: 'bg-gray-200 text-gray-800',
      processing: 'bg-warning/20 text-warning',
      completed: 'bg-success/20 text-success',
    }
    return badges[status as keyof typeof badges] || badges.draft
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                <span className="text-white font-bold text-sm">PI</span>
              </div>
              <div>
                <div className="text-xl font-semibold text-text-primary">Programme Insights</div>
                <div className="text-xs text-text-secondary">NISTA/PAR Assessment</div>
              </div>
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-text-secondary">
                {user?.email}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSignOut}
                className="flex items-center gap-2"
              >
                <LogOut size={16} />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-text-primary">My Projects</h2>
          <Button
            variant="primary"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus size={20} />
            Create New Project
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-lg text-text-secondary">Loading projects...</div>
          </div>
        ) : projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="card hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-text-primary">
                    {project.projectName}
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded ${getStatusBadge(
                      project.status
                    )}`}
                  >
                    {project.status}
                  </span>
                </div>
                <div className="space-y-2 text-sm text-text-secondary">
                  {project.projectValue && (
                    <p>
                      <span className="font-medium">Value:</span> £
                      {project.projectValue.toLocaleString()} million
                    </p>
                  )}
                  {project.projectSector && (
                    <p>
                      <span className="font-medium">Sector:</span>{' '}
                      {project.projectSector}
                    </p>
                  )}
                  <p>
                    <span className="font-medium">Created:</span>{' '}
                    {formatDate(project.createdAt)}
                  </p>
                </div>
                <div className="mt-4">
                  <Button variant="secondary" size="sm" className="w-full">
                    View Project
                  </Button>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 card">
            <p className="text-xl text-text-secondary mb-6">
              No projects yet. Create your first project to get started.
            </p>
            <Button
              variant="primary"
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 mx-auto"
            >
              <Plus size={20} />
              Create New Project
            </Button>
          </div>
        )}
      </main>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          refetch()
          setIsCreateModalOpen(false)
        }}
      />
    </div>
  )
}
