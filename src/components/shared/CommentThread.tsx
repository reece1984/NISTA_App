import { formatDistanceToNow } from 'date-fns'
import { MessageSquare, Reply } from 'lucide-react'

interface Comment {
  id: number
  userId: {
    id: number
    name?: string
    email: string
  }
  commentText: string
  createdAt: string
  mentions?: number[]
  replies?: Comment[]
}

interface CommentThreadProps {
  comments: Comment[]
  onReply?: (parentId: number) => void
  depth?: number
}

export default function CommentThread({
  comments,
  onReply,
  depth = 0
}: CommentThreadProps) {
  if (!comments || comments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <MessageSquare size={32} className="mx-auto mb-2 text-gray-400" />
        <p className="text-sm">No comments yet</p>
      </div>
    )
  }

  return (
    <div className={depth > 0 ? 'ml-8 mt-4' : 'space-y-4'}>
      {comments.map(comment => (
        <div key={comment.id} className="group">
          <div className="flex gap-3">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
                {comment.userId.email[0].toUpperCase()}
              </div>
            </div>

            {/* Comment Content */}
            <div className="flex-1 min-w-0">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-sm font-semibold text-gray-900">
                    {comment.userId.name || comment.userId.email}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {comment.commentText}
                </p>
              </div>

              {/* Reply Button */}
              {onReply && depth < 3 && (
                <button
                  onClick={() => onReply(comment.id)}
                  className="mt-1 text-xs text-gray-500 hover:text-blue-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Reply size={12} />
                  Reply
                </button>
              )}

              {/* Nested Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <CommentThread
                  comments={comment.replies}
                  onReply={onReply}
                  depth={depth + 1}
                />
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
