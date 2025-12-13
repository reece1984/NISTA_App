import { useState } from 'react'
import { X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { ActionPriority, CaseCategory } from '../../types/actions'

interface CreateActionModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (action: any) => void
  projectId: number
  assessmentRunId: number | null
  criterionId: number
  criterionCode: string
  criterionTitle: string
  caseCategory: string
  finding: string
  recommendation: string
  ragRating: string
}

export function CreateActionModal({
  isOpen,
  onClose,
  onSuccess,
  projectId,
  assessmentRunId,
  criterionId,
  criterionCode,
  criterionTitle,
  caseCategory,
  finding,
  recommendation,
  ragRating,
}: CreateActionModalProps) {

  // Map RAG to priority
  const defaultPriority: ActionPriority = ragRating === 'RED' ? 'critical'
    : ragRating === 'AMBER' ? 'high'
    : 'medium'

  // Form state
  const [title, setTitle] = useState(`Address ${criterionTitle}`)
  const [description, setDescription] = useState(recommendation || finding)
  const [priority, setPriority] = useState<ActionPriority>(defaultPriority)
  const [dueDate, setDueDate] = useState('')
  const [estimatedImpact, setEstimatedImpact] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const { data, error: insertError } = await supabase
        .from('actions')
        .insert({
          project_id: projectId,
          criterion_id: criterionId,
          source_assessment_run_id: assessmentRunId,
          source_type: 'manual',
          title: title.trim(),
          description: description.trim(),
          priority: priority,
          case_category: caseCategory.toLowerCase() as CaseCategory,
          action_status: 'not_started',
          due_date: dueDate || null,
          estimated_impact: estimatedImpact,
        })
        .select()
        .single()

      if (insertError) throw insertError

      onSuccess(data)
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to create action')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Create Action</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Source Finding Context */}
        <div className="px-4 pt-4">
          <p className="text-sm text-slate-500 mb-2">Creating action from finding:</p>
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-500">{criterionCode}</span>
                  <span className="text-sm font-medium text-slate-900 truncate">{criterionTitle}</span>
                </div>
              </div>
              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full flex-shrink-0 ml-2 ${
                ragRating === 'RED' ? 'bg-red-100 text-red-700' :
                ragRating === 'AMBER' ? 'bg-amber-100 text-amber-700' :
                'bg-green-100 text-green-700'
              }`}>
                {ragRating}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">{caseCategory} Case</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>

          {/* Priority & Due Date Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as ActionPriority)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Estimated Impact */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Estimated Impact on Readiness
            </label>
            <select
              value={estimatedImpact || ''}
              onChange={(e) => setEstimatedImpact(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">Not specified</option>
              <option value="1">+1%</option>
              <option value="2">+2%</option>
              <option value="3">+3%</option>
              <option value="5">+5%</option>
              <option value="8">+8%</option>
              <option value="10">+10%</option>
            </select>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Creating...' : 'Create Action'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
