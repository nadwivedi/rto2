import { createContext, useContext, useState, useEffect } from 'react'
import api from '../utils/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check if user is already logged in on mount
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      // Skip auth check if on login page
      if (window.location.pathname === '/login') {
        setLoading(false)
        return
      }

      // Verify cookie by fetching user profile
      // Cookie with JWT token is automatically sent by browser
      const response = await api.get('/api/auth/profile')

      if (response.data.success) {
        // Store user data in state only (not localStorage)
        setUser(response.data.data.user)
        setIsAuthenticated(true)
      } else {
        // Clear state if verification fails
        clearAuthState()
      }
    } catch (error) {
      console.error('Auth check error:', error)
      // Don't clear state if we're on login page
      if (window.location.pathname !== '/login') {
        clearAuthState()
      }
    } finally {
      setLoading(false)
    }
  }

  const login = (userData) => {
    setUser(userData)
    setIsAuthenticated(true)
  }

  const logout = async () => {
    try {
      // Call logout endpoint to clear HTTP-only cookie
      if (isAuthenticated) {
        await api.post('/api/auth/logout')
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear state (cookie is cleared by backend)
      clearAuthState()
    }
  }

  const clearAuthState = () => {
    setUser(null)
    setIsAuthenticated(false)
  }

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    checkAuth
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
