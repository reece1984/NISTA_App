import { useState } from 'react'
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners
} from '@dnd-kit/core'
import { useActions, type Action } from '../../hooks/useActions'
import PriorityBadge from '../shared/PriorityBadge'
import { Filter, MessageSquare, AlertTriangle, Calendar } from 'lucide-react'
import { cn } from '../../lib/utils'
import { format, isPast, parseISO } from 'date-fns'

interface ActionKanbanBoardProps {
  projectId: number
  onActionClick: (actionId: number) => void
}

interface KanbanColumn {
  id: Action['actionStatus']
  title: string
  color: string
}

const columns: KanbanColumn[] = [
  { id: 'not_started', title: 'Not Started', color: 'bg-gray-100 border-gray-300' },
  { id: 'in_progress', title: 'In Progress', color: 'bg-blue-50 border-blue-300' },
  { id: 'completed', title: 'Completed', color: 'bg-green-50 border-green-300' },
  { id: 'wont_fix', title: "Won't Fix", color: 'bg-gray-50 border-gray-300' }
]

function ActionCard({
  action,
  onClick,
  isDragging
}: {
  action: Action
  onClick: () => void
  isDragging?: boolean
}) {
  const isOverdue = action.dueDate && action.actionStatus !== 'completed' &&
    isPast(parseISO(action.dueDate))

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-lg p-3 cursor-pointer transition-all hover:shadow-md border-2',
        isOverdue ? 'border-red-300' : 'border-gray-200',
        isDragging && 'opacity-50 rotate-2'
      )}
    >
      {/* Priority Badge */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <PriorityBadge priority={action.priority} />
        {isOverdue && (
          <div className="flex items-center gap-1 text-red-600 text-xs">
            <AlertTriangle size={12} />
            Overdue
          </div>
        )}
      </div>

      {/* Title */}
      <h4 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">
        {action.title}
      </h4>

      {/* Metadata */}
      <div className="space-y-1.5">
        {/* Assigned User */}
        {action.assignedTo && (
          <div className="text-xs text-gray-600 flex items-center gap-1">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600 font-semibold">
              {action.assignedTo.name?.[0] || action.assignedTo.email[0]}
            </span>
            <span className="truncate">{action.assignedTo.name || action.assignedTo.email}</span>
          </div>
        )}

        {/* Due Date */}
        {action.dueDate && (
          <div className={cn(
            'text-xs flex items-center gap-1',
            isOverdue ? 'text-red-600 font-semibold' : 'text-gray-600'
          )}>
            <Calendar size={12} />
            {format(parseISO(action.dueDate), 'MMM d, yyyy')}
          </div>
        )}

        {/* Comment Count */}
        {action.commentCount > 0 && (
          <div className="text-xs text-gray-600 flex items-center gap-1">
            <MessageSquare size={12} />
            {action.commentCount}
          </div>
        )}

        {/* Linked Findings */}
        {action.linkedFindings && action.linkedFindings.length > 0 && (
          <div className="text-xs text-gray-500">
            📎 {action.linkedFindings.length} finding{action.linkedFindings.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  )
}

function DroppableColumn({
  column,
  actions,
  onActionClick
}: {
  column: KanbanColumn
  actions: Action[]
  onActionClick: (actionId: number) => void
}) {
  return (
    <div className="flex-1 min-w-[280px]">
      {/* Column Header */}
      <div className={cn('rounded-t-lg p-4 border-t-4', column.color)}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900">{column.title}</h3>
          <span className="bg-white px-2 py-1 rounded-full text-sm font-semibold text-gray-700">
            {actions.length}
          </span>
        </div>
      </div>

      {/* Column Content */}
      <div
        className={cn(
          'min-h-[500px] p-3 space-y-3 bg-gray-50 rounded-b-lg border-x border-b',
          column.color
        )}
      >
        {actions.map(action => (
          <ActionCard
            key={action.id}
            action={action}
            onClick={() => onActionClick(action.id)}
          />
        ))}

        {actions.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">
            No actions
          </div>
        )}
      </div>
    </div>
  )
}

export default function ActionKanbanBoard({
  projectId,
  onActionClick
}: ActionKanbanBoardProps) {
  const { actions, isLoading, updateActionStatus, filters, updateFilters } = useActions({ projectId })
  const [activeId, setActiveId] = useState<number | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) return

    const actionId = active.id as number
    const newStatus = over.id as Action['actionStatus']

    try {
      await updateActionStatus(actionId, newStatus)
    } catch (error) {
      console.error('Failed to update action status:', error)
    }

    setActiveId(null)
  }

  // Group actions by status
  const actionsByStatus = columns.reduce((acc, column) => {
    acc[column.id] = actions.filter(a => a.actionStatus === column.id)
    return acc
  }, {} as Record<Action['actionStatus'], Action[]>)

  const activeAction = activeId ? actions.find(a => a.id === activeId) : null

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg text-gray-500">Loading actions...</div>
      </div>
    )
  }

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
            {Object.keys(filters).length > 0 && (
              <span className="bg-blue-600 text-white px-1.5 py-0.5 rounded-full text-xs font-bold">
                {Object.keys(filters).length}
              </span>
            )}
          </button>
        </div>
        <div className="text-sm text-gray-600">
          {actions.length} total action{actions.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Filter Panel (collapsible) */}
      {showFilters && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={filters.priority || ''}
                onChange={(e) => updateFilters({ ...filters, priority: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status || ''}
                onChange={(e) => updateFilters({ ...filters, status: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="wont_fix">Won't Fix</option>
              </select>
            </div>

            {/* Clear Filters */}
            {Object.keys(filters).length > 0 && (
              <div className="flex items-end">
                <button
                  onClick={() => updateFilters({})}
                  className="w-full px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map(column => (
            <DroppableColumn
              key={column.id}
              column={column}
              actions={actionsByStatus[column.id] || []}
              onActionClick={onActionClick}
            />
          ))}
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeAction && (
            <ActionCard
              action={activeAction}
              onClick={() => {}}
              isDragging
            />
          )}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
