import { useState } from 'react'
import PriorityBadge from '../shared/PriorityBadge'
import StatusBadge from '../shared/StatusBadge'
import { MessageSquare, AlertTriangle, Calendar, Filter } from 'lucide-react'
import { cn } from '../../lib/utils'

// Mock data
const mockActions = [
  {
    id: 1,
    title: 'Develop and implement comprehensive risk register',
    description: 'Create a detailed risk register with clear ownership, likelihood/impact assessments, and mitigation strategies.',
    actionStatus: 'in_progress' as const,
    priority: 'critical' as const,
    assignedTo: { id: 1, name: 'Sarah Jones', email: 'sarah.jones@example.com' },
    dueDate: '2025-12-09',
    completedAt: null,
    commentCount: 2,
    linkedFindings: ['G3-MC-5'],
    createdAt: '2025-11-09T12:00:00Z'
  },
  {
    id: 2,
    title: 'Establish operational issue management log',
    description: 'Set up a structured issue tracking system with clear escalation procedures.',
    actionStatus: 'not_started' as const,
    priority: 'high' as const,
    assignedTo: null,
    dueDate: '2025-12-20',
    completedAt: null,
    commentCount: 0,
    linkedFindings: ['G3-MC-6'],
    createdAt: '2025-11-09T12:00:00Z'
  },
  {
    id: 3,
    title: 'Document formal benefits management plan',
    description: 'Create comprehensive benefits management framework including ownership matrix.',
    actionStatus: 'not_started' as const,
    priority: 'high' as const,
    assignedTo: { id: 1, name: 'Sarah Jones', email: 'sarah.jones@example.com' },
    dueDate: '2026-01-09',
    completedAt: null,
    commentCount: 0,
    linkedFindings: ['G3-MC-8'],
    createdAt: '2025-11-09T12:00:00Z'
  },
  {
    id: 4,
    title: 'Strengthen change control protocols and cost management',
    description: 'Implement robust change control framework with clear approval thresholds.',
    actionStatus: 'not_started' as const,
    priority: 'medium' as const,
    assignedTo: null,
    dueDate: '2026-02-09',
    completedAt: null,
    commentCount: 0,
    linkedFindings: ['G3-FC-2'],
    createdAt: '2025-11-09T12:00:00Z'
  },
  {
    id: 5,
    title: 'Review and document contingency sizing methodology',
    description: 'Develop and document explicit methodology for contingency allocation.',
    actionStatus: 'not_started' as const,
    priority: 'medium' as const,
    assignedTo: null,
    dueDate: '2026-01-09',
    completedAt: null,
    commentCount: 0,
    linkedFindings: ['G3-FC-3'],
    createdAt: '2025-11-09T12:00:00Z'
  },
  {
    id: 6,
    title: 'Compile detailed market engagement outcomes report',
    description: 'Document all market engagement activities and stakeholder feedback.',
    actionStatus: 'not_started' as const,
    priority: 'medium' as const,
    assignedTo: { id: 1, name: 'Sarah Jones', email: 'sarah.jones@example.com' },
    dueDate: '2025-12-01',
    completedAt: null,
    commentCount: 0,
    linkedFindings: [],
    createdAt: '2025-11-09T12:00:00Z'
  },
  {
    id: 7,
    title: 'Develop comprehensive evaluation criteria framework',
    description: 'Define and weight evaluation criteria for project decisions.',
    actionStatus: 'completed' as const,
    priority: 'medium' as const,
    assignedTo: { id: 1, name: 'Sarah Jones', email: 'sarah.jones@example.com' },
    dueDate: '2025-11-15',
    completedAt: '2025-11-15T10:00:00Z',
    commentCount: 1,
    linkedFindings: [],
    createdAt: '2025-11-09T12:00:00Z'
  },
  {
    id: 8,
    title: 'Complete legal review of all contract terms',
    description: 'Ensure all contract terms undergo comprehensive legal review.',
    actionStatus: 'in_progress' as const,
    priority: 'high' as const,
    assignedTo: { id: 1, name: 'Sarah Jones', email: 'sarah.jones@example.com' },
    dueDate: '2025-11-30',
    completedAt: null,
    commentCount: 1,
    linkedFindings: [],
    createdAt: '2025-11-09T12:00:00Z'
  },
  {
    id: 9,
    title: 'Define and document project performance KPIs',
    description: 'Establish concrete, agreed-upon performance metrics and KPIs.',
    actionStatus: 'not_started' as const,
    priority: 'medium' as const,
    assignedTo: null,
    dueDate: '2025-12-15',
    completedAt: null,
    commentCount: 0,
    linkedFindings: [],
    createdAt: '2025-11-09T12:00:00Z'
  },
  {
    id: 10,
    title: 'Verify compliance with all technical standards',
    description: 'Document explicit verification process confirming compliance.',
    actionStatus: 'not_started' as const,
    priority: 'low' as const,
    assignedTo: null,
    dueDate: '2026-01-31',
    completedAt: null,
    commentCount: 0,
    linkedFindings: [],
    createdAt: '2025-11-09T12:00:00Z'
  }
]

interface ActionKanbanBoardDemoProps {
  onActionClick: (actionId: number) => void
}

const columns = [
  { id: 'not_started' as const, title: 'Not Started', color: 'bg-gray-100 border-gray-300' },
  { id: 'in_progress' as const, title: 'In Progress', color: 'bg-blue-50 border-blue-300' },
  { id: 'completed' as const, title: 'Completed', color: 'bg-green-50 border-green-300' },
  { id: 'wont_fix' as const, title: "Won't Fix", color: 'bg-gray-50 border-gray-300' }
]

function ActionCard({ action, onClick }: { action: typeof mockActions[0]; onClick: () => void }) {
  const isOverdue = action.dueDate && action.actionStatus !== 'completed' &&
    new Date(action.dueDate) < new Date()

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-lg p-3 cursor-pointer transition-all hover:shadow-md border-2',
        isOverdue ? 'border-red-300' : 'border-gray-200'
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <PriorityBadge priority={action.priority} />
        {isOverdue && (
          <div className="flex items-center gap-1 text-red-600 text-xs">
            <AlertTriangle size={12} />
            Overdue
          </div>
        )}
      </div>

      <h4 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">
        {action.title}
      </h4>

      <div className="space-y-1.5">
        {action.assignedTo && (
          <div className="text-xs text-gray-600 flex items-center gap-1">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600 font-semibold">
              {action.assignedTo.name[0]}
            </span>
            <span className="truncate">{action.assignedTo.name}</span>
          </div>
        )}

        {action.dueDate && (
          <div className={cn(
            'text-xs flex items-center gap-1',
            isOverdue ? 'text-red-600 font-semibold' : 'text-gray-600'
          )}>
            <Calendar size={12} />
            {new Date(action.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        )}

        {action.commentCount > 0 && (
          <div className="text-xs text-gray-600 flex items-center gap-1">
            <MessageSquare size={12} />
            {action.commentCount}
          </div>
        )}

        {action.linkedFindings.length > 0 && (
          <div className="text-xs text-gray-500">
            📎 {action.linkedFindings.length} finding{action.linkedFindings.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ActionKanbanBoardDemo({ onActionClick }: ActionKanbanBoardDemoProps) {
  const [showFilters, setShowFilters] = useState(false)

  // Group actions by status
  const actionsByStatus = columns.reduce((acc, column) => {
    acc[column.id] = mockActions.filter(a => a.actionStatus === column.id)
    return acc
  }, {} as Record<typeof columns[0]['id'], typeof mockActions>)

  return (
    <div>
      {/* Filters Bar */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-gray-900">Action Board</h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Filter size={16} />
            Filters
          </button>
        </div>
        <div className="text-sm text-gray-600">
          {mockActions.length} total actions
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map(column => (
          <div key={column.id} className="flex-1 min-w-[280px]">
            {/* Column Header */}
            <div className={cn('rounded-t-lg p-4 border-t-4', column.color)}>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900">{column.title}</h3>
                <span className="bg-white px-2 py-1 rounded-full text-sm font-semibold text-gray-700">
                  {actionsByStatus[column.id].length}
                </span>
              </div>
            </div>

            {/* Column Content */}
            <div className={cn('min-h-[500px] p-3 space-y-3 bg-gray-50 rounded-b-lg border-x border-b', column.color)}>
              {actionsByStatus[column.id].map(action => (
                <ActionCard
                  key={action.id}
                  action={action}
                  onClick={() => onActionClick(action.id)}
                />
              ))}

              {actionsByStatus[column.id].length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No actions
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Demo Note */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> Drag-and-drop is disabled in demo mode. With the backend connected,
          you'll be able to drag cards between columns to update their status.
        </p>
      </div>
    </div>
  )
}
