interface CriterionCellProps {
  criterion?: {
    id: number
    criterionCode?: string
    criterion_code?: string  // Support snake_case from Supabase
    title: string
    category: string
  }
}

export default function CriterionCell({ criterion }: CriterionCellProps) {
  console.log('CriterionCell received:', criterion)

  if (!criterion) {
    return <span className="text-xs text-slate-400">No criterion</span>
  }

  // Support both camelCase and snake_case
  const code = criterion.criterionCode || criterion.criterion_code

  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-col">
        <span className="text-xs font-medium text-slate-900">
          {code}
        </span>
        <span className="text-xs text-slate-500 line-clamp-1">
          {criterion.title}
        </span>
      </div>
    </div>
  )
}
