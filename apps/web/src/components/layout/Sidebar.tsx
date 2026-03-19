import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  Home, FolderKanban, LayoutDashboard, Settings, Boxes,
  Trello, Activity, Users, Calendar, BarChart2, ShieldCheck,
  ChevronLeft, ChevronRight, LogOut,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const sections = [
  {
    label: 'Workspace',
    items: [
      { path: '/',         label: 'Home',         icon: Home },
      { path: '/projects', label: 'Projects',     icon: FolderKanban },
      { path: '/kanban',   label: 'Kanban',        icon: Trello },
      { path: '/calendar', label: 'Calendar',      icon: Calendar },
    ],
  },
  {
    label: 'Insights',
    items: [
      { path: '/dashboard', label: 'Dashboard',  icon: LayoutDashboard },
      { path: '/analytics', label: 'Analytics',  icon: BarChart2 },
    ],
  },
  {
    label: 'People',
    items: [
      { path: '/team',     label: 'Team',         icon: Users },
      { path: '/activity', label: 'Activity',     icon: Activity },
    ],
  },
]

const adminItems = [
  { path: '/admin/users', label: 'Users',  icon: ShieldCheck },
]

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export const Sidebar = () => {
  const { user, isAdmin, logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={`relative flex flex-col border-r border-neutral-200 bg-white transition-all duration-300 ease-in-out ${
        collapsed ? 'w-[68px]' : 'w-64'
      }`}
    >
      {/* ── Logo ─────────────────────────────────────────────── */}
      <div className={`flex h-16 items-center border-b border-neutral-100 shrink-0 ${collapsed ? 'justify-center px-0' : 'px-5 gap-3'}`}>
        <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center shrink-0 shadow-sm">
          <Boxes className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <h1 className="text-base font-bold text-gradient tracking-tight">FlareBoard</h1>
        )}
      </div>

      {/* ── Nav ──────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4 space-y-5">
        {sections.map(section => (
          <div key={section.label}>
            {!collapsed && (
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
                {section.label}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map(item => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/'}
                    title={collapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 rounded-lg transition-all duration-150 ${
                        collapsed ? 'justify-center h-10 w-10 mx-auto' : 'px-3 py-2.5'
                      } ${
                        isActive
                          ? 'bg-primary-50 text-primary-600 font-semibold nav-active-glow'
                          : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {!collapsed && <span className="text-sm">{item.label}</span>}
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}

        {/* Admin section */}
        {isAdmin && (
          <div>
            {!collapsed && (
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-amber-500">
                Admin
              </p>
            )}
            <div className="space-y-0.5">
              {adminItems.map(item => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    title={collapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 rounded-lg transition-all duration-150 ${
                        collapsed ? 'justify-center h-10 w-10 mx-auto' : 'px-3 py-2.5'
                      } ${
                        isActive
                          ? 'bg-amber-50 text-amber-700 font-semibold'
                          : 'text-amber-600 hover:bg-amber-50 hover:text-amber-700'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {!collapsed && <span className="text-sm">{item.label}</span>}
                  </NavLink>
                )
              })}
            </div>
          </div>
        )}
      </nav>

      {/* ── Settings link ─────────────────────────────────────── */}
      <div className="px-3 pb-2">
        <NavLink
          to="/settings"
          title={collapsed ? 'Settings' : undefined}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg transition-all duration-150 ${
              collapsed ? 'justify-center h-10 w-10 mx-auto' : 'px-3 py-2.5'
            } ${
              isActive
                ? 'bg-primary-50 text-primary-600 font-semibold nav-active-glow'
                : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
            }`
          }
        >
          <Settings className="w-4 h-4 shrink-0" />
          {!collapsed && <span className="text-sm">Settings</span>}
        </NavLink>
      </div>

      {/* ── User footer ──────────────────────────────────────── */}
      <div className={`border-t border-neutral-100 p-3 ${collapsed ? 'flex flex-col items-center gap-2' : ''}`}>
        {!collapsed ? (
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-neutral-50 transition-colors">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.fullName} className="w-8 h-8 rounded-full object-cover shrink-0" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {user ? getInitials(user.fullName) : 'U'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-neutral-900 truncate">{user?.fullName}</p>
              <div className="flex items-center gap-1.5">
                {isAdmin && (
                  <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-200">
                    Admin
                  </span>
                )}
                <p className="text-xs text-neutral-400 truncate">{user?.email}</p>
              </div>
            </div>
            <button onClick={logout} title="Sign out" className="text-neutral-400 hover:text-red-500 transition-colors p-1">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button onClick={logout} title="Sign out" className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50">
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Collapse toggle ───────────────────────────────────── */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-white border border-neutral-200 shadow-sm flex items-center justify-center text-neutral-500 hover:text-primary-600 hover:border-primary-300 transition-all z-10"
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </aside>
  )
}
