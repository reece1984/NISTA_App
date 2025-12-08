import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../contexts/AuthContext'
import { supabase, type AssessmentTemplate } from '../lib/supabase'
import Modal from './ui/Modal'
import Button from './ui/Button'
import Input from './ui/Input'
import Label from './ui/Label'
import { Upload, Folder, Calendar, FileText, Clock } from 'lucide-react'

const projectSchema = z.object({
  projectName: z.string().min(1, 'Project name is required'),
  projectValue: z.preprocess(
    (val) => (val === '' || val === undefined ? undefined : Number(val)),
    z.number().positive('Project value must be positive').optional()
  ),
  projectSector: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z.string().min(1, 'Project sector is required')
  ),
  sponsoringOrganisation: z.string().optional(),
  deliveryOrganisation: z.string().optional(),
  templateId: z.preprocess(
    (val) => {
      console.log('templateId raw value:', val, typeof val)
      if (val === '' || val === undefined || val === null) return undefined
      const num = Number(val)
      console.log('templateId converted:', num)
      return num
    },
    z.number().min(1, 'Assessment template is required')
  ),
  gatewayReviewDate: z.string().optional(),
  previousRating: z.string().optional(),
})

type ProjectFormData = {
  projectName: string
  projectValue?: number
  projectSector: string
  sponsoringOrganisation?: string
  deliveryOrganisation?: string
  templateId: number
  gatewayReviewDate?: string
  previousRating?: string
}

interface CreateProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (projectId: number) => void
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

const sponsoringOrganisations = [
  'Department for Transport',
  'DESNZ',
  'Ministry of Defence',
  'DHSC',
  'Department for Education',
  'Home Office',
  'HMRC',
  'Nuclear Decommissioning Authority',
  'HS2 Ltd',
  'Network Rail',
  'National Highways',
  'Other',
]

const previousRatings = [
  { value: 'first-review', label: 'First Review', color: '#D1D5DB' },
  { value: 'green', label: 'Green', color: '#10B981' },
  { value: 'amber-green', label: 'Amber/Green', color: '#84CC16' },
  { value: 'amber', label: 'Amber', color: '#F59E0B' },
  { value: 'amber-red', label: 'Amber/Red', color: '#F97316' },
  { value: 'red', label: 'Red', color: '#EF4444' },
]

export default function CreateProjectModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateProjectModalProps) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [templates, setTemplates] = useState<AssessmentTemplate[]>([])
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadError, setUploadError] = useState('')
  const { user } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
  })

  // Debug form errors
  console.log('Form errors:', JSON.stringify(errors, null, 2))

  const gatewayReviewDate = watch('gatewayReviewDate')

  // Calculate days until gateway review
  const calculateDaysUntil = (dateString: string | undefined): number | null => {
    if (!dateString) return null
    try {
      const reviewDate = new Date(dateString)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      reviewDate.setHours(0, 0, 0, 0)
      const diffTime = reviewDate.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays
    } catch {
      return null
    }
  }

  const daysUntilReview = calculateDaysUntil(gatewayReviewDate)

  // Get countdown badge color based on days remaining
  const getCountdownColor = (days: number | null): string => {
    if (days === null || days < 0) return 'var(--copper)'
    if (days > 30) return '#10B981' // Green
    if (days >= 15) return '#F59E0B' // Amber
    return '#EF4444' // Red
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setUploadError('')

    if (!file) {
      setUploadedFile(null)
      return
    }

    // Validate file type (allow common document formats)
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-powerpoint',
    ]

    if (!allowedTypes.includes(file.type)) {
      setUploadError('Please upload a PDF, Word, or PowerPoint file')
      setUploadedFile(null)
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size must be less than 10MB')
      setUploadedFile(null)
      return
    }

    setUploadedFile(file)
  }

  const removeFile = () => {
    setUploadedFile(null)
    setUploadError('')
  }

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
    console.log('Form submitted with data:', data)
    console.log('User:', user)

    if (!user) {
      console.error('No user found!')
      setError('You must be logged in to create a project')
      return
    }

    try {
      setError('')
      setLoading(true)
      console.log('Starting project creation...')

      // First, get or create the user record in our users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('open_id', user.id)
        .single()

      let userId: number

      if (userError || !userData) {
        // Create user record if it doesn't exist
        const { data: newUser, error: createUserError } = await supabase
          .from('users')
          .insert({
            open_id: user.id,
            email: user.email,
            login_method: 'email',
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

      // Upload template file if provided
      let reportTemplateUrl: string | null = null
      let reportTemplateName: string | null = null

      if (uploadedFile) {
        const fileExt = uploadedFile.name.split('.').pop()
        const fileName = `${userId}_${Date.now()}.${fileExt}`
        const filePath = `report-templates/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('project-files')
          .upload(filePath, uploadedFile)

        if (uploadError) {
          console.error('File upload error:', uploadError)
          // Don't fail the entire project creation if file upload fails
        } else {
          const { data: urlData } = supabase.storage
            .from('project-files')
            .getPublicUrl(filePath)

          reportTemplateUrl = urlData.publicUrl
          reportTemplateName = uploadedFile.name
        }
      }

      // Build project data with optional fields
      const projectData: any = {
        user_id: userId,
        template_id: data.templateId,
        project_name: data.projectName,
        project_value: data.projectValue || null,
        project_sector: data.projectSector,
        status: 'draft',
      }

      // Add optional fields only if they have values
      if (data.sponsoringOrganisation) {
        projectData.sponsoring_organisation = data.sponsoringOrganisation
      }
      if (data.deliveryOrganisation) {
        projectData.delivery_organisation = data.deliveryOrganisation
      }
      if (data.gatewayReviewDate) {
        projectData.gateway_review_date = data.gatewayReviewDate
      }
      if (data.previousRating) {
        projectData.previous_rating = data.previousRating
      }
      if (reportTemplateUrl) {
        projectData.report_template_url = reportTemplateUrl
        projectData.report_template_name = reportTemplateName
      }

      // Create the project with graceful handling of missing columns
      let createdProject
      try {
        const { data: newProject, error: projectError } = await supabase
          .from('projects')
          .insert(projectData)
          .select()
          .single()
        if (projectError) throw projectError
        createdProject = newProject
      } catch (insertError: any) {
        // If column doesn't exist, retry with only core fields
        if (insertError.message?.includes('column') && insertError.message?.includes('does not exist')) {
          console.warn('Some optional fields not available in database, creating with core fields only')
          const coreProjectData = {
            user_id: userId,
            template_id: data.templateId,
            project_name: data.projectName,
            project_value: data.projectValue || null,
            project_sector: data.projectSector,
            status: 'draft',
          }
          const { data: newProject, error: coreError } = await supabase
            .from('projects')
            .insert(coreProjectData)
            .select()
            .single()
          if (coreError) throw coreError
          createdProject = newProject
        } else {
          throw insertError
        }
      }

      console.log('Project created successfully:', createdProject)
      reset()
      setUploadedFile(null)
      onSuccess(createdProject.id)
    } catch (err: any) {
      setError(err.message || 'Failed to create project')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    reset()
    setError('')
    setUploadedFile(null)
    setUploadError('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Project">
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {error && (
          <div style={{
            background: 'var(--error-light)',
            border: '1px solid var(--error)',
            color: 'var(--error)',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}

        {/* Section 1: Project Basics */}
        <div style={{
          background: 'var(--white)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1.25rem',
            paddingBottom: '0.75rem',
            borderBottom: '1px solid #F3F4F6'
          }}>
            <Folder size={16} style={{ color: 'var(--copper)' }} />
            <h3 style={{
              fontSize: '0.7rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#6B7280',
              margin: 0
            }}>
              Project Basics
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <Label htmlFor="projectName">
                Project Name <span style={{ color: '#DC2626' }}>*</span>
              </Label>
              <Input
                id="projectName"
                type="text"
                placeholder="e.g., HS2 Phase 2"
                error={errors.projectName?.message}
                {...register('projectName')}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <Label htmlFor="projectValue">
                  Project Value (£ millions) <span style={{ color: '#DC2626' }}>*</span>
                </Label>
                <Input
                  id="projectValue"
                  type="number"
                  placeholder="e.g., 5000"
                  error={errors.projectValue?.message}
                  {...register('projectValue')}
                />
              </div>

              <div>
                <Label htmlFor="projectSector">
                  Project Sector <span style={{ color: '#DC2626' }}>*</span>
                </Label>
                <select
                  id="projectSector"
                  style={{
                    width: '100%',
                    padding: '0.625rem 1rem',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    color: 'var(--ink)',
                    background: 'var(--white)',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
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
                  <p style={{ marginTop: '0.25rem', fontSize: '0.85rem', color: 'var(--error)' }}>
                    {errors.projectSector.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="sponsoringOrganisation">Sponsoring Organisation</Label>
              <select
                id="sponsoringOrganisation"
                style={{
                  width: '100%',
                  padding: '0.625rem 1rem',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  color: 'var(--ink)',
                  background: 'var(--white)',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                {...register('sponsoringOrganisation')}
              >
                <option value="">Select an organisation</option>
                {sponsoringOrganisations.map((org) => (
                  <option key={org} value={org}>
                    {org}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="deliveryOrganisation">Delivery Organisation</Label>
              <Input
                id="deliveryOrganisation"
                type="text"
                placeholder="e.g., HS2 Ltd"
                {...register('deliveryOrganisation')}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Gateway Review */}
        <div style={{
          background: 'var(--white)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1.25rem',
            paddingBottom: '0.75rem',
            borderBottom: '1px solid #F3F4F6'
          }}>
            <Calendar size={16} style={{ color: 'var(--copper)' }} />
            <h3 style={{
              fontSize: '0.7rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#6B7280',
              margin: 0
            }}>
              Gateway Review
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <Label htmlFor="templateId">
                Assessment Template <span style={{ color: '#DC2626' }}>*</span>
              </Label>
              <select
                id="templateId"
                style={{
                  width: '100%',
                  padding: '0.625rem 1rem',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  color: 'var(--ink)',
                  background: 'var(--white)',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
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
                <p style={{ marginTop: '0.25rem', fontSize: '0.85rem', color: 'var(--error)' }}>
                  {errors.templateId.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="gatewayReviewDate">Gateway Review Date</Label>
              <div style={{ position: 'relative' }}>
                <Input
                  id="gatewayReviewDate"
                  type="date"
                  {...register('gatewayReviewDate')}
                />
                {daysUntilReview !== null && daysUntilReview >= 0 && (
                  <div style={{
                    position: 'absolute',
                    right: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: getCountdownColor(daysUntilReview),
                    color: 'var(--white)',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    <Clock size={12} />
                    {daysUntilReview} {daysUntilReview === 1 ? 'day' : 'days'}
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="previousRating">Previous Gateway Rating</Label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.5rem' }}>
                {previousRatings.map((rating) => (
                  <label
                    key={rating.value}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem',
                      border: '2px solid var(--border)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      background: 'var(--white)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = rating.color
                      e.currentTarget.style.background = `${rating.color}10`
                    }}
                    onMouseLeave={(e) => {
                      const input = e.currentTarget.querySelector('input') as HTMLInputElement
                      if (!input?.checked) {
                        e.currentTarget.style.borderColor = 'var(--border)'
                        e.currentTarget.style.background = 'var(--white)'
                      }
                    }}
                  >
                    <input
                      type="radio"
                      value={rating.value}
                      {...register('previousRating', {
                        onChange: (e) => {
                          // Update visual state on selection
                          const label = e.currentTarget.closest('label')
                          if (label) {
                            // Reset all labels
                            label.parentElement?.querySelectorAll('label').forEach((l) => {
                              l.style.borderColor = 'var(--border)'
                              l.style.background = 'var(--white)'
                            })
                            // Highlight selected
                            label.style.borderColor = rating.color
                            label.style.background = `${rating.color}10`
                          }
                        }
                      })}
                      style={{ display: 'none' }}
                    />
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: rating.color
                    }} />
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      color: 'var(--ink)',
                      textAlign: 'center'
                    }}>
                      {rating.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Report Template */}
        <div style={{
          background: 'var(--white)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.5rem',
            paddingBottom: '0.75rem',
            borderBottom: '1px solid #F3F4F6'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={16} style={{ color: 'var(--copper)' }} />
              <h3 style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: '#6B7280',
                margin: 0
              }}>
                Report Template
              </h3>
            </div>
            <span style={{
              fontSize: '0.7rem',
              color: '#9CA3AF',
              fontWeight: 500
            }}>
              Optional
            </span>
          </div>
          <p style={{
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
            marginBottom: '1.25rem'
          }}>
            Upload your organisation's document template
          </p>

          <div>
            <input
              type="file"
              id="reportTemplate"
              accept=".pdf,.doc,.docx,.ppt,.pptx"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />

            {!uploadedFile ? (
              <label
                htmlFor="reportTemplate"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1.25rem',
                  border: '2px dashed #E5E7EB',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  background: '#FFFFFF'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#D1D5DB'
                  e.currentTarget.style.background = '#F9FAFB'
                  const icon = e.currentTarget.querySelector('.upload-icon') as HTMLElement
                  if (icon) icon.style.color = '#6B7280'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E5E7EB'
                  e.currentTarget.style.background = '#FFFFFF'
                  const icon = e.currentTarget.querySelector('.upload-icon') as HTMLElement
                  if (icon) icon.style.color = '#9CA3AF'
                }}
              >
                <Upload size={32} className="upload-icon" style={{ color: '#9CA3AF', marginBottom: '0.5rem', transition: 'color 0.15s ease' }} />
                <span style={{ fontSize: '0.9rem', color: 'var(--ink)', fontWeight: 500 }}>
                  Click to upload template
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  PDF, Word, or PowerPoint (max 10MB)
                </span>
              </label>
            ) : (
              <div style={{
                padding: '1rem',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                background: 'var(--gray-50)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: 'var(--copper)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--white)'
                  }}>
                    <Upload size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--ink)' }}>
                      {uploadedFile.name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  style={{
                    padding: '0.5rem 1rem',
                    background: 'transparent',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--error)'
                    e.currentTarget.style.color = 'var(--error)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)'
                    e.currentTarget.style.color = 'var(--text-muted)'
                  }}
                >
                  Remove
                </button>
              </div>
            )}

            {uploadError && (
              <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--error)' }}>
                {uploadError}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          padding: '1rem 1.5rem',
          marginLeft: '-1.5rem',
          marginRight: '-1.5rem',
          marginBottom: '-1.5rem',
          background: '#F9FAFB',
          borderTop: '1px solid #E5E7EB'
        }}>
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            style={{ flex: 1 }}
            disabled={loading}
          >
            Cancel
          </Button>
          <button
            type="submit"
            disabled={loading}
            style={{
              flex: 1,
              padding: '0.625rem 1.5rem',
              background: '#0A1628',
              color: 'var(--white)',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              opacity: loading ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.background = '#1A2A42'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#0A1628'
            }}
          >
            {loading ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
