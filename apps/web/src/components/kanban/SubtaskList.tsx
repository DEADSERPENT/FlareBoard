import { useState } from 'react'
import { CheckCircle2, Circle, Plus, X } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { useCreateTask, useUpdateTask } from '../../hooks/useTasks'
import type { Task } from '@flareboard/types'

interface SubtaskListProps {
  parentTask: Task
}

export function SubtaskList({ parentTask }: SubtaskListProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')

  const createTaskMutation = useCreateTask()
  const updateTaskMutation = useUpdateTask()

  // Calculate progress
  const completedCount = parentTask.subtasks?.filter((t) => t.status === 'Done').length || 0
  const totalCount = parentTask.subtasks?.length || 0
  const progress = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    try {
      await createTaskMutation.mutateAsync({
        title: newTitle,
        projectId: parentTask.projectId,
        parentId: parentTask.id,
        status: 'Todo',
        priority: 'Medium',
      } as any)
      setNewTitle('')
      setIsAdding(false)
    } catch (error) {
      console.error('Failed to create subtask', error)
    }
  }

  const toggleStatus = async (subtask: Task) => {
    const newStatus = subtask.status === 'Done' ? 'Todo' : 'Done'

    try {
      await updateTaskMutation.mutateAsync({
        id: subtask.id,
        data: { status: newStatus as any },
      })
    } catch (error) {
      console.error('Failed to update subtask', error)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-neutral-900">Subtasks</h3>
        <span className="text-xs text-neutral-500">
          {completedCount}/{totalCount} completed
        </span>
      </div>

      {/* Progress Bar */}
      {totalCount > 0 && (
        <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* List */}
      {totalCount > 0 && (
        <div className="space-y-2 mt-2">
          {parentTask.subtasks?.map((subtask) => (
            <div
              key={subtask.id}
              className="group flex items-center gap-3 p-2 hover:bg-neutral-50 rounded-md transition-colors"
            >
              <button
                onClick={() => toggleStatus(subtask)}
                className={`flex-shrink-0 transition-colors ${
                  subtask.status === 'Done'
                    ? 'text-green-500'
                    : 'text-neutral-300 hover:text-neutral-400'
                }`}
                disabled={updateTaskMutation.isPending}
              >
                {subtask.status === 'Done' ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </button>
              <span
                className={`text-sm flex-1 ${
                  subtask.status === 'Done'
                    ? 'text-neutral-400 line-through'
                    : 'text-neutral-700'
                }`}
              >
                {subtask.title}
              </span>
              {subtask.assignee && (
                <span className="text-xs text-neutral-500">
                  {subtask.assignee.fullName}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add New */}
      {isAdding ? (
        <form onSubmit={handleCreate} className="flex items-center gap-2 mt-2">
          <Input
            autoFocus
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="h-8 text-sm"
          />
          <Button
            type="submit"
            size="sm"
            disabled={!newTitle.trim() || createTaskMutation.isPending}
          >
            {createTaskMutation.isPending ? 'Adding...' : 'Add'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsAdding(false)
              setNewTitle('')
            }}
          >
            <X className="w-4 h-4" />
          </Button>
        </form>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-neutral-500 hover:text-neutral-900 pl-1"
          onClick={() => setIsAdding(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add subtask
        </Button>
      )}
    </div>
  )
}
