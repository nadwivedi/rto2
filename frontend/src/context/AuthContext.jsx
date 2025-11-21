import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  // Initialize from localStorage immediately
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user')
    return savedUser ? JSON.parse(savedUser) : null
  })
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('token')
  })

  const clearAuthState = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
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
        const userData = response.data.data.user
        setUser(userData)
        setIsAuthenticated(true)
        localStorage.setItem('user', JSON.stringify(userData))
      } else {
        clearAuthState()
      }
    } catch (error) {
      console.error('Auth check error:', error)
      // Only clear auth if token is invalid (401), not on network errors
      if (error.response?.status === 401) {
        clearAuthState()
      } else if (localStorage.getItem('token')) {
        // Token exists but API failed (network issue) - restore from localStorage
        const savedUser = localStorage.getItem('user')
        if (savedUser) {
          setUser(JSON.parse(savedUser))
        }
        setIsAuthenticated(true)
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
