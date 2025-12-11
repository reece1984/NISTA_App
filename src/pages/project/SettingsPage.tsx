import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Folder, Calendar, FileText, Info, AlertTriangle,
  Clock, Upload, X, Check, AlertCircle
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { Project } from '../../lib/supabase'

// Types
interface ProjectFormData {
  project_name: string
  project_value: number | null
  project_sector: string | null
  sponsoring_organisation: string | null
  delivery_organisation: string | null
  template_id: number | null
  gateway_review_date: string | null
  previous_rating: string | null
  report_template_url: string | null
  report_template_name: string | null
}

interface ProjectMetadata {
  id: number
  created_at: string
  updated_at: string
  assessmentsCount: number
  documentsCount: number
  created_by: string
}

// Sponsoring organisations list
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

// Sector options
const sectors = [
  'Transport',
  'Energy',
  'Nuclear',
  'Defence',
  'Digital & Technology',
  'Health',
  'Education',
  'Housing',
  'Water',
  'Other Infrastructure',
]

// Previous rating options
const ratingOptions = [
  { value: 'none', label: 'First Review', color: '#d1d5db' },
  { value: 'green', label: 'Green', color: '#059669' },
  { value: 'amber-green', label: 'Amber/Green', color: '#84cc16' },
  { value: 'amber', label: 'Amber', color: '#d97706' },
  { value: 'amber-red', label: 'Amber/Red', color: '#ea580c' },
  { value: 'red', label: 'Red', color: '#dc2626' },
]

// Countdown badge color logic
const getCountdownColor = (days: number | null): { bg: string; text: string; variant: string } => {
  if (days === null || days < 0) return { bg: 'rgba(193, 127, 78, 0.08)', text: '#c17f4e', variant: 'none' }
  if (days > 30) return { bg: 'rgba(5, 150, 105, 0.08)', text: '#059669', variant: 'ok' }
  if (days >= 15) return { bg: 'rgba(217, 119, 6, 0.08)', text: '#d97706', variant: 'warning' }
  return { bg: 'rgba(220, 38, 38, 0.06)', text: '#dc2626', variant: 'urgent' }
}

export default function SettingsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  // State
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [originalData, setOriginalData] = useState<ProjectFormData | null>(null)
  const [formData, setFormData] = useState<ProjectFormData>({
    project_name: '',
    project_value: null,
    project_sector: null,
    sponsoring_organisation: null,
    delivery_organisation: null,
    template_id: null,
    gateway_review_date: null,
    previous_rating: null,
    report_template_url: null,
    report_template_name: null,
  })
  const [metadata, setMetadata] = useState<ProjectMetadata | null>(null)
  const [templateFile, setTemplateFile] = useState<File | null>(null)
  const [templates, setTemplates] = useState<Array<{ id: number; name: string; code: string }>>([])

  // Calculate unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    if (!originalData) return false
    return JSON.stringify(formData) !== JSON.stringify(originalData) || templateFile !== null
  }, [formData, originalData, templateFile])

  // Calculate countdown days
  const countdownDays = useMemo(() => {
    if (!formData.gateway_review_date) return null
    const reviewDate = new Date(formData.gateway_review_date)
    const today = new Date()
    const diffTime = reviewDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }, [formData.gateway_review_date])

  // Fetch project data
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return

      try {
        setLoading(true)

        // Fetch project
        const { data: project, error: projectError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .single()

        if (projectError) throw projectError

        // Fetch templates
        const { data: templatesData, error: templatesError } = await supabase
          .from('assessment_templates')
          .select('id, name, code')
          .eq('is_active', true)
          .order('code')

        if (templatesError) throw templatesError
        setTemplates(templatesData || [])

        // Fetch counts
        const { data: assessments } = await supabase
          .from('assessment_runs')
          .select('id')
          .eq('project_id', id)

        const { data: documents } = await supabase
          .from('files')
          .select('id')
          .eq('project_id', id)

        // Set form data
        const projectFormData: ProjectFormData = {
          project_name: project.project_name,
          project_value: project.project_value,
          project_sector: project.project_sector,
          sponsoring_organisation: project.sponsoring_organisation,
          delivery_organisation: project.delivery_organisation,
          template_id: project.template_id,
          gateway_review_date: project.gateway_review_date,
          previous_rating: project.previous_rating,
          report_template_url: project.report_template_url,
          report_template_name: project.report_template_name,
        }

        setFormData(projectFormData)
        setOriginalData(projectFormData)

        // Set metadata
        setMetadata({
          id: project.id,
          created_at: project.created_at,
          updated_at: project.updated_at,
          assessmentsCount: assessments?.length || 0,
          documentsCount: documents?.length || 0,
          created_by: 'Current User',
        })
      } catch (error) {
        console.error('Error fetching project data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  // Warn on navigation with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  // Handlers
  const handleChange = (field: keyof ProjectFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setTemplateFile(file)
    }
  }

  const handleRemoveTemplate = () => {
    setTemplateFile(null)
    setFormData(prev => ({
      ...prev,
      report_template_url: null,
      report_template_name: null,
    }))
  }

  const handleSave = async () => {
    if (!id) return

    try {
      setSaving(true)

      // Upload template file if provided
      let templateUrl = formData.report_template_url
      let templateName = formData.report_template_name

      if (templateFile) {
        const fileExt = templateFile.name.split('.').pop()
        const fileName = `${id}-${Date.now()}.${fileExt}`
        const filePath = `templates/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('project-files')
          .upload(filePath, templateFile)

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from('project-files')
          .getPublicUrl(filePath)

        templateUrl = urlData.publicUrl
        templateName = templateFile.name
      }

      // Update project
      const { error: updateError } = await supabase
        .from('projects')
        .update({
          project_name: formData.project_name,
          project_value: formData.project_value,
          project_sector: formData.project_sector,
          sponsoring_organisation: formData.sponsoring_organisation,
          delivery_organisation: formData.delivery_organisation,
          template_id: formData.template_id,
          gateway_review_date: formData.gateway_review_date,
          previous_rating: formData.previous_rating,
          report_template_url: templateUrl,
          report_template_name: templateName,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (updateError) throw updateError

      // Update original data
      const updatedData = {
        ...formData,
        report_template_url: templateUrl,
        report_template_name: templateName,
      }
      setFormData(updatedData)
      setOriginalData(updatedData)
      setTemplateFile(null)

      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (originalData) {
      setFormData(originalData)
      setTemplateFile(null)
    }
  }

  const handleArchive = async () => {
    if (!confirm('Are you sure you want to archive this project? You can restore it later.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('projects')
        .update({ status: 'archived' })
        .eq('id', id)

      if (error) throw error

      navigate('/projects')
    } catch (error) {
      console.error('Error archiving project:', error)
      alert('Failed to archive project. Please try again.')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return
    }

    if (!confirm('This will permanently delete all project data, assessments, and documents. Type DELETE to confirm.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)

      if (error) throw error

      navigate('/projects')
    } catch (error) {
      console.error('Error deleting project:', error)
      alert('Failed to delete project. Please try again.')
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '1.5rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>Loading settings...</div>
        </div>
      </div>
    )
  }

  const countdown = countdownDays !== null ? getCountdownColor(countdownDays) : null

  return (
    <div className="p-6">
      {/* Page Header - full width */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Project Settings</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your project configuration and preferences
          </p>
        </div>
      </div>

      {/* Form content - centered with max-width */}
      <div className="max-w-4xl">
        <div>

          {/* Project Basics */}
          <SettingsCard icon={Folder} title="Project Basics">
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1.25rem',
            }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <FormGroup
                  label="Project Name"
                  required
                  value={formData.project_name}
                  onChange={(val) => handleChange('project_name', val)}
                />
              </div>

              <FormGroup
                label="Project Value"
                required
                type="number"
                prefix="£m"
                value={formData.project_value?.toString() || ''}
                onChange={(val) => handleChange('project_value', val ? Number(val) : null)}
              />

              <FormGroup
                label="Sector"
                required
                type="select"
                value={formData.project_sector || ''}
                onChange={(val) => handleChange('project_sector', val)}
                options={sectors}
              />

              <FormGroup
                label="Sponsoring Organisation"
                type="select"
                value={formData.sponsoring_organisation || ''}
                onChange={(val) => handleChange('sponsoring_organisation', val)}
                options={sponsoringOrganisations}
              />

              <FormGroup
                label="Delivery Organisation"
                hint="The organisation delivering the project"
                value={formData.delivery_organisation || ''}
                onChange={(val) => handleChange('delivery_organisation', val)}
              />
            </div>
          </SettingsCard>

          {/* Gateway Review */}
          <SettingsCard icon={Calendar} title="Gateway Review">
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1.25rem',
            }}>
              <FormGroup
                label="Assessment Template"
                required
                type="select"
                value={formData.template_id?.toString() || ''}
                onChange={(val) => handleChange('template_id', val ? Number(val) : null)}
                options={templates.map(t => ({ value: t.id.toString(), label: t.name }))}
              />

              <div>
                <FormGroup
                  label="Gateway Review Date"
                  type="date"
                  value={formData.gateway_review_date || ''}
                  onChange={(val) => handleChange('gateway_review_date', val)}
                />
                {countdown && countdownDays !== null && (
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.35rem 0.6rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    marginTop: '0.5rem',
                    background: countdown.bg,
                    color: countdown.text,
                  }}>
                    <Clock size={14} />
                    <span>{countdownDays} days until review</span>
                  </div>
                )}
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  color: 'var(--ink)',
                  display: 'block',
                  marginBottom: '0.4rem',
                }}>
                  Previous Gateway Rating
                </label>
                <RatingSelector
                  value={formData.previous_rating || ''}
                  onChange={(val) => handleChange('previous_rating', val)}
                />
                <div style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  marginTop: '0.25rem',
                }}>
                  Helps track improvement trajectory across reviews
                </div>
              </div>
            </div>
          </SettingsCard>

          {/* Report Template */}
          <SettingsCard icon={FileText} title="Report Template" badge="Optional">
            <FormGroup
              label="Organisation Document Template"
              hint="Reports will be generated using your organisation's branded format"
            >
              {formData.report_template_name && !templateFile ? (
                <UploadedFile
                  name={formData.report_template_name}
                  onRemove={handleRemoveTemplate}
                />
              ) : templateFile ? (
                <UploadedFile
                  name={templateFile.name}
                  onRemove={() => setTemplateFile(null)}
                />
              ) : (
                <FileUploadArea onChange={handleFileSelect} />
              )}
            </FormGroup>
          </SettingsCard>

          {/* Project Metadata */}
          {metadata && (
            <SettingsCard icon={Info} title="Project Information">
              <MetadataGrid
                projectId={metadata.id}
                createdAt={metadata.created_at}
                updatedAt={metadata.updated_at}
                assessmentsCount={metadata.assessmentsCount}
                documentsCount={metadata.documentsCount}
                createdBy={metadata.created_by}
              />
            </SettingsCard>
          )}

          {/* Danger Zone */}
          <DangerZone onArchive={handleArchive} onDelete={handleDelete} />
        </div>
      </div>

      {/* Sticky Action Bar */}
      {hasUnsavedChanges && (
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '0.75rem',
          padding: '1.25rem 1.5rem',
          background: 'var(--gray-50)',
          borderTop: '1px solid var(--border)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem',
            color: 'var(--amber)',
            marginRight: 'auto',
          }}>
            <AlertCircle size={16} />
            <span>You have unsaved changes</span>
          </div>
          <button
            onClick={handleCancel}
            disabled={saving}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.6rem 1rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              border: '1px solid var(--border)',
              background: 'var(--white)',
              color: 'var(--ink)',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.6rem 1rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: saving ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease',
              border: 'none',
              background: 'var(--ink)',
              color: 'var(--white)',
              opacity: saving ? 0.6 : 1,
            }}
          >
            <Check size={16} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  )
}

// Sub-components

interface SettingsCardProps {
  icon: any
  title: string
  badge?: string
  children: React.ReactNode
}

function SettingsCard({ icon: Icon, title, badge, children }: SettingsCardProps) {
  return (
    <div style={{
      background: 'var(--white)',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      marginBottom: '1.5rem',
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '1rem 1.5rem',
        background: 'var(--gray-50)',
        borderBottom: '1px solid var(--border)',
      }}>
        <Icon size={20} style={{ color: 'var(--copper)' }} />
        <span style={{
          fontSize: '0.7rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'var(--text-muted)',
        }}>
          {title}
        </span>
        {badge && (
          <span style={{
            marginLeft: 'auto',
            fontSize: '0.7rem',
            color: 'var(--gray-400)',
          }}>
            {badge}
          </span>
        )}
      </div>
      <div style={{ padding: '1.5rem' }}>
        {children}
      </div>
    </div>
  )
}

interface FormGroupProps {
  label: string
  required?: boolean
  hint?: string
  type?: 'text' | 'number' | 'date' | 'select'
  prefix?: string
  value?: string
  onChange?: (value: string) => void
  options?: string[] | Array<{ value: string; label: string }>
  children?: React.ReactNode
}

function FormGroup({
  label,
  required,
  hint,
  type = 'text',
  prefix,
  value,
  onChange,
  options,
  children,
}: FormGroupProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      <label style={{
        fontSize: '0.85rem',
        fontWeight: 500,
        color: 'var(--ink)',
      }}>
        {label}
        {required && <span style={{ color: '#dc2626', marginLeft: '2px' }}>*</span>}
      </label>
      {children || (
        <>
          {prefix ? (
            <div style={{ display: 'flex' }}>
              <span style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0 0.75rem',
                background: 'var(--gray-50)',
                border: '1px solid var(--border)',
                borderRight: 'none',
                borderRadius: '8px 0 0 8px',
                fontSize: '0.9rem',
                color: 'var(--text-muted)',
                fontWeight: 500,
              }}>
                {prefix}
              </span>
              <input
                type={type}
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.65rem 0.85rem',
                  border: '1px solid var(--border)',
                  borderRadius: '0 8px 8px 0',
                  fontSize: '0.9rem',
                  color: 'var(--ink)',
                  background: 'var(--white)',
                  outline: 'none',
                }}
              />
            </div>
          ) : type === 'select' ? (
            <select
              value={value}
              onChange={(e) => onChange?.(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                fontSize: '0.9rem',
                color: 'var(--ink)',
                background: 'var(--white)',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="">Select {label.toLowerCase()}</option>
              {options?.map((opt) => {
                const optValue = typeof opt === 'string' ? opt : opt.value
                const optLabel = typeof opt === 'string' ? opt : opt.label
                return (
                  <option key={optValue} value={optValue}>
                    {optLabel}
                  </option>
                )
              })}
            </select>
          ) : (
            <input
              type={type}
              value={value}
              onChange={(e) => onChange?.(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                fontSize: '0.9rem',
                color: 'var(--ink)',
                background: 'var(--white)',
                outline: 'none',
              }}
            />
          )}
        </>
      )}
      {hint && (
        <span style={{
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          marginTop: '0.25rem',
        }}>
          {hint}
        </span>
      )}
    </div>
  )
}

interface RatingSelectorProps {
  value: string
  onChange: (value: string) => void
}

function RatingSelector({ value, onChange }: RatingSelectorProps) {
  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      {ratingOptions.map((rating) => {
        const isSelected = value === rating.value
        return (
          <label
            key={rating.value}
            style={{
              flex: 1,
              padding: '0.6rem 0.5rem',
              border: `2px solid ${isSelected ? 'var(--ink)' : 'var(--border)'}`,
              borderRadius: '8px',
              background: isSelected ? 'var(--gray-50)' : 'var(--white)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              textAlign: 'center',
            }}
          >
            <input
              type="radio"
              name="previousRating"
              value={rating.value}
              checked={isSelected}
              onChange={() => onChange(rating.value)}
              style={{ display: 'none' }}
            />
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: rating.color,
                margin: '0 auto 0.3rem',
              }}
            />
            <div style={{
              fontSize: '0.7rem',
              fontWeight: 500,
              color: 'var(--ink)',
            }}>
              {rating.label}
            </div>
          </label>
        )
      })}
    </div>
  )
}

interface FileUploadAreaProps {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

function FileUploadArea({ onChange }: FileUploadAreaProps) {
  return (
    <label style={{
      border: '2px dashed var(--border)',
      borderRadius: '8px',
      padding: '1.25rem',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'all 0.15s ease',
      display: 'block',
    }}>
      <input
        type="file"
        accept=".docx,.pptx"
        onChange={onChange}
        style={{ display: 'none' }}
      />
      <Upload size={28} style={{ color: 'var(--gray-400)', margin: '0 auto 0.5rem' }} />
      <div style={{ fontSize: '0.85rem', color: 'var(--text-body)' }}>
        Drop your template here, or <span style={{ color: 'var(--ink)', fontWeight: 600, textDecoration: 'underline' }}>browse</span>
      </div>
      <div style={{
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        marginTop: '0.25rem',
      }}>
        DOCX or PPTX • Your organisation's branded template
      </div>
    </label>
  )
}

interface UploadedFileProps {
  name: string
  onRemove: () => void
}

function UploadedFile({ name, onRemove }: UploadedFileProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.75rem',
      background: 'var(--gray-50)',
      border: '1px solid var(--border)',
      borderRadius: '8px',
    }}>
      <div style={{
        width: '36px',
        height: '36px',
        background: 'var(--white)',
        border: '1px solid var(--border)',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <FileText size={18} style={{ color: 'var(--ink)' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '0.85rem',
          fontWeight: 500,
          color: 'var(--ink)',
        }}>
          {name}
        </div>
      </div>
      <button
        onClick={onRemove}
        style={{
          width: '28px',
          height: '28px',
          border: 'none',
          background: 'transparent',
          borderRadius: '6px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
          transition: 'all 0.15s ease',
        }}
        title="Remove template"
      >
        <X size={16} />
      </button>
    </div>
  )
}

interface MetadataGridProps {
  projectId: number
  createdAt: string
  updatedAt: string
  assessmentsCount: number
  documentsCount: number
  createdBy: string
}

function MetadataGrid({
  projectId,
  createdAt,
  updatedAt,
  assessmentsCount,
  documentsCount,
  createdBy,
}: MetadataGridProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '1rem',
    }}>
      <MetadataItem label="Project ID" value={`PRJ-${projectId}`} />
      <MetadataItem label="Created" value={formatDate(createdAt)} />
      <MetadataItem label="Last Modified" value={formatDate(updatedAt)} />
      <MetadataItem label="Assessments Run" value={assessmentsCount.toString()} />
      <MetadataItem label="Documents Uploaded" value={documentsCount.toString()} />
      <MetadataItem label="Created By" value={createdBy} />
    </div>
  )
}

function MetadataItem({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      padding: '1rem',
      background: 'var(--gray-50)',
      borderRadius: '8px',
    }}>
      <div style={{
        fontSize: '0.7rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        color: 'var(--text-muted)',
        marginBottom: '0.35rem',
      }}>
        {label}
      </div>
      <div style={{
        fontSize: '0.9rem',
        fontWeight: 500,
        color: 'var(--ink)',
      }}>
        {value}
      </div>
    </div>
  )
}

interface DangerZoneProps {
  onArchive: () => void
  onDelete: () => void
}

function DangerZone({ onArchive, onDelete }: DangerZoneProps) {
  return (
    <div style={{
      background: 'var(--white)',
      border: '1px solid rgba(220, 38, 38, 0.2)',
      borderRadius: '12px',
      marginBottom: '1.5rem',
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '1rem 1.5rem',
        background: 'rgba(220, 38, 38, 0.06)',
        borderBottom: '1px solid rgba(220, 38, 38, 0.2)',
      }}>
        <AlertTriangle size={20} style={{ color: '#dc2626' }} />
        <span style={{
          fontSize: '0.7rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: '#dc2626',
        }}>
          Danger Zone
        </span>
      </div>
      <div style={{ padding: '1.5rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 0',
          borderBottom: '1px solid var(--border)',
        }}>
          <div>
            <h4 style={{
              fontSize: '0.9rem',
              fontWeight: 600,
              color: 'var(--ink)',
              marginBottom: '0.25rem',
            }}>
              Archive this project
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Remove this project from your active list. You can restore it later.
            </p>
          </div>
          <button
            onClick={onArchive}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.6rem 1rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              background: 'var(--white)',
              border: '1px solid rgba(220, 38, 38, 0.2)',
              color: '#dc2626',
            }}
          >
            Archive Project
          </button>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '1rem',
        }}>
          <div>
            <h4 style={{
              fontSize: '0.9rem',
              fontWeight: 600,
              color: 'var(--ink)',
              marginBottom: '0.25rem',
            }}>
              Delete this project
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Permanently delete this project and all associated data. This action cannot be undone.
            </p>
          </div>
          <button
            onClick={onDelete}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.6rem 1rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              background: '#dc2626',
              border: 'none',
              color: 'var(--white)',
            }}
          >
            Delete Project
          </button>
        </div>
      </div>
    </div>
  )
}
