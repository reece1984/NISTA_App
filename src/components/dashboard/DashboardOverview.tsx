import { useNavigate } from 'react-router-dom'
import { ReadinessHero } from './ReadinessHero'
import { CountdownTimer } from './CountdownTimer'
import { CriteriaStatus } from './CriteriaStatus'
import { DocumentActivity } from './DocumentActivity'
import { CriticalGaps } from './CriticalGaps'
import { ActionPlanSummary } from './ActionPlanSummary'
import { ReadinessTrend } from './ReadinessTrend'
import { AIInsights } from './AIInsights'

interface DashboardOverviewProps {
  project: any
  assessments: any[]
  onRerunAssessment: () => void
  runningAssessment: boolean
}

export function DashboardOverview({
  project,
  assessments,
  onRerunAssessment,
  runningAssessment
}: DashboardOverviewProps) {
  const navigate = useNavigate()

  // Calculate real data from assessments
  const totalCriteria = assessments.length
  const greenCount = assessments.filter(a => a.rag_rating?.toUpperCase() === 'GREEN').length
  const amberCount = assessments.filter(a => a.rag_rating?.toUpperCase() === 'AMBER').length
  const redCount = assessments.filter(a => a.rag_rating?.toUpperCase() === 'RED').length

  // Calculate readiness percentage (weighted: GREEN=100%, AMBER=50%, RED=0%)
  const readinessPercent = totalCriteria > 0
    ? Math.round(((greenCount * 100) + (amberCount * 50)) / totalCriteria)
    : 0

  // Determine predicted RAG
  const predictedRAG = readinessPercent >= 85 ? 'GREEN' : readinessPercent >= 50 ? 'AMBER' : 'RED'

  // Get critical gaps (RED criteria)
  const criticalGaps = assessments
    .filter(a => a.rag_rating?.toUpperCase() === 'RED')
    .map(a => ({
      id: a.id,
      title: a.title || a.assessment_criteria?.title || 'Untitled Criterion',
      description: a.finding?.substring(0, 100) || 'Missing evidence'
    }))

  // PLACEHOLDER DATA (will be replaced later)
  const placeholderData = {
    // Countdown
    daysRemaining: 127,
    targetDate: '15 April 2025',

    // Readiness trajectory
    weeklyChange: 12,
    forecastDate: 'March 15th',
    daysAheadSchedule: 31,

    // Criteria changes
    greenChange: 3,
    redChange: -3,

    // Document activity
    documentActivity: [
      {
        name: 'Benefits Register updated',
        description: 'Added tracking mechanisms',
        timestamp: '2 hours ago',
        impact: '+8% impact on readiness',
        impactType: 'positive' as const
      },
      {
        name: 'Risk Register v3.2',
        description: 'New version detected',
        timestamp: 'Yesterday',
        impact: 'Pending re-assessment',
        impactType: 'pending' as const
      },
      {
        name: 'Commercial Case Annex',
        description: 'New document added',
        timestamp: '3 days ago',
        impact: '+4% impact on readiness',
        impactType: 'positive' as const
      }
    ],

    // Action plan
    actionPlan: {
      completedCount: 18,
      inProgressCount: 12,
      notStartedCount: 4,
      overdueCount: 3,
      oldestOverdueDays: 5,
      dueThisWeek: [
        { title: 'Update QRA with latest estimates', dueDay: 'Fri' },
        { title: 'Complete stakeholder mapping', dueDay: 'Fri' }
      ]
    },

    // AI Insights
    aiInsights: [
      {
        type: 'trajectory' as const,
        title: 'Trajectory Analysis',
        content: 'Current improvement rate of +3% per week will achieve GREEN before the review date. Maintain momentum on Benefits documentation.'
      },
      {
        type: 'risk' as const,
        title: 'Risk Alert',
        content: 'QRA gap is a gateway blocker. Similar projects that failed to address this by T-60 days saw 78% RED rating probability.'
      },
      {
        type: 'opportunity' as const,
        title: 'Opportunity',
        content: 'Your Commercial Case is stronger than 85% of projects at this stage. Consider highlighting in pre-review briefing.'
      }
    ]
  }

  const handleExportReport = () => {
    // TODO: Implement export functionality
    console.log('Export report clicked')
  }

  const handleViewDetails = () => {
    navigate(`/projects/${project.id}/assessment`)
  }

  const handleViewDocuments = () => {
    navigate(`/projects/${project.id}/documents`)
  }

  const handleGapClick = (gapId: number) => {
    navigate(`/projects/${project.id}/assessment`)
  }

  const handleGenerateContent = () => {
    // TODO: Implement AI content generation
    console.log('Generate content clicked')
  }

  const handleManageActions = () => {
    // TODO: Navigate to action plan page
    console.log('Manage actions clicked')
  }

  const handleAskAdvisor = () => {
    // TODO: Open AI advisor chat
    console.log('Ask advisor clicked')
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-navy">
            {project.name || project.project_name}
          </h1>
          <p className="text-slate-500 mt-1">
            {project.assessment_templates?.name || 'Gate 0'} · {project.sector || 'General'} · £{project.value_m || '0'}M
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportReport}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Export Report
          </button>
          <button
            onClick={onRerunAssessment}
            disabled={runningAssessment}
            className="inline-flex items-center gap-2 px-4 py-2 bg-navy hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            {runningAssessment ? 'Running...' : 'Re-run Assessment'}
          </button>
        </div>
      </div>

      {/* ROW 1: Primary Metrics */}
      <div className="grid grid-cols-12 gap-6 mb-6">
        <ReadinessHero
          readinessPercent={readinessPercent}
          predictedRAG={predictedRAG as any}
          weeklyChange={placeholderData.weeklyChange}
          forecastDate={placeholderData.forecastDate}
          daysAheadSchedule={placeholderData.daysAheadSchedule}
        />
        <CountdownTimer
          daysRemaining={placeholderData.daysRemaining}
          targetDate={placeholderData.targetDate}
        />
        <CriteriaStatus
          greenCount={greenCount}
          amberCount={amberCount}
          redCount={redCount}
          greenChange={placeholderData.greenChange}
          redChange={placeholderData.redChange}
          onViewDetails={handleViewDetails}
        />
      </div>

      {/* ROW 2: Activity & Actions */}
      <div className="grid grid-cols-12 gap-6 mb-6">
        <DocumentActivity
          activities={placeholderData.documentActivity}
          onViewAll={handleViewDocuments}
        />
        <CriticalGaps
          gaps={criticalGaps}
          onGapClick={handleGapClick}
          onGenerateContent={handleGenerateContent}
        />
        <ActionPlanSummary
          {...placeholderData.actionPlan}
          onManage={handleManageActions}
        />
      </div>

      {/* ROW 3: Analytics */}
      <div className="grid grid-cols-12 gap-6">
        <ReadinessTrend />
        <AIInsights
          insights={placeholderData.aiInsights}
          onAskAdvisor={handleAskAdvisor}
        />
      </div>
    </div>
  )
}
