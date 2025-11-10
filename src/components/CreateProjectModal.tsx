import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase, type AssessmentTemplate } from '../lib/supabase'
import Modal from './ui/Modal'
import Button from './ui/Button'
import Input from './ui/Input'
import Label from './ui/Label'
import TemplateDetailSheet from './TemplateDetailSheet'

const projectSchema = z.object({
  templateId: z.preprocess(
    (val) => (val === '' || val === undefined ? undefined : Number(val)),
    z.number().min(1, 'Assessment template is required')
  ),
  projectName: z.string().min(1, 'Project name is required'),
  projectValue: z.preprocess(
    (val) => (val === '' || val === undefined ? undefined : Number(val)),
    z.number().positive('Project value must be positive').optional()
  ),
  projectSector: z.string().min(1, 'Project sector is required'),
})

type ProjectFormData = {
  templateId: number
  projectName: string
  projectValue?: number
  projectSector: string
}

interface CreateProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const sectors = [
  'Infrastructure',
  'Health',
  'Defence',
  'Digital',
  'Transport',
  'Education',
  'Energy',
  'Environment',
  'Housing',
  'Other',
]

export default function CreateProjectModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateProjectModalProps) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [templates, setTemplates] = useState<AssessmentTemplate[]>([])
  const [showTemplateDetail, setShowTemplateDetail] = useState(false)
  const { user } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(projectSchema),
  })

  const selectedTemplateId = watch('templateId')
  const selectedTemplate = templates.find((t) => t.id === Number(selectedTemplateId))

  // Fetch templates on mount
  useEffect(() => {
    const fetchTemplates = async () => {
      const { data, error } = await supabase
        .from('assessment_templates')
        .select('*')
        .eq('is_active', true)
        .order('id')

      if (!error && data) {
        setTemplates(data)
      }
    }

    fetchTemplates()
  }, [])

  const onSubmit = async (data: ProjectFormData) => {
    if (!user) {
      setError('You must be logged in to create a project')
      return
    }

    try {
      setError('')
      setLoading(true)

      // First, get or create the user record in our users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('openId', user.id)
        .single()

      let userId: number

      if (userError || !userData) {
        // Create user record if it doesn't exist
        const { data: newUser, error: createUserError } = await supabase
          .from('users')
          .insert({
            openId: user.id,
            email: user.email,
            loginMethod: 'email',
          })
          .select('id')
          .single()

        if (createUserError || !newUser) {
          throw new Error('Failed to create user record')
        }
        userId = newUser.id
      } else {
        userId = userData.id
      }

      // Create the project
      const { error: projectError } = await supabase.from('projects').insert({
        user_id: userId,
        template_id: data.templateId,
        project_name: data.projectName,
        project_value: data.projectValue || null,
        project_sector: data.projectSector,
        status: 'draft',
      })

      if (projectError) throw projectError

      reset()
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Failed to create project')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    reset()
    setError('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Project">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="bg-error/10 border border-error text-error px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div>
          <Label htmlFor="projectName">Project Name</Label>
          <Input
            id="projectName"
            type="text"
            placeholder="e.g., HS2 Phase 2"
            error={errors.projectName?.message}
            {...register('projectName')}
          />
        </div>

        <div>
          <Label htmlFor="templateId">Assessment Template</Label>
          <select
            id="templateId"
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-colors"
            {...register('templateId')}
          >
            <option value="">Select an assessment template</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
          {errors.templateId && (
            <p className="mt-1 text-sm text-error">
              {errors.templateId.message}
            </p>
          )}
          {selectedTemplate && (
            <button
              type="button"
              onClick={() => setShowTemplateDetail(true)}
              className="mt-2 flex items-center gap-2 text-sm text-secondary hover:text-secondary/80 transition-colors"
            >
              <Eye size={16} />
              View assessment criteria for this template
            </button>
          )}
        </div>

        <div>
          <Label htmlFor="projectValue">Project Value (£ millions)</Label>
          <Input
            id="projectValue"
            type="number"
            placeholder="e.g., 5000"
            error={errors.projectValue?.message}
            {...register('projectValue')}
          />
        </div>

        <div>
          <Label htmlFor="projectSector">Project Sector</Label>
          <select
            id="projectSector"
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-colors"
            {...register('projectSector')}
          >
            <option value="">Select a sector</option>
            {sectors.map((sector) => (
              <option key={sector} value={sector}>
                {sector}
              </option>
            ))}
          </select>
          {errors.projectSector && (
            <p className="mt-1 text-sm text-error">
              {errors.projectSector.message}
            </p>
          )}
        </div>

        <div className="flex gap-4 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            className="flex-1"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Project'}
          </Button>
        </div>
      </form>

      {/* Template Detail Sheet */}
      <TemplateDetailSheet
        isOpen={showTemplateDetail}
        onClose={() => setShowTemplateDetail(false)}
        templateId={selectedTemplate?.id || null}
        templateName={selectedTemplate?.name || ''}
      />
    </Modal>
  )
}
