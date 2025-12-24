import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { CommandPalette } from './CommandPalette'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('CommandPalette', () => {
  const mockOnClose = vi.fn()
  const mockOnCreateTask = vi.fn()
  const mockOnCreateProject = vi.fn()

  beforeEach(() => {
    mockOnClose.mockClear()
    mockOnCreateTask.mockClear()
    mockOnCreateProject.mockClear()
    mockNavigate.mockClear()
  })

  describe('Visibility', () => {
    it('should not render when isOpen is false', () => {
      render(
        <CommandPalette
          isOpen={false}
          onClose={mockOnClose}
        />
      )

      expect(screen.queryByPlaceholderText(/type a command/i)).not.toBeInTheDocument()
    })

    it('should render when isOpen is true', () => {
      render(
        <CommandPalette
          isOpen={true}
          onClose={mockOnClose}
        />
      )

      expect(screen.getByPlaceholderText(/type a command/i)).toBeInTheDocument()
    })

    it('should close when backdrop is clicked', async () => {
      const user = userEvent.setup()

      render(
        <CommandPalette
          isOpen={true}
          onClose={mockOnClose}
        />
      )

      const backdrop = document.querySelector('.bg-black\\/50')
      expect(backdrop).toBeInTheDocument()

      await user.click(backdrop!)

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should close when ESC key is pressed', async () => {
      const user = userEvent.setup()

      render(
        <CommandPalette
          isOpen={true}
          onClose={mockOnClose}
        />
      )

      await user.keyboard('{Escape}')

      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  describe('Navigation Commands', () => {
    it('should display navigation commands', () => {
      render(
        <CommandPalette
          isOpen={true}
          onClose={mockOnClose}
        />
      )

      expect(screen.getByText('Go to Home')).toBeInTheDocument()
      expect(screen.getByText('Go to Projects')).toBeInTheDocument()
      expect(screen.getByText('Go to Kanban Board')).toBeInTheDocument()
      expect(screen.getByText('Go to Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Go to Activity')).toBeInTheDocument()
      expect(screen.getByText('Go to Settings')).toBeInTheDocument()
    })

    it('should navigate to home when home command is clicked', async () => {
      const user = userEvent.setup()

      render(
        <CommandPalette
          isOpen={true}
          onClose={mockOnClose}
        />
      )

      const homeCommand = screen.getByText('Go to Home')
      await user.click(homeCommand)

      expect(mockNavigate).toHaveBeenCalledWith('/')
      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should navigate to projects when projects command is clicked', async () => {
      const user = userEvent.setup()

      render(
        <CommandPalette
          isOpen={true}
          onClose={mockOnClose}
        />
      )

      const projectsCommand = screen.getByText('Go to Projects')
      await user.click(projectsCommand)

      expect(mockNavigate).toHaveBeenCalledWith('/projects')
      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should navigate to kanban when kanban command is clicked', async () => {
      const user = userEvent.setup()

      render(
        <CommandPalette
          isOpen={true}
          onClose={mockOnClose}
        />
      )

      const kanbanCommand = screen.getByText('Go to Kanban Board')
      await user.click(kanbanCommand)

      expect(mockNavigate).toHaveBeenCalledWith('/kanban')
      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should navigate to settings when settings command is clicked', async () => {
      const user = userEvent.setup()

      render(
        <CommandPalette
          isOpen={true}
          onClose={mockOnClose}
        />
      )

      const settingsCommand = screen.getByText('Go to Settings')
      await user.click(settingsCommand)

      expect(mockNavigate).toHaveBeenCalledWith('/settings')
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  describe('Action Commands', () => {
    it('should display create task action when handler is provided', () => {
      render(
        <CommandPalette
          isOpen={true}
          onClose={mockOnClose}
          onCreateTask={mockOnCreateTask}
        />
      )

      expect(screen.getByText('Create New Task')).toBeInTheDocument()
    })

    it('should not display create task action when handler is not provided', () => {
      render(
        <CommandPalette
          isOpen={true}
          onClose={mockOnClose}
        />
      )

      expect(screen.queryByText('Create New Task')).not.toBeInTheDocument()
    })

    it('should display create project action when handler is provided', () => {
      render(
        <CommandPalette
          isOpen={true}
          onClose={mockOnClose}
          onCreateProject={mockOnCreateProject}
        />
      )

      expect(screen.getByText('Create New Project')).toBeInTheDocument()
    })

    it('should call onCreateTask and close when create task command is clicked', async () => {
      const user = userEvent.setup()

      render(
        <CommandPalette
          isOpen={true}
          onClose={mockOnClose}
          onCreateTask={mockOnCreateTask}
        />
      )

      const createTaskCommand = screen.getByText('Create New Task')
      await user.click(createTaskCommand)

      expect(mockOnCreateTask).toHaveBeenCalled()
      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should call onCreateProject and close when create project command is clicked', async () => {
      const user = userEvent.setup()

      render(
        <CommandPalette
          isOpen={true}
          onClose={mockOnClose}
          onCreateProject={mockOnCreateProject}
        />
      )

      const createProjectCommand = screen.getByText('Create New Project')
      await user.click(createProjectCommand)

      expect(mockOnCreateProject).toHaveBeenCalled()
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  describe('Search Functionality', () => {
    it('should filter commands based on search input', async () => {
      const user = userEvent.setup()

      render(
        <CommandPalette
          isOpen={true}
          onClose={mockOnClose}
        />
      )

      const searchInput = screen.getByPlaceholderText(/type a command/i)

      // All navigation commands should be visible initially
      expect(screen.getByText('Go to Home')).toBeInTheDocument()
      expect(screen.getByText('Go to Projects')).toBeInTheDocument()
      expect(screen.getByText('Go to Settings')).toBeInTheDocument()

      // Type "project" to filter
      await user.type(searchInput, 'project')

      // Only project-related commands should be visible
      await waitFor(() => {
        expect(screen.getByText('Go to Projects')).toBeInTheDocument()
        expect(screen.queryByText('Go to Home')).not.toBeInTheDocument()
        expect(screen.queryByText('Go to Settings')).not.toBeInTheDocument()
      })
    })

    it('should show "No results found" when search has no matches', async () => {
      const user = userEvent.setup()

      render(
        <CommandPalette
          isOpen={true}
          onClose={mockOnClose}
        />
      )

      const searchInput = screen.getByPlaceholderText(/type a command/i)

      await user.type(searchInput, 'nonexistentcommand')

      await waitFor(() => {
        expect(screen.getByText(/no results found/i)).toBeInTheDocument()
      })
    })

    it('should filter by keywords', async () => {
      const user = userEvent.setup()

      render(
        <CommandPalette
          isOpen={true}
          onClose={mockOnClose}
        />
      )

      const searchInput = screen.getByPlaceholderText(/type a command/i)

      // Search by keyword "board"
      await user.type(searchInput, 'board')

      await waitFor(() => {
        expect(screen.getByText('Go to Kanban Board')).toBeInTheDocument()
      })
    })

    it('should be case-insensitive when filtering', async () => {
      const user = userEvent.setup()

      render(
        <CommandPalette
          isOpen={true}
          onClose={mockOnClose}
        />
      )

      const searchInput = screen.getByPlaceholderText(/type a command/i)

      await user.type(searchInput, 'SETTINGS')

      await waitFor(() => {
        expect(screen.getByText('Go to Settings')).toBeInTheDocument()
      })
    })
  })

  describe('Keyboard Navigation Hints', () => {
    it('should display keyboard shortcuts in footer', () => {
      render(
        <CommandPalette
          isOpen={true}
          onClose={mockOnClose}
        />
      )

      expect(screen.getByText('Navigate')).toBeInTheDocument()
      expect(screen.getByText('Select')).toBeInTheDocument()
      expect(screen.getByText('Close')).toBeInTheDocument()
    })

    it('should display ESC hint in header', () => {
      render(
        <CommandPalette
          isOpen={true}
          onClose={mockOnClose}
        />
      )

      const escKbd = screen.getAllByText('ESC')
      expect(escKbd.length).toBeGreaterThan(0)
    })
  })

  describe('Groups', () => {
    it('should display Navigation group heading', () => {
      render(
        <CommandPalette
          isOpen={true}
          onClose={mockOnClose}
        />
      )

      expect(screen.getByText('Navigation')).toBeInTheDocument()
    })

    it('should display Actions group heading when actions are available', () => {
      render(
        <CommandPalette
          isOpen={true}
          onClose={mockOnClose}
          onCreateTask={mockOnCreateTask}
        />
      )

      expect(screen.getByText('Actions')).toBeInTheDocument()
    })

    it('should not display Actions group when no action handlers provided', () => {
      render(
        <CommandPalette
          isOpen={true}
          onClose={mockOnClose}
        />
      )

      expect(screen.queryByText('Actions')).not.toBeInTheDocument()
    })
  })
})
