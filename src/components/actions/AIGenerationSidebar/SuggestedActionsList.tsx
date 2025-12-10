import type { SuggestedAction, CaseCategory } from '../../../types/actions'
import SuggestedActionCard from './SuggestedActionCard'

interface SuggestedActionsListProps {
  actions: SuggestedAction[]
  onApprove: (action: SuggestedAction) => Promise<void>
  onReject: (index: number) => void
}

const CASE_CATEGORY_LABELS = {
  strategic: 'Strategic Case',
  economic: 'Economic Case',
  commercial: 'Commercial Case',
  financial: 'Financial Case',
  management: 'Management Case'
}

const CASE_CATEGORY_COLORS = {
  strategic: 'bg-blue-400',
  economic: 'bg-green-400',
  commercial: 'bg-purple-400',
  financial: 'bg-amber-400',
  management: 'bg-red-400'
}

export default function SuggestedActionsList({
  actions,
  onApprove,
  onReject
}: SuggestedActionsListProps) {
  // Group actions by case category
  const groupedActions = actions.reduce((groups, action, index) => {
    const category = action.case_category
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push({ action, originalIndex: index })
    return groups
  }, {} as Record<CaseCategory, Array<{ action: SuggestedAction; originalIndex: number }>>)

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin">
      {Object.entries(groupedActions).map(([category, categoryActions]) => (
        <div key={category} className="px-5 pt-4">
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-1.5 h-1.5 rounded-full ${CASE_CATEGORY_COLORS[category as CaseCategory]}`} />
            <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">
              {CASE_CATEGORY_LABELS[category as CaseCategory]}
            </span>
            <span className="text-[10px] text-white/30">{categoryActions.length} actions</span>
          </div>

          <div className="space-y-3 mb-6">
            {categoryActions.map(({ action, originalIndex }) => (
              <SuggestedActionCard
                key={originalIndex}
                action={action}
                onApprove={() => onApprove(action)}
                onReject={() => onReject(originalIndex)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
