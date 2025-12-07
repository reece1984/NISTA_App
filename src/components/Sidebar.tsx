import { Link, useLocation, useParams } from 'react-router-dom'
import {
  LayoutGrid, FileText, BarChart3, List, CheckSquare,
  Home, Table, LogOut, Settings
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export default function Sidebar() {
  const location = useLocation()
  const { id: projectId } = useParams()
  const { user, signOut } = useAuth()

  // Get user initials from email
  const getUserInitials = () => {
    if (!user?.email) return 'U'
    const parts = user.email.split('@')[0].split('.')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return user.email.substring(0, 2).toUpperCase()
  }

  // Get user name from email
  const getUserName = () => {
    if (!user?.email) return 'User'
    const name = user.email.split('@')[0]
    const formatted = name.charAt(0).toUpperCase() + name.slice(1)
    return formatted.replace('.', ' ')
  }

  // Fetch project data to get counts for badges
  const { data: projectData } = useQuery({
    queryKey: ['project-sidebar', projectId],
    queryFn: async () => {
      if (!projectId) return null

      try {
        const { data: project, error: projectError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .single()

        if (projectError) {
          console.error('Error fetching project:', projectError)
        }

        const { data: files, error: filesError } = await supabase
          .from('files')
          .select('id')
          .eq('project_id', projectId)

        if (filesError) {
          console.error('Error fetching documents:', filesError)
        }

        const { data: assessments, error: assessmentsError } = await supabase
          .from('assessment_runs')
          .select('id')
          .eq('project_id', projectId)

        if (assessmentsError) {
          console.error('Error fetching assessments:', assessmentsError)
        }

        const { data: actions, error: actionsError } = await supabase
          .from('actions')
          .select('id')
          .eq('project_id', projectId)

        if (actionsError) {
          console.error('Error fetching actions:', actionsError)
        }

        return {
          project,
          documentsCount: files?.length || 0,
          assessmentsCount: assessments?.length || 0,
          actionsCount: actions?.length || 0
        }
      } catch (error) {
        console.error('Error in sidebar query:', error)
        return {
          project: null,
          documentsCount: 0,
          assessmentsCount: 0,
          actionsCount: 0
        }
      }
    },
    enabled: !!projectId
  })

  const isActive = (path: string) => {
    if (path.startsWith('/project/')) {
      // For project subroutes, check if location matches
      const projectBase = `/project/${projectId}/`
      return location.pathname.startsWith(projectBase + path.replace('/project/:id/', ''))
    }
    return location.pathname === path
  }

  const NavItem = ({ to, icon: Icon, label, count }: {
    to: string,
    icon: any,
    label: string,
    count?: number
  }) => {
    const active = isActive(to)

    return (
      <Link
        to={to}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.6rem 1rem',
          color: active ? '#ffffff' : 'rgba(255,255,255,0.7)',
          textDecoration: 'none',
          fontSize: '0.9rem',
          fontWeight: 500,
          transition: 'all 0.15s ease',
          borderLeft: `3px solid ${active ? 'var(--copper)' : 'transparent'}`,
          background: active ? 'rgba(255,255,255,0.1)' : 'transparent'
        }}
        onMouseEnter={e => {
          if (!active) {
            e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
            e.currentTarget.style.color = '#ffffff'
          }
        }}
        onMouseLeave={e => {
          if (!active) {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'rgba(255,255,255,0.7)'
          }
        }}
      >
        <Icon size={18} style={{ opacity: active ? 1 : 0.7, flexShrink: 0 }} />
        <span>{label}</span>
        {count !== undefined && count > 0 && (
          <span style={{
            marginLeft: 'auto',
            minWidth: '20px',
            height: '20px',
            padding: '0 6px',
            background: active ? 'var(--copper)' : 'rgba(255,255,255,0.15)',
            borderRadius: '10px',
            fontSize: '0.7rem',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff'
          }}>
            {count}
          </span>
        )}
      </Link>
    )
  }

  return (
    <aside style={{
      width: '220px',
      background: 'var(--ink)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      transition: 'width 0.2s ease'
    }}>
      {/* Header: Logo */}
      <div style={{
        padding: '1.25rem 1rem',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.1rem',
          fontWeight: 600,
          color: '#ffffff'
        }}>
          Gateway<span style={{ color: 'var(--copper)' }}>Success</span>
        </div>
        <div style={{
          fontSize: '0.65rem',
          color: 'rgba(255,255,255,0.5)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginTop: '2px'
        }}>
          NISTA/PAR Assessment
        </div>
      </div>

      {/* Navigation */}
      <nav style={{
        flex: 1,
        padding: '1rem 0',
        overflowY: 'auto'
      }}>
        {/* Project Section - only show when viewing a project */}
        {projectId && (
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{
              padding: '0.5rem 1rem',
              fontSize: '0.65rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'rgba(255,255,255,0.4)'
            }}>
              Project
            </div>
            <NavItem to={`/project/${projectId}/overview`} icon={LayoutGrid} label="Overview" />
            <NavItem to={`/project/${projectId}/documents`} icon={FileText} label="Documents" count={projectData?.documentsCount} />
            <NavItem to={`/project/${projectId}/summary`} icon={FileText} label="Assessment Summary" count={projectData?.assessmentsCount} />
            <NavItem to={`/project/${projectId}/detail`} icon={List} label="Assessment Detail" count={projectData?.assessmentsCount} />
            <NavItem to={`/project/${projectId}/actions`} icon={CheckSquare} label="Actions" count={projectData?.actionsCount} />
            <NavItem to={`/project/${projectId}/settings`} icon={Settings} label="Settings" />
          </div>
        )}

        {/* Application Section - always visible */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{
            padding: '0.5rem 1rem',
            fontSize: '0.65rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'rgba(255,255,255,0.4)'
          }}>
            Application
          </div>
          <NavItem to="/projects" icon={Home} label="Projects" />
          <NavItem to="/criteria" icon={Table} label="Criteria" />
        </div>
      </nav>

      {/* Footer: User Info */}
      <div style={{
        padding: '1rem',
        borderTop: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.5rem',
            borderRadius: '6px',
            transition: 'background 0.15s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent'
          }}
          onClick={signOut}
          title="Sign out"
        >
          <div style={{
            width: '32px',
            height: '32px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontSize: '0.8rem',
            fontWeight: 600
          }}>
            {getUserInitials()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#ffffff',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {getUserName()}
            </div>
            <div style={{
              fontSize: '0.7rem',
              color: 'rgba(255,255,255,0.5)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {user?.email}
            </div>
          </div>
          <LogOut size={14} style={{ color: 'rgba(255,255,255,0.5)' }} />
        </div>
      </div>
    </aside>
  )
}
