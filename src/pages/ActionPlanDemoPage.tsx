import { useState } from 'react'
import { LayoutGrid, Table2 } from 'lucide-react'
import { Link } from 'react-router-dom'

// Mock data components
import ActionKanbanBoardDemo from '../components/ActionPlan/ActionKanbanBoardDemo'
import ActionTableViewDemo from '../components/ActionPlan/ActionTableViewDemo'
import ActionDetailModal from '../components/ActionPlan/ActionDetailModal'

export default function ActionPlanDemoPage() {
  const [view, setView] = useState<'kanban' | 'table'>('kanban')
  const [selectedActionId, setSelectedActionId] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Action Plan Demo</h1>
              <p className="text-sm text-gray-600 mt-1">
                Preview of Action Management UI (Mock Data)
              </p>
            </div>

            {/* View Toggle */}
            <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setView('kanban')}
                className={`flex items-center gap-2 px-4 py-2 rounded transition-all ${
                  view === 'kanban' ? 'bg-white shadow text-blue-600 font-semibold' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <LayoutGrid size={16} />
                Kanban Board
              </button>
              <button
                onClick={() => setView('table')}
                className={`flex items-center gap-2 px-4 py-2 rounded transition-all ${
                  view === 'table' ? 'bg-white shadow text-blue-600 font-semibold' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Table2 size={16} />
                Table View
              </button>
            </div>
          </div>

          {/* Info Banner */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Demo Mode:</strong> This page shows the Action Plan UI with mock data.
              No database or N8N backend required.
              <Link to="/dashboard" className="ml-2 underline font-medium">
                Return to Dashboard
              </Link>
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {view === 'kanban' ? (
          <ActionKanbanBoardDemo onActionClick={setSelectedActionId} />
        ) : (
          <ActionTableViewDemo onActionClick={setSelectedActionId} />
        )}
      </main>

      {/* Action Detail Modal (won't work without real backend) */}
      {selectedActionId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h3 className="text-lg font-bold mb-4">Action Details</h3>
            <p className="text-gray-600 mb-4">
              Action detail view requires backend integration to fetch full action data,
              history, and comments.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Selected Action ID: {selectedActionId}
            </p>
            <button
              onClick={() => setSelectedActionId(null)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
