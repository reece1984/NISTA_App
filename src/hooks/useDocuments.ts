import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export interface ProjectDocument {
  id: number
  project_id: number
  file_name: string
  file_type: string | null
  file_url: string
  file_key: string
  status: string | null
  uploaded_at: string
  processed_at: string | null
  document_type: string | null
  document_category: string | null
  display_order: number | null
  error_message: string | null
}

export function useDocuments(projectId: number) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['documents', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('project_id', projectId)
        .order('display_order', { ascending: true })
        .order('uploaded_at', { ascending: false })

      if (error) throw error
      return data as ProjectDocument[]
    },
    refetchInterval: (query) => {
      // Poll every 3 seconds if any document is processing
      const data = query.state.data
      const hasProcessing = data?.some((doc: ProjectDocument) => doc.status === 'processing' || doc.status === 'uploaded')
      return hasProcessing ? 3000 : false
    },
  })

  const deleteDocument = useMutation({
    mutationFn: async (document: ProjectDocument) => {
      // Delete from database
      const { error: dbError } = await supabase.from('files').delete().eq('id', document.id)

      if (dbError) throw dbError

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('project-documents')
        .remove([document.file_key])

      if (storageError) {
        console.error('Storage deletion error:', storageError)
        // Don't throw - file might not exist in storage
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', projectId] })
    },
  })

  return {
    documents: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    deleteDocument,
  }
}
