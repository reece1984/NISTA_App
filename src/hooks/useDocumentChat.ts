import { useState, useCallback } from 'react'
import type { ChatMessage } from '../types/documentChat'

// const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_BASE_URL

export function useDocumentChat(projectId: number) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = useCallback(async (query: string) => {
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: query,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    const loadingId = crypto.randomUUID()
    setMessages(prev => [...prev, {
      id: loadingId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true,
    }])

    try {
      // TODO: Replace with real API call when N8N workflow is ready
      // const response = await fetch(`${N8N_WEBHOOK_URL}/chat_with_documents`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     project_id: projectId,
      //     user_query: query,
      //     conversation_history: messages.slice(-10).map(m => ({
      //       role: m.role,
      //       content: m.content,
      //     })),
      //   }),
      // })
      // const data = await response.json()

      // Mock response for testing
      await new Promise(resolve => setTimeout(resolve, 1500))
      const data = {
        success: true,
        answer: `Based on your documents, here's what I found about "${query}":\n\nThe Full Business Case v2.3 contains relevant information. The document indicates comprehensive coverage of this topic with supporting evidence.\n\nKey points:\n• Primary analysis documented in Section 4\n• Supporting data in the appendices\n• Cross-referenced with Risk Register`,
        citations: [
          {
            document_id: 1,
            document_name: "Full Business Case v2.3",
            file_name: "FBC_Gate3_v2.3.pdf",
            section: "Section 4.3",
            page_numbers: "45-52",
            relevance_score: 0.92,
            excerpt: "The analysis demonstrates..."
          }
        ],
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to get response')
      }

      setMessages(prev => prev.map(m =>
        m.id === loadingId
          ? { ...m, content: data.answer, citations: data.citations, isLoading: false }
          : m
      ))

    } catch (error) {
      setMessages(prev => prev.map(m =>
        m.id === loadingId
          ? { ...m, isLoading: false, isError: true, errorMessage: error instanceof Error ? error.message : 'Something went wrong' }
          : m
      ))
    } finally {
      setIsLoading(false)
    }
  }, [projectId, messages])

  const clearMessages = useCallback(() => setMessages([]), [])

  return { messages, isLoading, sendMessage, clearMessages }
}
