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
    <div className="w-[380px] border-l border-slate-200 bg-white flex flex-col">
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
  )
}
