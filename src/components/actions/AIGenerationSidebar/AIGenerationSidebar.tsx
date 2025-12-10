import { useState } from 'react'
import { cn } from '../../../lib/utils'
import type { GenerationResult, SuggestedAction } from '../../../types/actions'
import SidebarLoadingState from './SidebarLoadingState'
import SidebarHeader from './SidebarHeader'
import GenerationStats from './GenerationStats'
import RefinementSection from './RefinementSection'
import SuggestedActionsList from './SuggestedActionsList'
import SidebarFooter from './SidebarFooter'

interface AIGenerationSidebarProps {
  isOpen: boolean
  onClose: () => void
  generationResult: GenerationResult | null
  isGenerating: boolean
  onApproveAction: (action: SuggestedAction) => Promise<void>
  onApproveAll: (actions: SuggestedAction[]) => Promise<void>
  onRejectAction: (index: number) => void
  onRefineActions: (prompt: string) => Promise<void>
}

export default function AIGenerationSidebar({
  isOpen,
  onClose,
  generationResult,
  isGenerating,
  onApproveAction,
  onApproveAll,
  onRejectAction,
  onRefineActions
}: AIGenerationSidebarProps) {
  const [suggestedActions, setSuggestedActions] = useState<SuggestedAction[]>([])

  // Update local state when generation completes
  if (generationResult && generationResult.actions.length > 0 && suggestedActions.length === 0) {
    setSuggestedActions(generationResult.actions)
  }

  const handleReject = (index: number) => {
    setSuggestedActions(prev => prev.filter((_, i) => i !== index))
    onRejectAction(index)
  }

  const handleApproveAll = async () => {
    await onApproveAll(suggestedActions)
    onClose()
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed top-0 right-0 h-full w-[440px] bg-navy shadow-2xl z-50 flex flex-col transition-transform duration-300',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {isGenerating ? (
          <SidebarLoadingState />
        ) : suggestedActions.length > 0 ? (
          <>
            <SidebarHeader onClose={onClose} />
            <GenerationStats
              totalActions={suggestedActions.length}
              gapsAddressed={generationResult?.summary.gaps_addressed || 0}
              potentialImpact={generationResult?.summary.potential_impact || 0}
            />
            <RefinementSection onRefine={onRefineActions} />
            <SuggestedActionsList
              actions={suggestedActions}
              onApprove={onApproveAction}
              onReject={handleReject}
            />
            <SidebarFooter
              onDismissAll={onClose}
              onApproveAll={handleApproveAll}
              actionsCount={suggestedActions.length}
            />
          </>
        ) : null}
      </div>
    </>
  )
}
