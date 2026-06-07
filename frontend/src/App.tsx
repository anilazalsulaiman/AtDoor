import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Register from './pages/auth/Register'
import Login from './pages/auth/Login'
import Home from './pages/Home'
import Profile from './pages/Profile'
import PostJob from './pages/PostJob'


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