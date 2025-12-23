import { useState } from 'react'
import { Search, Menu, LogOut, User, Settings } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { NotificationPanel } from '../notifications/NotificationPanel'

export const TopBar = () => {
  const { user, logout } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <header className="h-16 border-b border-neutral-200 bg-white px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button className="text-neutral-500 hover:text-neutral-700 lg:hidden">
          <Menu className="w-6 h-6" />
        </button>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="search"
            placeholder="Search projects, tasks..."
            className="pl-10 pr-4 py-2 w-96 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <NotificationPanel />

        <div className="relative pl-4 border-l border-neutral-200">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 hover:bg-neutral-50 rounded-lg p-2 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-orange flex items-center justify-center text-white font-semibold shadow-orange-sm">
              {user ? getInitials(user.fullName) : 'U'}
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-neutral-900">{user?.fullName || 'User'}</p>
              <p className="text-xs text-neutral-500 capitalize">{user?.roleId || 'User'}</p>
            </div>
          </button>

          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-neutral-200 py-2 z-20">
                <div className="px-4 py-3 border-b border-neutral-200">
                  <p className="text-sm font-medium text-neutral-900">{user?.fullName}</p>
                  <p className="text-xs text-neutral-500">{user?.email}</p>
                </div>
                <button
                  className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-3"
                  onClick={() => {
                    setShowUserMenu(false)
                  }}
                >
                  <User className="w-4 h-4" />
                  Profile
                </button>
                <button
                  className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-3"
                  onClick={() => {
                    setShowUserMenu(false)
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
