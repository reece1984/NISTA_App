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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-primary border-b border-white/10 shadow-sm sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <a href="https://www.programmeinsights.co.uk" className="flex items-center gap-2">
                <div>
                  <div className="text-xl font-bold text-white tracking-tight">
                    Gateway Success
                  </div>
                  <div className="text-xs text-white/70 font-medium">NISTA/PAR Assessment</div>
                </div>
              </a>
              <nav className="hidden md:flex items-center gap-1 ml-4">
                <Link
                  to="/dashboard"
                  className="px-4 py-2 text-sm font-semibold text-white border-b-2 border-accent transition-all"
                >
                  Dashboard
                </Link>
                <Link
                  to="/criteria"
                  className="px-4 py-2 text-sm font-medium text-white/85 hover:text-white hover:bg-white/10 rounded-lg transition-all flex items-center gap-2"
                >
                  <ClipboardList size={16} />
                  Criteria
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs text-white/70">Signed in as</span>
                <span className="text-sm text-white font-medium">{user?.email}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white/85 hover:text-white px-4 py-2 rounded-lg font-medium text-sm transition-all"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-text-primary mb-2">
            Welcome back
          </h1>
          <p className="text-lg text-text-secondary">
            Here's what's happening with your projects today
          </p>
        </div>

        {/* Stats Grid */}
        {!isLoading && projects && projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Total Projects */}
            <div className="bg-card rounded-lg p-6 shadow-sm border border-border hover:shadow-md hover:border-accent transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <FolderOpen className="text-text-primary" size={24} />
                </div>
                <span className="text-sm font-medium text-text-secondary">Total</span>
              </div>
              <div className="text-3xl font-bold text-text-primary">{stats.totalProjects}</div>
              <div className="text-sm text-text-secondary mt-1">Projects</div>
            </div>

            {/* Active Projects */}
            <div className="bg-card rounded-lg p-6 shadow-sm border border-border hover:shadow-md hover:border-accent transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-text-primary" size={24} />
                </div>
                <span className="text-sm font-medium text-text-secondary">Active</span>
              </div>
              <div className="text-3xl font-bold text-text-primary">{stats.activeProjects}</div>
              <div className="text-sm text-text-secondary mt-1">In Progress</div>
            </div>

            {/* Critical Actions */}
            <div className="bg-card rounded-lg p-6 shadow-sm border border-border hover:shadow-md hover:border-accent transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="text-text-primary" size={24} />
                </div>
                <span className="text-sm font-medium text-text-secondary">Critical</span>
              </div>
              <div className="text-3xl font-bold text-error">{stats.criticalActions}</div>
              <div className="text-sm text-text-secondary mt-1">
                {stats.overdueActions > 0 && (
                  <span className="text-error font-medium">{stats.overdueActions} overdue</span>
                )}
                {stats.overdueActions === 0 && 'Actions'}
              </div>
            </div>

            {/* Completed Actions */}
            <div className="bg-card rounded-lg p-6 shadow-sm border border-border hover:shadow-md hover:border-accent transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="text-text-primary" size={24} />
                </div>
                <span className="text-sm font-medium text-text-secondary">Done</span>
              </div>
              <div className="text-3xl font-bold text-success">{stats.completedActions}</div>
              <div className="text-sm text-text-secondary mt-1">
                of {stats.totalActions} actions
              </div>
            </div>
          </div>
        )}

        {/* Projects Section Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-text-primary">Your Projects</h2>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-sm hover:shadow-md"
          >
            <Plus size={20} />
            Create Project
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-border border-t-accent mb-4"></div>
            <div className="text-lg text-text-secondary font-medium">Loading your projects...</div>
          </div>
        ) : projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="group bg-card rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer border border-border hover:border-accent"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-text-primary group-hover:text-accent transition-colors">
                      {project.project_name}
                    </h3>
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-md ${getStatusBadge(
                        project.status
                      )}`}
                    >
                      {project.status}
                    </span>
                  </div>

                  <div className="space-y-3 text-sm mb-4">
                    {project.project_value && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <div className="w-6 h-6 bg-slate-100 rounded flex items-center justify-center flex-shrink-0">
                          <span className="text-slate-700 font-bold text-xs">£</span>
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
                        <div className="w-6 h-6 bg-slate-100 rounded flex items-center justify-center flex-shrink-0">
                          <FolderOpen className="text-slate-700" size={14} />
                        </div>
                        <span>{project.project_sector}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-slate-600">
                      <div className="w-6 h-6 bg-slate-100 rounded flex items-center justify-center flex-shrink-0">
                        <Clock className="text-slate-600" size={14} />
                      </div>
                      <span>Created {formatDate(project.created_at)}</span>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-border">
                    <div className="flex items-center justify-between text-sm font-semibold text-text-primary group-hover:text-accent transition-colors">
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
          <div className="text-center py-20 bg-card rounded-lg border-2 border-dashed border-border">
            <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-6">
              <FolderOpen className="text-text-secondary" size={36} />
            </div>
            <h3 className="text-2xl font-bold text-text-primary mb-3">
              No projects yet
            </h3>
            <p className="text-lg text-text-secondary mb-8 max-w-md mx-auto">
              Create your first project to start tracking assessments and actions
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all shadow-sm hover:shadow-md"
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
