import { useState, useEffect, useRef } from 'react'
import { Search, Menu, LogOut, User, Settings, FolderKanban, CheckSquare } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { NotificationPanel } from '../notifications/NotificationPanel'

export const TopBar = () => {
  const { user, logout, token } = useAuth()
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any>(null)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Search with debounce
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults(null)
      setShowSearchResults(false)
      return
    }

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/search?q=${encodeURIComponent(searchQuery)}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await response.json()
        if (data.success) {
          setSearchResults(data.data)
          setShowSearchResults(true)
        }
      } catch (error) {
        console.error('Search failed:', error)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, token])

  // Click outside to close search results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearchResultClick = (type: string) => {
    setShowSearchResults(false)
    setSearchQuery('')
    if (type === 'project') {
      navigate('/projects')
    } else if (type === 'task') {
      navigate('/kanban')
    }
  }

  return (
    <header className="h-16 border-b border-neutral-200 bg-white px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button className="text-neutral-500 hover:text-neutral-700 lg:hidden">
          <Menu className="w-6 h-6" />
        </button>
        <div className="relative" ref={searchRef}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="search"
            placeholder="Search projects, tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchResults && setShowSearchResults(true)}
            className="pl-10 pr-20 py-2 w-96 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <kbd className="hidden sm:inline-flex items-center px-2 py-1 text-xs font-medium text-neutral-500 bg-white border border-neutral-200 rounded">
              ⌘K
            </kbd>
          </div>

          {/* Search Results Dropdown */}
          {showSearchResults && searchResults && (
            <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg border border-neutral-200 py-2 z-30 max-h-96 overflow-y-auto">
              {searchResults.total === 0 ? (
                <div className="px-4 py-8 text-center text-neutral-500">
                  No results found for "{searchQuery}"
                </div>
              ) : (
                <>
                  {searchResults.projects.length > 0 && (
                    <div>
                      <div className="px-4 py-2 text-xs font-semibold text-neutral-500 uppercase">
                        Projects ({searchResults.projects.length})
                      </div>
                      {searchResults.projects.map((project: any) => (
                        <button
                          key={project.id}
                          onClick={() => handleSearchResultClick('project')}
                          className="w-full px-4 py-3 text-left hover:bg-neutral-50 flex items-start gap-3"
                        >
                          <FolderKanban className="w-5 h-5 text-primary-500 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-neutral-900">{project.name}</p>
                            {project.description && (
                              <p className="text-xs text-neutral-500 mt-1 line-clamp-1">
                                {project.description}
                              </p>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {searchResults.tasks.length > 0 && (
                    <div className={searchResults.projects.length > 0 ? 'mt-2' : ''}>
                      <div className="px-4 py-2 text-xs font-semibold text-neutral-500 uppercase">
                        Tasks ({searchResults.tasks.length})
                      </div>
                      {searchResults.tasks.map((task: any) => (
                        <button
                          key={task.id}
                          onClick={() => handleSearchResultClick('task')}
                          className="w-full px-4 py-3 text-left hover:bg-neutral-50 flex items-start gap-3"
                        >
                          <CheckSquare className="w-5 h-5 text-blue-500 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-neutral-900">{task.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-neutral-500">
                                {task.project?.name}
                              </span>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">
                                {task.status}
                              </span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <NotificationPanel />

        <div className="relative pl-4 border-l border-neutral-200">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 hover:bg-neutral-50 rounded-lg p-2 transition-colors"
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                className="w-10 h-10 rounded-full object-cover shadow-orange-sm"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-orange flex items-center justify-center text-white font-semibold shadow-orange-sm">
                {user ? getInitials(user.fullName) : 'U'}
              </div>
            )}
            <div className="text-left">
              <p className="text-sm font-medium text-neutral-900">{user?.fullName || 'User'}</p>
            </div>
          </button>

          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-neutral-200 py-2 z-20">
                <div className="px-4 py-3 border-b border-neutral-200">
                  <p className="text-sm font-medium text-neutral-900">{user?.fullName}</p>
                  <p className="text-xs text-neutral-500">{user?.email}</p>
                </div>
                <button
                  className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-3"
                  onClick={() => {
                    setShowUserMenu(false)
                    navigate('/settings')
                  }}
                >
                  <User className="w-4 h-4" />
                  Profile
                </button>
                <button
                  className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-3"
                  onClick={() => {
                    setShowUserMenu(false)
                    navigate('/settings')
                  }}
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
                <div className="border-t border-neutral-200 mt-2 pt-2">
                  <button
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
                    onClick={() => {
                      setShowUserMenu(false)
                      logout()
                    }}
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
