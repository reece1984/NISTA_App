import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Plus, LogOut, ClipboardList, TrendingUp, AlertCircle, CheckCircle2, Clock, FolderOpen, Target } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase, type Project } from '../lib/supabase'
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
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Project[]
    },
  })

  // Get all actions across all projects for dashboard stats
  const { data: allActions } = useQuery({
    queryKey: ['dashboard-actions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('actions')
        .select('action_status, priority, due_date')

      if (error) throw error
      return data
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
      draft: 'bg-slate-100 text-slate-700 border border-slate-200',
      processing: 'bg-amber-50 text-amber-700 border border-amber-200',
      completed: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
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

  // Calculate dashboard statistics
  const stats = {
    totalProjects: projects?.length || 0,
    activeProjects: projects?.filter(p => p.status !== 'completed').length || 0,
    totalActions: allActions?.length || 0,
    criticalActions: allActions?.filter(a => a.priority === 'critical' && a.action_status !== 'completed').length || 0,
    completedActions: allActions?.filter(a => a.action_status === 'completed').length || 0,
    overdueActions: allActions?.filter(a => {
      if (a.action_status === 'completed' || !a.due_date) return false
      return new Date(a.due_date) < new Date()
    }).length || 0,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Modern Header with Gradient */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
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
                  className="px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 rounded-lg transition-all"
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
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs text-slate-500">Signed in as</span>
                <span className="text-sm text-slate-700 font-medium">{user?.email}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium text-sm transition-all"
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
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Welcome back 👋
          </h1>
          <p className="text-lg text-slate-600">
            Here's what's happening with your projects today
          </p>
        </div>

        {/* Stats Grid */}
        {!isLoading && projects && projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Total Projects */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200/50 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <FolderOpen className="text-white" size={24} />
                </div>
                <span className="text-sm font-medium text-slate-500">Total</span>
              </div>
              <div className="text-3xl font-bold text-slate-900">{stats.totalProjects}</div>
              <div className="text-sm text-slate-600 mt-1">Projects</div>
            </div>

            {/* Active Projects */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200/50 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <TrendingUp className="text-white" size={24} />
                </div>
                <span className="text-sm font-medium text-slate-500">Active</span>
              </div>
              <div className="text-3xl font-bold text-slate-900">{stats.activeProjects}</div>
              <div className="text-sm text-slate-600 mt-1">In Progress</div>
            </div>

            {/* Critical Actions */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200/50 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30">
                  <AlertCircle className="text-white" size={24} />
                </div>
                <span className="text-sm font-medium text-slate-500">Critical</span>
              </div>
              <div className="text-3xl font-bold text-slate-900">{stats.criticalActions}</div>
              <div className="text-sm text-slate-600 mt-1">
                {stats.overdueActions > 0 && (
                  <span className="text-red-600 font-medium">{stats.overdueActions} overdue</span>
                )}
                {stats.overdueActions === 0 && 'Actions'}
              </div>
            </div>

            {/* Completed Actions */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200/50 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <CheckCircle2 className="text-white" size={24} />
                </div>
                <span className="text-sm font-medium text-slate-500">Done</span>
              </div>
              <div className="text-3xl font-bold text-slate-900">{stats.completedActions}</div>
              <div className="text-sm text-slate-600 mt-1">
                of {stats.totalActions} actions
              </div>
            </div>
          </div>
        )}

        {/* Projects Section Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Your Projects</h2>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all hover:shadow-lg shadow-blue-500/30"
          >
            <Plus size={20} />
            Create Project
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-blue-600 mb-4"></div>
            <div className="text-lg text-slate-600 font-medium">Loading your projects...</div>
          </div>
        ) : projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all cursor-pointer border border-slate-200/50 overflow-hidden hover:-translate-y-1"
              >
                {/* Project Header with Gradient Bar */}
                <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {project.project_name}
                    </h3>
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-lg ${getStatusBadge(
                        project.status
                      )}`}
                    >
                      {project.status}
                    </span>
                  </div>

                  <div className="space-y-3 text-sm mb-4">
                    {project.project_value && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <div className="w-6 h-6 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-emerald-600 font-bold text-xs">£</span>
                        </div>
                        <span>
                          <span className="font-semibold text-slate-900">
                            £{project.project_value.toLocaleString()}M
                          </span>
                          {' '}value
                        </span>
                      </div>
                    )}
                    {project.project_sector && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FolderOpen className="text-blue-600" size={14} />
                        </div>
                        <span>{project.project_sector}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-slate-600">
                      <div className="w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Clock className="text-slate-600" size={14} />
                      </div>
                      <span>Created {formatDate(project.created_at)}</span>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between text-sm font-semibold text-blue-600 group-hover:text-indigo-600 transition-colors">
                      <span>View Project</span>
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-2xl border-2 border-dashed border-slate-300">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FolderOpen className="text-blue-600" size={36} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">
              No projects yet
            </h3>
            <p className="text-lg text-slate-600 mb-8 max-w-md mx-auto">
              Create your first project to start tracking assessments and actions
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:shadow-xl shadow-blue-500/30"
            >
              <Plus size={24} />
              Create Your First Project
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
