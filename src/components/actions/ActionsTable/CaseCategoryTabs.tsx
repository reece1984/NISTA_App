import { cn } from '../../../lib/utils'
import type { CaseCategory } from '../../../types/actions'

interface CaseCategoryTabsProps {
  activeCategory: CaseCategory | 'all'
  counts: Record<CaseCategory | 'all', number>
  onChange: (category: CaseCategory | 'all') => void
}

const tabs: Array<{ key: CaseCategory | 'all'; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'strategic', label: 'Strategic' },
  { key: 'economic', label: 'Economic' },
  { key: 'commercial', label: 'Commercial' },
  { key: 'financial', label: 'Financial' },
  { key: 'management', label: 'Management' }
]

export default function CaseCategoryTabs({
  activeCategory,
  counts,
  onChange
}: CaseCategoryTabsProps) {
  return (
    <div className="border-b border-slate-200 px-4">
      <nav className="flex gap-1">
        {tabs.map(tab => {
          const isActive = activeCategory === tab.key
          const count = counts[tab.key] || 0

          return (
            <button
              key={tab.key}
              onClick={() => onChange(tab.key)}
              className={cn(
                'px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
                isActive
                  ? 'text-navy font-semibold border-copper'
                  : 'text-slate-500 hover:text-slate-700 border-transparent'
              )}
            >
              {tab.label}
              <span
                className={cn(
                  'ml-1.5 px-1.5 py-0.5 text-xs rounded',
                  isActive
                    ? 'bg-navy text-white'
                    : 'bg-slate-100 text-slate-600'
                )}
              >
                {count}
              </span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
