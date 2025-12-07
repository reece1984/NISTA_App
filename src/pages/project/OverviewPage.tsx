import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import ProjectOverview from '../../components/ProjectOverview'

export default function OverviewPage() {
  const { id } = useParams<{ id: string }>()

  // Fetch project data
  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*, assessment_templates (*)')
        .eq('id', id!)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!id
  })

  // Fetch assessments
  const { data: assessments = [], isLoading: assessmentsLoading } = useQuery({
    queryKey: ['assessments', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assessments')
        .select('*, assessment_criteria (*)')
        .eq('project_id', id!)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    },
    enabled: !!id
  })

  // Get latest assessment
  const latestAssessment = assessments[0]

  if (projectLoading || assessmentsLoading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        Loading project overview...
      </div>
    )
  }

  if (!project) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        Project not found
      </div>
    )
  }

  return (
    <ProjectOverview
      project={project}
      assessmentResults={assessments}
      latestAssessment={latestAssessment}
    />
  )
}
