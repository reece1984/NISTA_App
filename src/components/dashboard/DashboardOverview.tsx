import { useNavigate } from 'react-router-dom'
import { GatewayReadinessHero } from './GatewayReadinessHero'
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
    <div className="p-6">
      {/* Top section: Gateway Readiness + Readiness Trend (left) | AI Insights spanning both rows (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] lg:grid-rows-[auto_1fr] gap-6 mb-6">
        {/* Top-left: Gateway Readiness Hero */}
        <div className="col-start-1 row-start-1">
          <GatewayReadinessHero
            readinessPercent={readinessPercent}
            predictedRAG={predictedRAG as any}
            weeklyChange={placeholderData.weeklyChange}
            forecastDate={placeholderData.forecastDate}
            daysAheadSchedule={placeholderData.daysAheadSchedule}
            daysRemaining={placeholderData.daysRemaining}
            targetDate={placeholderData.targetDate}
          />
        </div>

        {/* Right side: AI Insights - spans both rows */}
        <div className="lg:col-start-2 lg:row-start-1 lg:row-span-2">
          <AIInsights
            insights={placeholderData.aiInsights}
            onAskAdvisor={handleAskAdvisor}
          />
        </div>

        {/* Bottom-left: Readiness Trend */}
        <div className="col-start-1 lg:row-start-2">
          <ReadinessTrend />
        </div>
      </div>

      {/* Bottom row: Three supporting panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <CriticalGaps
          gaps={criticalGaps}
          onGapClick={handleGapClick}
          onGenerateContent={handleGenerateContent}
        />
        <DocumentActivity
          activities={placeholderData.documentActivity}
          onViewAll={handleViewDocuments}
        />
        <ActionPlanSummary
          {...placeholderData.actionPlan}
          onManage={handleManageActions}
        />
      </div>
    </div>
  )
}
