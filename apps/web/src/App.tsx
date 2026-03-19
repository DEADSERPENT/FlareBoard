import { type ReactNode } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/contexts/AuthContext'
import { SocketProvider } from '@/contexts/SocketContext'
import { ToastProvider } from '@/contexts/ToastContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Layout } from '@/components/layout/Layout'
import { CommandPalette } from '@/components/CommandPalette'
import { useCommandPalette } from '@/hooks/useCommandPalette'
import { useAuth } from '@/contexts/AuthContext'
import { HomePage } from '@/pages/Home'
import { ProjectsPage } from '@/pages/Projects'
import { DashboardPage } from '@/pages/Dashboard'
import { SettingsPage } from '@/pages/Settings'
import { KanbanPage } from '@/pages/Kanban'
import { ActivityPage } from '@/pages/Activity'
import { TeamPage } from '@/pages/Team'
import { CalendarPage } from '@/pages/Calendar'
import { AnalyticsPage } from '@/pages/Analytics'
import { AdminUsersPage } from '@/pages/AdminUsers'
import { Login } from '@/pages/Login'
import { Register } from '@/pages/Register'

function AdminRoute({ children }: { children: ReactNode }) {
  const { isAdmin, isLoading } = useAuth()
  if (isLoading) return null
  return isAdmin ? <>{children}</> : <Navigate to="/" replace />
}

// Create a QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

function AppContent() {
  const commandPalette = useCommandPalette()

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<HomePage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="kanban" element={<KanbanPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="team" element={<TeamPage />} />
          <Route path="activity" element={<ActivityPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route
            path="admin/users"
            element={
              <AdminRoute>
                <AdminUsersPage />
              </AdminRoute>
            }
          />
        </Route>
      </Routes>

      <CommandPalette
        isOpen={commandPalette.isOpen}
        onClose={commandPalette.close}
      />
    </>
  )
}

function App() {
  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ToastProvider>
            <SocketProvider>
              <AppContent />
            </SocketProvider>
          </ToastProvider>
        </AuthProvider>
      </QueryClientProvider>
    </Router>
  )
}

export default App
