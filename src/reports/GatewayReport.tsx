import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import CoverPage from './components/CoverPage'
import ExecutiveSummary from './components/ExecutiveSummary'
import CaseAssessment from './components/CaseAssessment'
import ActionPlan from './components/ActionPlan'
import EvidenceRegister from './components/EvidenceRegister'
import './styles/report.css'

interface GatewayReportProps {
  projectId: string
  reportType: 'summary' | 'full' | 'board-pack'
}

export default function GatewayReport({ projectId, reportType }: GatewayReportProps) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  // Load the report CSS
  useEffect(() => {
    document.body.classList.add('report-body')
    return () => {
      document.body.classList.remove('report-body')
    }
  }, [])

  // Fetch report data
  useEffect(() => {
    async function fetchReportData() {
      try {
        setLoading(true)
        setError(null)

        // Fetch project
        const { data: project, error: projectError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .single()

        if (projectError) throw projectError

        // Fetch assessments with criteria details
        const { data: assessments, error: assessmentsError } = await supabase
          .from('assessments')
          .select(`
            *,
            assessment_criteria (
              id,
              criterion_code,
              title,
              assessment_question,
              category,
              is_critical,
              is_gateway_blocker
            )
          `)
          .eq('project_id', projectId)
          .order('created_at', { ascending: false })

        if (assessmentsError) throw assessmentsError

        // Fetch action items (optional - table may not exist yet)
        let actions: any[] = []
        try {
          const { data: actionsData, error: actionsError } = await supabase
            .from('action_items')
            .select('*')
            .eq('project_id', projectId)
            .order('created_at', { ascending: false })

          if (!actionsError && actionsData) {
            actions = actionsData
          }
        } catch (err) {
          console.warn('Action items table not available, continuing without actions:', err)
        }

        // Fetch documents (optional - table may not exist yet)
        let documents: any[] = []
        try {
          const { data: documentsData, error: documentsError } = await supabase
            .from('documents')
            .select('*')
            .eq('project_id', projectId)
            .order('created_at', { ascending: false })

          if (!documentsError && documentsData) {
            documents = documentsData
          }
        } catch (err) {
          console.warn('Documents table not available, continuing without documents:', err)
        }

        setData({
          project,
          assessments: assessments || [],
          actions: actions,
          documents: documents
        })
      } catch (err: any) {
        console.error('Error fetching report data:', err)
        console.error('Error details:', {
          projectId,
          message: err.message,
          stack: err.stack,
          fullError: err
        })
        setError(err.message || 'Failed to load report data')
      } finally {
        setLoading(false)
      }
    }

    fetchReportData()
  }, [projectId])

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="text-lg font-semibold text-slate-900 mb-2">Generating Report...</div>
          <div className="text-sm text-slate-500">Loading project data</div>
        </div>
      </div>
    )
  }

  // Show error state
  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center max-w-2xl mx-auto p-8">
          <div className="text-lg font-semibold text-red-600 mb-2">Error Loading Report</div>
          <div className="text-sm text-slate-600 mb-4">{error || 'No data available'}</div>
          <div className="text-xs text-slate-500 bg-slate-100 p-4 rounded-lg text-left overflow-auto">
            <div><strong>Project ID:</strong> {projectId}</div>
            <div><strong>Report Type:</strong> {reportType}</div>
            {error && <div className="mt-2 text-red-600"><strong>Error:</strong> {error}</div>}
          </div>
        </div>
      </div>
    )
  }

  // Process the real data
  const { project, assessments, actions, documents } = data

  // Calculate assessment statistics
  const totalCriteria = assessments.length
  const greenCount = assessments.filter((a: any) => a.rag_rating?.toUpperCase() === 'GREEN').length
  const amberCount = assessments.filter((a: any) => a.rag_rating?.toUpperCase() === 'AMBER').length
  const redCount = assessments.filter((a: any) => a.rag_rating?.toUpperCase() === 'RED').length
  const criticalCount = assessments.filter((a: any) => a.rag_rating?.toUpperCase() === 'RED').length

  // Calculate readiness score (weighted: GREEN=100%, AMBER=50%, RED=0%)
  const readinessScore = totalCriteria > 0
    ? Math.round(((greenCount * 100) + (amberCount * 50)) / totalCriteria)
    : 0

  // Determine overall rating
  const overallRating = readinessScore >= 85 ? 'GREEN' : readinessScore >= 50 ? 'AMBER' : 'RED'

  // Group assessments by case
  const assessmentsByCase: Record<string, any[]> = {}
  assessments.forEach((assessment: any) => {
    const category = assessment.assessment_criteria?.category || 'Other'
    if (!assessmentsByCase[category]) {
      assessmentsByCase[category] = []
    }
    assessmentsByCase[category].push(assessment)
  })

  // Create case summaries
  const caseSummaries = Object.entries(assessmentsByCase).map(([caseName, caseAssessments]) => {
    const caseGreen = caseAssessments.filter(a => a.rag_rating?.toUpperCase() === 'GREEN').length
    const caseAmber = caseAssessments.filter(a => a.rag_rating?.toUpperCase() === 'AMBER').length
    const caseRed = caseAssessments.filter(a => a.rag_rating?.toUpperCase() === 'RED').length
    const caseCritical = caseAssessments.filter(a => a.rag_rating?.toUpperCase() === 'RED').length

    // Calculate case readiness
    const caseReadiness = caseAssessments.length > 0
      ? Math.round(((caseGreen * 100) + (caseAmber * 50)) / caseAssessments.length)
      : 0

    const caseRating = caseReadiness >= 85 ? 'GREEN' : caseReadiness >= 50 ? 'AMBER' : 'RED'

    // Get key finding from worst criterion
    const worstCriterion = caseAssessments.find(a => a.rag_rating?.toUpperCase() === 'RED') ||
                          caseAssessments.find(a => a.rag_rating?.toUpperCase() === 'AMBER') ||
                          caseAssessments[0]

    return {
      case: caseName,
      rating: caseRating as 'RED' | 'AMBER' | 'GREEN',
      criteria_count: caseAssessments.length,
      critical_count: caseCritical,
      key_finding: worstCriterion?.finding || 'No significant issues identified.'
    }
  })

  // Build assessment summary object
  const assessmentSummary = {
    overall_rating: overallRating as 'RED' | 'AMBER' | 'GREEN',
    readiness_score: readinessScore,
    green_count: greenCount,
    amber_count: amberCount,
    red_count: redCount,
    criteria_assessed: totalCriteria,
    critical_count: criticalCount,
    created_at: assessments[0]?.created_at || new Date().toISOString(),
    executive_summary: `Assessment of ${totalCriteria} criteria shows ${greenCount} at GREEN, ${amberCount} at AMBER, and ${redCount} at RED, resulting in an overall ${overallRating} rating.`,
    case_summaries: caseSummaries
  }

  // Get critical issues (RED assessments)
  const criticalIssues = assessments
    .filter((a: any) => a.rag_rating?.toUpperCase() === 'RED')
    .map((a: any) => ({
      id: a.id,
      criterion_name: a.assessment_criteria?.title || a.assessment_criteria?.assessment_question || 'Untitled',
      finding: a.finding || 'No finding provided',
      case: a.assessment_criteria?.category || 'Other',
      criterion_code: a.assessment_criteria?.criterion_code || 'N/A'
    }))

  // Get recommendations (from actions or generate from RED criteria)
  const recommendations = actions.slice(0, 10).map((action: any) => ({
    id: action.id,
    recommendation: action.action_required || action.title || 'Action required',
    priority: action.priority || 'Medium',
    impact: 5 // Default impact percentage
  }))

  // Format actions for ActionPlan component
  const formattedActions = actions.map((action: any) => ({
    id: action.id,
    title: action.action_required || action.title || 'Action required',
    criterion_code: action.criterion_id || null,
    priority: action.priority || 'Medium',
    impact: 5,
    owner: action.assigned_to || 'Unassigned',
    due_date: action.due_date || null,
    status: action.status || 'Not Started'
  }))

  // Build cases data for detailed assessment
  const casesData: Record<string, any> = {}
  Object.entries(assessmentsByCase).forEach(([caseName, caseAssessments]) => {
    const caseGreen = caseAssessments.filter(a => a.rag_rating?.toUpperCase() === 'GREEN').length
    const caseAmber = caseAssessments.filter(a => a.rag_rating?.toUpperCase() === 'AMBER').length
    const caseRed = caseAssessments.filter(a => a.rag_rating?.toUpperCase() === 'RED').length

    const caseReadiness = caseAssessments.length > 0
      ? Math.round(((caseGreen * 100) + (caseAmber * 50)) / caseAssessments.length)
      : 0

    const caseRating = caseReadiness >= 85 ? 'GREEN' : caseReadiness >= 50 ? 'AMBER' : 'RED'

    casesData[caseName] = {
      rating: caseRating as 'RED' | 'AMBER' | 'GREEN',
      summary: `Assessment of ${caseName} case based on ${caseAssessments.length} criteria.`,
      criteria_count: caseAssessments.length,
      green_count: caseGreen,
      amber_count: caseAmber,
      red_count: caseRed,
      criteria: caseAssessments.map((a: any) => ({
        id: a.id,
        code: a.assessment_criteria?.criterion_code || 'N/A',
        name: a.assessment_criteria?.title || a.assessment_criteria?.assessment_question || 'Untitled',
        rating: a.rag_rating?.toUpperCase() || 'AMBER',
        confidence: a.confidence_score || 70,
        finding: a.finding || 'No finding provided',
        is_critical: a.assessment_criteria?.is_critical || false
      })),
      evidence_gaps: [],
      recommendations: []
    }
  })

  // Coverage stats for evidence register
  const coverageStats = {
    coverage_percentage: documents.length > 0 ? 75 : 0,
    requirements_met: documents.length,
    total_requirements: Math.max(documents.length + 5, 20),
    missing_documents: []
  }

  // Render different report types
  const renderReport = () => {
    switch (reportType) {
      case 'summary':
        return (
          <>
            <CoverPage project={project} assessment={assessmentSummary} />
            <ExecutiveSummary
              assessment={assessmentSummary}
              criticalIssues={criticalIssues.slice(0, 8)}
              recommendations={recommendations.slice(0, 5)}
            />
          </>
        )

      case 'board-pack':
        return (
          <>
            <CoverPage project={project} assessment={assessmentSummary} />
            <ExecutiveSummary
              assessment={assessmentSummary}
              criticalIssues={criticalIssues.slice(0, 5)}
              recommendations={recommendations.slice(0, 5)}
            />
            {formattedActions.length > 0 && <ActionPlan actions={formattedActions.slice(0, 10)} />}
          </>
        )

      case 'full':
      default:
        return (
          <>
            <CoverPage project={project} assessment={assessmentSummary} />
            <ExecutiveSummary
              assessment={assessmentSummary}
              criticalIssues={criticalIssues}
              recommendations={recommendations}
            />
            {Object.entries(casesData).map(([caseName, caseData]) => (
              <CaseAssessment key={caseName} caseName={caseName} caseData={caseData} />
            ))}
            {formattedActions.length > 0 && <ActionPlan actions={formattedActions} />}
            {documents.length > 0 && <EvidenceRegister documents={documents} coverageStats={coverageStats} />}
          </>
        )
    }
  }

  return (
    <div className="gateway-report">
      {renderReport()}
    </div>
  )
}
