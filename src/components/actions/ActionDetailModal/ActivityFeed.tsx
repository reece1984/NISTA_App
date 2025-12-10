import { RefreshCw, UserPlus, Plus, Zap } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { ActivityItem } from '../../../types/actions'

interface ActivityFeedProps {
  actionId: number
}

// Mock activity data - will be replaced with real API call
const getMockActivity = (actionId: number): ActivityItem[] => [
  {
    id: '1',
    type: 'comment',
    user_id: 2,
    user_name: 'Sarah Miller',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    data: {
      content: "@James I've sent the latest cost data to the risk team. They should have the Monte Carlo outputs by Friday.",
      mentions: ['James']
    }
  },
  {
    id: '2',
    type: 'status_change',
    user_id: 1,
    user_name: 'James Reece',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    data: {
      from_status: 'not_started',
      to_status: 'in_progress'
    }
  },
  {
    id: '3',
    type: 'assignment',
    user_id: 1,
    user_name: 'James Reece',
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    data: {
      assigned_to: 'James Reece'
    }
  },
  {
    id: '4',
    type: 'created',
    user_id: 0,
    user_name: 'System',
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    data: {
      source: 'ai_generated',
      assessment_version: 2
    }
  }
]

const statusLabels = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  completed: 'Completed',
  blocked: 'Blocked',
  cancelled: 'Cancelled',
  wont_fix: "Won't Fix"
}

const statusColors = {
  not_started: 'bg-slate-100 text-slate-600',
  in_progress: 'bg-amber-100 text-amber-700',
  completed: 'bg-green-100 text-green-700',
  blocked: 'bg-purple-100 text-purple-700',
  cancelled: 'bg-slate-100 text-slate-500',
  wont_fix: 'bg-slate-100 text-slate-500'
}

export default function ActivityFeed({ actionId }: ActivityFeedProps) {
  // TODO: Replace with real API call
  const activities = getMockActivity(actionId)

  const renderActivityItem = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'comment':
        return (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-copper text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
              {activity.user_name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-navy">{activity.user_name}</span>
                  <span className="text-xs text-slate-400">
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm text-slate-600">
                  {activity.data.content?.split(' ').map((word, i) =>
                    word.startsWith('@') ? (
                      <span key={i} className="text-copper font-medium">{word} </span>
                    ) : (
                      word + ' '
                    )
                  )}
                </p>
              </div>
            </div>
          </div>
        )

      case 'status_change':
        return (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
              <RefreshCw className="w-4 h-4 text-slate-500" />
            </div>
            <div className="flex-1 py-2">
              <p className="text-sm text-slate-500">
                <span className="font-medium text-slate-700">{activity.user_name}</span> changed status from{' '}
                <span className={`px-1.5 py-0.5 text-xs rounded ${statusColors[activity.data.from_status!]}`}>
                  {statusLabels[activity.data.from_status!]}
                </span>{' '}
                to{' '}
                <span className={`px-1.5 py-0.5 text-xs rounded ${statusColors[activity.data.to_status!]}`}>
                  {statusLabels[activity.data.to_status!]}
                </span>
                <span className="text-slate-400 ml-1">
                  · {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                </span>
              </p>
            </div>
          </div>
        )

      case 'assignment':
        return (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
              <UserPlus className="w-4 h-4 text-slate-500" />
            </div>
            <div className="flex-1 py-2">
              <p className="text-sm text-slate-500">
                <span className="font-medium text-slate-700">{activity.data.assigned_to}</span> was assigned to this action
                <span className="text-slate-400 ml-1">
                  · {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                </span>
              </p>
            </div>
          </div>
        )

      case 'created':
        const isAI = activity.data.source === 'ai_generated'
        return (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
              {isAI ? (
                <Zap className="w-4 h-4 text-copper" />
              ) : (
                <Plus className="w-4 h-4 text-slate-500" />
              )}
            </div>
            <div className="flex-1 py-2">
              <p className="text-sm text-slate-500">
                Action created by{' '}
                <span className="font-medium text-slate-700">
                  {isAI ? 'AI Generation' : activity.user_name}
                </span>
                {isAI && activity.data.assessment_version && (
                  <> from Assessment v{activity.data.assessment_version}</>
                )}
                <span className="text-slate-400 ml-1">
                  · {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                </span>
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-4 mt-4">
      {activities.map(activity => (
        <div key={activity.id}>
          {renderActivityItem(activity)}
        </div>
      ))}
    </div>
  )
}
