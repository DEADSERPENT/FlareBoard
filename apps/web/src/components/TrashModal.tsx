import { RefreshCcw, Trash2, X } from 'lucide-react'
import { Button } from './ui/Button'
import { useDeletedTasks, useRestoreTask } from '../hooks/useTasks'
import { formatDistanceToNow } from 'date-fns'

interface TrashModalProps {
  isOpen: boolean
  onClose: () => void
}

export function TrashModal({ isOpen, onClose }: TrashModalProps) {
  const { data: deletedTasks, isLoading } = useDeletedTasks()
  const restoreMutation = useRestoreTask()

  if (!isOpen) return null

  const handleRestore = async (taskId: string) => {
    try {
      await restoreMutation.mutateAsync(taskId)
    } catch (error) {
      console.error('Failed to restore task:', error)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col">
        <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-red-500" />
            <h2 className="font-semibold text-lg">Trash Bin</h2>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="text-center py-8 text-neutral-500">Loading deleted items...</div>
          ) : deletedTasks?.length === 0 ? (
            <div className="text-center py-12 flex flex-col items-center">
              <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mb-3">
                <Trash2 className="w-6 h-6 text-neutral-400" />
              </div>
              <p className="text-neutral-900 font-medium">Trash is empty</p>
              <p className="text-neutral-500 text-sm mt-1">Deleted items will appear here</p>
            </div>
          ) : (
            <div className="space-y-2">
              {deletedTasks?.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start justify-between p-4 border border-neutral-200 rounded-lg hover:border-neutral-300 bg-white transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-neutral-900">{task.title}</p>
                    {task.description && (
                      <p className="text-sm text-neutral-600 mt-1 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-neutral-500">
                      <span className="flex items-center gap-1">
                        <span
                          className={`inline-block w-2 h-2 rounded-full ${
                            task.priority === 'High'
                              ? 'bg-red-500'
                              : task.priority === 'Medium'
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                          }`}
                        />
                        {task.priority}
                      </span>
                      {task.deletedAt && (
                        <span>
                          Deleted{' '}
                          {formatDistanceToNow(new Date(task.deletedAt), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRestore(task.id)}
                    disabled={restoreMutation.isPending}
                    className="ml-4 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                  >
                    <RefreshCcw className="w-3 h-3 mr-2" />
                    Restore
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-neutral-100 bg-neutral-50 text-center">
          <p className="text-xs text-neutral-500">
            Items in trash are permanently deleted after 30 days
          </p>
        </div>
      </div>
    </div>
  )
}
