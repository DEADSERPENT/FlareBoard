import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { SocketProvider } from '@/contexts/SocketContext'
import { ToastProvider } from '@/contexts/ToastContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Layout } from '@/components/layout/Layout'
import { CommandPalette } from '@/components/CommandPalette'
import { useCommandPalette } from '@/hooks/useCommandPalette'
import { HomePage } from '@/pages/Home'
import { ProjectsPage } from '@/pages/Projects'
import { DashboardPage } from '@/pages/Dashboard'
import { SettingsPage } from '@/pages/Settings'
import { KanbanPage } from '@/pages/Kanban'
import { ActivityPage } from '@/pages/Activity'
import { Login } from '@/pages/Login'
import { Register } from '@/pages/Register'

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
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="activity" element={<ActivityPage />} />
          <Route path="settings" element={<SettingsPage />} />
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
      <AuthProvider>
        <ToastProvider>
          <SocketProvider>
            <AppContent />
          </SocketProvider>
        </ToastProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
