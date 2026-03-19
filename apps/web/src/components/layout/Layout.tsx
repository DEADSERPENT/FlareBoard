import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

export const Layout = () => {
  const location = useLocation()
  return (
    <div className="flex h-full bg-neutral-50">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <TopBar />
        <main
          key={location.pathname}
          className="flex-1 overflow-auto p-6 scrollbar-thin page-enter"
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}
