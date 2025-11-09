import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Plus, LogOut, ClipboardList } from 'lucide-react'
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
      processing: 'bg-amber-100 text-amber-700',
      completed: 'bg-green-100 text-green-700',
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <Link to="/dashboard" className="flex items-center gap-2">
                <div>
                  <div className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Inter, sans-serif' }}>Gateway Success</div>
                  <div className="text-xs text-gray-600">NISTA/PAR Assessment</div>
                </div>
              </Link>
              <nav className="hidden md:flex items-center gap-4">
                <Link
                  to="/dashboard"
                  className="text-sm text-blue-600 font-semibold border-b-2 border-blue-600 pb-1"
                >
                  Dashboard
                </Link>
                <Link
                  to="/criteria"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2 font-medium"
                >
                  <ClipboardList size={16} />
                  Criteria
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700 hidden sm:inline font-medium">
                {user?.email}
              </span>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-semibold text-sm transition-all"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Inter, sans-serif' }}>My Projects</h2>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all hover:shadow-lg"
          >
            <Plus size={20} />
            Create New Project
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-lg text-gray-600">Loading projects...</div>
          </div>
        ) : projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-blue-200 p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    {project.projectName}
                  </h3>
                  <span
                    className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusBadge(
                      project.status
                    )}`}
                  >
                    {project.status}
                  </span>
                </div>
                <div className="space-y-2 text-sm text-gray-700">
                  {project.projectValue && (
                    <p>
                      <span className="font-semibold">Value:</span> £
                      {project.projectValue.toLocaleString()} million
                    </p>
                  )}
                  {project.projectSector && (
                    <p>
                      <span className="font-semibold">Sector:</span>{' '}
                      {project.projectSector}
                    </p>
                  )}
                  <p>
                    <span className="font-semibold">Created:</span>{' '}
                    {formatDate(project.createdAt)}
                  </p>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded-lg font-semibold text-sm transition-all">
                    View Project
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl shadow-md p-8">
            <p className="text-xl text-gray-700 mb-6">
              No projects yet. Create your first project to get started.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 mx-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all hover:shadow-lg"
            >
              <Plus size={20} />
              Create New Project
            </button>
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
