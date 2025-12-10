import { useMemo } from 'react'
import { GATE_RECOMMENDATIONS } from '../data/recommendedDocuments'
import type { RecommendationsWithProgress } from '../types/recommendedDocuments'
import type { Document } from '../types/document'

export function useRecommendedDocs(
  projectGate: string,
  uploadedDocuments: Document[]
): RecommendationsWithProgress | null {
  return useMemo(() => {
    const recommendations = GATE_RECOMMENDATIONS[projectGate]
    if (!recommendations) return null

    // Match uploaded documents to recommendations by type/name
    const docsWithStatus = recommendations.documents.map(rec => {
      const matchingDoc = uploadedDocuments.find(doc => {
        const docTypeLower = doc.document_type?.toLowerCase() || ''
        const docNameLower = doc.name?.toLowerCase() || ''
        const fileNameLower = doc.file_name?.toLowerCase() || ''
        const recIdLower = rec.id.toLowerCase()
        const recNameLower = rec.name.toLowerCase()

        // Extract first meaningful word from recommended name
        const recFirstWord = recNameLower.split(' ')[0]

        // Check multiple matching strategies
        return (
          // Match by document_type containing rec ID
          docTypeLower.includes(recIdLower) ||
          // Match by name containing rec ID
          docNameLower.includes(recIdLower) ||
          // Match by file name containing rec ID
          fileNameLower.includes(recIdLower) ||
          // Match by name containing first word of recommendation
          (recFirstWord.length > 3 && docNameLower.includes(recFirstWord)) ||
          // Match by file name containing first word of recommendation
          (recFirstWord.length > 3 && fileNameLower.includes(recFirstWord)) ||
          // Specific matches for common document types
          (recIdLower === 'fbc' && (docNameLower.includes('business case') || fileNameLower.includes('business case'))) ||
          (recIdLower === 'brp' && (docNameLower.includes('benefit') || fileNameLower.includes('benefit'))) ||
          (recIdLower === 'risk' && (docNameLower.includes('risk') || fileNameLower.includes('risk'))) ||
          (recIdLower === 'procurement' && (docNameLower.includes('procurement') || docNameLower.includes('commercial') || fileNameLower.includes('procurement') || fileNameLower.includes('commercial'))) ||
          (recIdLower === 'implementation' && (docNameLower.includes('implementation') || docNameLower.includes('delivery') || fileNameLower.includes('implementation') || fileNameLower.includes('delivery'))) ||
          (recIdLower === 'assurance' && (docNameLower.includes('assurance') || fileNameLower.includes('assurance')))
        )
      })

      return {
        ...rec,
        isUploaded: !!matchingDoc,
        uploadedDocumentId: matchingDoc?.id,
      }
    })

    const uploadedCount = docsWithStatus.filter(d => d.isUploaded).length
    const totalCount = docsWithStatus.length

    return {
      ...recommendations,
      documents: docsWithStatus,
      uploadedCount,
      totalCount,
      progressPercent: Math.round((uploadedCount / totalCount) * 100),
    }
  }, [projectGate, uploadedDocuments])
}
