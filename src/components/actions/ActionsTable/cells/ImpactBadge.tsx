interface ImpactBadgeProps {
  impact: number | null
}

export default function ImpactBadge({ impact }: ImpactBadgeProps) {
  if (!impact || impact === 0) {
    return <span className="text-xs text-slate-400">-</span>
  }

  return (
    <span className="text-sm font-semibold text-green-600">
      +{impact}%
    </span>
  )
}
