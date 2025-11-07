import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export interface DocumentType {
  id: number
  name: string
  category: string
  description: string | null
  typical_for_gates: string[] | null
  is_active: boolean
  display_order: number
}

export interface GroupedDocumentTypes {
  [category: string]: DocumentType[]
}

export function useDocumentTypes() {
  return useQuery({
    queryKey: ['documentTypes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('document_types')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })

      if (error) throw error

      // Group by category
      const grouped: GroupedDocumentTypes = {}
      data.forEach((type) => {
        if (!grouped[type.category]) {
          grouped[type.category] = []
        }
        grouped[type.category].push(type)
      })

      return { types: data as DocumentType[], grouped }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
