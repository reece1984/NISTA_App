import { useState } from 'react'
import { useAuth } from '../../../contexts/AuthContext'

interface CommentInputProps {
  actionId: number
}

export default function CommentInput({ actionId }: CommentInputProps) {
  const { user } = useAuth()
  const [comment, setComment] = useState('')
  const [isPosting, setIsPosting] = useState(false)

  const handlePost = async () => {
    if (!comment.trim()) return

    setIsPosting(true)
    try {
      // TODO: Implement comment posting to backend
      console.log('Posting comment for action:', actionId, comment)
      setComment('')
    } catch (error) {
      console.error('Failed to post comment:', error)
    } finally {
      setIsPosting(false)
    }
  }

  // Get user initials
  const initials = user?.user_metadata?.name
    ? user.user_metadata.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || 'U'

  return (
    <div className="mb-4">
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-full bg-navy text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1">
          <textarea
            placeholder="Add a comment... Use @name to mention someone"
            value={comment}
            onChange={e => setComment(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-copper/20 focus:border-copper resize-none"
            rows={2}
          />
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-slate-400">Use @name to notify team members</p>
            <button
              onClick={handlePost}
              disabled={!comment.trim() || isPosting}
              className="px-3 py-1.5 bg-navy hover:bg-slate-800 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPosting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
