import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { TaskModal } from './TaskModal'

// Mock the child components
vi.mock('./TaskComments', () => ({
  TaskComments: ({ taskId }: { taskId: string }) => (
    <div data-testid="task-comments">Comments for {taskId}</div>
  ),
}))

vi.mock('./TaskAttachments', () => ({
  TaskAttachments: ({ taskId }: { taskId: string }) => (
    <div data-testid="task-attachments">Attachments for {taskId}</div>
  ),
}))

const mockProjects = [
  { id: 'proj-1', name: 'Project Alpha' },
  { id: 'proj-2', name: 'Project Beta' },
]

describe('TaskModal', () => {
  const mockOnClose = vi.fn()
  const mockOnSave = vi.fn()

  beforeEach(() => {
    mockOnClose.mockClear()
    mockOnSave.mockClear()
    mockOnSave.mockResolvedValue(undefined)
  })

  describe('Create Mode', () => {
    it('should render with "Create Task" title when no task provided', () => {
      render(
        <TaskModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          projects={mockProjects}
        />
      )

      expect(screen.getByRole('heading', { name: 'Create Task' })).toBeInTheDocument()
    })

    it('should render empty form with default values', () => {
      render(
        <TaskModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          projects={mockProjects}
        />
      )

      const titleInput = screen.getByLabelText(/task title/i) as HTMLInputElement
      const descriptionInput = screen.getByLabelText(/description/i) as HTMLTextAreaElement
      const statusSelect = screen.getByLabelText(/status/i) as HTMLSelectElement
      const prioritySelect = screen.getByLabelText(/priority/i) as HTMLSelectElement

      expect(titleInput.value).toBe('')
      expect(descriptionInput.value).toBe('')
      expect(statusSelect.value).toBe('Todo')
      expect(prioritySelect.value).toBe('Medium')
    })

    it('should use defaultStatus and defaultProjectId when provided', () => {
      render(
        <TaskModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          projects={mockProjects}
          defaultStatus="In Progress"
          defaultProjectId="proj-2"
        />
      )

      const statusSelect = screen.getByLabelText(/status/i) as HTMLSelectElement
      const projectSelect = screen.getByLabelText(/project/i) as HTMLSelectElement

      expect(statusSelect.value).toBe('In Progress')
      expect(projectSelect.value).toBe('proj-2')
    })

    it('should have required validation on title input', () => {
      render(
        <TaskModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          projects={mockProjects}
        />
      )

      const titleInput = screen.getByLabelText(/task title/i)
      expect(titleInput).toBeRequired()
    })

    it('should have required validation on project select', () => {
      render(
        <TaskModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          projects={mockProjects}
        />
      )

      const projectSelect = screen.getByLabelText(/project/i)
      expect(projectSelect).toBeRequired()
    })

    it('should call onSave with correct data when form is valid', async () => {
      const user = userEvent.setup()

      render(
        <TaskModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          projects={mockProjects}
        />
      )

      const titleInput = screen.getByLabelText(/task title/i)
      const descriptionInput = screen.getByLabelText(/description/i)
      const projectSelect = screen.getByLabelText(/project/i)
      const statusSelect = screen.getByLabelText(/status/i)
      const prioritySelect = screen.getByLabelText(/priority/i)

      await user.type(titleInput, 'New Task')
      await user.type(descriptionInput, 'Task description')
      await user.selectOptions(projectSelect, 'proj-1')
      await user.selectOptions(statusSelect, 'In Progress')
      await user.selectOptions(prioritySelect, 'High')

      const submitButton = screen.getByRole('button', { name: /create task/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'New Task',
            description: 'Task description',
            projectId: 'proj-1',
            status: 'In Progress',
            priority: 'High',
          })
        )
      })
    })

    it('should close modal on successful save', async () => {
      const user = userEvent.setup()

      render(
        <TaskModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          projects={mockProjects}
        />
      )

      const titleInput = screen.getByLabelText(/task title/i)
      const projectSelect = screen.getByLabelText(/project/i)

      await user.type(titleInput, 'New Task')
      await user.selectOptions(projectSelect, 'proj-1')

      const submitButton = screen.getByRole('button', { name: /create task/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled()
      })
    })

    it('should show loading state during save', async () => {
      const user = userEvent.setup()
      let resolvePromise: () => void
      const savePromise = new Promise<void>((resolve) => {
        resolvePromise = resolve
      })
      mockOnSave.mockReturnValue(savePromise)

      render(
        <TaskModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          projects={mockProjects}
        />
      )

      const titleInput = screen.getByLabelText(/task title/i)
      const projectSelect = screen.getByLabelText(/project/i)

      await user.type(titleInput, 'New Task')
      await user.selectOptions(projectSelect, 'proj-1')

      const submitButton = screen.getByRole('button', { name: /create task/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Saving...')).toBeInTheDocument()
      })

      expect(submitButton).toBeDisabled()
      expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled()

      resolvePromise!()
    })

    it('should display error message when save fails', async () => {
      const user = userEvent.setup()
      mockOnSave.mockRejectedValue(new Error('Network error'))

      render(
        <TaskModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          projects={mockProjects}
        />
      )

      const titleInput = screen.getByLabelText(/task title/i)
      const projectSelect = screen.getByLabelText(/project/i)

      await user.type(titleInput, 'New Task')
      await user.selectOptions(projectSelect, 'proj-1')

      const submitButton = screen.getByRole('button', { name: /create task/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument()
      })

      expect(mockOnClose).not.toHaveBeenCalled()
    })

    it('should not show attachments or comments in create mode', () => {
      render(
        <TaskModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          projects={mockProjects}
        />
      )

      expect(screen.queryByTestId('task-attachments')).not.toBeInTheDocument()
      expect(screen.queryByTestId('task-comments')).not.toBeInTheDocument()
    })
  })

  describe('Edit Mode', () => {
    const existingTask = {
      id: 'task-1',
      title: 'Existing Task',
      description: 'Existing description',
      status: 'In Progress',
      priority: 'High',
      projectId: 'proj-2',
      position: 1,
      assignedTo: null,
      dueDate: '2024-12-31',
    }

    it('should render with "Edit Task" title when task provided', () => {
      render(
        <TaskModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          projects={mockProjects}
          task={existingTask}
        />
      )

      expect(screen.getByText('Edit Task')).toBeInTheDocument()
    })

    it('should populate form with task data', () => {
      render(
        <TaskModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          projects={mockProjects}
          task={existingTask}
        />
      )

      const titleInput = screen.getByLabelText(/task title/i) as HTMLInputElement
      const descriptionInput = screen.getByLabelText(/description/i) as HTMLTextAreaElement
      const projectSelect = screen.getByLabelText(/project/i) as HTMLSelectElement
      const statusSelect = screen.getByLabelText(/status/i) as HTMLSelectElement
      const prioritySelect = screen.getByLabelText(/priority/i) as HTMLSelectElement
      const dueDateInput = screen.getByLabelText(/due date/i) as HTMLInputElement

      expect(titleInput.value).toBe('Existing Task')
      expect(descriptionInput.value).toBe('Existing description')
      expect(projectSelect.value).toBe('proj-2')
      expect(statusSelect.value).toBe('In Progress')
      expect(prioritySelect.value).toBe('High')
      expect(dueDateInput.value).toBe('2024-12-31')
    })

    it('should format Date object for dueDate correctly', () => {
      const taskWithDateObject = {
        ...existingTask,
        dueDate: new Date('2024-12-31T00:00:00Z'),
      }

      render(
        <TaskModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          projects={mockProjects}
          task={taskWithDateObject}
        />
      )

      const dueDateInput = screen.getByLabelText(/due date/i) as HTMLInputElement
      expect(dueDateInput.value).toBe('2024-12-31')
    })

    it('should show "Update Task" button in edit mode', () => {
      render(
        <TaskModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          projects={mockProjects}
          task={existingTask}
        />
      )

      expect(screen.getByRole('button', { name: /update task/i })).toBeInTheDocument()
    })

    it('should show attachments and comments sections for existing task', () => {
      render(
        <TaskModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          projects={mockProjects}
          task={existingTask}
        />
      )

      expect(screen.getByTestId('task-attachments')).toBeInTheDocument()
      expect(screen.getByTestId('task-comments')).toBeInTheDocument()
      expect(screen.getByText(/attachments for task-1/i)).toBeInTheDocument()
      expect(screen.getByText(/comments for task-1/i)).toBeInTheDocument()
    })

    it('should call onSave with updated data', async () => {
      const user = userEvent.setup()

      render(
        <TaskModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          projects={mockProjects}
          task={existingTask}
        />
      )

      const titleInput = screen.getByLabelText(/task title/i)
      await user.clear(titleInput)
      await user.type(titleInput, 'Updated Task')

      const submitButton = screen.getByRole('button', { name: /update task/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'task-1',
            title: 'Updated Task',
            projectId: 'proj-2',
          })
        )
      })
    })
  })

  describe('User Interactions', () => {
    it('should close modal when cancel button is clicked', async () => {
      const user = userEvent.setup()

      render(
        <TaskModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          projects={mockProjects}
        />
      )

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should update form fields on user input', async () => {
      const user = userEvent.setup()

      render(
        <TaskModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          projects={mockProjects}
        />
      )

      const titleInput = screen.getByLabelText(/task title/i) as HTMLInputElement
      await user.type(titleInput, 'Test')

      expect(titleInput.value).toBe('Test')
    })

    it('should handle date input correctly', async () => {
      const user = userEvent.setup()

      render(
        <TaskModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          projects={mockProjects}
        />
      )

      const dueDateInput = screen.getByLabelText(/due date/i)
      await user.type(dueDateInput, '2025-01-15')

      const titleInput = screen.getByLabelText(/task title/i)
      await user.type(titleInput, 'Task with date')

      const projectSelect = screen.getByLabelText(/project/i)
      await user.selectOptions(projectSelect, 'proj-1')

      const submitButton = screen.getByRole('button', { name: /create task/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            dueDate: '2025-01-15',
          })
        )
      })
    })

    it('should clear error when submitting after a failed save', async () => {
      const user = userEvent.setup()
      mockOnSave.mockRejectedValueOnce(new Error('Server error'))
      mockOnSave.mockResolvedValueOnce(undefined)

      render(
        <TaskModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          projects={mockProjects}
        />
      )

      const titleInput = screen.getByLabelText(/task title/i)
      const projectSelect = screen.getByLabelText(/project/i)

      await user.type(titleInput, 'Task')
      await user.selectOptions(projectSelect, 'proj-1')

      // First submission fails
      const submitButton = screen.getByRole('button', { name: /create task/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/server error/i)).toBeInTheDocument()
      })

      // Second submission succeeds and error is cleared
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.queryByText(/server error/i)).not.toBeInTheDocument()
      })
    })
  })

  describe('Modal Visibility', () => {
    it('should not render when isOpen is false', () => {
      render(
        <TaskModal
          isOpen={false}
          onClose={mockOnClose}
          onSave={mockOnSave}
          projects={mockProjects}
        />
      )

      expect(screen.queryByRole('heading', { name: 'Create Task' })).not.toBeInTheDocument()
    })

    it('should render when isOpen is true', () => {
      render(
        <TaskModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          projects={mockProjects}
        />
      )

      expect(screen.getByRole('heading', { name: 'Create Task' })).toBeInTheDocument()
    })
  })
})
