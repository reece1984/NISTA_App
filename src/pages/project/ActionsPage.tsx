import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { Sparkles } from 'lucide-react'
import ActionTableView from '../../components/ActionPlan/ActionTableView'
import ActionDetailModal from '../../components/ActionPlan/ActionDetailModal'
import ActionPlanDraftWorkspace from '../../components/ActionPlan/ActionPlanDraftWorkspace'
import { useActions } from '../../hooks/useActions'

export default function ActionsPage() {
  const { id } = useParams<{ id: string }>()
  const projectId = Number(id)
  const [selectedActionId, setSelectedActionId] = useState<number | null>(null)
  const [openActionPlanWorkspace, setOpenActionPlanWorkspace] = useState(false)

  const { actions, isLoading } = useActions({ projectId })

  // Fetch the most recent assessment run
  const { data: latestAssessmentRun } = useQuery({
    queryKey: ['latest-assessment-run', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assessment_runs')
        .select('id')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) throw error
      return data
    }
  })

  const hasActions = actions.length > 0

  return (
    <div style={{ padding: '2rem', background: '#f1f5f9', minHeight: '600px' }}>
      {/* Header with Generate Action Plan button */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.5rem',
            fontWeight: 600,
            color: 'var(--ink)',
            margin: 0
          }}>
            Action Plan
          </h1>
          <p style={{
            fontSize: '0.9rem',
            color: 'var(--text-muted)',
            marginTop: '0.25rem'
          }}>
            {hasActions ? `${actions.length} action${actions.length !== 1 ? 's' : ''}` : 'No actions yet'}
          </p>
        </div>

        {latestAssessmentRun && (
          <button
            onClick={() => setOpenActionPlanWorkspace(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'linear-gradient(to right, #2563eb, #4f46e5)',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.75rem',
              fontWeight: 600,
              fontSize: '0.9rem',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(to right, #1d4ed8, #4338ca)'
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(37, 99, 235, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(to right, #2563eb, #4f46e5)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.3)'
            }}
          >
            <Sparkles size={20} />
            Generate Action Plan
          </button>
        )}
      </div>

      {/* Table View */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Loading actions...
        </div>
      ) : hasActions ? (
        <ActionTableView
          projectId={projectId}
          onActionClick={(actionId) => setSelectedActionId(actionId)}
        />
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: 'var(--white)',
          borderRadius: '12px',
          border: '1px solid var(--border)'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            margin: '0 auto 1.5rem',
            background: 'var(--gray-100)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sparkles size={32} style={{ color: 'var(--text-muted)' }} />
          </div>
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.25rem',
            fontWeight: 600,
            color: 'var(--ink)',
            marginBottom: '0.5rem'
          }}>
            No actions yet
          </h3>
          <p style={{
            fontSize: '0.95rem',
            color: 'var(--text-muted)',
            maxWidth: '400px',
            margin: '0 auto 1.5rem'
          }}>
            Generate an AI-powered action plan to address gaps in your assessment
          </p>
          {latestAssessmentRun && (
            <button
              onClick={() => setOpenActionPlanWorkspace(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'linear-gradient(to right, #2563eb, #4f46e5)',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.75rem',
                fontWeight: 600,
                fontSize: '0.9rem',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
              }}
            >
              <Sparkles size={20} />
              Generate Action Plan
            </button>
          )}
        </div>
      )}

      {/* Action Detail Modal */}
      {selectedActionId && (
        <ActionDetailModal
          actionId={selectedActionId}
          onClose={() => setSelectedActionId(null)}
        />
      )}

      {/* Action Plan Draft Workspace */}
      {openActionPlanWorkspace && latestAssessmentRun && (
        <ActionPlanDraftWorkspace
          assessmentRunId={latestAssessmentRun.id}
          projectId={projectId}
          onClose={() => setOpenActionPlanWorkspace(false)}
          onConfirm={(result) => {
            console.log('Actions confirmed:', result)
            setOpenActionPlanWorkspace(false)
            // Actions will be automatically refreshed via query invalidation
          }}
        />
      )}
    </div>
  )
}
