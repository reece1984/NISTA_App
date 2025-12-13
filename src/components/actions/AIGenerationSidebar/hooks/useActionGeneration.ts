import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { GenerationResult, SuggestedAction } from '../../../../types/actions'

interface UseActionGenerationOptions {
  projectId: number
}

// Mock data for testing - will be replaced with real N8N API call
const generateMockActions = async (projectId: number, refinementPrompt?: string): Promise<GenerationResult> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000))

  return {
    actions: [
      {
        title: 'Enhance Business Case Documentation',
        description: 'Review and strengthen the strategic rationale, ensuring alignment with current government priorities and spending review requirements.',
        criterion_id: 1,
        criterion_code: 'G3-I-1.1',
        criterion_name: 'Business Case Publication (GMPP)',
        criterion_rag: 'RED',
        case_category: 'strategic',
        priority: 'critical',
        estimated_impact: 8,
        suggested_due_date: '2025-01-15'
      },
      {
        title: 'Complete Quantified Risk Assessment',
        description: 'Update the QRA with latest cost estimates, schedule risk analysis, and Monte Carlo simulation outputs. Ensure alignment with Treasury Green Book requirements.',
        criterion_id: 2,
        criterion_code: 'G3-IV-4.1',
        criterion_name: 'Cost Contingency Analysis',
        criterion_rag: 'RED',
        case_category: 'financial',
        priority: 'critical',
        estimated_impact: 6,
        suggested_due_date: '2025-01-20'
      },
      {
        title: 'Develop Benefits Realization Plan',
        description: 'Create comprehensive plan detailing how benefits will be measured, tracked and realized post-implementation.',
        criterion_id: 3,
        criterion_code: 'G3-II-2.3',
        criterion_name: 'Benefits Management Strategy',
        criterion_rag: 'AMBER',
        case_category: 'economic',
        priority: 'high',
        estimated_impact: 7,
        suggested_due_date: '2025-02-01'
      },
      {
        title: 'Update Commercial Strategy',
        description: 'Revise procurement approach and contracting strategy based on latest market soundings and IPA recommendations.',
        criterion_id: 4,
        criterion_code: 'G3-III-3.2',
        criterion_name: 'Procurement Strategy',
        criterion_rag: 'AMBER',
        case_category: 'commercial',
        priority: 'high',
        estimated_impact: 5,
        suggested_due_date: '2025-02-10'
      },
      {
        title: 'Establish Programme Governance Structure',
        description: 'Define clear governance framework with roles, responsibilities, decision-making authorities and escalation procedures.',
        criterion_id: 5,
        criterion_code: 'G3-V-5.1',
        criterion_name: 'Governance Framework',
        criterion_rag: 'RED',
        case_category: 'management',
        priority: 'critical',
        estimated_impact: 4,
        suggested_due_date: '2025-01-25'
      }
    ],
    summary: {
      total_generated: 5,
      gaps_addressed: 5,
      potential_impact: 30
    }
  }
}

export function useActionGeneration({ projectId }: UseActionGenerationOptions) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null)
  const queryClient = useQueryClient()

  const generateActions = async (refinementPrompt?: string) => {
    setIsGenerating(true)
    try {
      const result = await generateMockActions(projectId, refinementPrompt)
      setGenerationResult(result)
      return result
    } finally {
      setIsGenerating(false)
    }
  }

  const approveAction = useMutation({
    mutationFn: async (action: SuggestedAction) => {
      const response = await fetch(`http://localhost:3001/api/projects/${projectId}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: action.title,
          description: action.description,
          action_status: 'not_started',
          priority: action.priority,
          criterion_id: action.criterion_id,
          case_category: action.case_category,
          estimated_impact: action.estimated_impact,
          source_type: 'ai_generated',
          due_date: action.suggested_due_date
        })
      })

      if (!response.ok) throw new Error('Failed to create action')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actions-v3', projectId] })
      queryClient.invalidateQueries({ queryKey: ['actions', projectId] })
    }
  })

  const approveAllActions = useMutation({
    mutationFn: async (actions: SuggestedAction[]) => {
      const results = await Promise.all(
        actions.map(action =>
          fetch(`http://localhost:3001/api/projects/${projectId}/actions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: action.title,
              description: action.description,
              action_status: 'not_started',
              priority: action.priority,
              criterion_id: action.criterion_id,
              case_category: action.case_category,
              estimated_impact: action.estimated_impact,
              source_type: 'ai_generated',
              due_date: action.suggested_due_date
            })
          }).then(res => {
            if (!res.ok) throw new Error('Failed to create action')
            return res.json()
          })
        )
      )
      return results
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actions-v3', projectId] })
      queryClient.invalidateQueries({ queryKey: ['actions', projectId] })
    }
  })

  return {
    isGenerating,
    generationResult,
    generateActions,
    approveAction: approveAction.mutateAsync,
    approveAllActions: approveAllActions.mutateAsync
  }
}
