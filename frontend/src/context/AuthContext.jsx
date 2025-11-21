import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const clearAuthState = () => {
    localStorage.removeItem('token')
    setUser(null)
    setIsAuthenticated(false)
  }

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

      const token = localStorage.getItem('token')
      if (!token) {
        clearAuthState()
        setLoading(false)
        return
      }

      // Verify token by fetching user profile
      const response = await axios.get(`${BACKEND_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data.success) {
        setUser(response.data.data.user)
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

  const logout = () => {
    clearAuthState()
  }


  const value = {
    user,
    setUser,
    isAuthenticated,
    setIsAuthenticated,
    loading,
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
