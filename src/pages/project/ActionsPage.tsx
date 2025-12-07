import { useState } from 'react'
import { useParams } from 'react-router-dom'
import ActionKanbanBoard from '../../components/ActionPlan/ActionKanbanBoard'
import ActionDetailModal from '../../components/ActionPlan/ActionDetailModal'

export default function ActionsPage() {
  const { id } = useParams<{ id: string }>()
  const projectId = Number(id)
  const [selectedActionId, setSelectedActionId] = useState<number | null>(null)

  return (
    <div style={{ padding: '2rem', background: 'var(--gray-50)', minHeight: '600px' }}>
      <ActionKanbanBoard
        projectId={projectId}
        onActionClick={(actionId) => setSelectedActionId(actionId)}
      />

      {/* Action Detail Modal */}
      {selectedActionId && (
        <ActionDetailModal
          actionId={selectedActionId}
          onClose={() => setSelectedActionId(null)}
        />
      )}
    </div>
  )
}
