import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

interface DocumentStats {
  totalChunks: number
  documentChunkCounts: Record<number, number> // document_id -> chunk count
  isLoading: boolean
  error: Error | null
}

export function useDocumentStats(projectId: number): DocumentStats {
  const { data, isLoading, error } = useQuery({
    queryKey: ['document-stats', projectId],
    queryFn: async () => {
      console.log('🔵 useDocumentStats: Fetching stats for projectId:', projectId)

      // Get total count of embeddings for this project
      const countResponse = await supabase
        .from('document_embeddings')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', projectId)

      console.log('🔵 useDocumentStats: Count response:', countResponse)

      if (countResponse.error) {
        console.error('🔴 useDocumentStats: Count error:', countResponse.error)
        throw countResponse.error
      }

      // Get per-document chunk counts
      const embeddingsResponse = await supabase
        .from('document_embeddings')
        .select('file_id')
        .eq('project_id', projectId)

      console.log('🔵 useDocumentStats: Embeddings response:', {
        count: embeddingsResponse.data?.length,
        sample: embeddingsResponse.data?.slice(0, 3)
      })

      if (embeddingsResponse.error) {
        console.error('🔴 useDocumentStats: Embeddings error:', embeddingsResponse.error)
        throw embeddingsResponse.error
      }

      // Count chunks per file
      const documentChunkCounts: Record<number, number> = {}
      embeddingsResponse.data?.forEach(embedding => {
        const fileId = embedding.file_id
        documentChunkCounts[fileId] = (documentChunkCounts[fileId] || 0) + 1
      })

      const result = {
        totalChunks: countResponse.count || 0,
        documentChunkCounts
      }

      console.log('🔵 useDocumentStats: Final result:', result)

      return result
    },
    enabled: !!projectId,
    staleTime: 30000, // Cache for 30 seconds
    refetchOnWindowFocus: false
  })

  return {
    totalChunks: data?.totalChunks || 0,
    documentChunkCounts: data?.documentChunkCounts || {},
    isLoading,
    error: error as Error | null
  }
}
