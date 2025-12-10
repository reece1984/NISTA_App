interface GenerationStatsProps {
  totalActions: number
  gapsAddressed: number
  potentialImpact: number
}

export default function GenerationStats({
  totalActions,
  gapsAddressed,
  potentialImpact
}: GenerationStatsProps) {
  return (
    <div className="px-5 py-4 border-b border-white/10 bg-white/5">
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <p className="text-2xl font-bold text-white">{totalActions}</p>
          <p className="text-[10px] text-white/50 uppercase tracking-wider">Actions</p>
        </div>
        <div className="text-center border-x border-white/10">
          <p className="text-2xl font-bold text-green-400">{gapsAddressed}</p>
          <p className="text-[10px] text-white/50 uppercase tracking-wider">Gaps Addressed</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-copper">+{potentialImpact}%</p>
          <p className="text-[10px] text-white/50 uppercase tracking-wider">Est. Impact</p>
        </div>
      </div>
    </div>
  )
}
