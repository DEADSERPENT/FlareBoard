import { useState, useEffect, useRef } from 'react'
import { Search, FolderKanban, CheckSquare, ChevronRight } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { NotificationCenter } from '../notifications/NotificationCenter'
import { API_BASE } from '../../lib/api'

const ROUTE_LABELS: Record<string, string> = {
  '/':            'Home',
  '/projects':    'Projects',
  '/kanban':      'Kanban',
  '/calendar':    'Calendar',
  '/dashboard':   'Dashboard',
  '/analytics':   'Analytics',
  '/team':        'Team',
  '/activity':    'Activity',
  '/settings':    'Settings',
  '/admin/users': 'Users',
}

export const TopBar = () => {
  const { token, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchQuery, setSearchQuery]             = useState('')
  const [searchResults, setSearchResults]         = useState<any>(null)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // Build breadcrumb
  const crumbs = (() => {
    if (location.pathname === '/') return [{ label: 'Home', path: '/' }]
    const result = [{ label: 'FlareBoard', path: '/' }]
    if (location.pathname === '/admin/users') {
      result.push({ label: 'Admin', path: '/admin/users' })
      result.push({ label: 'Users', path: '/admin/users' })
    } else {
      const label = ROUTE_LABELS[location.pathname]
      if (label) result.push({ label, path: location.pathname })
    }
    return result
  })()

  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults(null); setShowSearchResults(false); return
    }
    const t = setTimeout(async () => {
      try {
        const res  = await fetch(`${API_BASE}/search?q=${encodeURIComponent(searchQuery)}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (data.success) { setSearchResults(data.data); setShowSearchResults(true) }
      } catch {}
    }, 300)
    return () => clearTimeout(t)
  }, [searchQuery, token])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSearchResults(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleResultClick = (type: string) => {
    setShowSearchResults(false); setSearchQuery('')
    navigate(type === 'project' ? '/projects' : '/kanban')
  }

  return (
    <header className="h-14 border-b border-neutral-100 bg-white px-5 flex items-center justify-between shrink-0">
      {/* ── Breadcrumb ─────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 text-sm">
        {crumbs.map((crumb, i) => (
          <div key={`${crumb.path}-${i}`} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-neutral-300" />}
            <span
              onClick={() => i < crumbs.length - 1 && navigate(crumb.path)}
              className={i === crumbs.length - 1
                ? 'font-semibold text-neutral-900'
                : 'text-neutral-400 hover:text-neutral-600 cursor-pointer transition-colors'}
            >
              {crumb.label}
            </span>
          </div>
        ))}
        {isAdmin && location.pathname.startsWith('/admin') && (
          <span className="ml-1 text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-200">
            Admin
          </span>
        )}
      </div>

      {/* ── Search ─────────────────────────────────────────────── */}
      <div className="relative" ref={searchRef}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
        <input
          type="search"
          placeholder="Search projects, tasks…"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onFocus={() => searchResults && setShowSearchResults(true)}
          className="pl-9 pr-16 py-1.5 w-72 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white focus:w-96 transition-all duration-200"
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium text-neutral-400 bg-white border border-neutral-200 rounded">
          ⌘K
        </kbd>

        {showSearchResults && searchResults && (
          <div className="absolute top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-neutral-200 py-2 z-30 max-h-96 overflow-y-auto scale-in">
            {searchResults.total === 0 ? (
              <div className="px-4 py-8 text-center text-neutral-400 text-sm">No results for "{searchQuery}"</div>
            ) : (
              <>
                {searchResults.projects?.length > 0 && (
                  <div>
                    <p className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-neutral-400">Projects</p>
                    {searchResults.projects.map((p: any) => (
                      <button key={p.id} onClick={() => handleResultClick('project')}
                        className="w-full px-4 py-2.5 text-left hover:bg-neutral-50 flex items-center gap-3 transition-colors">
                        <FolderKanban className="w-4 h-4 text-primary-500 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-neutral-900 truncate">{p.name}</p>
                          {p.description && <p className="text-xs text-neutral-400 truncate">{p.description}</p>}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {searchResults.tasks?.length > 0 && (
                  <div>
                    <p className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-neutral-400">Tasks</p>
                    {searchResults.tasks.map((t: any) => (
                      <button key={t.id} onClick={() => handleResultClick('task')}
                        className="w-full px-4 py-2.5 text-left hover:bg-neutral-50 flex items-center gap-3 transition-colors">
                        <CheckSquare className="w-4 h-4 text-blue-500 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-neutral-900 truncate">{t.title}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-neutral-400">{t.project?.name}</p>
                            <span className="text-xs px-1.5 py-0.5 rounded-full bg-neutral-100 text-neutral-500">{t.status}</span>
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

      {/* ── Notifications ──────────────────────────────────────── */}
      <NotificationCenter />
    </header>
  )
}
