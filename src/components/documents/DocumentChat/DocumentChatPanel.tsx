import { useDocumentChat } from '../../../hooks/useDocumentChat'
import ChatHeader from './ChatHeader'
import ChatMessages from './ChatMessages'
import ChatInput from './ChatInput'

interface DocumentChatPanelProps {
  projectId: number
  documentCount: number
  pageCount: number
  onClose: () => void
}

export default function DocumentChatPanel({
  projectId,
  documentCount,
  pageCount,
  onClose
}: DocumentChatPanelProps) {
  const { messages, isLoading, sendMessage } = useDocumentChat(projectId)

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Chat Panel - Fixed Overlay */}
      <div className="fixed right-0 top-16 bottom-0 w-[380px] bg-white border-l border-slate-200 shadow-[-4px_0_20px_rgba(0,0,0,0.1)] z-50 flex flex-col animate-slide-in">
        <ChatHeader
          documentCount={documentCount}
          pageCount={pageCount}
          onClose={onClose}
        />

        <ChatMessages messages={messages} />

        <ChatInput
          onSend={sendMessage}
          disabled={isLoading}
          documentCount={documentCount}
          pageCount={pageCount}
        />
      </div>
    </>
  )
}
