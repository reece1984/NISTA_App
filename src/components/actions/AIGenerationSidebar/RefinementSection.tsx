import { useState } from 'react'
import { Zap, ArrowRight } from 'lucide-react'

interface RefinementSectionProps {
  onRefine: (prompt: string) => Promise<void>
}

const QUICK_CHIPS = [
  'Make more specific',
  'Add due dates',
  'Break into sub-tasks',
  'Suggest owners'
]

export default function RefinementSection({ onRefine }: RefinementSectionProps) {
  const [customPrompt, setCustomPrompt] = useState('')
  const [isRefining, setIsRefining] = useState(false)

  const handleChipClick = async (chip: string) => {
    setIsRefining(true)
    try {
      await onRefine(chip)
    } finally {
      setIsRefining(false)
    }
  }

  const handleCustomRefine = async () => {
    if (!customPrompt.trim()) return

    setIsRefining(true)
    try {
      await onRefine(customPrompt)
      setCustomPrompt('')
    } finally {
      setIsRefining(false)
    }
  }

  return (
    <div className="px-5 py-4 border-b border-white/10">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-4 h-4 text-copper" />
        <span className="text-xs font-medium text-white/70">Refine with AI</span>
      </div>

      {/* Quick Chips */}
      <div className="flex flex-wrap gap-2 mb-3">
        {QUICK_CHIPS.map(chip => (
          <button
            key={chip}
            onClick={() => handleChipClick(chip)}
            disabled={isRefining}
            className="px-2.5 py-1 text-xs bg-white/10 hover:bg-white/20 text-white/70 hover:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Custom Prompt Input */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Or type a custom refinement..."
          value={customPrompt}
          onChange={e => setCustomPrompt(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleCustomRefine()}
          disabled={isRefining}
          className="flex-1 px-3 py-2 text-sm bg-white/10 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-copper/50 focus:border-copper/50 disabled:opacity-50"
        />
        <button
          onClick={handleCustomRefine}
          disabled={!customPrompt.trim() || isRefining}
          className="px-3 py-2 bg-copper hover:bg-copper-light text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
