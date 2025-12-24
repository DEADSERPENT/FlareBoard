import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Command } from 'cmdk'
import {
  Home,
  FolderKanban,
  LayoutDashboard,
  Settings,
  Activity,
  Plus,
  Search,
  Layers,
} from 'lucide-react'

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  onCreateTask?: () => void
  onCreateProject?: () => void
}

interface CommandItem {
  id: string
  label: string
  icon: React.ReactNode
  action: () => void
  keywords?: string[]
  group: 'navigation' | 'actions'
}

export function CommandPalette({
  isOpen,
  onClose,
  onCreateTask,
  onCreateProject,
}: CommandPaletteProps) {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!isOpen) {
      setSearch('')
    }
  }, [isOpen])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [onClose])

  const handleNavigate = (path: string) => {
    navigate(path)
    onClose()
  }

  const handleAction = (action: () => void) => {
    action()
    onClose()
  }

  const commands: CommandItem[] = [
    // Navigation commands
    {
      id: 'nav-home',
      label: 'Go to Home',
      icon: <Home className="w-4 h-4" />,
      action: () => handleNavigate('/'),
      keywords: ['home', 'dashboard', 'main'],
      group: 'navigation',
    },
    {
      id: 'nav-projects',
      label: 'Go to Projects',
      icon: <FolderKanban className="w-4 h-4" />,
      action: () => handleNavigate('/projects'),
      keywords: ['projects', 'list'],
      group: 'navigation',
    },
    {
      id: 'nav-kanban',
      label: 'Go to Kanban Board',
      icon: <Layers className="w-4 h-4" />,
      action: () => handleNavigate('/kanban'),
      keywords: ['kanban', 'board', 'tasks'],
      group: 'navigation',
    },
    {
      id: 'nav-dashboard',
      label: 'Go to Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
      action: () => handleNavigate('/dashboard'),
      keywords: ['dashboard', 'analytics', 'stats'],
      group: 'navigation',
    },
    {
      id: 'nav-activity',
      label: 'Go to Activity',
      icon: <Activity className="w-4 h-4" />,
      action: () => handleNavigate('/activity'),
      keywords: ['activity', 'log', 'history'],
      group: 'navigation',
    },
    {
      id: 'nav-settings',
      label: 'Go to Settings',
      icon: <Settings className="w-4 h-4" />,
      action: () => handleNavigate('/settings'),
      keywords: ['settings', 'preferences', 'config'],
      group: 'navigation',
    },
  ]

  // Add action commands if handlers are provided
  if (onCreateTask) {
    commands.push({
      id: 'action-create-task',
      label: 'Create New Task',
      icon: <Plus className="w-4 h-4" />,
      action: () => handleAction(onCreateTask),
      keywords: ['create', 'new', 'task', 'add'],
      group: 'actions',
    })
  }

  if (onCreateProject) {
    commands.push({
      id: 'action-create-project',
      label: 'Create New Project',
      icon: <Plus className="w-4 h-4" />,
      action: () => handleAction(onCreateProject),
      keywords: ['create', 'new', 'project', 'add'],
      group: 'actions',
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Command Palette */}
      <Command
        className="relative w-full max-w-2xl bg-white rounded-lg shadow-2xl border border-neutral-200 overflow-hidden"
        shouldFilter={false}
      >
        <div className="flex items-center gap-3 px-4 border-b border-neutral-200">
          <Search className="w-5 h-5 text-neutral-400" />
          <Command.Input
            value={search}
            onValueChange={setSearch}
            placeholder="Type a command or search..."
            className="w-full py-4 text-base bg-transparent outline-none text-neutral-900 placeholder-neutral-400"
            autoFocus
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-neutral-500 bg-neutral-100 rounded">
            ESC
          </kbd>
        </div>

        <Command.List className="max-h-[400px] overflow-y-auto p-2">
          <Command.Empty className="py-12 text-center text-sm text-neutral-500">
            No results found.
          </Command.Empty>

          {/* Navigation Group */}
          <Command.Group
            heading="Navigation"
            className="mb-2 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-neutral-500"
          >
            {commands
              .filter((cmd) => cmd.group === 'navigation')
              .filter(
                (cmd) =>
                  search === '' ||
                  cmd.label.toLowerCase().includes(search.toLowerCase()) ||
                  cmd.keywords?.some((kw) =>
                    kw.toLowerCase().includes(search.toLowerCase())
                  )
              )
              .map((cmd) => (
                <Command.Item
                  key={cmd.id}
                  value={cmd.label}
                  onSelect={() => cmd.action()}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-neutral-700 hover:bg-primary-50 hover:text-primary-700 aria-selected:bg-primary-50 aria-selected:text-primary-700 transition-colors"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-md bg-neutral-100 text-neutral-600 group-hover:bg-primary-100 group-hover:text-primary-600">
                    {cmd.icon}
                  </div>
                  <span className="text-sm font-medium">{cmd.label}</span>
                </Command.Item>
              ))}
          </Command.Group>

          {/* Actions Group */}
          {commands.some((cmd) => cmd.group === 'actions') && (
            <Command.Group
              heading="Actions"
              className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-neutral-500"
            >
              {commands
                .filter((cmd) => cmd.group === 'actions')
                .filter(
                  (cmd) =>
                    search === '' ||
                    cmd.label.toLowerCase().includes(search.toLowerCase()) ||
                    cmd.keywords?.some((kw) =>
                      kw.toLowerCase().includes(search.toLowerCase())
                    )
                )
                .map((cmd) => (
                  <Command.Item
                    key={cmd.id}
                    value={cmd.label}
                    onSelect={() => cmd.action()}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-neutral-700 hover:bg-primary-50 hover:text-primary-700 aria-selected:bg-primary-50 aria-selected:text-primary-700 transition-colors"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-md bg-neutral-100 text-neutral-600">
                      {cmd.icon}
                    </div>
                    <span className="text-sm font-medium">{cmd.label}</span>
                  </Command.Item>
                ))}
            </Command.Group>
          )}
        </Command.List>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-neutral-200 bg-neutral-50 text-xs text-neutral-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-neutral-200 rounded">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-white border border-neutral-200 rounded">↓</kbd>
              <span className="ml-1">Navigate</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-neutral-200 rounded">↵</kbd>
              <span className="ml-1">Select</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-white border border-neutral-200 rounded">ESC</kbd>
            <span className="ml-1">Close</span>
          </div>
        </div>
      </Command>
    </div>
  )
}
