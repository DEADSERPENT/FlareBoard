import { useState, useEffect } from 'react'
import { MessageSquare, Send, Loader2 } from 'lucide-react'
import { Button } from '../ui/Button'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { formatDistanceToNow } from 'date-fns'

interface Comment {
  id: string
  taskId: string
  userId: string
  content: string
  createdAt: Date | string
  updatedAt: Date | string
  user?: {
    id: string
    fullName: string
    avatarUrl?: string | null
  }
}

interface TaskCommentsProps {
  taskId: string
}

export function TaskComments({ taskId }: TaskCommentsProps) {
  const { token } = useAuth()
  const toast = useToast()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [newComment, setNewComment] = useState('')

  useEffect(() => {
    if (taskId) {
      fetchComments()
    }
  }, [taskId])

  const fetchComments = async () => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:3000/api/comments/task/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (data.success) {
        setComments(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      toast.error('Validation Error', 'Comment cannot be empty')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('http://localhost:3000/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          taskId,
          content: newComment.trim(),
        }),
      })

      const data = await response.json()
      if (data.success) {
        setComments([data.data, ...comments])
        setNewComment('')
        toast.success('Success', 'Comment added')
      } else {
        toast.error('Error', data.error?.message || 'Failed to add comment')
      }
    } catch (error) {
      toast.error('Error', 'Failed to add comment')
    } finally {
      setSubmitting(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleAddComment()
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-neutral-900 font-medium">
        <MessageSquare className="w-5 h-5" />
        <span>Comments</span>
        <span className="text-sm text-neutral-500">({comments.length})</span>
      </div>

      {/* Add Comment Form */}
      <div className="bg-neutral-50 rounded-lg p-4">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Add a comment... (Ctrl+Enter to submit)"
          rows={3}
          className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-neutral-900 resize-none"
        />
        <div className="flex justify-end mt-2">
          <Button
            variant="primary"
            size="sm"
            onClick={handleAddComment}
            disabled={submitting || !newComment.trim()}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Posting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Post Comment
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-neutral-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-white border border-neutral-200 rounded-lg p-4 hover:border-neutral-300 transition-colors"
            >
              <div className="flex items-start gap-3">
                {/* User Avatar */}
                {comment.user?.avatarUrl ? (
                  <img
                    src={comment.user.avatarUrl}
                    alt={comment.user.fullName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-orange flex items-center justify-center text-white text-xs font-semibold">
                    {comment.user ? getInitials(comment.user.fullName) : '?'}
                  </div>
                )}

                {/* Comment Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-neutral-900 text-sm">
                      {comment.user?.fullName || 'Unknown User'}
                    </span>
                    <span className="text-xs text-neutral-500">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-700 whitespace-pre-wrap break-words">
                    {comment.content}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
