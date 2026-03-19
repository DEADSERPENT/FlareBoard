import { NavLink } from 'react-router-dom'
import { Home, FolderKanban, LayoutDashboard, Settings, Boxes, Trello, Activity, Users, Calendar, BarChart2, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const memberNav = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/projects', label: 'Projects', icon: FolderKanban },
  { path: '/kanban', label: 'Kanban Board', icon: Trello },
  { path: '/calendar', label: 'Calendar', icon: Calendar },
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/analytics', label: 'Analytics', icon: BarChart2 },
  { path: '/team', label: 'Team', icon: Users },
  { path: '/activity', label: 'Activity', icon: Activity },
  { path: '/settings', label: 'Settings', icon: Settings },
]

const adminOnlyNav = [
  { path: '/admin/users', label: 'Users', icon: ShieldCheck },
]

export const Sidebar = () => {
  const { isAdmin } = useAuth()
  const navItems = isAdmin ? [...memberNav, ...adminOnlyNav] : memberNav

  return (
    <aside className="w-64 border-r border-neutral-200 bg-white flex flex-col">
      <div className="flex h-16 items-center border-b border-neutral-200 px-6 shrink-0">
        <div className="flex items-center gap-2">
          <Boxes className="w-8 h-8 text-primary-500" />
          <h1 className="text-xl font-bold text-gradient">FlareBoard</h1>
        </div>
      </div>

      <nav className="p-4 space-y-1 flex-1">
        {navItems.map(item => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-primary-50 text-primary-600 font-medium border-l-4 border-primary-500 -ml-[2px]'
                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      {isAdmin && (
        <div className="p-4 border-t border-neutral-200">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-50 text-amber-700">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span className="text-xs font-medium">Admin Mode</span>
          </div>
        </div>
      )}
    </aside>
  )
}
