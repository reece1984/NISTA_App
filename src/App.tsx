import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import ScrollToTop from './components/ScrollToTop'

// Pages
import SignUpPage from './pages/SignUpPage'
import LoginPage from './pages/LoginPage'
import ProjectsLanding from './pages/ProjectsLanding'
import AssessmentCriteriaPage from './pages/AssessmentCriteriaPage'

// Layout components
import Layout from './components/Layout'
import ProjectLayout from './components/ProjectLayout'

// Project pages
import OverviewPage from './pages/project/OverviewPage'
import DocumentsPage from './pages/project/DocumentsPage'
import FindingsPage from './pages/project/FindingsPage'
import SummaryPage from './pages/project/SummaryPage'
import DetailPage from './pages/project/DetailPage'
import ActionsPageV3 from './components/actions/ActionsPageV3'
import SettingsPage from './pages/project/SettingsPage'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

// Public Route (redirect if already authenticated)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/projects" replace />
  }

  return <>{children}</>
}

// Root redirect based on auth state
function RootRedirect() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/projects" replace />
  }

  return <Navigate to="/login" replace />
}

function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<RootRedirect />} />

        {/* Public routes */}
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <SignUpPage />
            </PublicRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />

        {/* Protected routes with sidebar layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Projects list (no project selected) */}
          <Route path="projects" element={<ProjectsLanding />} />

          {/* Criteria page (no project context) */}
          <Route path="criteria" element={<AssessmentCriteriaPage />} />

          {/* Project routes with ProjectLayout (header + content) */}
          <Route path="project/:id" element={<ProjectLayout />}>
            <Route index element={<Navigate to="readiness" replace />} />
            <Route path="readiness" element={<OverviewPage />} />
            <Route path="evidence" element={<DocumentsPage />} />
            <Route path="findings" element={<FindingsPage />} />
            <Route path="actions" element={<ActionsPageV3 />} />
            <Route path="settings" element={<SettingsPage />} />

            {/* Redirects from old routes to new routes */}
            <Route path="overview" element={<Navigate to="../readiness" replace />} />
            <Route path="documents" element={<Navigate to="../evidence" replace />} />
            <Route path="summary" element={<Navigate to="../findings" replace />} />
            <Route path="detail" element={<Navigate to="../findings" replace />} />
          </Route>
        </Route>

        {/* Redirect old dashboard route to new projects route */}
        <Route path="/dashboard" element={<Navigate to="/projects" replace />} />
      </Routes>
    </>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
