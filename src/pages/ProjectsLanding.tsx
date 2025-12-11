import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Plus, Upload, Play, ExternalLink, Settings, MoreVertical, FileText, BarChart3, FolderOpen, Star } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import CreateProjectModal from '../components/CreateProjectModal'

interface ProjectData {
  id: string
  name: string
  description: string | null
  current_gate: number | null
  template_name: string | null
  budget: number | null
  category: string | null
  created_at: string
  last_activity: string
  documentCount: number
  assessmentCount: number
  greenCount: number
  amberCount: number
  redCount: number
  readinessPercent: number | null
}

export default function ProjectsLanding() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [firstName, setFirstName] = useState('User')
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  // Fetch user's first name
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return

      if (user.email) {
        const emailName = user.email.split('@')[0]
        const formattedName = emailName.charAt(0).toUpperCase() + emailName.slice(1)
        setFirstName(formattedName.split('.')[0])
      }
    }

    fetchUserProfile()
  }, [user])

  // Fetch projects with counts and assessment data
  const { data: projects = [], isLoading, refetch } = useQuery({
    queryKey: ['projects-landing-v2'], // Changed key to bust cache
    queryFn: async () => {
      const { data: projectsData, error } = await supabase
        .from('projects')
        .select('*, assessment_templates (*)')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching projects:', error)
        return []
      }

      // For each project, fetch document count and assessment data
      const projectsWithData = await Promise.all(
        (projectsData || []).map(async (project) => {
          // Fetch document count
          const { data: files } = await supabase
            .from('files')
            .select('id')
            .eq('project_id', project.id)

          // Fetch the most recent assessment run ID
          const { data: assessmentRuns } = await supabase
            .from('assessment_runs')
            .select('id')
            .eq('project_id', project.id)
            .order('created_at', { ascending: false })
            .limit(1)

          const documentCount = files?.length || 0
          const assessmentRunCount = assessmentRuns?.length || 0

          // Fetch actual assessments from the most recent run
          let assessments: any[] = []
          if (assessmentRuns && assessmentRuns.length > 0) {
            const latestRunId = assessmentRuns[0].id
            const { data: assessmentData } = await supabase
              .from('assessments')
              .select('id, rag_rating')
              .eq('project_id', project.id)
              .eq('assessment_run_id', latestRunId)

            assessments = assessmentData || []
          }

          // Calculate RAG counts from actual assessments
          const greenCount = assessments.filter(a => a.rag_rating?.toUpperCase() === 'GREEN').length
          const amberCount = assessments.filter(a => a.rag_rating?.toUpperCase() === 'AMBER').length
          const redCount = assessments.filter(a => a.rag_rating?.toUpperCase() === 'RED').length
          const totalCriteria = assessments.length

          // Calculate readiness percentage (weighted: GREEN=100%, AMBER=50%, RED=0%)
          const readinessPercent = totalCriteria > 0
            ? Math.round(((greenCount * 100) + (amberCount * 50)) / totalCriteria)
            : null

          // Determine last activity (most recent of created_at, file uploads, or assessments)
          let lastActivity = project.created_at
          if (files && files.length > 0) {
            const latestFile = await supabase
              .from('files')
              .select('created_at')
              .eq('project_id', project.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .single()
            if (latestFile.data && new Date(latestFile.data.created_at) > new Date(lastActivity)) {
              lastActivity = latestFile.data.created_at
            }
          }
          if (assessments && assessments.length > 0) {
            const latestAssessment = await supabase
              .from('assessment_runs')
              .select('created_at')
              .eq('project_id', project.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .single()
            if (latestAssessment.data && new Date(latestAssessment.data.created_at) > new Date(lastActivity)) {
              lastActivity = latestAssessment.data.created_at
            }
          }

          const mappedProject = {
            id: project.id,
            name: project.name || project.project_name || 'Untitled Project',
            description: project.description,
            current_gate: project.current_gate,
            template_name: project.assessment_templates?.name || null,
            budget: project.budget || project.project_value,
            category: project.category || project.project_sector,
            created_at: project.created_at,
            last_activity: lastActivity,
            documentCount,
            assessmentCount: totalCriteria, // Use total criteria count as assessment count
            greenCount,
            amberCount,
            redCount,
            readinessPercent
          } as ProjectData

          return mappedProject
        })
      )

      // Sort by last activity
      return projectsWithData.sort((a, b) =>
        new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime()
      )
    }
  })

  const formatValue = (budget: number | null): string => {
    if (!budget) return 'Not specified'
    if (budget >= 1000000000) return `£${(budget / 1000000000).toFixed(1)}B`
    if (budget >= 1000000) return `£${(budget / 1000000).toFixed(0)}M`
    if (budget >= 1000) return `£${(budget / 1000).toFixed(0)}K`
    return `£${budget}`
  }

  const formatLastActivity = (dateStr: string): string => {
    const now = new Date()
    const date = new Date(dateStr)
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const getGateName = (current_gate: number | null, template_name: string | null): string => {
    // Check if current_gate is a valid number (not null and not undefined)
    if (current_gate !== null && current_gate !== undefined) {
      return `Gate ${current_gate}`
    }
    if (template_name) {
      return template_name
    }
    return 'Gate 0'
  }

  const getStatusColor = (readinessPercent: number | null): string => {
    if (readinessPercent === null) return 'bg-slate-300'
    if (readinessPercent >= 85) return 'bg-green-500'
    if (readinessPercent >= 50) return 'bg-amber-500'
    return 'bg-red-500'
  }

  const getNextAction = (project: ProjectData): { label: string; icon: any; action: () => void } => {
    if (project.documentCount === 0) {
      return {
        label: 'Upload Docs',
        icon: Upload,
        action: () => navigate(`/project/${project.id}/evidence`)
      }
    }
    if (project.assessmentCount === 0) {
      return {
        label: 'Run Assessment',
        icon: Play,
        action: () => navigate(`/project/${project.id}/readiness`)
      }
    }
    return {
      label: 'View Project',
      icon: ExternalLink,
      action: () => navigate(`/project/${project.id}/readiness`)
    }
  }

  // Calculate summary stats
  const totalProjects = projects.length
  const totalDocuments = projects.reduce((sum, p) => sum + p.documentCount, 0)
  const assessedProjects = projects.filter(p => p.assessmentCount > 0).length

  // Get featured project (most recently active with assessments)
  const featuredProject = projects.find(p => p.assessmentCount > 0) || projects[0]

  return (
    <>
      <div className="px-8 py-6 bg-gradient-to-br from-slate-50 via-white to-slate-50 min-h-screen">
        <div className="max-w-5xl mx-auto">
          {/* Page Header with Stats and New Project Button */}
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">
                Welcome back, {firstName}
              </h1>
              <p className="text-sm text-slate-500">
                {totalProjects} project{totalProjects !== 1 ? 's' : ''} · {totalDocuments} document{totalDocuments !== 1 ? 's' : ''} · {assessedProjects} assessed
              </p>
            </div>
            {projects.length > 0 && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-copper hover:bg-[#a85d32] text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                New Project
              </button>
            )}
          </div>

        {isLoading ? (
          <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
            <p className="text-slate-600">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          // Empty State
          <div className="bg-white border-2 border-dashed border-copper/30 rounded-lg p-12 text-center max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-copper/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="w-8 h-8 text-copper" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              Welcome to Gateway Success
            </h2>
            <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
              Create your first project to start preparing for your gateway review with AI-powered gap analysis and readiness tracking.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-copper hover:bg-[#a85d32] text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Create Your First Project
            </button>
          </div>
        ) : (
          <>
            {/* Featured Project Section */}
            {featuredProject && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-4 h-4 text-copper" />
                  <h2 className="text-sm font-semibold text-navy uppercase tracking-wide">
                    Continue Where You Left Off
                  </h2>
                </div>
                <div className="bg-white border-l-4 border-copper border-t border-r border-b border-slate-200 rounded-lg shadow-sm overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-slate-900">{featuredProject.name}</h3>
                          <span className="inline-flex items-center px-2.5 py-1 bg-navy text-white text-xs font-semibold rounded-full">
                            {getGateName(featuredProject.current_gate, featuredProject.template_name)}
                          </span>
                        </div>
                        {featuredProject.description && (
                          <p className="text-sm text-slate-600 mb-3 line-clamp-2">{featuredProject.description}</p>
                        )}
                        <div className="flex items-center gap-6 text-xs text-slate-500">
                          <span>{formatValue(featuredProject.budget)}</span>
                          <span>{featuredProject.category || 'Not specified'}</span>
                          <span>Last active {formatLastActivity(featuredProject.last_activity)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/project/${featuredProject.id}/settings`)}
                          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Progress Section */}
                    {featuredProject.readinessPercent !== null && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-slate-700">Gateway Readiness</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900">{featuredProject.readinessPercent}%</span>
                            {featuredProject.readinessPercent >= 85 && (
                              <span className="inline-flex items-center px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                GREEN
                              </span>
                            )}
                            {featuredProject.readinessPercent >= 50 && featuredProject.readinessPercent < 85 && (
                              <span className="inline-flex items-center px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                                AMBER
                              </span>
                            )}
                            {featuredProject.readinessPercent < 50 && (
                              <span className="inline-flex items-center px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                                RED
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${getStatusColor(featuredProject.readinessPercent)} transition-all duration-500`}
                            style={{ width: `${featuredProject.readinessPercent}%` }}
                          />
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full" />
                            {featuredProject.greenCount} Green
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-amber-500 rounded-full" />
                            {featuredProject.amberCount} Amber
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-red-500 rounded-full" />
                            {featuredProject.redCount} Red
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => navigate(`/project/${featuredProject.id}/evidence`)}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                        Evidence ({featuredProject.documentCount})
                      </button>
                      <button
                        onClick={() => navigate(`/project/${featuredProject.id}/findings`)}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium transition-colors"
                      >
                        <BarChart3 className="w-4 h-4" />
                        Findings ({featuredProject.assessmentCount})
                      </button>
                      <button
                        onClick={() => navigate(`/project/${featuredProject.id}/readiness`)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-copper hover:bg-[#a85d32] text-white rounded-lg text-sm font-medium transition-colors ml-auto shadow-sm"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open Project
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* All Projects Grid */}
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-navy uppercase tracking-wide mb-3">
                All Projects
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Existing Project Cards */}
                {projects.map((project) => {
                  const nextAction = getNextAction(project)
                  const isMenuOpen = openMenuId === project.id

                  // Get sector color
                  const getSectorColor = (category: string | null): string => {
                    if (!category) return 'bg-slate-400'
                    const categoryLower = category.toLowerCase()
                    if (categoryLower.includes('transport') || categoryLower.includes('rail')) return 'bg-blue-500'
                    if (categoryLower.includes('energy') || categoryLower.includes('nuclear')) return 'bg-green-500'
                    if (categoryLower.includes('health')) return 'bg-red-500'
                    if (categoryLower.includes('infrastructure')) return 'bg-copper'
                    if (categoryLower.includes('digital') || categoryLower.includes('tech')) return 'bg-purple-500'
                    return 'bg-slate-400'
                  }

                  return (
                    <button
                      key={project.id}
                      onClick={() => navigate(`/project/${project.id}/readiness`)}
                      className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all hover:-translate-y-0.5 text-left relative group"
                    >
                      {/* Sector Color Bar */}
                      <div className={`h-1 ${getSectorColor(project.category)}`} />

                      <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-bold text-slate-900 truncate mb-1">{project.name}</h3>
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center px-2 py-0.5 bg-navy text-white text-xs font-semibold rounded-full">
                                {getGateName(project.current_gate, project.template_name)}
                              </span>
                              {project.readinessPercent !== null && (
                                <>
                                  <span className="text-xs font-semibold text-slate-600">
                                    {project.readinessPercent}%
                                  </span>
                                  {project.readinessPercent >= 85 && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                      GREEN
                                    </span>
                                  )}
                                  {project.readinessPercent >= 50 && project.readinessPercent < 85 && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                                      AMBER
                                    </span>
                                  )}
                                  {project.readinessPercent < 50 && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                                      RED
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                          </div>

                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setOpenMenuId(isMenuOpen ? null : project.id)
                              }}
                              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {isMenuOpen && (
                              <>
                                <div
                                  className="fixed inset-0 z-40"
                                  onClick={() => setOpenMenuId(null)}
                                />
                                <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden">
                                  <button
                                    onClick={() => {
                                      navigate(`/project/${project.id}/settings`)
                                      setOpenMenuId(null)
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                  >
                                    <Settings className="w-3.5 h-3.5" />
                                    Settings
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 mb-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5" />
                            {project.documentCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <BarChart3 className="w-3.5 h-3.5" />
                            {project.assessmentCount}
                          </span>
                          <span className="truncate">{formatLastActivity(project.last_activity)}</span>
                        </div>

                        {/* Mini Progress Indicators */}
                        {project.readinessPercent !== null && (
                          <div className="mb-3">
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-1.5">
                                {project.greenCount > 0 && (
                                  <div className="flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                    <span className="text-xs text-slate-600">{project.greenCount}</span>
                                  </div>
                                )}
                                {project.amberCount > 0 && (
                                  <div className="flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                                    <span className="text-xs text-slate-600">{project.amberCount}</span>
                                  </div>
                                )}
                                {project.redCount > 0 && (
                                  <div className="flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                                    <span className="text-xs text-slate-600">{project.redCount}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${getStatusColor(project.readinessPercent)} transition-all duration-500`}
                                style={{ width: `${project.readinessPercent}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={(projectId) => {
          setShowCreateModal(false)
          refetch()
          navigate(`/project/${projectId}/readiness`)
        }}
      />
    </>
  )
}
