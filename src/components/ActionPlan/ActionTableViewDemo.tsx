import PriorityBadge from '../shared/PriorityBadge'
import StatusBadge from '../shared/StatusBadge'

// Same mock data as Kanban
const mockActions = [
  {
    id: 1,
    title: 'Develop and implement comprehensive risk register',
    description: 'Create a detailed risk register with clear ownership, likelihood/impact assessments, and mitigation strategies.',
    actionStatus: 'in_progress' as const,
    priority: 'critical' as const,
    assignedTo: { id: 1, name: 'Sarah Jones', email: 'sarah.jones@example.com' },
    dueDate: '2025-12-09',
    linkedFindings: ['G3-MC-5']
  },
  {
    id: 2,
    title: 'Establish operational issue management log',
    description: 'Set up a structured issue tracking system with clear escalation procedures.',
    actionStatus: 'not_started' as const,
    priority: 'high' as const,
    assignedTo: null,
    dueDate: '2025-12-20',
    linkedFindings: ['G3-MC-6']
  },
  {
    id: 3,
    title: 'Document formal benefits management plan',
    description: 'Create comprehensive benefits management framework.',
    actionStatus: 'not_started' as const,
    priority: 'high' as const,
    assignedTo: { id: 1, name: 'Sarah Jones', email: 'sarah.jones@example.com' },
    dueDate: '2026-01-09',
    linkedFindings: ['G3-MC-8']
  },
  {
    id: 7,
    title: 'Develop comprehensive evaluation criteria framework',
    description: 'Define and weight evaluation criteria for project decisions.',
    actionStatus: 'completed' as const,
    priority: 'medium' as const,
    assignedTo: { id: 1, name: 'Sarah Jones', email: 'sarah.jones@example.com' },
    dueDate: '2025-11-15',
    linkedFindings: []
  },
  {
    id: 8,
    title: 'Complete legal review of all contract terms',
    description: 'Ensure all contract terms undergo comprehensive legal review.',
    actionStatus: 'in_progress' as const,
    priority: 'high' as const,
    assignedTo: { id: 1, name: 'Sarah Jones', email: 'sarah.jones@example.com' },
    dueDate: '2025-11-30',
    linkedFindings: []
  }
]

interface ActionTableViewDemoProps {
  onActionClick: (actionId: number) => void
}

export default function ActionTableViewDemo({ onActionClick }: ActionTableViewDemoProps) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Actions Table</h2>
        <div className="text-sm text-gray-600">
          {mockActions.length} actions
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-sm text-gray-700">Title</th>
              <th className="px-4 py-3 text-left font-semibold text-sm text-gray-700 w-36">Owner</th>
              <th className="px-4 py-3 text-left font-semibold text-sm text-gray-700 w-32">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-sm text-gray-700 w-28">Priority</th>
              <th className="px-4 py-3 text-left font-semibold text-sm text-gray-700 w-32">Due Date</th>
              <th className="px-4 py-3 text-left font-semibold text-sm text-gray-700 w-32">Findings</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {mockActions.map(action => (
              <tr
                key={action.id}
                onClick={() => onActionClick(action.id)}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{action.title}</div>
                  <div className="text-sm text-gray-500 line-clamp-1">{action.description}</div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {action.assignedTo ? (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 font-semibold text-xs">
                        {action.assignedTo.name[0]}
                      </span>
                      <span className="truncate">{action.assignedTo.name}</span>
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
                  {new Date(action.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {action.linkedFindings.length}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Demo Note */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> Sorting, filtering, and bulk operations are disabled in demo mode.
          With the backend connected, you'll have full table functionality.
        </p>
      </div>
    </div>
  )
}
