import { useState, KeyboardEvent } from 'react'
import { Send } from 'lucide-react'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  documentCount: number
  indexedChunks: number
  isLoadingStats?: boolean
}

export default function ChatInput({ onSend, disabled, documentCount, indexedChunks, isLoadingStats }: ChatInputProps) {
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input.trim())
      setInput('')
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const getIndexingText = () => {
    if (isLoadingStats) return 'Loading...'
    if (indexedChunks === 0) return '0 pages (processing...)'
    return `${indexedChunks.toLocaleString()} pages`
  }

  return (
    <div className="p-4 border-t border-slate-200">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your documents..."
            disabled={disabled}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-copper/20 focus:border-copper disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        <button
          onClick={handleSend}
          disabled={!input.trim() || disabled}
          className="p-3 bg-navy hover:bg-slate-800 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
      <p className="text-xs text-slate-400 mt-2 text-center">
        Searching across {documentCount} documents · {getIndexingText()}
      </p>
    </div>
  )
}
