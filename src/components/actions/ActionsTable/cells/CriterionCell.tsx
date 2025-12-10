import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../../../lib/supabase'
import { cn } from '../../../../lib/utils'

interface CriterionCellProps {
  criterionId: number | null
}

export default function CriterionCell({ criterionId }: CriterionCellProps) {
  const { data: criterion } = useQuery({
    queryKey: ['criterion', criterionId],
    queryFn: async () => {
      if (!criterionId) return null
      const { data, error } = await supabase
        .from('assessment_criteria')
        .select('id, criterion_code, name, case_category, rag_status')
        .eq('id', criterionId)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!criterionId
  })

  if (!criterionId || !criterion) {
    return <span className="text-xs text-slate-400">No criterion</span>
  }

  // RAG badge colors
  const ragColors = {
    red: 'bg-red-500',
    amber: 'bg-amber-500',
    green: 'bg-green-500'
  }

  return (
    <div className="flex items-center gap-2">
      {criterion.rag_status && (
        <div
          className={cn(
            'w-2 h-2 rounded-full',
            ragColors[criterion.rag_status as keyof typeof ragColors] || 'bg-slate-300'
          )}
        />
      )}
      <div className="flex flex-col">
        <span className="text-xs font-medium text-slate-900">
          {criterion.criterion_code}
        </span>
        <span className="text-xs text-slate-500 line-clamp-1">
          {criterion.name}
        </span>
      </div>
    </div>
  )
}
