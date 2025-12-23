import { Search, Bell, Menu } from 'lucide-react'

export const TopBar = () => {
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
        <button className="relative text-neutral-500 hover:text-neutral-700 p-2 rounded-lg hover:bg-neutral-50">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary-500 rounded-full"></span>
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-neutral-200">
          <div className="w-10 h-10 rounded-full bg-gradient-orange flex items-center justify-center text-white font-semibold shadow-orange-sm">
            SN
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-900">Samartha</p>
            <p className="text-xs text-neutral-500">Admin</p>
          </div>
        </div>
      </div>
    </header>
  )
}
