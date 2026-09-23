import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Register from './pages/auth/Register'
import Login from './pages/auth/Login'
import Home from './pages/Home'
import Profile from './pages/Profile'
import PostJob from './pages/PostJob'
import MyJobs from './pages/MyJobs'
import BrowseJobs from './pages/jobs/BrowseJobs'
import JobDetail from './pages/jobs/JobDetail'
import Notifications from './pages/Notifications'
import MyWork from './pages/MyWork'

// Protected route — redirects to login if not logged in
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth()
  if (isLoading) return <div>Loading...</div>
  if (!user) return <Navigate to="/login" />
  return <>{children}</>
}

// Public route — redirects to home if already logged in
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth()
  if (isLoading) return <div>Loading...</div>
  if (user) return <Navigate to="/home" />
  return <>{children}</>
}

const AppRoutes = () => {
  return (
    <Routes>
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/login" />} />

      {/* Public routes */}
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute>
          <Register />
        </PublicRoute>
      } />
      <Route path="/post-job" element={
        <ProtectedRoute>
          <PostJob />
        </ProtectedRoute>
      } />

      {/* Protected routes — will add more pages here */}
      <Route path="/home" element={
  <ProtectedRoute>
    <Home />
  </ProtectedRoute>
} />
<Route path="/profile" element={
  <ProtectedRoute>
    <Profile />
  </ProtectedRoute>
} />
<Route path="/my-jobs" element={
  <ProtectedRoute>
    <MyJobs />
  </ProtectedRoute>
} />
<Route path="/browse-jobs" element={
  <ProtectedRoute>
    <BrowseJobs />
  </ProtectedRoute>
} />
<Route path="/jobs/:id" element={
  <ProtectedRoute>
    <JobDetail />
  </ProtectedRoute>
} />
<Route path="/notifications" element={
  <ProtectedRoute>
    <Notifications />
  </ProtectedRoute>
} />
<Route path="/my-work" element={
  <ProtectedRoute>
    <MyWork />
  </ProtectedRoute>
} />
    </Routes>
  )
}

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App