import { useState, useMemo } from 'react'
import { useActions, type Action } from '../../hooks/useActions'
import PriorityBadge from '../shared/PriorityBadge'
import StatusBadge from '../shared/StatusBadge'
import { ChevronUp, ChevronDown, Check } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { cn } from '../../lib/utils'

interface ActionTableViewProps {
  projectId: number
  onActionClick: (actionId: number) => void
}

type SortField = 'title' | 'priority' | 'status' | 'dueDate' | 'assignedTo'
type SortDirection = 'asc' | 'desc'

const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
const statusOrder = { not_started: 1, in_progress: 2, completed: 3, wont_fix: 4 }

export default function ActionTableView({ projectId, onActionClick }: ActionTableViewProps) {
  const { actions, isLoading, bulkUpdate } = useActions({ projectId })
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [sortField, setSortField] = useState<SortField>('priority')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [filters, setFilters] = useState({
    title: '',
    priority: '',
    status: '',
    assignedTo: ''
  })

  // Sort and filter actions
  const filteredAndSortedActions = useMemo(() => {
    let result = [...actions]

    // Apply filters
    if (filters.title) {
      result = result.filter(a =>
        a.title.toLowerCase().includes(filters.title.toLowerCase())
      )
    }
    if (filters.priority) {
      result = result.filter(a => a.priority === filters.priority)
    }
    if (filters.status) {
      result = result.filter(a => a.actionStatus === filters.status)
    }
    if (filters.assignedTo) {
      result = result.filter(a =>
        a.assignedTo?.email.toLowerCase().includes(filters.assignedTo.toLowerCase())
      )
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0

      switch (sortField) {
        case 'title':
          comparison = a.title.localeCompare(b.title)
          break
        case 'priority':
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority]
          break
        case 'status':
          comparison = statusOrder[a.actionStatus] - statusOrder[b.actionStatus]
          break
        case 'dueDate':
          const aDate = a.dueDate ? new Date(a.dueDate).getTime() : 0
          const bDate = b.dueDate ? new Date(b.dueDate).getTime() : 0
          comparison = aDate - bDate
          break
        case 'assignedTo':
          comparison = (a.assignedTo?.email || '').localeCompare(b.assignedTo?.email || '')
          break
      }

      return sortDirection === 'asc' ? comparison : -comparison
    })

    return result
  }, [actions, filters, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleSelectAll = () => {
    if (selectedIds.size === filteredAndSortedActions.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredAndSortedActions.map(a => a.id)))
    }
  }

  const handleSelectOne = (id: number) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setSelectedIds(newSet)
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
  }

  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">Loading actions...</div>
  }

  return (
    <div>
      {/* Bulk Actions Toolbar */}
      {selectedIds.size > 0 && (
        <div className="mb-4 p-4 bg-accent/5 rounded-lg border border-accent/20 flex items-center justify-between">
          <span className="text-sm font-semibold text-accent-hover">
            {selectedIds.size} action{selectedIds.size !== 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-3">
            <select
              className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              onChange={(e) => {
                if (e.target.value) {
                  bulkUpdate({
                    actionIds: Array.from(selectedIds),
                    updates: { actionStatus: e.target.value as Action['actionStatus'] }
                  })
                  setSelectedIds(new Set())
                }
              }}
            >
              <option value="">Change status...</option>
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="wont_fix">Won't Fix</option>
            </select>
            <select
              className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              onChange={(e) => {
                if (e.target.value) {
                  bulkUpdate({
                    actionIds: Array.from(selectedIds),
                    updates: { priority: e.target.value as Action['priority'] }
                  })
                  setSelectedIds(new Set())
                }
              }}
            >
              <option value="">Change priority...</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left w-12">
                <input
                  type="checkbox"
                  checked={selectedIds.size === filteredAndSortedActions.length && filteredAndSortedActions.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300"
                />
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('title')}
                  className="flex items-center gap-2 font-semibold text-sm text-gray-700 hover:text-gray-900"
                >
                  Title
                  <SortIcon field="title" />
                </button>
                <input
                  type="text"
                  placeholder="Filter..."
                  value={filters.title}
                  onChange={(e) => setFilters({ ...filters, title: e.target.value })}
                  className="mt-1 w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </th>
              <th className="px-4 py-3 text-left w-36">
                <button
                  onClick={() => handleSort('assignedTo')}
                  className="flex items-center gap-2 font-semibold text-sm text-gray-700 hover:text-gray-900"
                >
                  Owner
                  <SortIcon field="assignedTo" />
                </button>
                <input
                  type="text"
                  placeholder="Filter..."
                  value={filters.assignedTo}
                  onChange={(e) => setFilters({ ...filters, assignedTo: e.target.value })}
                  className="mt-1 w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </th>
              <th className="px-4 py-3 text-left w-32">
                <button
                  onClick={() => handleSort('status')}
                  className="flex items-center gap-2 font-semibold text-sm text-gray-700 hover:text-gray-900"
                >
                  Status
                  <SortIcon field="status" />
                </button>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="mt-1 w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  <option value="">All</option>
                  <option value="not_started">Not Started</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="wont_fix">Won't Fix</option>
                </select>
              </th>
              <th className="px-4 py-3 text-left w-28">
                <button
                  onClick={() => handleSort('priority')}
                  className="flex items-center gap-2 font-semibold text-sm text-gray-700 hover:text-gray-900"
                >
                  Priority
                  <SortIcon field="priority" />
                </button>
                <select
                  value={filters.priority}
                  onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                  className="mt-1 w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  <option value="">All</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </th>
              <th className="px-4 py-3 text-left w-32">
                <button
                  onClick={() => handleSort('dueDate')}
                  className="flex items-center gap-2 font-semibold text-sm text-gray-700 hover:text-gray-900"
                >
                  Due Date
                  <SortIcon field="dueDate" />
                </button>
              </th>
              <th className="px-4 py-3 text-left w-32">
                <span className="font-semibold text-sm text-gray-700">Finding Links</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredAndSortedActions.map(action => (
              <tr
                key={action.id}
                onClick={() => onActionClick(action.id)}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(action.id)}
                    onChange={() => handleSelectOne(action.id)}
                    className="rounded border-gray-300"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{action.title}</div>
                  {action.description && (
                    <div className="text-sm text-gray-500 line-clamp-1">{action.description}</div>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {action.assignedTo ? (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-accent/10 text-accent font-semibold text-xs">
                        {action.assignedTo.name?.[0] || action.assignedTo.email[0]}
                      </span>
                      <span className="truncate">{action.assignedTo.name || action.assignedTo.email}</span>
                    </div>
                  ) : (
                    <span className="text-gray-400">Unassigned</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={action.actionStatus} />
                </td>
                <td className="px-4 py-3">
                  <PriorityBadge priority={action.priority} />
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {action.dueDate ? format(parseISO(action.dueDate), 'MMM d, yyyy') : '-'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {action.linkedFindings?.length || 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredAndSortedActions.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No actions found
          </div>
        )}
      </div>
    </div>
  )
}
