import { useState, useCallback } from 'react'
import type { ChatMessage } from '../types/documentChat'

const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_BASE_URL

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
      console.log('🔵 Document Chat: Sending request to N8N webhook')
      console.log('🔵 Project ID:', projectId)
      console.log('🔵 Query:', query)
      console.log('🔵 Webhook URL:', N8N_WEBHOOK_URL)

      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: 'chat_with_documents',
          project_id: projectId,
          user_query: query,
          conversation_history: messages.slice(-10).map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      console.log('🔵 Response status:', response.status)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('🔵 Response data:', data)

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
