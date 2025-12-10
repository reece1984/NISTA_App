import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Plus, Sparkles } from 'lucide-react'
import { useActionsV3 } from './hooks/useActionsV3'
import { useActionStats } from './hooks/useActionStats'
import ActionsSummary from './ActionsSummary'
import ActionsTableCard from './ActionsTable/ActionsTableCard'
import ActionDetailModal from './ActionDetailModal/ActionDetailModal'
import AIGenerationSidebar from './AIGenerationSidebar/AIGenerationSidebar'
import { useActionGeneration } from './AIGenerationSidebar/hooks/useActionGeneration'
import type { ActionFilters, CaseCategory, Action } from '../../types/actions'

export default function ActionsPageV3() {
  const { id } = useParams<{ id: string }>()
  const projectId = Number(id)

  const [filters, setFilters] = useState<ActionFilters>({
    status: 'all',
    priority: 'all',
    caseCategory: 'all',
    search: ''
  })

  const [selectedAction, setSelectedAction] = useState<Action | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const { actions, isLoading, updateAction, deleteAction } = useActionsV3({ projectId, filters })
  const stats = useActionStats(actions)
  const {
    isGenerating,
    generationResult,
    generateActions,
    approveAction,
    approveAllActions
  } = useActionGeneration({ projectId })

  const handleCategoryChange = (category: CaseCategory | 'all') => {
    setFilters({ ...filters, caseCategory: category })
  }

  const handleFiltersChange = (newFilters: Partial<ActionFilters>) => {
    setFilters({ ...filters, ...newFilters })
  }

  const handleOpenDetail = (action: Action) => {
    setSelectedAction(action)
  }

  const handleCloseDetail = () => {
    setSelectedAction(null)
  }

  const handleUpdateAction = async (updates: Partial<Action>) => {
    if (!selectedAction) return
    await updateAction.mutateAsync({ id: selectedAction.id, updates })
  }

  const handleDeleteAction = async () => {
    if (!selectedAction) return
    await deleteAction.mutateAsync(selectedAction.id)
  }

  const handleGenerateMore = async () => {
    setIsSidebarOpen(true)
    await generateActions()
  }

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false)
  }

  const handleRejectAction = (index: number) => {
    // Action is removed from local state in the sidebar component
    console.log('Rejected action at index:', index)
  }

  return (
    <div className="p-8 max-w-[1500px] mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy">Actions Register</h1>
          <p className="text-slate-500 mt-1">
            {actions.length} action{actions.length !== 1 ? 's' : ''} · Last updated recently
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg transition-colors">
            <Plus className="w-4 h-4" />
            Add Action
          </button>
          <button
            onClick={handleGenerateMore}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-navy hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            Generate More
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <ActionsSummary stats={stats} />

      {/* Main Table */}
      <ActionsTableCard
        actions={actions}
        isLoading={isLoading}
        filters={filters}
        onCategoryChange={handleCategoryChange}
        onFiltersChange={handleFiltersChange}
        onOpenDetail={handleOpenDetail}
      />

      {/* Detail Modal */}
      {selectedAction && (
        <ActionDetailModal
          action={selectedAction}
          isOpen={!!selectedAction}
          onClose={handleCloseDetail}
          onUpdate={handleUpdateAction}
          onDelete={handleDeleteAction}
        />
      )}

      {/* AI Generation Sidebar */}
      <AIGenerationSidebar
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        generationResult={generationResult}
        isGenerating={isGenerating}
        onApproveAction={approveAction}
        onApproveAll={approveAllActions}
        onRejectAction={handleRejectAction}
        onRefineActions={generateActions}
      />
    </div>
  )
}
