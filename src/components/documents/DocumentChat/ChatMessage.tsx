import ChatCitation from './ChatCitation'
import type { ChatMessage as ChatMessageType } from '../../../types/documentChat'
import { Loader2 } from 'lucide-react'

interface ChatMessageProps {
  message: ChatMessageType
}

export default function ChatMessage({ message }: ChatMessageProps) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] bg-navy text-white rounded-2xl rounded-br-md px-4 py-2.5">
          <p className="text-sm">{message.content}</p>
        </div>
      </div>
    )
  }

  // Assistant message
  return (
    <div className="flex justify-start">
      <div className="max-w-[85%]">
        <div className="bg-slate-100 rounded-2xl rounded-bl-md px-4 py-3">
          {message.isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-copper" />
              <span className="text-sm text-slate-600">Thinking...</span>
            </div>
          ) : message.isError ? (
            <div>
              <p className="text-sm text-red-600 font-medium">Error</p>
              <p className="text-sm text-slate-600 mt-1">{message.errorMessage || 'Something went wrong. Please try again.'}</p>
            </div>
          ) : (
            <div className="text-sm text-slate-700 whitespace-pre-wrap">
              {message.content.split('\n').map((line, i) => {
                if (line.startsWith('•')) {
                  return (
                    <div key={i} className="flex items-start gap-2 my-1">
                      <span className="text-copper mt-0.5">•</span>
                      <span>{line.substring(1).trim()}</span>
                    </div>
                  )
                }
                return <p key={i} className={i > 0 ? 'mt-2' : ''}>{line}</p>
              })}
            </div>
          )}
        </div>

        {/* Citations */}
        {message.citations && message.citations.length > 0 && (
          <div className="mt-2 space-y-1.5">
            {message.citations.map((citation, idx) => (
              <ChatCitation key={idx} citation={citation} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
