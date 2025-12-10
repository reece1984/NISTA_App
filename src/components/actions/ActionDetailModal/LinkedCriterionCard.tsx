import { useQuery } from '@tanstack/react-query'
import { ChevronRight } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { cn } from '../../../lib/utils'

interface LinkedCriterionCardProps {
  criterionId: number | null
}

export default function LinkedCriterionCard({ criterionId }: LinkedCriterionCardProps) {
  const { data: criterion } = useQuery({
    queryKey: ['criterion-detail', criterionId],
    queryFn: async () => {
      if (!criterionId) return null
      const { data, error } = await supabase
        .from('assessment_criteria')
        .select('id, criterion_code, name, case_category, rag_status, gap_description')
        .eq('id', criterionId)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!criterionId
  })

  if (!criterionId || !criterion) {
    return (
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Addresses Gap
        </label>
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
          <p className="text-sm text-slate-500 text-center">
            No criterion linked to this action
          </p>
        </div>
      </div>
    )
  }

  // RAG badge styles
  const ragStyles = {
    red: 'bg-red-100 text-red-700',
    amber: 'bg-amber-100 text-amber-700',
    green: 'bg-green-100 text-green-700'
  }

  // Case category labels
  const caseCategoryLabels = {
    strategic: 'Strategic Case',
    economic: 'Economic Case',
    commercial: 'Commercial Case',
    financial: 'Financial Case',
    management: 'Management Case'
  }

  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
        Addresses Gap
      </label>
      <a
        href={`#criterion-${criterion.id}`}
        className="block p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-copper/50 hover:bg-slate-100 transition-colors group"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {criterion.rag_status && (
              <span className={cn(
                'px-2 py-1 text-xs font-bold rounded uppercase',
                ragStyles[criterion.rag_status as keyof typeof ragStyles] || 'bg-slate-100 text-slate-700'
              )}>
                {criterion.rag_status}
              </span>
            )}
            <div>
              <p className="text-sm font-semibold text-navy group-hover:text-copper transition-colors">
                {criterion.criterion_code} · {criterion.name}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {caseCategoryLabels[criterion.case_category as keyof typeof caseCategoryLabels] || criterion.case_category}
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-copper transition-colors flex-shrink-0" />
        </div>
        {criterion.gap_description && (
          <div className="mt-3 pt-3 border-t border-slate-200">
            <p className="text-xs text-slate-500 line-clamp-2">
              <span className="font-medium text-slate-600">Gap:</span> {criterion.gap_description}
            </p>
          </div>
        )}
      </a>
    </div>
  )
}
