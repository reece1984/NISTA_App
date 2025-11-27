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
      draft: 'bg-slate-100 text-slate-600 border border-slate-200',
      processing: 'bg-amber-50 text-amber-700 border border-amber-200',
      completed: 'bg-slate-700 text-white',
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
            <div className="bg-white border border-slate-200 rounded-lg p-5">
              <div className="flex items-center justify-between mb-3">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                <span className="text-xs text-slate-500 font-medium">Total</span>
              </div>
              <div className="text-2xl font-semibold text-slate-900">{stats.totalProjects}</div>
              <div className="text-sm text-slate-500 mt-1">Projects</div>
            </div>

            {/* Active Projects */}
            <div className="bg-white border border-slate-200 rounded-lg p-5">
              <div className="flex items-center justify-between mb-3">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span className="text-xs text-slate-500 font-medium">Active</span>
              </div>
              <div className="text-2xl font-semibold text-slate-900">{stats.activeProjects}</div>
              <div className="text-sm text-slate-500 mt-1">In Progress</div>
            </div>

            {/* Critical Actions */}
            <div className="bg-white border border-slate-200 rounded-lg p-5">
              <div className="flex items-center justify-between mb-3">
                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-xs text-slate-500 font-medium">Critical</span>
              </div>
              <div className="text-2xl font-semibold text-amber-600">{stats.criticalActions}</div>
              <div className="text-sm text-slate-500 mt-1">Actions</div>
            </div>

            {/* Completed Actions */}
            <div className="bg-white border border-slate-200 rounded-lg p-5">
              <div className="flex items-center justify-between mb-3">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs text-slate-500 font-medium">Done</span>
              </div>
              <div className="text-2xl font-semibold text-slate-900">{stats.completedActions}</div>
              <div className="text-sm text-slate-500 mt-1">of {stats.totalActions} actions</div>
            </div>
          </div>
        )}

        {/* Projects Section Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-slate-900">Your Projects</h2>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-[#C2713A] hover:bg-[#A65F2E] text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
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
              <div
                key={project.id}
                className="bg-white border border-slate-200 rounded-lg p-5 hover:shadow-md hover:border-slate-300 transition-all"
              >
                {/* Header row */}
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-slate-900">{project.project_name}</h3>
                  <span
                    className={`px-2.5 py-1 text-xs font-medium rounded ${getStatusBadge(
                      project.status
                    )}`}
                  >
                    {project.status}
                  </span>
                </div>

                {/* Metadata row - simplified with dot separators */}
                <div className="text-sm text-slate-500 mb-4">
                  {project.project_value && `£${project.project_value}M value`}
                  {project.project_value && project.project_sector && ' · '}
                  {project.project_sector}
                  {(project.project_value || project.project_sector) && ' · '}
                  Created {formatDate(project.created_at)}
                </div>

                {/* Action link - NOT a styled button */}
                <div className="pt-3 border-t border-slate-100">
                  <Link
                    to={`/projects/${project.id}`}
                    className="text-slate-700 hover:text-[#C2713A] font-medium text-sm transition-colors inline-flex items-center gap-1"
                  >
                    View Project
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-lg border-2 border-dashed border-slate-200">
            <div className="w-20 h-20 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-6">
              <FolderOpen className="text-slate-400" size={36} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">
              No projects yet
            </h3>
            <p className="text-lg text-slate-600 mb-8 max-w-md mx-auto">
              Create your first project to start tracking assessments and actions
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 bg-[#C2713A] hover:bg-[#A65F2E] text-white px-8 py-4 rounded-lg font-medium text-lg transition-colors"
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
