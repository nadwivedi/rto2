import { createContext, useContext, useState, useEffect } from 'react'
import api from '../utils/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check if admin is already logged in on mount
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

      // Verify cookie by fetching admin profile
      const response = await api.get('/api/admin/auth/profile')

      if (response.data.success) {
        setAdmin(response.data.data.admin)
        setIsAuthenticated(true)
      } else {
        clearAuthState()
      }
    } catch (error) {
      console.error('Auth check error:', error)
      if (window.location.pathname !== '/login') {
        clearAuthState()
      }
    } finally {
      setLoading(false)
    }
  }

  const login = (adminData) => {
    setAdmin(adminData)
    setIsAuthenticated(true)
  }

  const logout = async () => {
    try {
      if (isAuthenticated) {
        await api.post('/api/admin/auth/logout')
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      clearAuthState()
    }
  }

  const clearAuthState = () => {
    setAdmin(null)
    setIsAuthenticated(false)
  }

  const value = {
    admin,
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
